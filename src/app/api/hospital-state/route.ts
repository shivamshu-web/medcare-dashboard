import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Patients data ko frontend format me map karna
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

    return NextResponse.json(
      {
        patients: normalizedPatients,
        appointments: [],
        labQueue: [],
        inventory: [],
        beds: [],
        bloodStock: [],
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/hospital-state error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}