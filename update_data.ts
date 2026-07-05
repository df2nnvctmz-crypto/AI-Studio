import fs from 'fs';

let dataTs = fs.readFileSync('src/data.ts', 'utf8');

const newInterfaces = `
export interface Nutrients {
  kcal: number;
  sugar_g: number;
  fat_g: number;
  saturated_fat_g: number;
  salt_g: number;
  fiber_g: number;
  protein_g: number;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  subCategory?: string; // We might need this for app compat, but json doesn't have it
  health_score: number;
  nutri_grade: string;
  nutrients_per_100: Nutrients;
  swap_suggestion_id: string | null;
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
    'A': { label: 'Nutri-Score A', color: 'bg-green-100 text-green-800' },
    'B': { label: 'Nutri-Score B', color: 'bg-green-50 text-green-700' },
    'C': { label: 'Nutri-Score C', color: 'bg-yellow-100 text-yellow-800' },
    'D': { label: 'Nutri-Score D', color: 'bg-orange-100 text-orange-800' },
    'E': { label: 'Nutri-Score E', color: 'bg-red-100 text-red-800' },
  };
  return grades[grade?.toUpperCase()] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
};

export const getScoreColors = (score: number) => {
  if (score >= 80) return { bg: "bg-[#E5F5E5]", text: "text-[#2E7D32]", border: "border-[#A5D6A7]", gradient: "from-[#2E7D32] to-[#4CAF50]" };
  if (score >= 60) return { bg: "bg-[#FFF3E0]", text: "text-[#EF6C00]", border: "border-[#FFCC80]", gradient: "from-[#EF6C00] to-[#FF9800]" };
  return { bg: "bg-[#FFEBEE]", text: "text-[#C62828]", border: "border-[#EF9A9A]", gradient: "from-[#C62828] to-[#EF5350]" };
};
`;

fs.writeFileSync('src/data.ts', newInterfaces);
