
export interface Micronutrients {
  vitamin_a_ug?: number | null;
  betacarotene_ug?: number | null;
  vitamin_b1_mg?: number | null;
  vitamin_b2_mg?: number | null;
  vitamin_b6_mg?: number | null;
  vitamin_b12_ug?: number | null;
  niacin_mg?: number | null;
  folate_ug?: number | null;
  pantothenic_acid_mg?: number | null;
  vitamin_c_mg?: number | null;
  vitamin_d_ug?: number | null;
  vitamin_e_mg?: number | null;
  sodium_mg?: number | null;
  potassium_mg?: number | null;
  chloride_mg?: number | null;
  calcium_mg?: number | null;
  magnesium_mg?: number | null;
  phosphorus_mg?: number | null;
  iron_mg?: number | null;
  iodide_ug?: number | null;
  zinc_mg?: number | null;
}

export interface Nutrients {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  sugars_g: number;
  fat_g: number;
  saturated_fat_g: number;
  fiber_g: number;
  salt_g: number;
  micros?: Micronutrients;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  swiss_category?: string;
  subCategory?: string; // We might need this for app compat, but json doesn't have it
  health_score: number;
  nutri_grade: string;
  nutrients_per_100: Nutrients;
  swap_suggestion_id: string | null;
  nova_group?: number;
}

import rawFoods from './foods.json';
export const CATEGORIES = ['All', 'Produce', 'Dairy & Eggs', 'Pantry', 'Snacks', 'Beverages'];
export const FOODS: Food[] = rawFoods as Food[];

// Removed NovaGroup
export const getNovaDetails = (novaGroup: number) => {
  return { label: "", color: "" };
}

export const getNutriGradeDetails = (grade: string) => {
  const grades: Record<string, { label: string, color: string }> = {
    'A': { label: 'NUTRI SCORE A', color: 'bg-green-100 text-green-800' },
    'B': { label: 'NUTRI SCORE B', color: 'bg-green-50 text-green-700' },
    'C': { label: 'NUTRI SCORE C', color: 'bg-yellow-100 text-yellow-800' },
    'D': { label: 'NUTRI SCORE D', color: 'bg-orange-100 text-orange-800' },
    'E': { label: 'NUTRI SCORE E', color: 'bg-red-100 text-red-800' },
  };
  return grades[grade?.toUpperCase()] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
};

export const getScoreColors = (score: number) => {
  if (score >= 80) return { bg: "bg-[#E5F5E5]", text: "text-[#2E7D32]", border: "border-[#A5D6A7]", gradient: "from-[#2E7D32] to-[#4CAF50]" };
  if (score >= 60) return { bg: "bg-[#FFF3E0]", text: "text-[#EF6C00]", border: "border-[#FFCC80]", gradient: "from-[#EF6C00] to-[#FF9800]" };
  return { bg: "bg-[#FFEBEE]", text: "text-[#C62828]", border: "border-[#EF9A9A]", gradient: "from-[#C62828] to-[#EF5350]" };
};
