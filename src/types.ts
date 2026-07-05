export type { Food } from "./data";
import { Food } from "./data";

export interface ReceiptItem {
  id: string;
  cleanName: string;
  foodData?: Food;
}

export interface Receipt {
  id: string;
  storeName: string;
  totalAmount: string;
  date: string;
  items: ReceiptItem[];
  score: number;
  positives: string[];
  negatives: string[];
}
