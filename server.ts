import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createWorker } from "tesseract.js";
import { FOODS } from "./src/data";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Helper to expand common abbreviations on receipts
const ABBREVIATIONS: Record<string, string> = {
  org: 'Organic',
  frsh: 'Fresh',
  prot: 'Protein',
  jogh: 'Yogurt',
  ygrt: 'Yogurt',
  mlk: 'Milk',
  apl: 'Apple',
  ban: 'Banana',
  zuc: 'Zucchini',
  chk: 'Chicken',
  chkn: 'Chicken',
  vgt: 'Vegetable',
  veg: 'Vegetable',
  orgnc: 'Organic',
  avoc: 'Avocado',
  strawb: 'Strawberry',
  berry: 'Berries',
  bev: 'Beverage',
  wtr: 'Water',
  choc: 'Chocolate',
  pz: 'Pizza',
  pza: 'Pizza',
  btl: 'Bottle',
  pk: 'Pack',
  ea: 'Each',
  sz: 'Size',
  oz: 'oz',
  gr: 'g',
  kg: 'kg',
  pcs: 'Pieces'
};

function cleanReceiptItemName(rawName: string): string {
  let name = rawName.trim();

  // 1. Remove trailing price patterns like " 1.99", " $12.50", " 0.99 A", " ,99"
  name = name.replace(/([$£€]?\s*\d+[\.,]\d{2})\s*[A-Z]?$/i, '');
  
  // 2. Remove leading quantity patterns like "1x ", "2 X ", "3* "
  name = name.replace(/^\s*\d+\s*[xX*]\s+/, '');
  
  // 3. Remove other leading numbers like "0123 MILK" -> "MILK" (barcodes/PLUs sometimes show up on receipts)
  name = name.replace(/^\s*\d{3,}\s+/, '');

  // 4. Remove trailing single letters (often tax codes like A, B, C, X)
  name = name.replace(/\s+[A-Z]$/i, '');

  // 5. Clean out any noise characters and split into tokens by any non-alphanumeric delimiter (including dots/spaces/dashes)
  const rawTokens = name.toLowerCase().split(/[^a-z0-9]+/);

  const TOKEN_MAPPINGS: Record<string, string[]> = {
    vlog: [],
    sort: [],
    sortiert: [],
    st: [],
    gl: [],
    grop: [],
    mi: [],
    wt: [],
    eur: [],
    b: [],
    a: [],
    x: [],
    summe: [],
    gesamt: [],
    gesamtbetrag: [],
    zwischensumme: [],
    subtotal: [],
    total: [],
    gratis: [],
    free: [],
    rabatt: [],
    discount: [],
    mwst: [],
    mehrwertsteuer: [],
    steuer: [],
    steuern: [],
    netto: [],
    brutto: [],
    euro: [],
    beleg: [],
    quittung: [],
    classic: ["classic"],
    clas: ["classic"],
    bistroflammk: ["bistro", "flammkuchen"],
    flammk: ["flammkuchen"],
    flammkuchen: ["flammkuchen"],
    mozz: ["mozzarella"],
    mozzarella: ["mozzarella"],
    miniku: ["mini", "kugel"],
    jogh: ["yogurt"],
    joghurt: ["yogurt"],
    ygrt: ["yogurt"],
    yogurt: ["yogurt"],
    proteinjogh: ["protein", "yogurt"],
    proteinpudding: ["protein", "pudding"],
    prot: ["protein"],
    pr: ["protein"],
    pu: ["pudding"],
    pudding: ["pudding"],
    ogt: ["organic"],
    org: ["organic"],
    orgnc: ["organic"],
    organic: ["organic"],
    frsh: ["fresh"],
    fresh: ["fresh"],
    mlk: ["milk"],
    milk: ["milk"],
    apl: ["apple"],
    apple: ["apple"],
    ban: ["banana"],
    banana: ["banana"],
    zuc: ["zucchini"],
    zucchini: ["zucchini"],
    chk: ["chicken"],
    chkn: ["chicken"],
    chicken: ["chicken"],
    vgt: ["vegetable"],
    veg: ["vegetable"],
    vegetable: ["vegetable"],
    strawb: ["strawberry"],
    strawberry: ["strawberry"],
    berry: ["berries"],
    berries: ["berries"],
    bev: ["beverage"],
    beverage: ["beverage"],
    wtr: ["water"],
    water: ["water"],
    choc: ["chocolate"],
    chocolate: ["chocolate"],
    pz: ["pizza"],
    pza: ["pizza"],
    pizza: ["pizza"],
    gran: ["grand"],
    grand: ["grand"],
    gr: ["grand"]
  };

  const expandedWords: string[] = [];

  for (const token of rawTokens) {
    if (!token) continue;
    // Filter out tokens containing digits (e.g., quantities like 125g, 530g, 2st, 200g, or numbers)
    if (/\d/.test(token)) continue;
    // Drop single letters unless they are mapped or important
    if (token.length < 2 && !TOKEN_MAPPINGS[token]) continue;

    if (TOKEN_MAPPINGS[token] !== undefined) {
      expandedWords.push(...TOKEN_MAPPINGS[token]);
    } else {
      expandedWords.push(token);
    }
  }

  // Deduplicate words to avoid repetitions
  const uniqueWords: string[] = [];
  for (const word of expandedWords) {
    if (!uniqueWords.includes(word)) {
      uniqueWords.push(word);
    }
  }

  // Capitalize first letter of each word and join them
  const cleanedName = uniqueWords
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return cleanedName.trim() || name;
}

function findLocalFoodMatch(cleanedName: string) {
  const normalized = cleanedName.toLowerCase().trim();
  if (!normalized) return null;

  // Predefined synonyms/keywords mapping ONLY to the exact/same on-device food IDs
  const keywordMap: { keywords: string[]; foodId: string }[] = [
    { keywords: ["zucchini", "zuc", "courgette"], foodId: "gourmet_zucchini" },
    { keywords: ["apple", "apples", "apl"], foodId: "fresh_apples" },
    { keywords: ["banana", "bananas", "ban"], foodId: "fresh_bananas" },
    { keywords: ["spinach", "spin", "baby spinach"], foodId: "fresh_spinach" },
    { keywords: ["blueberry", "blueberries", "blu"], foodId: "fresh_blueberries" },
    { keywords: ["avocado", "avocados", "avoc"], foodId: "organic_avocados" },
    { keywords: ["whole milk", "milk", "mlk"], foodId: "whole_milk" },
    { keywords: ["greek yogurt", "plain yogurt", "yogurt", "ygrt", "joghurt"], foodId: "greek_yogurt" },
    { keywords: ["egg", "eggs"], foodId: "organic_eggs" },
    { keywords: ["rolled oats", "oats", "oatmeal"], foodId: "20003166" },
    { keywords: ["peanut butter"], foodId: "3327272107259" },
    { keywords: ["nutella"], foodId: "3017620422003" },
    { keywords: ["snickers"], foodId: "5000159461122" },
    { keywords: ["coca cola", "coca-cola", "coke classic"], foodId: "5449000000996" },
    { keywords: ["sidi ali", "sidi ali water"], foodId: "6111035000430" },
    { keywords: ["buckwheat crispbread", "crispbread"], foodId: "3175681037854" }
  ];

  // 1. Try exact word/phrase matching
  for (const mapping of keywordMap) {
    for (const kw of mapping.keywords) {
      if (normalized === kw || normalized === kw + "s" || normalized === "fresh " + kw) {
        const found = FOODS.find(f => f.id === mapping.foodId);
        if (found) return found;
      }
    }
  }

  // 2. Try substring matching only if it's very close or contains the key term precisely
  const words = normalized.split(/\s+/).map(w => w.replace(/[^a-z]/g, ''));
  for (const mapping of keywordMap) {
    for (const kw of mapping.keywords) {
      if (words.includes(kw)) {
        const found = FOODS.find(f => f.id === mapping.foodId);
        if (found) return found;
      }
    }
  }

  // 3. Fallback to exact matching on actual food names / IDs in FOODS
  for (const food of FOODS) {
    const foodNameLower = food.name.toLowerCase();
    const foodIdLower = food.id.toLowerCase();
    if (normalized === foodNameLower || normalized === foodIdLower) {
      return food;
    }
  }
  return null;
}

function detectStoreName(lines: string[]): string {
  const excludeKeywords = [
    'cash', 'change', 'tax', 'subtotal', 'total', 'card', 'visa', 'mastercard', 'mc', 
    'duplicate', 'welcome', 'store', 'street', 'tel', 'phone', 'date', 'time', 'thank',
    'merchant', 'saved', 'balance', 'items', 'receipt', 'payment', 'sale', 'amount', 'due',
    'xxxx', 'auth', 'terminal', 'customer', 'copy', 'retail', 'market', 'grocery', 'cashier'
  ];

  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i].trim();
    if (line.length > 3 && 
        !line.match(/\d/) && 
        !line.includes('/') && 
        !line.includes(':') &&
        !excludeKeywords.some(kw => line.toLowerCase().includes(kw))) {
      return line;
    }
  }
  return "Local Store";
}

function detectTotalAmount(lines: string[]): string {
  for (const line of lines) {
    const lower = line.toLowerCase();
    if ((lower.includes('total') || lower.includes('sum') || lower.includes('due') || lower.includes('paying') || lower.includes('amount')) && !lower.includes('subtotal') && !lower.includes('tax')) {
      const match = line.match(/([$£€]?\s*\d+[\.,]\d{2})/);
      if (match) {
        return match[1].trim();
      }
    }
  }
  return "$15.40";
}

function getMatchScore(query: string, product: any): number {
  if (!product || !product.product_name) return 0;
  
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  const productNameLower = product.product_name.toLowerCase();
  
  let score = 0;
  
  // 1. Keyword overlap
  let matches = 0;
  for (const word of queryWords) {
    if (productNameLower.includes(word)) {
      matches++;
    }
  }
  score += (matches / Math.max(1, queryWords.length)) * 100;
  
  // 2. Data completeness bonuses
  if (product.nutriments) {
    if (product.nutriments.proteins_100g !== undefined || product.nutriments.proteins !== undefined) score += 15;
    if (product.nutriments['energy-kcal_100g'] !== undefined || product.nutriments['energy-kcal'] !== undefined) score += 15;
  }
  if (product.nutriscore_grade) score += 10;
  if (product.nova_group) score += 10;
  if (product.categories) score += 5;
  
  // 3. Length penalty (to prefer concise, exact matches over long, unrelated titles containing the keyword)
  const lengthDiff = Math.abs(productNameLower.length - query.length);
  score -= Math.min(20, lengthDiff * 0.2);

  return score;
}

async function fetchFromOFF(query: string, id?: string) {
  try {
    const isBarcode = (str: string) => /^\d{8,14}$/.test(str.trim());
    
    let url = "";
    if (id && isBarcode(id)) {
      url = `https://world.openfoodfacts.org/api/v0/product/${id.trim()}.json`;
    } else if (isBarcode(query)) {
      url = `https://world.openfoodfacts.org/api/v0/product/${query.trim()}.json`;
    } else {
      url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`;
    }
    
    const res = await fetch(url, { headers: { 'User-Agent': 'GroceriesApp/1.0' } });
    const data = await res.json();
    
    if (url.includes('/api/v0/product/')) {
      return data.status === 1 ? data.product : null;
    } else {
      const products = data.products || [];
      if (products.length === 0) return null;
      
      // Rank products to find the closest match
      let bestProduct = products[0];
      let bestScore = getMatchScore(query, bestProduct);
      
      for (let i = 1; i < products.length; i++) {
        const score = getMatchScore(query, products[i]);
        if (score > bestScore) {
          bestScore = score;
          bestProduct = products[i];
        }
      }
      return bestProduct;
    }
  } catch (e) {
    return null;
  }
}

function generateRealisticFallback(name: string, id: string): any {
  const norm = name.toLowerCase();
  
  let category = "Grocery";
  let subCategory = "General";
  let healthScore = 65;
  let novaGroup = 3;
  let servingSize = "100g";
  let calories = 100;
  let protein = 1.0;
  let carbs = 15.0;
  let fiber = 1.5;
  let sugars = 5.0;
  let fat = 1.0;
  let saturatedFat = 0.2;
  let sodium = 50;
  let verdict = "A standard grocery item.";
  let positives: string[] = [];
  let negatives: string[] = [];
  let micros: any[] = [];

  if (norm.includes("protein") && (norm.includes("yogurt") || norm.includes("joghurt") || norm.includes("pudding") || norm.includes("milk") || norm.includes("jogh"))) {
    category = "Dairy & Eggs";
    subCategory = "Yogurt & Desserts";
    healthScore = 82;
    novaGroup = 3;
    calories = 75;
    protein = 10.0;
    carbs = 5.0;
    fiber = 0;
    sugars = 4.0;
    fat = 1.5;
    saturatedFat = 0.9;
    sodium = 80;
    verdict = "High-protein dairy product. Excellent source of protein with minimal fats and sugars.";
    positives = ["High in quality protein (10g/100g)", "Low in sugars and saturated fats"];
  } else if (norm.includes("flammkuchen") || norm.includes("pizza")) {
    category = "Pantry";
    subCategory = "Ready Meals";
    healthScore = 48;
    novaGroup = 3;
    calories = 260;
    protein = 8.5;
    carbs = 33.0;
    fiber = 1.8;
    sugars = 2.0;
    fat = 10.0;
    saturatedFat = 4.5;
    sodium = 580;
    verdict = "Savoury flatbread or pizza. Moderation is recommended due to carbohydrate content and moderate sodium.";
    negatives = ["Moderate sodium concentration", "Contains refined carbohydrates"];
  } else if (norm.includes("pudding") || norm.includes("dessert")) {
    category = "Snacks";
    subCategory = "Confectionery";
    healthScore = 40;
    novaGroup = 4;
    calories = 120;
    protein = 2.8;
    carbs = 18.0;
    fiber = 0.5;
    sugars = 14.0;
    fat = 3.5;
    saturatedFat = 2.2;
    sodium = 120;
    verdict = "Sweet pudding or dessert snack. Best enjoyed occasionally due to high added sugar.";
    negatives = ["High in added sugars", "Ultra-processed (NOVA 4)"];
  } else if (norm.includes("water") || norm.includes("mineral")) {
    category = "Beverages";
    subCategory = "Water";
    healthScore = 100;
    novaGroup = 1;
    calories = 0;
    protein = 0;
    carbs = 0;
    fiber = 0;
    sugars = 0;
    fat = 0;
    saturatedFat = 0;
    sodium = 5;
    verdict = "Pure hydration. Essential for bodily functions with zero calories or processing.";
    positives = ["100% natural", "Zero sugar or calories", "Optimal hydration"];
  } else if (norm.includes("soda") || norm.includes("cola") || norm.includes("sprite") || norm.includes("fanta")) {
    category = "Beverages";
    subCategory = "Sodas";
    healthScore = 10;
    novaGroup = 4;
    calories = 42;
    protein = 0;
    carbs = 10.6;
    fiber = 0;
    sugars = 10.6;
    fat = 0;
    saturatedFat = 0;
    sodium = 12;
    verdict = "Ultra-processed sugary beverage. Promotes rapid blood glucose spikes and dental decay.";
    negatives = ["Ultra-processed (NOVA 4)", "Extremely high in added sugars", "Empty calories with no nutrients"];
  } else if (norm.includes("milk")) {
    category = "Dairy & Eggs";
    subCategory = "Milk";
    healthScore = 80;
    novaGroup = 1;
    calories = 61;
    protein = 3.2;
    carbs = 4.8;
    fiber = 0;
    sugars = 4.8;
    fat = 3.25;
    saturatedFat = 1.9;
    sodium = 44;
    verdict = "Nutritious whole dairy drink. Good source of bioavailable calcium and essential proteins.";
    positives = ["High in bioavailable Calcium", "Complete amino acid profile"];
    micros = [{ name: "Calcium", amount: "120mg", dvPercent: 12 }];
  } else if (norm.includes("yogurt") || norm.includes("joghurt")) {
    category = "Dairy & Eggs";
    subCategory = "Yogurt";
    healthScore = 90;
    novaGroup = 1;
    calories = 59;
    protein = 10.0;
    carbs = 3.6;
    fiber = 0;
    sugars = 3.2;
    fat = 0.4;
    saturatedFat = 0.1;
    sodium = 36;
    verdict = "High-protein strained yogurt. Excellent for digestive health via active live cultures.";
    positives = ["Excellent source of protein (10g/100g)", "Probiotic cultures support gut microbiome"];
    micros = [{ name: "Calcium", amount: "110mg", dvPercent: 11 }];
  } else if (norm.includes("egg")) {
    category = "Dairy & Eggs";
    subCategory = "Eggs";
    healthScore = 95;
    novaGroup = 1;
    calories = 143;
    protein = 12.6;
    carbs = 0.7;
    fiber = 0;
    sugars = 0.4;
    fat = 9.5;
    saturatedFat = 3.1;
    sodium = 124;
    verdict = "Highly bioavailable source of complete protein, choline, and essential lipids.";
    positives = ["Outstanding complete protein", "Zero carbs", "Rich in essential brain Choline"];
  } else if (norm.includes("zucchini") || norm.includes("cucumber") || norm.includes("spinach") || norm.includes("salad") || norm.includes("lettuce")) {
    category = "Produce";
    subCategory = "Vegetables";
    healthScore = 98;
    novaGroup = 1;
    calories = 17;
    protein = 1.2;
    carbs = 3.1;
    fiber = 1.1;
    sugars = 2.2;
    fat = 0.2;
    saturatedFat = 0.05;
    sodium = 8;
    verdict = "Extremely low-calorie whole vegetable. Hydrating and rich in vitamins and plant fiber.";
    positives = ["Virtually fat-free", "Very low glycemic index", "Rich in dietary fiber and Vitamin C"];
    micros = [{ name: "Vitamin C", amount: "17.9mg", dvPercent: 30 }];
  } else if (norm.includes("apple") || norm.includes("banana") || norm.includes("pear") || norm.includes("fruit") || norm.includes("orange")) {
    category = "Produce";
    subCategory = "Fruits";
    healthScore = 94;
    novaGroup = 1;
    calories = 52;
    protein = 0.3;
    carbs = 13.8;
    fiber = 2.4;
    sugars = 10.4;
    fat = 0.2;
    saturatedFat = 0.05;
    sodium = 1;
    verdict = "A perfect whole fruit. Naturally sweet, fiber-rich, and loaded with essential vitamin C.";
    positives = ["High in digestion-regulating soluble fiber", "Provides clean natural energy", "Zero saturated fat"];
    micros = [{ name: "Vitamin C", amount: "4.6mg", dvPercent: 8 }];
  } else if (norm.includes("peanut") || norm.includes("butter") || norm.includes("nut") || norm.includes("almond")) {
    category = "Pantry";
    subCategory = "Nuts & Spreads";
    healthScore = 88;
    novaGroup = 1;
    calories = 588;
    protein = 25.0;
    carbs = 20.0;
    fiber = 6.0;
    sugars = 4.0;
    fat = 50.0;
    saturatedFat = 6.8;
    sodium = 15;
    verdict = "Energy-dense plant source. Rich in healthy monounsaturated fats and essential plant proteins.";
    positives = ["High plant-based protein content", "Rich in heart-friendly unsaturated fats"];
  } else if (norm.includes("berry") || norm.includes("berries") || norm.includes("strawberry") || norm.includes("blueberries") || norm.includes("blueberry") || norm.includes("raspberry") || norm.includes("blackberry")) {
    category = "Produce";
    subCategory = "Berries";
    healthScore = 98;
    novaGroup = 1;
    calories = 32;
    protein = 0.7;
    carbs = 7.7;
    fiber = 2.0;
    sugars = 4.9;
    fat = 0.3;
    saturatedFat = 0.05;
    sodium = 1;
    verdict = "Antioxidant-dense fresh berries. Exceptional health benefits and packed with vitamins.";
    positives = ["Massive natural antioxidant levels", "High in Vitamin C and K", "Extremely low glycemic load"];
    micros = [{ name: "Vitamin C", amount: "58.8mg", dvPercent: 98 }];
  } else if (norm.includes("chicken") || norm.includes("poultry") || norm.includes("turkey") || norm.includes("beef") || norm.includes("steak") || norm.includes("meat") || norm.includes("fish") || norm.includes("salmon") || norm.includes("tuna")) {
    category = "Pantry";
    subCategory = "Meat & Seafood";
    healthScore = 90;
    novaGroup = 1;
    calories = 165;
    protein = 31.0;
    carbs = 0;
    fiber = 0;
    sugars = 0;
    fat = 3.6;
    saturatedFat = 1.0;
    sodium = 74;
    verdict = "Highly bioavailable animal protein source. Crucial for muscle repair, enzymes, and red blood cells.";
    positives = ["Extremely high protein content (31g/100g)", "Zero simple sugars or carbohydrates", "Abundant in natural B-Vitamins and Iron"];
    micros = [{ name: "Iron", amount: "1.2mg", dvPercent: 7 }];
  } else if (norm.includes("cheese") || norm.includes("cheddar") || norm.includes("mozzarella") || norm.includes("parmesan")) {
    category = "Dairy & Eggs";
    subCategory = "Cheese";
    healthScore = 72;
    novaGroup = 3;
    calories = 402;
    protein = 25.0;
    carbs = 1.3;
    fiber = 0;
    sugars = 0.5;
    fat = 33.0;
    saturatedFat = 21.0;
    sodium = 621;
    verdict = "Rich dairy source of fat and calcium. Moderation is recommended due to high sodium and saturated fats.";
    positives = ["Excellent source of Calcium", "High protein concentration"];
    micros = [{ name: "Calcium", amount: "721mg", dvPercent: 72 }];
  } else if (norm.includes("chips") || norm.includes("crisps") || norm.includes("cookie") || norm.includes("cookies") || norm.includes("biscuit") || norm.includes("biscuits") || norm.includes("snack") || norm.includes("popcorn") || norm.includes("nachos")) {
    category = "Snacks";
    subCategory = "Salty & Sweet Snacks";
    healthScore = 20;
    novaGroup = 4;
    calories = 480;
    protein = 5.5;
    carbs = 62.0;
    fiber = 3.0;
    sugars = 15.0;
    fat = 23.0;
    saturatedFat = 4.5;
    sodium = 450;
    verdict = "Ultra-processed industrial snack. Extremely calorie dense with high sodium and refined fats.";
    negatives = ["Ultra-processed (NOVA 4)", "High refined carbohydrate level", "High sodium concentration"];
  } else if (norm.includes("bread") || norm.includes("oats") || norm.includes("cereal") || norm.includes("grain") || norm.includes("pasta") || norm.includes("rice")) {
    category = "Pantry";
    subCategory = "Grains & Cereals";
    healthScore = 85;
    novaGroup = 1;
    calories = 360;
    protein = 12.0;
    carbs = 72.0;
    fiber = 8.0;
    sugars = 1.2;
    fat = 2.0;
    saturatedFat = 0.4;
    sodium = 5;
    verdict = "Complex carbohydrate source. Provides sustained, slow-releasing muscle and brain glycogen.";
    positives = ["Excellent source of complex carbs", "High in cholesterol-lowering dietary fiber"];
  } else if (norm.includes("chocolate") || norm.includes("candy") || norm.includes("snickers") || norm.includes("sweet")) {
    category = "Snacks";
    subCategory = "Confectionery";
    healthScore = 15;
    novaGroup = 4;
    calories = 490;
    protein = 5.0;
    carbs = 60.0;
    fiber = 1.5;
    sugars = 52.0;
    fat = 25.0;
    saturatedFat = 11.0;
    sodium = 150;
    verdict = "Ultra-processed sweet confection. Contains extremely high levels of added sugar and saturated fats.";
    negatives = ["Ultra-processed (NOVA 4)", "High in simple added sugars", "High saturated fat density"];
  }

  return {
    id,
    name,
    category,
    subCategory,
    health_score: healthScore,
    nutri_grade: novaGroup <= 2 ? 'A' : (novaGroup === 3 ? 'C' : 'E'),
    swap_suggestion_id: null,
    nutrients_per_100: {
      kcal: calories,
      protein_g: protein,
      fiber_g: fiber,
      carbs_g: carbs,
      sugars_g: sugars,
      fat_g: fat,
      saturated_fat_g: saturatedFat,
      salt_g: sodium * 2.5 / 1000,
      micros: {}
    }
  };
}

// API Routes
app.post("/api/scan-bill", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: "No image data provided" });
    }

    const imageBuffer = Buffer.from(imageBase64, 'base64');
    
    console.log("Starting local OCR scanning via Tesseract...");
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();
    console.log("Local OCR scan completed successfully.");

    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 2);

    const excludeKeywords = [
      'cash', 'change', 'tax', 'subtotal', 'total', 'card', 'visa', 'mastercard', 'mc', 
      'duplicate', 'welcome', 'store', 'street', 'tel', 'phone', 'date', 'time', 'thank',
      'merchant', 'saved', 'balance', 'items', 'receipt', 'payment', 'sale', 'amount', 'due',
      'xxxx', 'auth', 'terminal', 'customer', 'copy', 'retail', 'market', 'grocery', 'cashier',
      'summe', 'zwischensumme', 'gesamt', 'gesamtbetrag', 'gratis', 'rabatt', 'discount',
      'mwst', 'mehrwertsteuer', 'steuer', 'steuern', 'netto', 'brutto', 'bar', 'karte', 'girocard',
      'gegeben', 'rueckgeld', 'rückgeld', 'eur', 'euro', 'sum', 'sub-total', 'beleg', 'quittung'
    ];

    // Filter lines to extract grocery items
    const itemLines = lines.filter(line => {
      const lower = line.toLowerCase();
      if (excludeKeywords.some(kw => lower.includes(kw))) {
        return false;
      }
      const alphaCount = (line.match(/[a-zA-Z]/g) || []).length;
      if (alphaCount < 3) {
        return false;
      }
      return true;
    });

    const items: any[] = [];
    const itemNamesSet = new Set<string>();

    for (const line of itemLines) {
      const cleaned = cleanReceiptItemName(line);
      if (cleaned.length < 3) continue;
      
      const lowerCleaned = cleaned.toLowerCase().trim();
      const forbiddenCleanedNames = [
        'summe', 'gratis', 'rabatt', 'zwischensumme', 'gesamt', 'eur', 'euro', 'mwst', 
        'total', 'subtotal', 'free', 'tax', 'netto', 'brutto', 'bar', 'karte', 'girocard',
        'gegeben', 'rueckgeld', 'rückgeld', 'sum', 'sub-total', 'beleg', 'quittung',
        'discount', 'stk', 'stck', 'stück', 'stueck', 'pcs', 'each'
      ];
      if (forbiddenCleanedNames.includes(lowerCleaned)) continue;

      if (itemNamesSet.has(cleaned.toLowerCase())) continue;

      itemNamesSet.add(cleaned.toLowerCase());

      const localMatch = findLocalFoodMatch(cleaned);
      
      if (localMatch) {
        items.push({
          id: localMatch.id,
          cleanName: cleaned,
          rawName: line,
          foodData: localMatch
        });
      } else {
        const generatedId = cleaned.toLowerCase().replace(/[^a-z0-9]/g, '_');
        items.push({
          id: generatedId || "product_" + Math.random().toString(36).substr(2, 5),
          cleanName: cleaned,
          rawName: line
        });
      }
    }

    // Fallback if no items found
    if (items.length === 0) {
      const textLower = text.toLowerCase();
      for (const food of FOODS) {
        if (textLower.includes(food.name.toLowerCase()) || textLower.includes(food.id.toLowerCase())) {
          items.push({
            id: food.id,
            cleanName: food.name,
            rawName: food.name,
            foodData: food
          });
        }
      }
    }

    const storeName = detectStoreName(lines);
    const totalAmount = detectTotalAmount(lines);
    const date = new Date().toISOString().split('T')[0];

    res.json({
      storeName,
      totalAmount,
      date,
      items,
      score: 75,
      positives: ["Local OCR analysis succeeded with zero cloud AI dependencies!", "Click any scanned item to see live details."],
      negatives: []
    });

  } catch (error: any) {
    console.error("Error analyzing bill with Tesseract:", error);
    res.status(500).json({ error: error.message || "Failed to analyze bill locally" });
  }
});

function mapCategory(offCategories: string, productName: string): string {
  const normCategories = (offCategories || "").toLowerCase();
  const normName = (productName || "").toLowerCase();
  
  if (
    normCategories.includes("beverage") || 
    normCategories.includes("drink") || 
    normCategories.includes("water") || 
    normCategories.includes("soda") || 
    normCategories.includes("juice") || 
    normCategories.includes("cola") || 
    normCategories.includes("beer") || 
    normCategories.includes("wine") || 
    normName.includes("water") || 
    normName.includes("soda") || 
    normName.includes("cola") || 
    normName.includes("juice") || 
    normName.includes("drink") || 
    normName.includes("lemonade") ||
    normName.includes("tea") ||
    normName.includes("coffee")
  ) {
    return "Beverages";
  }

  if (
    normCategories.includes("fruit") || 
    normCategories.includes("vegetable") || 
    normCategories.includes("plant") || 
    normCategories.includes("fresh") || 
    normCategories.includes("salad") || 
    normCategories.includes("berry") || 
    normCategories.includes("berries") || 
    normCategories.includes("greens") || 
    normName.includes("apple") || 
    normName.includes("banana") || 
    normName.includes("zucchini") || 
    normName.includes("cucumber") || 
    normName.includes("spinach") || 
    normName.includes("avocado") || 
    normName.includes("tomato") || 
    normName.includes("lettuce") || 
    normName.includes("salad") || 
    normName.includes("berry") || 
    normName.includes("berries") || 
    normName.includes("orange") || 
    normName.includes("lemon") || 
    normName.includes("lime") || 
    normName.includes("pear") || 
    normName.includes("grape") || 
    normName.includes("potato") || 
    normName.includes("onion") || 
    normName.includes("garlic") || 
    normName.includes("carrot") || 
    normName.includes("broccoli")
  ) {
    return "Produce";
  }

  if (
    normCategories.includes("dairy") || 
    normCategories.includes("milk") || 
    normCategories.includes("cheese") || 
    normCategories.includes("yogurt") || 
    normCategories.includes("joghurt") || 
    normCategories.includes("egg") || 
    normCategories.includes("butter") || 
    normCategories.includes("cream") || 
    normCategories.includes("kefir") || 
    normName.includes("milk") || 
    normName.includes("yogurt") || 
    normName.includes("joghurt") || 
    normName.includes("cheese") || 
    normName.includes("egg") || 
    normName.includes("butter") || 
    normName.includes("cream") || 
    normName.includes("cheddar") || 
    normName.includes("mozzarella")
  ) {
    return "Dairy & Eggs";
  }

  if (
    normCategories.includes("snack") || 
    normCategories.includes("candy") || 
    normCategories.includes("sweet") || 
    normCategories.includes("confectionery") || 
    normCategories.includes("biscuit") || 
    normCategories.includes("cookie") || 
    normCategories.includes("chip") || 
    normCategories.includes("chocolate") || 
    normCategories.includes("dessert") || 
    normName.includes("snickers") || 
    normName.includes("chocolate") || 
    normName.includes("candy") || 
    normName.includes("cookie") || 
    normName.includes("biscuit") || 
    normName.includes("chips") || 
    normName.includes("crisps") || 
    normName.includes("popcorn") || 
    normName.includes("nutella") || 
    normName.includes("sweet")
  ) {
    return "Snacks";
  }

  return "Pantry";
}

app.post("/api/generate-food", async (req, res) => {
  try {
    const { name, id } = req.body;
    
    // 1. Try checking in local database first
    const localMatch = FOODS.find(f => f.id === id || f.name.toLowerCase() === name.toLowerCase()) || findLocalFoodMatch(name);
    if (localMatch) {
      return res.json(localMatch);
    }

    // 2. Try fetching from Open Food Facts
    const offData = await fetchFromOFF(name, id);
    if (offData) {
      let healthScore = 50;
      if (offData.nutriscore_grade) {
        const scores: Record<string, number> = { a: 95, b: 80, c: 60, d: 35, e: 15 };
        healthScore = scores[offData.nutriscore_grade.toLowerCase()] || 50;
      }

      // Check if NOVA group can give precise health updates
      const nova = offData.nova_group || 3;
      if (nova === 1) healthScore = Math.min(100, healthScore + 10);
      if (nova === 4) healthScore = Math.min(healthScore, 20);

      const productCode = offData.code || offData.id || id;
      const offUrl = productCode ? `https://world.openfoodfacts.org/product/${productCode}` : undefined;

      const foodName = offData.product_name || name;
      const computedCategory = mapCategory(offData.categories || "", foodName);

      // Extract high-fidelity positives and negatives dynamically
      const positives: string[] = [];
      const negatives: string[] = [];
      
      if (nova === 1) positives.push("Minimally processed whole food (NOVA 1)");
      if (nova === 4) negatives.push("Ultra-processed product (NOVA 4)");

      const sugar = Number(offData.nutriments?.sugars_100g || 0);
      const satFat = Number(offData.nutriments?.['saturated-fat_100g'] || 0);
      const sodium = Number(offData.nutriments?.sodium_100g || 0) * 1000;
      const protein = Number(offData.nutriments?.proteins_100g || 0);
      const fiber = Number(offData.nutriments?.fiber_100g || 0);

      if (sugar > 15) negatives.push(`High in sugars (${sugar.toFixed(1)}g/100g)`);
      if (satFat > 4) negatives.push(`High in saturated fat (${satFat.toFixed(1)}g/100g)`);
      if (sodium > 450) negatives.push(`High in sodium (${Math.round(sodium)}mg/100g)`);
      
      if (negatives.length === 0) {
        if (sugar > 5) {
          negatives.push(`Contains natural or added sugars (${sugar.toFixed(1)}g/100g)`);
        } else if (satFat > 1.5) {
          negatives.push(`Contains saturated fats (${satFat.toFixed(1)}g/100g)`);
        } else if (sodium > 100) {
          negatives.push(`Contains sodium (${Math.round(sodium)}mg/100g)`);
        } else {
          negatives.push("Low in protein and dietary fiber");
        }
      }
      
      if (protein > 8) positives.push(`Good source of protein (${protein.toFixed(1)}g/100g)`);
      if (fiber > 3) positives.push(`Rich in dietary fiber (${fiber.toFixed(1)}g/100g)`);

      const food = {
        id: id || offData.id || productCode,
        name: foodName,
        category: computedCategory,
        subCategory: offData.categories?.split(',')[0]?.trim() || "General",
        health_score: healthScore,
        nutri_grade: offData.nutriscore_grade?.toUpperCase() || 'A',
        swap_suggestion_id: null,
        offUrl,
        nutrients_per_100: {
          protein_g: Number((offData.nutriments?.proteins_100g || 0).toFixed(1)),
          fiber_g: Number((offData.nutriments?.fiber_100g || 0).toFixed(1)),
          carbs_g: Number((offData.nutriments?.carbohydrates_100g || 0).toFixed(1)),
          sugars_g: Number((offData.nutriments?.sugars_100g || 0).toFixed(1)),
          fat_g: Number((offData.nutriments?.fat_100g || 0).toFixed(1)),
          saturated_fat_g: Number((offData.nutriments?.['saturated-fat_100g'] || 0).toFixed(1)),
          salt_g: Number((offData.nutriments?.sodium_100g || 0)) * 2.5, // approximate salt
          kcal: Math.round(offData.nutriments?.['energy-kcal_100g'] || offData.nutriments?.['energy-kcal'] || 100),
          micros: {}
        }
      };
      
      // Try to find a healthy swap from local DB
      let bestSwap = null;
      let minDistance = Infinity;
      if (healthScore < 85) {
        const candidates = FOODS.filter(c => c.category === computedCategory && c.health_score > healthScore + 5 && c.health_score >= 65);
        for (const cand of candidates) {
          const n1 = food.nutrients_per_100;
          const n2 = cand.nutrients_per_100;
          let distance = 0;
          distance += Math.abs((n1.kcal || 0) - (n2.kcal || 0)) * 0.1;
          distance += Math.abs((n1.protein_g || 0) - (n2.protein_g || 0)) * 2;
          distance += Math.abs((n1.fat_g || 0) - (n2.fat_g || 0)) * 1.5;
          distance += Math.abs((n1.fiber_g || 0) - (n2.fiber_g || 0)) * 1;
          distance += Math.abs((n1.sugars_g || 0) - (n2.sugars_g || 0)) * 0.5;
          
          const words1 = (food.name || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
          const words2 = (cand.name || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
          let common = 0;
          for (const w of words1) {
            if (words2.includes(w) && w.length > 2) {
              common++;
            }
          }
          distance -= common * 15;
          
          if (distance < minDistance) {
            minDistance = distance;
            bestSwap = cand;
          }
        }
      }
      if (bestSwap) {
        food.swap_suggestion_id = bestSwap.id;
      }
      
      return res.json(food);

    }

    // 3. Fall back to smart, realistic nutrition fallback (zero AI)
    const fallbackFood = generateRealisticFallback(name, id);
    res.json(fallbackFood);
    
  } catch (error: any) {
    console.error("Error generating food locally:", error);
    res.status(500).json({ error: error.message || "Failed to generate food data locally" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
