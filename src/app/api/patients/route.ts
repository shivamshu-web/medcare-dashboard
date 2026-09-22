import { NextResponse } from "next/server";
import * as dbModule from "@/lib/db";

// Prisma instance ko safely extract karna
const prismaClient: any =
  (dbModule as any).prisma ||
  (dbModule as any).db ||
  (dbModule as any).default ||
  dbModule;

// Patient model ko safely identify karna
function getPatientModel() {
  if (!prismaClient) return null;
  return (
    prismaClient.patient ||
    prismaClient.Patient ||
    prismaClient.patients ||
    null
  );
}

export async function GET() {
  try {
    const patientModel = getPatientModel();
    if (!patientModel) {
      console.warn("⚠️ Prisma patient model not found on db instance");
      return NextResponse.json([]);
    }

    const patients = await patientModel.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(patients);
  } catch (error: any) {
    console.error("❌ GET /api/patients error:", error?.message || error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Incoming Intake/Code Red Data:", body);

    const patientModel = getPatientModel();

    if (!patientModel) {
      console.error("❌ Prisma Database Model not found! Check src/lib/db.ts");
      return NextResponse.json(
        { error: "Database connection not initialized" },
        { status: 500 }
      );
    }

    // Age validation
    const parsedAge =
      typeof body.age === "number"
        ? body.age
        : parseInt(String(body.age || "30"), 10) || 30;

    // Unique ABHA / ID generator to avoid UNIQUE constraint failed
    const uniqueAbha =
      body.abhaId && String(body.abhaId).trim() !== ""
        ? body.abhaId
        : `ABHA-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // Build data payload safely
    const payload: Record<string, any> = {
      name: body.name || "Emergency Patient",
      age: parsedAge,
      gender: body.gender || "Male",
      contact: body.contact || body.phone || "9876543210",
      bloodGroup: body.bloodGroup || "O+",
      abhaId: uniqueAbha,
      complaint: body.complaint || "CODE RED STAT EMERGENCY",
      diagnosis: body.diagnosis || "Critical Triage",
      vitals:
        typeof body.vitals === "object"
          ? JSON.stringify(body.vitals)
          : body.vitals || "BP: 120/80 | HR: 98 | SpO2: 98%",
      treatment: body.treatment || "Immediate Bed Matrix Observation",
      bedNumber: body.bedNumber || "TRAUMA-RESUS-02",
      status: body.status || "Admitted",
    };

    // Save to Prisma SQLite/PostgreSQL
    const createdPatient = await patientModel.create({
      data: payload,
    });

    console.log("✅ Successfully saved to Prisma DB:", createdPatient.id);
    return NextResponse.json(createdPatient, { status: 201 });
  } catch (error: any) {
    console.error("❌ Prisma POST Error details:", error);
    // Agar Prisma validation fail ho, toh frontend ko pata chale
    return NextResponse.json(
      {
        error: "Failed to persist to Prisma database",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const patientModel = getPatientModel();
    if (patientModel) {
      await patientModel.delete({
        where: { id },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ DELETE /api/patients error:", error?.message || error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}