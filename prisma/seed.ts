import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoPatients = [
  {
    name: "Aarav Sharma",
    abhaId: "91-4821-9034-1102",
    age: 42,
    gender: "Male",
    contact: "+91 98765 43210",
    bloodGroup: "B+",
    complaint: "Fever, Cough, Fatigue",
    diagnosis: "Suspected acute viral bronchitis. Mild throat congestion noted.",
    treatment: "Hydration and oral antipyretics advised.",
    vitals: JSON.stringify({ bp: "135/88", pulse: 78, temperature: "99.1" }),
    bedNumber: "GEN-01",
    status: "Admitted",
  },
  {
    name: "Sunita Devi",
    abhaId: "91-8842-1923-4411",
    age: 38,
    gender: "Female",
    contact: "+91 91234 56780",
    bloodGroup: "A+",
    complaint: "High fever, chills, severe headache",
    diagnosis: "Dengue NS1 positive, thrombocytopenia monitoring.",
    treatment: "IV fluids 100ml/hr, platelet count monitoring.",
    vitals: JSON.stringify({ bp: "110/70", pulse: 92, temperature: "102.4" }),
    bedNumber: "GEN-02",
    status: "Admitted",
  },
  {
    name: "Rajeshwar Singh",
    abhaId: "91-3312-9901-7782",
    age: 61,
    gender: "Male",
    contact: "+91 99887 76655",
    bloodGroup: "O+",
    complaint: "Retrosternal chest tightness and shortness of breath",
    diagnosis: "Unstable Angina, Non-STEMI ruled out, lipid profile high.",
    treatment: "Dual antiplatelet therapy, Atorvastatin 40mg.",
    vitals: JSON.stringify({ bp: "155/95", pulse: 84, temperature: "98.4" }),
    bedNumber: "ICU-01",
    status: "ICU Care",
  },
  {
    name: "Vikram Malhotra",
    abhaId: "91-7721-3344-9988",
    age: 29,
    gender: "Male",
    contact: "+91 94561 23098",
    bloodGroup: "AB+",
    complaint: "Wheezing, nocturnal cough and breathlessness",
    diagnosis: "Acute exacerbation of bronchial asthma.",
    treatment: "Salbutamol nebulization Q6H, Budecort inhaler.",
    vitals: JSON.stringify({ bp: "124/82", pulse: 88, temperature: "98.6" }),
    bedNumber: "GEN-03",
    status: "Admitted",
  },
];

async function main() {
  console.log("Seeding realistic ABDM clinical records to Neon Cloud...");
  for (const patient of demoPatients) {
    await prisma.patient.upsert({
      where: {
        abhaId: patient.abhaId,
      },
      update: patient,
      create: patient,
    });
  }
  console.log("Database seeded successfully in Neon Cloud!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });