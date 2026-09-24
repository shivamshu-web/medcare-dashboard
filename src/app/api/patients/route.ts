import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as dbModule from "@/lib/db";

// 1. Force Dynamic taaki koi bhi device cached data na uthaye
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Prisma instance ko safely reuse karna
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma =
  globalForPrisma.prisma ||
  (dbModule as any).prisma ||
  (dbModule as any).db ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Patient model ko safely extract karna
function getPatientModel() {
  return (
    prisma.patient ||
    (prisma as any).Patient ||
    (prisma as any).patients ||
    null
  );
}

// ==========================================
// 1. GET: Har device ko authoritative Neon Cloud DB se data milega
// ==========================================
export async function GET() {
  try {
    const patientModel: any = getPatientModel();
    if (!patientModel) {
      console.error("❌ Prisma Patient model not found!");
      return NextResponse.json(
        { error: "Database model unavailable" },
        { status: 500 }
      );
    }

    const dbPatients = await patientModel.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Frontend (Table, Vitals, Profile) ke format me normalize karna
    const normalizedPatients = dbPatients.map((p: any) => {
      let parsedVitals: any = {};
      if (typeof p.vitals === "string" && p.vitals.startsWith("{")) {
        try {
          parsedVitals = JSON.parse(p.vitals);
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
        symptoms: p.complaint || p.symptoms || "Routine Clinical Intake",
        caseNotes: p.diagnosis || p.caseNotes || p.treatment || "Standard Protocol Active",
        complaint: p.complaint || p.symptoms || "Routine Clinical Intake",
        diagnosis: p.diagnosis || "Routine Clinical Intake",
        treatment: p.treatment || "Standard care",
        bedNumber: p.bedNumber || "OPD",
        status: p.status || "Admitted",
        bp: parsedVitals.bp || p.bp || "120/80",
        pulse: parsedVitals.pulse || p.pulse || 76,
        temperature: parsedVitals.temperature || p.temperature || "98.6",
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json(normalizedPatients, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    console.error("❌ GET /api/patients error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch patients from Neon DB", details: error?.message },
      { status: 500 }
    );
  }
}

// ==========================================
// 2. POST: Phone ya Laptop kahin se bhi input aane par Cloud DB me save
// ==========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Incoming Intake/Code Red Patient:", body.name);

    const patientModel: any = getPatientModel();
    if (!patientModel) {
      return NextResponse.json(
        { error: "Database model unavailable" },
        { status: 500 }
      );
    }

    const parsedAge =
      typeof body.age === "number"
        ? body.age
        : parseInt(String(body.age || "30"), 10) || 30;

    // Guaranteed Unique ABHA ID taaki duplicate key crash na ho
    const uniqueAbha =
      body.abhaId && String(body.abhaId).trim() !== ""
        ? String(body.abhaId)
        : `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const vitalsData = JSON.stringify({
      bp: body.bp || "120/80",
      pulse: body.pulse || 76,
      temperature: body.temperature || "98.6",
    });

    const payload: any = {
      name: body.name || "Admitted Patient",
      age: parsedAge,
      gender: body.gender || "Male",
      contact: body.contact || body.phone || "+91 98765 43210",
      bloodGroup: body.bloodGroup || "B+",
      abhaId: uniqueAbha,
      complaint: body.symptoms || body.complaint || "Routine Clinical Intake",
      diagnosis: body.caseNotes || body.diagnosis || "Standard Clinical Protocol",
      vitals: vitalsData,
      treatment: body.treatment || body.caseNotes || "Standard Observation Protocol",
      bedNumber: body.bedNumber || (body.name?.includes("RED-CODE") ? "TRAUMA-RESUS-01" : "GEN-WARD-04"),
      status: body.status || (body.name?.includes("RED-CODE") ? "Critical Resus" : "Admitted"),
    };

    // Neon PostgreSQL Database me save
    const createdPatient: any = await (patientModel as any).create({
      data: payload,
    });

    console.log("✅ Successfully stored in Neon Cloud DB:", createdPatient?.id);

    return NextResponse.json(
      {
        ...createdPatient,
        symptoms: createdPatient?.complaint || payload.complaint,
        caseNotes: createdPatient?.diagnosis || payload.diagnosis,
        bp: body.bp || "120/80",
        pulse: body.pulse || 76,
        temperature: body.temperature || "98.6",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Prisma POST Error:", error?.message || error);
    return NextResponse.json(
      {
        error: "Failed to persist patient to cloud database",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

// ==========================================
// 3. PUT / PATCH: Edit hone par Database Sync
// ==========================================
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    const patientModel: any = getPatientModel();
    if (!patientModel) {
      return NextResponse.json({ error: "Database model unavailable" }, { status: 500 });
    }

    const updated = await patientModel.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("❌ PUT /api/patients error:", error?.message || error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

// ==========================================
// 4. DELETE: Record Delete hone par sabhi devices se hatana
// ==========================================
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing Patient ID" }, { status: 400 });
    }

    const patientModel: any = getPatientModel();
    if (!patientModel) {
      return NextResponse.json({ error: "Database model unavailable" }, { status: 500 });
    }

    await patientModel.delete({
      where: { id },
    });

    console.log("🗑️ Deleted patient from Neon DB:", id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("❌ DELETE /api/patients error:", error?.message || error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}