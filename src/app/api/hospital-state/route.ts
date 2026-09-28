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
// 1. GET: Saare Modules (Patients, Beds, Inventory, Blood, Appointments, Labs)
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
// 2. POST: Lab Order, Medicine, Appointment Create
// ========================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Incoming POST /api/hospital-state payload:", body);

    // 1. LAB ORDER CREATE (Lab View ya Blood Bank Dispatch se)
    if (body.type === "ADD_LAB_ORDER") {
      const payload = body.payload || body;
      const generatedToken = payload.token || `LAB-${Math.floor(1000 + Math.random() * 9000)}`;

      const createdLab = await prisma.labItem.create({
        data: {
          token: generatedToken,
          test: String(payload.test || "Complete Blood Count (CBC)"),
          patient: String(payload.patient || "Admitted Patient"),
          doctor: String(payload.doctor || "Dr. Verma"),
          status: String(payload.status || "In-Queue"),
          tat: String(payload.tat || "45 mins"),
        },
      });

      console.log("✅ Lab order created in Neon DB:", createdLab.token);
      return NextResponse.json(createdLab, { status: 201, headers: corsHeaders });
    }

    // 2. APPOINTMENT BOOKING (Neon DB Create)
    if (body.type === "BOOK_APPOINTMENT") {
      const aptData = body.payload || body;
      const generatedId = `APT-${Math.floor(1000 + Math.random() * 9000)}`;

      const newApt = await prisma.appointment.create({
        data: {
          id: generatedId,
          patient: String(aptData.patient || "Walk-in Patient").trim(),
          doctor: String(aptData.doctor || "Dr. Verma").trim(),
          time: String(aptData.time || "10:30 AM"),
          type: String(aptData.type || "Routine Consult"),
          status: String(aptData.status || "Confirmed"),
        },
      });

      console.log("✅ Appointment saved to Neon DB:", newApt.id);
      return NextResponse.json(newApt, { status: 201, headers: corsHeaders });
    }

    // 3. MEDICINE CREATE
    if (body.type === "ADD_MEDICINE" || body.name) {
      const medData = body.payload || body;
      const cleanStock = Math.max(0, parseInt(String(medData.stock || 50), 10) || 50);
      const cleanPrice = Math.max(0, parseFloat(String(medData.unitPrice || medData.price || 25.0)) || 25.0);
      const randomBatch = `BT-${Math.floor(1000 + Math.random() * 9000)}`;

      const newMed = await prisma.medicine.create({
        data: {
          name: String(medData.name || "New Formulary Item").trim(),
          genericName: String(medData.genericName || medData.generic || medData.name || "Generic").trim(),
          category: String(medData.category || "Tablet"),
          batch: String(medData.batch || randomBatch),
          stock: cleanStock,
          unitPrice: cleanPrice,
          expiry: String(medData.expiry || "12/2028"),
        },
      });

      return NextResponse.json(newMed, { status: 201, headers: corsHeaders });
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400, headers: corsHeaders });
  } catch (error: any) {
    console.error("❌ Error in POST /api/hospital-state:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to execute DB insert" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ========================================================
// 3. PATCH: Beds, Stock, Blood, Appointment, Lab Status Update
// ========================================================
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    // 1. Bed Updates
    if (type === "UPDATE_BED" && (prisma as any).bed && payload?.id) {
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
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // 2. Appointment Status Update (Confirmed / In Progress / Completed)
    if (type === "UPDATE_APPOINTMENT" && payload?.id) {
      await prisma.appointment.update({
        where: { id: payload.id },
        data: { status: payload.status },
      });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // 3. Pharmacy Stock Update
    if (type === "UPDATE_STOCK" && (prisma as any).medicine && payload?.id) {
      await (prisma as any).medicine.update({
        where: { id: payload.id },
        data: { stock: Number(payload.stock) },
      });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // 4. Blood Bank Unit Update
    if (type === "UPDATE_BLOOD" && (prisma as any).bloodStock && payload?.group) {
      await (prisma as any).bloodStock.update({
        where: { group: payload.group },
        data: { unitsAvailable: Number(payload.unitsAvailable) },
      });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // 5. Lab Updates / Status Change
    if (type === "UPDATE_LAB" && payload?.token && (prisma as any).labItem) {
      await (prisma as any).labItem.update({
        where: { token: payload.token },
        data: { status: payload.status },
      });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("PATCH /api/hospital-state error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update hospital state" },
      { status: 500, headers: corsHeaders }
    );
  }
}