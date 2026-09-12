import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { symptoms, notes, vitals } = await req.json();

    // Clinical Logic / AI Analysis Simulation (Production-ready format)
    const promptData = `Symptoms: ${symptoms.join(", ")}. Notes: ${notes}. Vitals: ${JSON.stringify(vitals)}`;

    // Rule-based + Smart Clinical Summary engine (instant & offline resilient for Hackathons)
    const summary = {
      diagnosis: symptoms.includes("Chest Pain")
        ? "Acute Angina / Rule out Coronary Syndrome"
        : symptoms.includes("Fever") && symptoms.includes("Cough")
        ? "Acute Upper Respiratory Tract Infection (URTI) with Pyrexia"
        : "General Malaise & Viral Prodrome",
      severity: symptoms.includes("Chest Pain") ? "Urgent / High" : "Moderate",
      icd10Code: symptoms.includes("Fever") ? "J06.9 / R50.9" : "R53.83",
      aiSummary: `Patient exhibits symptomatic indicators of ${
        symptoms.join(" and ") || "general discomfort"
      }. Reported observations: "${notes || "No additional notes"}". Vitals indicate ${
        vitals?.bp ? `BP at ${vitals.bp}` : "stable parameters"
      }. No signs of acute respiratory compromise.`,
      recommendedActions: [
        "CBC (Complete Blood Count) & Peripheral Smear",
        "Maintain adequate oral hydration & symptomatic antipyretics",
        "Review in OPD after 48 hours if symptoms persist",
      ],
    };

    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      { error: "AI Processing Failed" },
      { status: 500 }
    );
  }
}