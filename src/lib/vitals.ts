export interface VitalsInput {
  weightKg?: number;
  heightCm?: number;
  systolicBp?: number;
  diastolicBp?: number;
}

export function calculateBMI(weightKg?: number, heightCm?: number) {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = +(weightKg / (heightM * heightM)).toFixed(1);

  let category = "Normal";
  let color = "text-emerald-600 bg-emerald-50 border-emerald-200";

  if (bmi < 18.5) {
    category = "Underweight";
    color = "text-amber-600 bg-amber-50 border-amber-200";
  } else if (bmi >= 25 && bmi < 30) {
    category = "Overweight";
    color = "text-amber-600 bg-amber-50 border-amber-200";
  } else if (bmi >= 30) {
    category = "Obese";
    color = "text-rose-600 bg-rose-50 border-rose-200";
  }

  return { value: bmi, category, color };
}

export function calculateMAP(systolic?: number, diastolic?: number) {
  if (!systolic || !diastolic) return null;
  const map = Math.round((systolic + 2 * diastolic) / 3);

  let status = "Adequate Perfusion";
  let color = "text-emerald-600 bg-emerald-50 border-emerald-200";

  if (map < 65) {
    status = "Low Perfusion Risk";
    color = "text-rose-600 bg-rose-50 border-rose-200";
  } else if (map > 105) {
    status = "Elevated Pressure";
    color = "text-amber-600 bg-amber-50 border-amber-200";
  }

  return { value: map, status, color };
}