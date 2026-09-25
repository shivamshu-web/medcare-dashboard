import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Initializing Neon PostgreSQL Database setup...");

  // 1. Clean old dummy patient records
  console.log("🧹 Clearing old dummy patient records...");
  await prisma.patient.deleteMany({});
  console.log("✅ Patient table is now clean (0 rows) - Ready for real live intakes.");

  // 2. Clear old appointments & lab items
  await prisma.appointment.deleteMany({});
  await prisma.labItem.deleteMany({});

  // 3. Populate Ward & Critical Care Beds
  console.log("🛏️ Configuring hospital bed capacity...");
  const bedsData = [
    { ward: "Cardio-Thoracic ICU", number: "ICU-BAY-01", status: "Available" },
    { ward: "Red Zone Trauma Bay", number: "TRAUMA-RESUS-02", status: "Available" },
    { ward: "Plastic & Burn Sterile Unit", number: "BURN-STERILE-03", status: "Available" },
    { ward: "General Ward", number: "GEN-WARD-04", status: "Available" },
    { ward: "General Ward", number: "GEN-WARD-05", status: "Available" },
    { ward: "Emergency Observation", number: "EMERG-OBS-06", status: "Available" },
  ];

  for (const bed of bedsData) {
    await prisma.bed.upsert({
      where: { number: bed.number },
      update: { status: "Available", patientName: null, abhaId: null, admitTime: null },
      create: bed,
    });
  }

  // 4. Populate Blood Bank Stock
  console.log("🩸 Initializing Blood Bank units...");
  const bloodGroups = [
    { group: "A+", unitsAvailable: 12, criticalThreshold: 5 },
    { group: "A-", unitsAvailable: 4, criticalThreshold: 3 },
    { group: "B+", unitsAvailable: 15, criticalThreshold: 5 },
    { group: "B-", unitsAvailable: 3, criticalThreshold: 3 },
    { group: "AB+", unitsAvailable: 6, criticalThreshold: 2 },
    { group: "AB-", unitsAvailable: 2, criticalThreshold: 2 },
    { group: "O+", unitsAvailable: 18, criticalThreshold: 6 },
    { group: "O-", unitsAvailable: 5, criticalThreshold: 4 },
  ];

  for (const bg of bloodGroups) {
    await prisma.bloodStock.upsert({
      where: { group: bg.group },
      update: { unitsAvailable: bg.unitsAvailable, criticalThreshold: bg.criticalThreshold },
      create: bg,
    });
  }

  // 5. Populate Essential Pharmacy Formulary
  console.log("💊 Stocking essential hospital medicine inventory...");
  await prisma.medicine.deleteMany({});
  const medicines = [
    {
      name: "Dolo 650mg",
      genericName: "Paracetamol",
      category: "Tablet",
      batch: "BT-2026-91",
      stock: 150,
      unitPrice: 30.0,
      expiry: "12/2027",
    },
    {
      name: "Augmentin 625 Duo",
      genericName: "Amoxicillin + Clavulanic Acid",
      category: "Tablet",
      batch: "BT-2026-44",
      stock: 65,
      unitPrice: 195.0,
      expiry: "09/2027",
    },
    {
      name: "Ceftriaxone 1g",
      genericName: "Ceftriaxone Sodium",
      category: "Injection",
      batch: "INJ-904",
      stock: 40,
      unitPrice: 85.0,
      expiry: "05/2027",
    },
    {
      name: "Normal Saline (0.9% NaCl 500ml)",
      genericName: "Sodium Chloride IV",
      category: "IV Fluid",
      batch: "IV-882",
      stock: 80,
      unitPrice: 45.0,
      expiry: "01/2028",
    },
  ];

  for (const med of medicines) {
    await prisma.medicine.create({ data: med });
  }

  console.log("✨ All tables configured and ready in Neon PostgreSQL Cloud!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });