import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoPatients = [
  {
    name: "Aarav Sharma",
    abhaId: "91-4821-9034-1102",
    age: 42,
    gender: "Male",
    bp: "135/88",
    pulse: "78",
    temperature: "99.1",
    symptoms: "Fever, Cough, Fatigue",
    caseNotes: "Suspected acute viral bronchitis. Mild throat congestion noted. Hydration and oral antipyretics advised.",
  },
  {
    name: "Priya Mukherjee",
    abhaId: "91-8930-1092-4451",
    age: 29,
    gender: "Female",
    bp: "118/76",
    pulse: "70",
    temperature: "98.4",
    symptoms: "Headache, Nausea",
    caseNotes: "Migraine episode without aura triggered by screen fatigue. Prescribed prophylactic rest and analgesics.",
  },
  {
    name: "Rajeshwar Singh",
    abhaId: "91-3049-7712-8823",
    age: 58,
    gender: "Male",
    bp: "150/95",
    pulse: "84",
    temperature: "98.6",
    symptoms: "Chest Pain, Fatigue",
    caseNotes: "Hypertensive urgency baseline. Referred to cardiology OPD for 12-lead ECG and lipid evaluation.",
  },
  {
    name: "Sunita Devi",
    abhaId: "91-2291-0391-7762",
    age: 36,
    gender: "Female",
    bp: "122/82",
    pulse: "74",
    temperature: "101.2",
    symptoms: "Fever, Headache",
    caseNotes: "High grade intermittent pyrexia with chills. Ordered Dengue NS1 Ag and peripheral blood smear.",
  },
  {
    name: "Vikram Malhotra",
    abhaId: "91-6651-4432-9901",
    age: 51,
    gender: "Male",
    bp: "128/84",
    pulse: "76",
    temperature: "98.7",
    symptoms: "Cough, Fatigue",
    caseNotes: "Post-allergic bronchospasm with nocturnal cough. Recommended steam inhalation and levocetirizine.",
  },
];

async function main() {
  console.log("Seeding realistic ABDM clinical records...");
  for (const patient of demoPatients) {
    await prisma.patient.upsert({
      where: { abhaId: patient.abhaId },
      update: {},
      create: patient,
    });
  }
  console.log("Seed data injected successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });