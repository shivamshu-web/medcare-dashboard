import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(patients);
  } catch (error: any) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const createdPatient = await (prisma.patient as any).create({
      data: {
        id: body.id || `PAT-${Date.now().toString().slice(-6)}`,
        name: String(body.name || "Walk-in Patient"),
        age: Number(body.age) || 30,
        gender: String(body.gender || "Male"),
        abhaId: String(
          body.abhaId ||
            `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
              1000 + Math.random() * 9000
            )}-${Math.floor(1000 + Math.random() * 9000)}`
        ),
        bp: String(body.bp || "120/80"),
        pulse: String(body.pulse || "72"), // FIX: Prisma schema String expect kar raha hai
        temperature: String(body.temperature || "98.6"),
        symptoms: String(body.symptoms || "General OPD Consultation"),
        caseNotes: String(body.caseNotes || "Routine examination complete."),
      },
    });

    return NextResponse.json(createdPatient, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/patients error:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}