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

    // 2. Fetch Beds, Appointments, Inventory safely agar models bane hain
    let beds: any[] = [];
    let appointments: any[] = [];
    let inventory: any[] = [];
    let bloodStock: any[] = [];
    let labQueue: any[] = [];

    try {
      if ((prisma as any).bed) beds = await (prisma as any).bed.findMany();
      if ((prisma as any).appointment) appointments = await (prisma as any).appointment.findMany();
      if ((prisma as any).medicine) inventory = await (prisma as any).medicine.findMany();
      if ((prisma as any).bloodStock) bloodStock = await (prisma as any).bloodStock.findMany();
      if ((prisma as any).labItem) labQueue = await (prisma as any).labItem.findMany();
    } catch (e) {
      // Fallback silently if tables are being set up
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

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    // Bed updates sync handling
    if (type === "UPDATE_BED" && (prisma as any).bed && payload?.id) {
      await (prisma as any).bed.update({
        where: { id: payload.id },
        data: payload.data,
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