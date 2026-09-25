import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// CORS headers taaki browser access block na kare
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Pragma, Cache-Control",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

// Browser preflight check ko handle karna
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ========================================================
// 1. GET: Saare Modules (Patients, Beds, Inventory, Blood)
// ========================================================
export async function GET() {
  try {
    // 1. Fetch Patients from Neon Cloud
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
    });

    const normalizedPatients = patients.map((p: any) => {
      let vitalsObj: any = {};
      if (typeof p.vitals === "string" && p.vitals.startsWith("{")) {
        try {
          vitalsObj = JSON.parse(p.vitals);
        } catch (e) {}
      }

      return {
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        contact: p.contact || "+91 98765 43210",
        bloodGroup: p.bloodGroup || "B+",
        abhaId: p.abhaId,
        symptoms: p.complaint || "Routine Clinical Intake",
        caseNotes: p.diagnosis || "Standard Protocol Active",
        bedNumber: p.bedNumber || "OPD",
        status: p.status || "Admitted",
        bp: vitalsObj.bp || "120/80",
        pulse: vitalsObj.pulse || 76,
        temperature: vitalsObj.temperature || "98.6",
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    // 2. Fetch Beds, Appointments, Inventory safely
    let beds: any[] = [];
    let appointments: any[] = [];
    let inventory: any[] = [];
    let bloodStock: any[] = [];
    let labQueue: any[] = [];

    try {
      if ((prisma as any).bed) beds = await (prisma as any).bed.findMany({ orderBy: { number: "asc" } });
      if ((prisma as any).appointment) appointments = await (prisma as any).appointment.findMany({ orderBy: { createdAt: "desc" } });
      if ((prisma as any).medicine) inventory = await (prisma as any).medicine.findMany({ orderBy: { name: "asc" } });
      if ((prisma as any).bloodStock) bloodStock = await (prisma as any).bloodStock.findMany({ orderBy: { group: "asc" } });
      if ((prisma as any).labItem) labQueue = await (prisma as any).labItem.findMany({ orderBy: { createdAt: "desc" } });
    } catch (e) {
      console.warn("Table fetch warning:", e);
    }

    return NextResponse.json(
      {
        patients: normalizedPatients,
        beds,
        appointments,
        inventory,
        bloodStock,
        labQueue,
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    console.error("GET /api/hospital-state error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch state" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ========================================================
// 2. POST: Direct Site se Medicine ya Naya Record Add karna
// ========================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Incoming POST /api/hospital-state payload:", body);

    const medData = body.payload || body;

    // Guaranteed Unique Batch Number & Clean Types
    const cleanStock = Math.max(0, parseInt(String(medData.stock || 50), 10) || 50);
    const cleanPrice = Math.max(0, parseFloat(String(medData.unitPrice || medData.price || 25.0)) || 25.0);
    const randomBatch = `BT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMed = await (prisma as any).medicine.create({
      data: {
        name: String(medData.name || "New Formulary Item").trim(),
        genericName: String(medData.genericName || medData.generic || medData.name || "Essential Generic").trim(),
        category: String(medData.category || "Tablet"),
        batch: String(medData.batch || randomBatch),
        stock: cleanStock,
        unitPrice: cleanPrice,
        expiry: String(medData.expiry || "12/2028"),
      },
    });

    console.log("✅ Medicine saved successfully in Neon DB:", newMed.id, newMed.name);
    return NextResponse.json(newMed, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    console.error("❌ Prisma Medicine Create Error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to create medicine", details: error?.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
// ========================================================
// 3. PATCH: Beds, Stock, Blood, Labs sabhi ka Update Handle
// ========================================================
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    // 1. Bed Updates
    if (type === "UPDATE_BED" && (prisma as any).bed && payload?.id) {
      // Find bed by number or id
      const existing = await (prisma as any).bed.findFirst({
        where: {
          OR: [{ id: payload.id }, { number: payload.id }],
        },
      });

      if (existing) {
        await (prisma as any).bed.update({
          where: { id: existing.id },
          data: payload.data,
        });
      }
    }

    // 2. Pharmacy Stock Update
    if (type === "UPDATE_STOCK" && (prisma as any).medicine && payload?.id) {
      await (prisma as any).medicine.update({
        where: { id: payload.id },
        data: { stock: Number(payload.stock) },
      });
    }

    // 3. Blood Bank Unit Update
    if (type === "UPDATE_BLOOD" && (prisma as any).bloodStock && payload?.group) {
      await (prisma as any).bloodStock.update({
        where: { group: payload.group },
        data: { unitsAvailable: Number(payload.unitsAvailable) },
      });
    }

    // 4. Lab Test Queue Update
    if (type === "UPDATE_LAB" && (prisma as any).labItem && payload?.token) {
      await (prisma as any).labItem.update({
        where: { token: payload.token },
        data: { status: payload.status },
      });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("PATCH /api/hospital-state error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update state" },
      { status: 500, headers: corsHeaders }
    );
  }
}