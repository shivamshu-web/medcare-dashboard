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
    // 1. Analgesics & Antipyretics
  { name: "Dolo 650mg", genericName: "Paracetamol", category: "Tablet", batch: "BT-2026-01", stock: 240, unitPrice: 32.0, expiry: "12/2027" },
  { name: "Combiflam", genericName: "Ibuprofen + Paracetamol", category: "Tablet", batch: "BT-2026-02", stock: 180, unitPrice: 45.0, expiry: "11/2027" },
  { name: "Voveran 50mg", genericName: "Diclofenac Sodium", category: "Tablet", batch: "BT-2026-03", stock: 150, unitPrice: 65.0, expiry: "08/2027" },
  { name: "Ultracet", genericName: "Tramadol + Paracetamol", category: "Tablet", batch: "BT-2026-04", stock: 90, unitPrice: 190.0, expiry: "10/2027" },
  { name: "Dynapar AQ 75mg/ml", genericName: "Diclofenac Injection", category: "Injection", batch: "INJ-901", stock: 120, unitPrice: 35.0, expiry: "05/2028" },
  { name: "Tramadol 50mg/ml", genericName: "Tramadol HCl Injection", category: "Injection", batch: "INJ-902", stock: 75, unitPrice: 48.0, expiry: "04/2028" },

  // 2. Antibiotics & Anti-Infectives
  { name: "Augmentin 625 Duo", genericName: "Amoxicillin + Clavulanic Acid", category: "Tablet", batch: "BT-2026-05", stock: 140, unitPrice: 210.0, expiry: "09/2027" },
  { name: "Azithral 500mg", genericName: "Azithromycin", category: "Tablet", batch: "BT-2026-06", stock: 160, unitPrice: 130.0, expiry: "06/2027" },
  { name: "Cifran 500mg", genericName: "Ciprofloxacin", category: "Tablet", batch: "BT-2026-07", stock: 110, unitPrice: 85.0, expiry: "07/2027" },
  { name: "Zifi 200mg", genericName: "Cefixime", category: "Tablet", batch: "BT-2026-08", stock: 130, unitPrice: 115.0, expiry: "03/2028" },
  { name: "Taxim-O 200mg", genericName: "Cefixime Oral", category: "Tablet", batch: "BT-2026-09", stock: 95, unitPrice: 120.0, expiry: "08/2027" },
  { name: "Monocef 1g", genericName: "Ceftriaxone Sodium", category: "Injection", batch: "INJ-903", stock: 110, unitPrice: 95.0, expiry: "12/2027" },
  { name: "Pipzo 4.5g", genericName: "Piperacillin + Tazobactam", category: "Injection", batch: "INJ-904", stock: 60, unitPrice: 480.0, expiry: "11/2027" },
  { name: "Meromac 1g", genericName: "Meropenem IV", category: "Injection", batch: "INJ-905", stock: 45, unitPrice: 890.0, expiry: "10/2027" },
  { name: "Amikacin 500mg", genericName: "Amikacin Sulfate", category: "Injection", batch: "INJ-906", stock: 80, unitPrice: 75.0, expiry: "01/2028" },
  { name: "Metrogyl 400mg", genericName: "Metronidazole", category: "Tablet", batch: "BT-2026-10", stock: 200, unitPrice: 28.0, expiry: "02/2028" },

  // 3. Gastrointestinal & Antacids
  { name: "Pan 40mg", genericName: "Pantoprazole Gastro-Resistant", category: "Tablet", batch: "BT-2026-11", stock: 220, unitPrice: 140.0, expiry: "04/2028" },
  { name: "Pantocid IV 40mg", genericName: "Pantoprazole Injection", category: "Injection", batch: "INJ-907", stock: 130, unitPrice: 55.0, expiry: "03/2028" },
  { name: "Omez 20mg", genericName: "Omeprazole", category: "Capsule", batch: "CAP-101", stock: 180, unitPrice: 60.0, expiry: "07/2027" },
  { name: "Rantac 150mg", genericName: "Ranitidine", category: "Tablet", batch: "BT-2026-12", stock: 140, unitPrice: 42.0, expiry: "05/2027" },
  { name: "Emeset 4mg", genericName: "Ondansetron Oral", category: "Tablet", batch: "BT-2026-13", stock: 150, unitPrice: 52.0, expiry: "06/2027" },
  { name: "Emeset 2ml IV", genericName: "Ondansetron Injection", category: "Injection", batch: "INJ-908", stock: 160, unitPrice: 28.0, expiry: "09/2027" },
  { name: "Cremaffin Plus", genericName: "Liquid Paraffin + Milk of Magnesia", category: "Syrup", batch: "SYR-201", stock: 65, unitPrice: 185.0, expiry: "02/2028" },

  // 4. Cardiac & Anti-Hypertensives
  { name: "Telma 40mg", genericName: "Telmisartan", category: "Tablet", batch: "BT-2026-14", stock: 190, unitPrice: 110.0, expiry: "01/2028" },
  { name: "Amlong 5mg", genericName: "Amlodipine Besylate", category: "Tablet", batch: "BT-2026-15", stock: 210, unitPrice: 45.0, expiry: "08/2027" },
  { name: "Ecosprin 75mg", genericName: "Enteric Coated Aspirin", category: "Tablet", batch: "BT-2026-16", stock: 300, unitPrice: 18.0, expiry: "12/2027" },
  { name: "Clopilet 75mg", genericName: "Clopidogrel", category: "Tablet", batch: "BT-2026-17", stock: 170, unitPrice: 125.0, expiry: "07/2027" },
  { name: "Atorva 20mg", genericName: "Atorvastatin", category: "Tablet", batch: "BT-2026-18", stock: 160, unitPrice: 175.0, expiry: "10/2027" },
  { name: "Sorbitrate 5mg", genericName: "Isosorbide Dinitrate (Sublingual)", category: "Tablet", batch: "BT-2026-19", stock: 130, unitPrice: 38.0, expiry: "11/2027" },
  { name: "Lasix 40mg", genericName: "Furosemide Oral", category: "Tablet", batch: "BT-2026-20", stock: 140, unitPrice: 22.0, expiry: "04/2028" },
  { name: "Lasix 2ml IV", genericName: "Furosemide Injection", category: "Injection", batch: "INJ-909", stock: 115, unitPrice: 18.0, expiry: "03/2028" },

  // 5. Anti-Diabetic & Endocrine
  { name: "Glycomet 500mg SR", genericName: "Metformin Hydrochloride", category: "Tablet", batch: "BT-2026-21", stock: 250, unitPrice: 35.0, expiry: "09/2027" },
  { name: "Amaryl 1mg", genericName: "Glimepiride", category: "Tablet", batch: "BT-2026-22", stock: 140, unitPrice: 85.0, expiry: "06/2027" },
  { name: "Human Mixtard 40IU", genericName: "Biphasic Isophane Insulin", category: "Injection", batch: "INJ-910", stock: 55, unitPrice: 215.0, expiry: "01/2028" },
  { name: "Thyronorm 50mcg", genericName: "Levothyroxine Sodium", category: "Tablet", batch: "BT-2026-23", stock: 190, unitPrice: 165.0, expiry: "03/2028" },

  // 6. Emergency & Critical Care Injections
  { name: "Adrenaline 1:1000", genericName: "Epinephrine Injection", category: "Injection", batch: "INJ-911", stock: 95, unitPrice: 22.0, expiry: "08/2027" },
  { name: "Atropine Sulfate 0.6mg", genericName: "Atropine Injection", category: "Injection", batch: "INJ-912", stock: 85, unitPrice: 16.0, expiry: "07/2027" },
  { name: "Hydrocort 100mg", genericName: "Hydrocortisone Sodium Succinate", category: "Injection", batch: "INJ-913", stock: 70, unitPrice: 42.0, expiry: "12/2027" },
  { name: "Decadron 4mg/ml", genericName: "Dexamethasone Injection", category: "Injection", batch: "INJ-914", stock: 90, unitPrice: 15.0, expiry: "05/2028" },
  { name: "Noradrenaline 2mg/ml", genericName: "Norepinephrine IV Infusion", category: "Injection", batch: "INJ-915", stock: 50, unitPrice: 180.0, expiry: "06/2028" },

  // 7. IV Fluids & Electrolytes
  { name: "Normal Saline (0.9% NaCl 500ml)", genericName: "Sodium Chloride Solution", category: "IV Fluid", batch: "IV-801", stock: 160, unitPrice: 42.0, expiry: "02/2029" },
  { name: "Ringer Lactate (RL 500ml)", genericName: "Compound Sodium Lactate", category: "IV Fluid", batch: "IV-802", stock: 140, unitPrice: 48.0, expiry: "01/2029" },
  { name: "Dextrose 5% (D5 500ml)", genericName: "5% Dextrose Injection", category: "IV Fluid", batch: "IV-803", stock: 120, unitPrice: 44.0, expiry: "11/2028" },
  { name: "Electral ORS Powder", genericName: "Oral Rehydration Salts (WHO Formula)", category: "Sachet", batch: "SAC-01", stock: 350, unitPrice: 22.0, expiry: "09/2028" },

  // 8. Respiratory & Anti-Allergic
  { name: "Asthalin Respules", genericName: "Salbutamol Respirator Solution", category: "Syrup", batch: "RESP-101", stock: 90, unitPrice: 68.0, expiry: "06/2027" },
  { name: "Budecort 0.5mg Respules", genericName: "Budesonide Nebulising Suspension", category: "Syrup", batch: "RESP-102", stock: 80, unitPrice: 110.0, expiry: "07/2027" },
  { name: "Allegra 120mg", genericName: "Fexofenadine Hydrochloride", category: "Tablet", batch: "BT-2026-24", stock: 150, unitPrice: 195.0, expiry: "04/2028" },
  { name: "Avil 25mg", genericName: "Pheniramine Maleate", category: "Tablet", batch: "BT-2026-25", stock: 220, unitPrice: 14.0, expiry: "05/2028" },
  { name: "Ascoril-D Plus", genericName: "Dextromethorphan + CPM Syrup", category: "Syrup", batch: "SYR-202", stock: 110, unitPrice: 135.0, expiry: "08/2027" }
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