import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import {
  Sun,
  Moon,
  Smartphone,
  Eye,
  User,
  Activity,
  Home,
  Search,
  ArrowLeftRight,
  ChevronRight,
  X,
  Check,
  Sparkles,
  Flame,
  Apple,
  Info,
  TrendingUp,
  Receipt,
  ScanLine,
  Camera,
  ArrowRight,
  ChevronDown,
  Settings2,
  FileImage,
  ArrowLeft, Filter, SlidersHorizontal, ChevronUp,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Heart
} from "lucide-react";
import { FOODS, CATEGORIES, getNutriGradeDetails } from "./data";
import { Food } from "./types";

// Helper for haptic vibration feedback
const triggerHaptic = () => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(10);
    } catch (err) {
      // Ignore vibration failures if blocked by browser policies
    }
  }
};

// Colors scheme helper for health scores
const getScoreColors = (score: number) => {
  if (score >= 80) {
    return {
      text: "text-[#3B7A32] dark:text-emerald-400",
      darkText: "text-[#2F7E41] dark:text-emerald-300",
      bg: "bg-[#EAF3EB] dark:bg-emerald-950/40",
      border: "border-[#CDE5CE] dark:border-emerald-900/50",
      stroke: "#519D46", // Toned green like at the top (not neon green)
      glow: "shadow-emerald-100 dark:shadow-emerald-950/20"
    };
  } else if (score >= 60) {
    return {
      text: "text-lime-600 dark:text-lime-400",
      darkText: "text-lime-800 dark:text-lime-300",
      bg: "bg-lime-50 dark:bg-lime-950/40",
      border: "border-lime-200 dark:border-lime-900/50",
      stroke: "#84CC16", // Lime-500
      glow: "shadow-lime-100 dark:shadow-lime-950/20"
    };
  } else if (score >= 40) {
    return {
      text: "text-amber-500 dark:text-amber-400",
      darkText: "text-amber-700 dark:text-amber-300",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-900/50",
      stroke: "#F59E0B", // Amber-500
      glow: "shadow-amber-100 dark:shadow-amber-950/20"
    };
  } else {
    return {
      text: "text-rose-500 dark:text-rose-400",
      darkText: "text-rose-700 dark:text-rose-300",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-900/50",
      stroke: "#EF4444", // Red-500
      glow: "shadow-rose-100 dark:shadow-rose-950/20"
    };
  }
};


const getMacroDV = (macroName: string, amount: number) => {
  const standards: Record<string, number> = {
    kcal: 2000,
    protein_g: 50,
    carbs_g: 275,
    fiber_g: 28,
    sugars_g: 50,
    fat_g: 78,
    saturated_fat_g: 20,
    salt_g: 6 
  };
  const standard = standards[macroName] || 100;
  return Math.round((amount / standard) * 100);
};

const isBetterNutrient = (macroName: string, fromVal: number, toVal: number) => {
  if (macroName === 'protein_g' || macroName === 'fiber_g') {
    return toVal >= fromVal;
  }
  return toVal <= fromVal;
};

const ScoreRing = ({ score, size = 64, strokeWidth = 5, textSizeClass }: { score: number, size?: number, strokeWidth?: number, textSizeClass?: string }) => {
  const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [offset, setOffset] = useState(circumference);
  useEffect(() => {
    const timer = setTimeout(() => {
      const targetOffset = circumference - (circumference * validScore) / 100;
      setOffset(targetOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [validScore, circumference]);
  
  const colors = getScoreColors(validScore);
  const computedTextClass = textSizeClass || (size >= 96 ? "text-4xl" : size >= 84 ? "text-3xl" : size >= 64 ? "text-xl" : "text-sm");
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90 transform" width={size} height={size}>
        <circle className="text-neutral-100 dark:text-neutral-800" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size/2} cy={size/2} />
        <circle className={colors.text} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx={size/2} cy={size/2} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${computedTextClass} font-bold ${colors.text}`}>{Math.round(validScore)}</span>
      </div>
    </div>
  );
};

const translateCategoryName = (cat: string, lang: "en" | "de"): string => {
  if (lang === "en") return cat;
  const mapping: Record<string, any> = {
    "All": "Alle",
    "Produce": "Frischeprodukte",
    "Dairy & Eggs": "Milchprodukte & Eier",
    "Pantry": "Vorratskammer",
    "Snacks": "Süßigkeiten & Snacks",
    "Beverages": "Getränke",
    "Grocery": "Lebensmittel"
  };
  return mapping[cat] || cat;
};

const translateSubcategoryName = (sub: string, lang: "en" | "de"): string => {
  if (lang === "en") return sub;
  const mapping: Record<string, any> = {
    "Vegetables": "Gemüse",
    "Fruits": "Obst",
    "Berries": "Beeren",
    "Milk": "Milch",
    "Yogurt": "Joghurt",
    "Eggs": "Eier",
    "Breakfast Cereals": "Frühstückscerealien",
    "Spreads": "Aufstriche",
    "Sweet Spreads": "Süße Aufstriche",
    "Confectionery": "Süßwaren",
    "Candy chocolate bars": "Schokoriegel",
    "Sodas": "Limonaden",
    "Water": "Wasser",
    "Crackers": "Cracker"
  };
  return mapping[sub] || sub;
};

const translateMicroNutrient = (name: string, lang: "en" | "de"): string => {
  if (lang === "en") return name;
  const mapping: Record<string, any> = {
    "Vitamin C": "Vitamin C",
    "Potassium": "Kalium",
    "Vitamin B6": "Vitamin B6",
    "Vitamin K": "Vitamin K",
    "Iron": "Eisen",
    "Calcium": "Calcium",
    "Folate": "Folsäure",
    "Vitamin B12": "Vitamin B12",
    "Vitamin D": "Vitamin D",
    "Choline": "Cholin",
    "Magnesium": "Magnesium",
    "Vitamin E": "Vitamin E"
  };
  return mapping[name] || name;
};

const translateDynamicName = (name: string, lang: "en" | "de"): string => {
  if (lang === "en") return name;
  let translated = name;
  const replacements: [RegExp | string, string][] = [
    [/organic/i, "Bio-"],
    [/avocado/i, "Avocado"],
    [/strawberry/i, "Erdbeere"],
    [/strawberries/i, "Erdbeeren"],
    [/jogurt/i, "Joghurt"],
    [/yogurt/i, "Joghurt"],
    [/milk/i, "Milch"],
    [/egg/i, "Ei"],
    [/eggs/i, "Eier"],
    [/water/i, "Wasser"],
    [/banana/i, "Banane"],
    [/bananas/i, "Bananen"],
    [/apple/i, "Apfel"],
    [/apples/i, "Äpfel"],
    [/chocolate/i, "Schokolade"],
    [/bread/i, "Brot"],
    [/bar/i, "-Riegel"],
    [/crispbread/i, "Knäckebrot"],
    [/spinach/i, "Spinat"],
    [/zucchini/i, "Zucchini"]
  ];
  for (const [pattern, repl] of replacements) {
    translated = translated.replace(pattern, repl);
  }
  return translated;
};

const translateDynamicVerdict = (verdict: string, lang: "en" | "de"): string => {
  if (lang === "en") return verdict;
  if (verdict.includes("Packed with heart-healthy monounsaturated fats")) {
    return "Vollgepackt mit herzgesunden einfach ungesättigten Fetten und Ballaststoffen. Ausgezeichnete Wahl!";
  }
  if (verdict.includes("Incredibly high in vitamin C")) {
    return "Unglaublich reich an Vitamin C und Antioxidantien. Extrem kalorienarm und niedriger glykämischer Index.";
  }
  if (verdict.includes("Excellent source of protein with minimal added sugars")) {
    return "Hervorragende Proteinquelle mit minimalem Zuckerzusatz. Großartig für den Muskelaufbau und die Sättigung.";
  }
  if (verdict.includes("Ultra-processed chocolate bar high in added sugars")) {
    return "Ultra-verarbeiteter Schokoriegel mit viel zugesetztem Zucker, gesättigten Fetten und leeren Kalorien.";
  }
  return verdict;
};

const translateDynamicPhrases = (phrase: string, lang: "en" | "de"): string => {
  if (lang === "en") return phrase;
  const mapping: Record<string, any> = {
    "Rich in healthy monounsaturated fats": "Reich an gesunden einfach ungesättigten Fetten",
    "High in dietary fiber": "Reich an Ballaststoffen",
    "Excellent source of potassium": "Hervorragende Kaliumquelle",
    "Very high in Vitamin C": "Sehr reich an Vitamin C",
    "Rich in antioxidants": "Reich an Antioxidantien",
    "Low in calories": "Kalorienarm",
    "Excellent protein source": "Hervorragende Proteinquelle",
    "Low in fat": "Fettarm",
    "Good source of Calcium": "Gute Calciumquelle",
    "Ultra-processed (NOVA 4)": "Ultra-verarbeitet (NOVA 4)",
    "High in added sugars": "Sehr viel zugesetzter Zucker",
    "High in saturated fat": "Hoher Gehalt an gesättigten Fetten"
  };
  return mapping[phrase] || phrase;
};

const getTranslatedFood = (food: Food, lang: "en" | "de"): Food => {
  if (lang === "en") return food;
  return {
    ...food,
    name: translateDynamicName(food.name, lang),
    category: translateCategoryName(food.category, lang),
    subCategory: translateSubcategoryName((food.subCategory || "Grocery"), lang)
  };
};


// Translation dictionary
const translations = {
  en: {
    today: "Today",
    search: "Search",
    swaps: "Swaps",
    bills: "Bills",
    groceries: "Groceries",
    guide: "Smart Nutrition Guide",
    healthPoints: "Health Points",
    scanReceipt: "Scan Receipt",
    scanReceiptLower: "Scan a receipt",
    scanPrompt: "Scan a receipt to start earning points",
    spotlight: "Today's Spotlight",
    recommended: "Recommended for You",
    thisWeek: "This Week",
    pointsThisWeek: "This week's health points",
    trackReceipts: "Track your receipts and health points",
    recentBills: "Recent Bills",
    noHistory: "No history yet",
    noHistoryDesc: "Scan your first grocery receipt to get a health rating.",
    myProfile: "My Profile",
    personaliseExp: "Personalise your nutrition experience",
    calorieTarget: "Daily Calorie Target",
    appearance: "Appearance",
    colorScheme: "Color scheme",
    sex: "Biological sex",
    personalInfo: "Personal Info",
    age: "Age",
    weight: "Weight",
    height: "Height",
    activityLevel: "Activity Level",
    dietaryPreference: "Dietary Preference",
    balanced: "Balanced",
    personalise: "Personalise",
    recommendedLabel: "Recommended",
    popularFoods: "Popular Foods",
    quickSearches: "Quick Searches",
    chooseLibrary: "Choose from Library",
    tryDemo: "Try with Demo Receipt",
    howItWorks: "How it works",
    takeClear: "Take a clear picture of your receipt",
    weIdentify: "We identify the groceries you bought",
    getHealth: "Get a health score for your purchase",
    back: "Back",
    male: "Male",
    female: "Female",
    sedentary: "Sedentary",
    lightlyActive: "Lightly Active",
    moderatelyActive: "Moderately Active",
    veryActive: "Very Active",
    extraActive: "Extra Active",
    noExercise: "Little to no exercise",
    lightExercise: "Light exercise (1-3 days/week)",
    modExercise: "Moderate exercise (3-5 days/week)",
    heavyExercise: "Heavy exercise (6-7 days/week)",
    extraExercise: "Very heavy training or physical job",
    deleteBill: "Delete bill",
    items: "items",
    calories: "Calories",
    protein: "Protein",
    fiber: "Fiber",
    serving: "Serving",
    searchPlaceholder: "Search over 20+ foods...",
    noMatching: "No matching groceries",
    trySearch: "Try searching for 'Avocado', 'Yogurt', or 'Water'.",
    results: "Search Results",
    filterDesc: "Filter foods by keyword, sub-category, or name.",
  },
  de: {
    today: "Heute",
    search: "Suche",
    swaps: "Alternativen",
    bills: "Belege",
    groceries: "Lebensmittel",
    guide: "Intelligenter Ernährungsberater",
    healthPoints: "Gesundheitspunkte",
    scanReceipt: "Beleg scannen",
    scanReceiptLower: "Beleg scannen",
    scanPrompt: "Scannen Sie einen Beleg, um Punkte zu sammeln",
    spotlight: "Heutiges Highlight",
    recommended: "Für Sie empfohlen",
    thisWeek: "Diese Woche",
    pointsThisWeek: "Gesundheitspunkte dieser Woche",
    trackReceipts: "Verfolgen Sie Ihre Belege und Gesundheitspunkte",
    recentBills: "Letzte Rechnungen",
    noHistory: "Noch kein Verlauf",
    noHistoryDesc: "Scannen Sie Ihren ersten Kassenzettel für eine Bewertung.",
    myProfile: "Mein Profil",
    personaliseExp: "Personalisieren Sie Ihr Ernährungserlebnis",
    calorieTarget: "Tägliches Kalorienziel",
    appearance: "Aussehen",
    colorScheme: "Farbschema",
    sex: "Biologisches Geschlecht",
    personalInfo: "Persönliche Infos",
    age: "Alter",
    weight: "Gewicht",
    height: "Größe",
    activityLevel: "Aktivitätslevel",
    dietaryPreference: "Ernährungspräferenz",
    balanced: "Ausgewogen",
    personalise: "Personalisieren",
    recommendedLabel: "Empfohlen",
    popularFoods: "Beliebte Lebensmittel",
    quickSearches: "Schnellsuche",
    chooseLibrary: "Aus Bibliothek wählen",
    tryDemo: "Mit Demo-Beleg testen",
    howItWorks: "So funktioniert es",
    takeClear: "Machen Sie ein klares Foto Ihres Belegs",
    weIdentify: "Wir erkennen die gekauften Lebensmittel",
    getHealth: "Erhalten Sie eine Gesundheitsbewertung",
    back: "Zurück",
    male: "Männlich",
    female: "Weiblich",
    sedentary: "Sitzend",
    lightlyActive: "Leicht aktiv",
    moderatelyActive: "Mäßig aktiv",
    veryActive: "Sehr aktiv",
    extraActive: "Besonders aktiv",
    noExercise: "Wenig bis gar kein Training",
    lightExercise: "Leichtes Training (1-3 Tage/Woche)",
    modExercise: "Mäßiges Training (3-5 Tage/Woche)",
    heavyExercise: "Intensives Training (6-7 Tage/Woche)",
    extraExercise: "Sehr schweres Training oder körperliche Arbeit",
    deleteBill: "Rechnung löschen",
    items: "Artikel",
    calories: "Kalorien",
    protein: "Eiweiß",
    fiber: "Ballaststoffe",
    serving: "Portion",
    searchPlaceholder: "Über 20+ Lebensmittel durchsuchen...",
    noMatching: "Keine passenden Lebensmittel",
    trySearch: "Suchen Sie nach 'Avocado', 'Joghurt' oder 'Wasser'.",
    results: "Suchergebnisse",
    filterDesc: "Filtern Sie Lebensmittel nach Stichwort, Unterkategorie oder Name.",
  }
};

export default function App() {
  const [language, setLanguage] = useState<"en" | "de">(() => {
    const saved = localStorage.getItem('language');
    return (saved === "de" || saved === "en") ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key];
  };

  const [activeTab, setActiveTab] = useState<"home" | "search" | "swaps" | "bill" | "scan" | "profile">("home");
  
  // Swipeable main tabs tracking refs
  const mainTouchStartX = useRef<number | null>(null);
  const mainTouchStartY = useRef<number | null>(null);
  const mainHasSwiped = useRef<boolean>(false);

  const handleMainTouchStart = (e: React.TouchEvent) => {
    // Only track swipe if no modal sheets or full overlays are open
    if (selectedFoodId || showCalorieDetail || isScanning) return;
    mainTouchStartX.current = e.touches[0].clientX;
    mainTouchStartY.current = e.touches[0].clientY;
    mainHasSwiped.current = false;
  };

  const handleMainTouchMove = (e: React.TouchEvent) => {
    if (mainTouchStartX.current === null || mainTouchStartY.current === null || mainHasSwiped.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const deltaX = currentX - mainTouchStartX.current;
    const deltaY = currentY - mainTouchStartY.current;
    
    const SWIPE_THRESHOLD = 45; // ultra-responsive swipe threshold
    
    // Check if horizontal swipe is dominant and exceeds threshold
    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      mainHasSwiped.current = true;
      const tabOrder: ("home" | "search" | "swaps" | "bill")[] = ["home", "search", "swaps", "bill"];
      const currentIndex = tabOrder.indexOf(activeTab as any);
      
      if (currentIndex !== -1) {
        if (deltaX < 0) {
          // Swipe Left: Go to next tab in order
          if (currentIndex < tabOrder.length - 1) {
            triggerHaptic();
            handleTabChange(tabOrder[currentIndex + 1]);
          }
        } else {
          // Swipe Right: Go to previous tab in order
          if (currentIndex > 0) {
            triggerHaptic();
            handleTabChange(tabOrder[currentIndex - 1]);
          }
        }
      }
      
      // Clear values to avoid double trigger
      mainTouchStartX.current = null;
      mainTouchStartY.current = null;
    }
  };

  const handleMainTouchEnd = () => {
    mainTouchStartX.current = null;
    mainTouchStartY.current = null;
    mainHasSwiped.current = false;
  };
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchCategory, setSearchCategory] = useState("All");
  const [searchSubCategory, setSearchSubCategory] = useState("All");
  const [searchNutriScores, setSearchNutriScores] = useState<string[]>([]);
  const [searchNovaScores, setSearchNovaScores] = useState<number[]>([]);
  const [searchFavoritesOnly, setSearchFavoritesOnly] = useState<boolean>(false);
  const [swapsFavoritesOnly, setSwapsFavoritesOnly] = useState<boolean>(false);
  const [searchMaxCalories, setSearchMaxCalories] = useState<number>(1000);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [expandedSwapId, setExpandedSwapId] = useState<string | null>(null);
  const [animationTrigger, setAnimationTrigger] = useState(0);

  const [favoriteFoodIds, setFavoriteFoodIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteFoodIds');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('favoriteFoodIds', JSON.stringify(favoriteFoodIds));
  }, [favoriteFoodIds]);

  const [favoriteSwapIds, setFavoriteSwapIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteSwapIds');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('favoriteSwapIds', JSON.stringify(favoriteSwapIds));
  }, [favoriteSwapIds]);

  const [showAllBills, setShowAllBills] = useState(false);

  const toggleFavoriteFood = (foodId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    triggerHaptic();
    setFavoriteFoodIds(prev => 
      prev.includes(foodId) ? prev.filter(id => id !== foodId) : [...prev, foodId]
    );
  };

  const toggleFavoriteSwap = (fromId: string, toId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    triggerHaptic();
    const swapKey = `${fromId}::${toId}`;
    setFavoriteSwapIds(prev => 
      prev.includes(swapKey) ? prev.filter(key => key !== swapKey) : [...prev, swapKey]
    );
  };

  const [receipts, setReceipts] = useState<any[]>(() => {
    const saved = localStorage.getItem('receipts');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('receipts', JSON.stringify(receipts));
  }, [receipts]);
  const [isScanning, setIsScanning] = useState(false);
  const [dynamicFoods, setDynamicFoods] = useState<Food[]>(() => {
    try {
      const saved = localStorage.getItem('dynamicFoods');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].nutrients_per_100) {
          localStorage.removeItem('dynamicFoods');
          return [];
        }
        return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });
  useEffect(() => {
    localStorage.setItem('dynamicFoods', JSON.stringify(dynamicFoods));
  }, [dynamicFoods]);
  const [isGeneratingFood, setIsGeneratingFood] = useState(false);
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : { 
      height: 190, 
      weight: 93, 
      age: 23,
      sex: 'Male',
      colorScheme: 'Auto',
      activityLevel: 'Active',
      dietaryPreference: 'None' 
    };
  });
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Dark mode active state listener
  const [isDarkModeActive, setIsDarkModeActive] = useState(false);
  const [showCalorieDetail, setShowCalorieDetail] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      if (userProfile.colorScheme === 'Dark') {
        return true;
      }
      if (userProfile.colorScheme === 'Auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false; // Light
    };

    const active = checkDarkMode();
    setIsDarkModeActive(active);

    if (active) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Dynamic preference listener
    if (userProfile.colorScheme === 'Auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkModeActive(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [userProfile.colorScheme]);

  const getDailyCalorieTarget = () => {
    const baseBmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * (userProfile.age || 23);
    const bmr = userProfile.sex === 'Female' ? baseBmr - 161 : baseBmr + 5;
    
    let multiplier = 1.2;
    const level = userProfile.activityLevel;
    if (level === 'Sedentary') {
      multiplier = 1.2;
    } else if (level === 'Lightly Active') {
      multiplier = 1.375;
    } else if (level === 'Moderately Active' || level === 'Active') {
      multiplier = 1.55;
    } else if (level === 'Very Active') {
      multiplier = 1.725;
    } else if (level === 'Extra Active') {
      multiplier = 1.9;
    }
    
    return Math.round(bmr * multiplier);
  };

  const getNutritionBreakdown = () => {
    const calories = getDailyCalorieTarget();
    const pref = userProfile.dietaryPreference;
    
    // Percentages of calories
    let proteinPct = 20;
    let carbsPct = 50;
    let fatPct = 30;
    
    if (pref === 'High Protein') {
      proteinPct = 35;
      carbsPct = 35;
      fatPct = 30;
    } else if (pref === 'Low Carb') {
      proteinPct = 25;
      carbsPct = 15;
      fatPct = 60;
    } else if (pref === 'Vegetarian' || pref === 'Vegan') {
      proteinPct = 15;
      carbsPct = 55;
      fatPct = 30;
    }
    
    // Grams calculations: Protein=4 kcal/g, Carbs=4 kcal/g, Fat=9 kcal/g
    const proteinGrams = Math.round((calories * (proteinPct / 100)) / 4);
    const carbsGrams = Math.round((calories * (carbsPct / 100)) / 4);
    const fatGrams = Math.round((calories * (fatPct / 100)) / 9);
    
    // Fiber standard is 14g per 1000 kcal
    const fiberGrams = Math.round((calories / 1000) * 14);
    
    // Micronutrient targets based on sex/body weight or standard guidelines
    const sodiumMg = pref === 'Low Carb' ? 3000 : 2300;
    
    const activeFactor = (userProfile.activityLevel === 'Active' || userProfile.activityLevel === 'Very Active' || userProfile.activityLevel === 'Extra Active') ? 1.25 : 1.0;
    const potassiumMg = Math.round((userProfile.sex === 'Female' ? 2600 : 3400) * activeFactor);
    const calciumMg = 1000;
    const ironMg = userProfile.sex === 'Female' ? 18 : 8;
    const vitaminCMg = userProfile.sex === 'Female' ? 75 : 90;
    
    // Complete Vitamin & Mineral Reference Targets
    const vitAMcg = userProfile.sex === 'Female' ? 700 : 900;
    const vitB1Mg = userProfile.sex === 'Female' ? 1.1 : 1.2;
    const vitB2Mg = userProfile.sex === 'Female' ? 1.1 : 1.3;
    const vitB3Mg = userProfile.sex === 'Female' ? 14 : 16;
    const vitB6Mg = 1.3;
    const vitB9Mcg = 400;
    const vitB12Mcg = 2.4;
    const vitDMcg = 15; // 600 IU
    const vitEMg = 15;
    const vitKMcg = userProfile.sex === 'Female' ? 90 : 120;
    const magnesiumMg = userProfile.sex === 'Female' ? 320 : 420;
    const zincMg = userProfile.sex === 'Female' ? 8 : 11;
    
    return {
      calories,
      nutrients_per_100: [
        { name: language === 'en' ? 'Protein' : 'Eiweiß', pct: proteinPct, grams: proteinGrams, kcal: Math.round(proteinGrams * 4), color: 'bg-emerald-500 text-white' },
        { name: language === 'en' ? 'Carbohydrates' : 'Kohlenhydrate', pct: carbsPct, grams: carbsGrams, kcal: Math.round(carbsGrams * 4), color: 'bg-amber-500 text-neutral-900' },
        { name: language === 'en' ? 'Fats' : 'Fett', pct: fatPct, grams: fatGrams, kcal: Math.round(fatGrams * 9), color: 'bg-rose-500 text-white' },
        { name: language === 'en' ? 'Dietary Fiber' : 'Ballaststoffe', pct: null, grams: fiberGrams, kcal: null, color: 'bg-teal-500 text-white' }
      ],
      
    };
  };


  // Detail slide-up modal pull-to-dismiss states
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);
  const touchStartY = useRef(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputLibRef = useRef<HTMLInputElement>(null);

  const [scanStatus, setScanStatus] = useState<string>("");
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleLoadDemoBill = () => {
    setIsScanning(true);
    setScanStatus("Simulating Demo Receipt analysis...");
    setScanProgress({ current: 0, total: 4 });
    setScanError(null);

    // Let's simulate scanning steps to make it feel amazing
    setTimeout(() => {
      setScanStatus("Extracting store name and items...");
      setScanProgress({ current: 1, total: 4 });
      
      setTimeout(() => {
        setScanStatus("Fetching nutrition profile for 'Organic Avocados'...");
        setScanProgress({ current: 2, total: 4 });

        setTimeout(() => {
          setScanStatus("Fetching nutrition profile for 'Fresh Strawberries'...");
          setScanProgress({ current: 3, total: 4 });

          setTimeout(() => {
            setScanStatus("Fetching nutrition profile for 'Snickers Bar'...");
            setScanProgress({ current: 4, total: 4 });

            // Now we create the mock foods and mock receipt
            const mockFoods: Food[] = [
              {
                id: "organic_avocados",
                name: "Organic Avocados",
                category: "Produce",
                subCategory: "Fresh Fruits",
                health_score: 95,
                nutri_grade: 'A', swap_suggestion_id: null,
                
                
                
                
                
                nutrients_per_100: { protein_g: 2, carbs_g: 0, fiber_g: 6.7, sugars_g: 0.6, fat_g: 14.7, saturated_fat_g: 2.1, salt_g: 7, kcal: 100 },
                
              },
              {
                id: "fresh_strawberries",
                name: "Fresh Strawberries",
                category: "Produce",
                subCategory: "Berries",
                health_score: 92,
                nutri_grade: 'A', swap_suggestion_id: null,
                
                
                
                
                
                nutrients_per_100: { protein_g: 0.7, carbs_g: 0, fiber_g: 2, sugars_g: 4.9, fat_g: 0.3, saturated_fat_g: 0, salt_g: 1, kcal: 100 },
                
              },
              {
                id: "high_protein_joghurt",
                name: "High Protein Joghurt",
                category: "Dairy & Eggs",
                subCategory: "Yogurt",
                health_score: 85,
                nutri_grade: 'A', swap_suggestion_id: null,
                
                
                
                
                
                nutrients_per_100: { protein_g: 10, carbs_g: 0, fiber_g: 0, sugars_g: 3.5, fat_g: 1.5, saturated_fat_g: 0.9, salt_g: 80, kcal: 100 },
                
              },
              {
                id: "5000159461122", // Snickers
                name: "Snickers Bar",
                category: "Snacks",
                subCategory: "Candy chocolate bars",
                health_score: 10,
                nutri_grade: 'E', swap_suggestion_id: "f121",
                
                
                
                
                
                nutrients_per_100: { protein_g: 6.3, carbs_g: 0, fiber_g: 0, sugars_g: 56.3, fat_g: 30.9, saturated_fat_g: 10.6, salt_g: 42.8, kcal: 100 },
                
              }
            ];

            // Add mock foods to dynamicFoods so they are fully interactive when clicked
            setDynamicFoods(prev => {
              const map = new Map(prev.map(f => [f.id, f]));
              mockFoods.forEach(f => map.set(f.id, f));
              return Array.from(map.values());
            });

            const demoReceipt = {
              id: "demo_" + Math.random().toString(36).substr(2, 9),
              storeName: "Trader Joe's (Demo)",
              totalAmount: "$15.40",
              date: new Date().toISOString().split('T')[0],
              items: [
                { id: "organic_avocados", cleanName: "Organic Avocados", rawName: "ORG AVOCADOS 4PK" },
                { id: "fresh_strawberries", cleanName: "Fresh Strawberries", rawName: "FRSH STRAWBERRY 1LB" },
                { id: "high_protein_joghurt", cleanName: "High Protein Joghurt", rawName: "HI-PROT YGRT BLU" },
                { id: "5000159461122", cleanName: "Snickers Bar", rawName: "SNICKERS BAR 1.86OZ" }
              ],
              score: 71,
              
              negatives: []
            };

            setReceipts(prev => [demoReceipt, ...prev]);
            setIsScanning(false);
            setScanStatus("");
            setScanProgress(null);
            setScanError(null);
            setActiveTab("bill");
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const getReceiptScore = (receipt: any) => {
    let score = receipt.score || 50;
    if (receipt.items && receipt.items.length > 0) {
      let total = 0;
      let count = 0;
      receipt.items.forEach((it: any) => {
        const df = FOODS.find(f => f.id === it.id) || dynamicFoods.find(f => f.id === it.id) || it.foodData;
        if (df && typeof df.health_score === 'number' && !isNaN(df.health_score)) {
          total += df.health_score;
          count++;
        }
      });
      if (count > 0) score = Math.round(total / count);
    }
    return score;
  };

  const avgHealthScore = receipts.length > 0 ? Math.round(receipts.reduce((acc, r) => acc + getReceiptScore(r), 0) / receipts.length) : 0;
  const validAvgHealthScore = typeof avgHealthScore === 'number' && !isNaN(avgHealthScore) ? avgHealthScore : 0;
  const healthOffset = 264 - (264 * (validAvgHealthScore / 100));

  // Background loading of Open Food Facts / Gemini data for any items inside bills that are not loaded yet
  useEffect(() => {
    if (activeTab !== "bill") return;
    
    // Find all item IDs in any of our receipts that are not loaded in FOODS or dynamicFoods
    const unloadedItems: { id: string; cleanName: string }[] = [];
    receipts.forEach(receipt => {
      if (receipt.items && receipt.items.length > 0) {
        receipt.items.forEach((item: any) => {
          const isLoaded = FOODS.some(f => f.id === item.id) || dynamicFoods.some(f => f.id === item.id);
          if (!isLoaded && !unloadedItems.some(ui => ui.id === item.id)) {
            unloadedItems.push({ id: item.id, cleanName: item.cleanName });
          }
        });
      }
    });

    if (unloadedItems.length === 0) return;

    // Load them sequentially in the background to avoid overwhelming the server
    let active = true;
    const loadBackgroundFoods = async () => {
      for (const item of unloadedItems) {
        if (!active) break;
        try {
          const response = await fetch('/api/generate-food', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id, name: item.cleanName }),
          });
          if (response.ok && active) {
            const newFood: Food = await response.json();
            setDynamicFoods(prev => {
              const exists = prev.some(f => f.id === newFood.id);
              if (exists) return prev;
              return [...prev, newFood];
            });
          }
        } catch (err) {
          console.error("Background fetch failed for", item.cleanName, err);
        }
      }
    };

    loadBackgroundFoods();

    return () => {
      active = false;
    };
  }, [activeTab, receipts, dynamicFoods]);

  useEffect(() => {
    // Retrigger animations when category filters are swapped
    setAnimationTrigger(prev => prev + 1);
  }, [selectedCategory]);

  const handleOpenDynamicFood = async (item: { id: string; cleanName: string, foodData?: Food }) => {
    const existing = FOODS.find(f => f.id === item.id) || dynamicFoods.find(f => f.id === item.id) || item.foodData;
    if (existing) {
      if (!FOODS.find(f => f.id === item.id) && !dynamicFoods.find(f => f.id === item.id)) {
        setDynamicFoods(prev => [...prev, existing]);
      }
      setSelectedFoodId(item.id);
      return;
    }

    setIsGeneratingFood(true);
    try {
      const response = await fetch('/api/generate-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, name: item.cleanName }),
      });
      if (!response.ok) throw new Error("Failed to generate food");
      const newFood: Food = await response.json();
      setDynamicFoods(prev => [...prev, newFood]);
      setSelectedFoodId(newFood.id);
    } catch (err) {
      console.error(err);
      alert("Failed to load food details.");
    } finally {
      setIsGeneratingFood(false);
    }
  };

  const handleScanBill = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanStatus("Uploading & optimizing receipt image...");
    setScanProgress(null);
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_DIM = 1200;
          if (width > height && width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          const base64data = dataUrl.split(',')[1];
          
          try {
            setScanStatus("Local Tesseract OCR is reading receipt details...");
            const response = await fetch('/api/scan-bill', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageBase64: base64data,
                mimeType: 'image/jpeg'
              }),
            });
            
            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              throw new Error(errData.error || `Server error: ${response.statusText || response.status}`);
            }
            
            const result = await response.json();
            
            // Now, load food data from Open Food Facts / Gemini for all scanned items
            if (result.items && result.items.length > 0) {
              const fetchedFoods: Food[] = [];
              const totalItems = result.items.length;
              setScanProgress({ current: 0, total: totalItems });

              for (let i = 0; i < totalItems; i++) {
                const item = result.items[i];
                setScanStatus(`Fetching Swiss Food DB scores for "${item.cleanName}"...`);
                setScanProgress({ current: i + 1, total: totalItems });

                try {
                  const existing = FOODS.find(f => f.id === item.id) || dynamicFoods.find(f => f.id === item.id);
                  if (existing) {
                    fetchedFoods.push(existing);
                    item.foodData = existing;
                  } else {
                    const foodRes = await fetch('/api/generate-food', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: item.id, name: item.cleanName }),
                    });
                    if (foodRes.ok) {
                      const newFood: Food = await foodRes.json();
                      fetchedFoods.push(newFood);
                      item.foodData = newFood;
                    } else {
                      throw new Error("Failed to load");
                    }
                  }
                } catch (err) {
                  console.warn(`Failed to load details for ${item.cleanName}`, err);
                  // Resilient fallback
                  const fallback: Food = {
                    id: item.id,
                    name: item.cleanName,
                    category: "Grocery",
                    subCategory: "General",
                    health_score: 60,
                    nutri_grade: 'A', swap_suggestion_id: null,
                    
                    
                    
                    
                    
                    nutrients_per_100: { protein_g: 2, carbs_g: 0, fiber_g: 1, sugars_g: 2, fat_g: 4, saturated_fat_g: 0.5, salt_g: 100, kcal: 100 },
                    
                  };
                  fetchedFoods.push(fallback);
                  item.foodData = fallback;
                }
              }

              // Update dynamicFoods state with newly fetched products
              if (fetchedFoods.length > 0) {
                setDynamicFoods(prev => {
                  const map = new Map(prev.map(f => [f.id, f]));
                  fetchedFoods.forEach(f => map.set(f.id, f));
                  return Array.from(map.values());
                });
              }

              // Set the receipt's dynamic score based on actual loaded item scores
              const totalScore = fetchedFoods.reduce((acc, f) => acc + f.health_score, 0);
              const calculatedReceiptScore = Math.round(totalScore / fetchedFoods.length);
              result.score = calculatedReceiptScore;
              result.positives = [
                `All ${totalItems} items scanned and loaded!`,
                `Average grocery score is ${calculatedReceiptScore}%.`
              ];
            } else {
              result.score = 50;
            }
            
            setReceipts(prev => [{ ...result, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
            setActiveTab('bill');
          } catch (err: any) {
            console.error("Failed to analyze bill:", err);
            setScanError(err.message || "Failed to analyze bill");
          } finally {
            setIsScanning(false);
            setScanStatus("");
            setScanProgress(null);
            if (fileInputRef.current) fileInputRef.current.value = ''; 
            if (fileInputLibRef.current) fileInputLibRef.current.value = '';
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      setIsScanning(false);
      setScanStatus("");
      setScanProgress(null);
    }
  };

  const matchesDietaryPreference = (food: any, preference: string) => {
    if (!preference || preference === "None") return true;
    
    const nameLower = food.name.toLowerCase();
    const catLower = food.category.toLowerCase();
    const subLower = (food.subCategory || "Grocery").toLowerCase();
    
    if (preference === "High Protein") {
      return food.nutrients_per_100.protein_g >= 8; 
    }
    
    if (preference === "Low Carb") {
      return food.nutrients_per_100.sugars_g <= 15;
    }
    
    if (preference === "Vegetarian") {
      const nonVegTerms = ["salmon", "tuna", "chicken", "beef", "pork", "bacon", "prosciutto", "ham", "turkey", "fish", "meat", "shrimp", "prawn", "sardine", "anchovy", "halibut", "cod"];
      return !nonVegTerms.some(term => nameLower.includes(term) || subLower.includes(term) || catLower.includes(term));
    }
    
    if (preference === "Vegan") {
      const nonVeganTerms = [
        "salmon", "tuna", "chicken", "beef", "pork", "bacon", "prosciutto", "ham", "turkey", "fish", "meat", "shrimp", "prawn", "sardine", "anchovy", "halibut", "cod",
        "yogurt", "joghurt", "milk", "cheese", "egg", "butter", "honey", "cream", "whey", "lactose", "gelatin"
      ];
      return !nonVeganTerms.some(term => nameLower.includes(term) || subLower.includes(term) || catLower.includes(term));
    }
    
    return true;
  };

  const allFoods = useMemo(() => {
    const map = new Map<string, Food>();
    FOODS.forEach(f => map.set(f.id, f));
    dynamicFoods.forEach(f => map.set(f.id, f));
    return Array.from(map.values()).map(f => getTranslatedFood(f, language));
  }, [dynamicFoods, language]);

  const getSmartSwapsForFood = (currentFood: Food) => {
    if (!currentFood.swap_suggestion_id) return [];
    const swapFood = allFoods.find(f => f.id === currentFood.swap_suggestion_id);
    if (!swapFood) return [];
    return [{
      fromFood: currentFood,
      toFood: swapFood,
      reason: language === 'en' ? 'Better nutritional profile' : 'Besseres Nährwertprofil',
      scoreDiff: Math.round(swapFood.health_score - currentFood.health_score)
    }];
  };

  const recommendedSwaps = useMemo(() => {
    const validSwaps: { fromId: string, toId: string }[] = [];
    allFoods.forEach(food => {
      if (food.swap_suggestion_id) {
        const swapFood = allFoods.find(f => f.id === food.swap_suggestion_id);
        if (swapFood) {
          validSwaps.push({ fromId: food.id, toId: swapFood.id });
        }
      }
    });
    return validSwaps;
  }, []);

  const getBillItemSwap = (foodItem: Food, preference: string) => {
    // Find a food in the same category that has a higher health_score and matches dietaryPreference
    const sameCatFoods = allFoods.filter(f => 
      f.category === foodItem.category && 
      f.health_score > foodItem.health_score && 
      f.id !== foodItem.id && 
      matchesDietaryPreference(f, preference)
    );
    if (sameCatFoods.length > 0) {
      // Sort to get the best scoring swap
      return sameCatFoods.sort((a, b) => b.health_score - a.health_score)[0];
    }
    // Fallback to any higher scoring food matching preference
    const fallbackFoods = allFoods.filter(f => 
      f.health_score > foodItem.health_score && 
      f.id !== foodItem.id && 
      matchesDietaryPreference(f, preference)
    );
    return fallbackFoods.length > 0 ? fallbackFoods.sort((a, b) => b.health_score - a.health_score)[0] : null;
  };

  const getWeekLabel = (dateStr: string, lang: 'en' | 'de'): string => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return lang === 'en' ? 'Other Bills' : 'Andere Belege';
    
    const now = new Date();
    now.setHours(0,0,0,0);
    const itemDate = new Date(d);
    itemDate.setHours(0,0,0,0);
    
    const diffTime = now.getTime() - itemDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7 && diffDays >= 0) {
      return lang === 'en' ? 'This Week' : 'Diese Woche';
    } else if (diffDays < 14 && diffDays >= 7) {
      return lang === 'en' ? 'Last Week' : 'Letzte Woche';
    } else {
      const startOfWeek = new Date(itemDate);
      const day = startOfWeek.getDay();
      const diffToMonday = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diffToMonday);
      return lang === 'en' 
        ? `Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : `Woche vom ${startOfWeek.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
  };

  const foodsMatchingPreference = allFoods.filter(f => matchesDietaryPreference(f, userProfile.dietaryPreference));
  const spotlightFood = foodsMatchingPreference.find(f => f.id === "hass_avocado") || foodsMatchingPreference[0] || allFoods[0];

  // Recommendations mapping
  const RECOMMENDATIONS = [
    {
      foodId: "salmon",
      reason: "Unmatched anti-inflammatory Omega-3 fatty acids and highly digestible, complete protein."
    },
    {
      foodId: "hass_avocado",
      reason: "High soluble fiber and healthy monounsaturated lipids that provide stable metabolic satiety."
    },
    {
      foodId: "greek_yogurt",
      reason: "Outstanding bone-rebuilding calcium density coupled with rich active probiotic cultures."
    },
    {
      foodId: "spinach",
      reason: "Vast micronutrient density (Vitamins A, K & Iron) with practically zero impact on blood sugar."
    },
    {
      foodId: "almonds",
      reason: "Potent source of cellular Vitamin E antioxidants and raw muscle-relaxing magnesium."
    }
  ];

  // Advanced case/accent-insensitive text normalization
  const normalizeText = (text: string | undefined): string => {
    if (!text) return "";
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents/umlauts
      .replace(/ä/g, "a")
      .replace(/ö/g, "o")
      .replace(/ü/g, "u")
      .replace(/ß/g, "ss")
      .trim();
  };

  // Filters logic with advanced synonym, cross-language, and tab-aware category rules
  const filteredFoods = allFoods.filter(food => {
    const effectiveCategory = activeTab === "search" ? "All" : selectedCategory;
    const categoryMatches = effectiveCategory === "All" || food.category === effectiveCategory;
    
    const query = normalizeText(searchQuery);
    let searchMatches = true;
    
    if (query) {
      const q = query.trim();
      const nameMatch = normalizeText(food.name).includes(q);
      
      const originalFood = allFoods.find(f => f.id === food.id);
      let origNameMatch = false;
      if (originalFood) {
        origNameMatch = normalizeText(originalFood.name).includes(q);
      }
      
      let synonymMatch = false;
      const synonyms: Record<string, string[]> = {
        avocado: ["avocados", "avocado", "hass_avocado"],
        joghurt: ["yogurt", "joghurt", "yoghurt", "griechischer naturjoghurt", "naturjoghurt"],
        yogurt: ["joghurt", "yogurt", "yoghurt", "greek yogurt"],
        haferflocken: ["oats", "haferflocken", "rolled oats", "breakfast cereals"],
        oats: ["haferflocken", "oats"],
        spinat: ["spinach", "spinat", "baby spinach"],
        spinach: ["spinat", "spinach", "baby spinach"],
        blaubeeren: ["blueberries", "blaubeeren", "berry", "berries", "blueberry"],
        blueberries: ["blaubeeren", "blueberries", "blueberry", "berry", "berries"],
        apfel: ["apples", "apfel", "apple"],
        apples: ["apfel", "apples", "apple"],
        apple: ["apfel", "apple", "apples"],
        wasser: ["water", "wasser", "sidi ali"],
        water: ["wasser", "water", "sidi ali"],
        zucchini: ["zucchini", "vegetables", "gemuse", "courgette"],
        eier: ["eggs", "eier", "egg", "ei"],
        eggs: ["eier", "eggs", "egg", "ei"],
        erdnussbutter: ["peanut butter", "erdnussbutter", "peanut", "erdnuss"],
        peanut: ["erdnussbutter", "peanut", "peanut butter"]
      };
      
      for (const [key, list] of Object.entries(synonyms)) {
        if (q === key || list.includes(q)) {
           if (list.some(syn => 
               normalizeText(food.name).includes(syn) || 
              (originalFood && normalizeText(originalFood.name).includes(syn))
           )) {
             synonymMatch = true;
             break;
           }
        }
      }
      
      const translatedCat = translateCategoryName(food.category, language);
      const catMatch = normalizeText(food.category).includes(q) || 
                       normalizeText(translatedCat).includes(q) || 
                       (food.subCategory && normalizeText(food.subCategory).includes(q));
      
      // Specifically map "Dairy" to "Dairy & Eggs"
      let customCatMatch = false;
      if (q.includes("dairy") || q.includes("milch")) {
         customCatMatch = food.category === "Dairy & Eggs";
      }

      searchMatches = nameMatch || origNameMatch || synonymMatch || catMatch || customCatMatch;
    }
    
    const preferenceMatches = matchesDietaryPreference(food, userProfile.dietaryPreference);
    
    // Advanced Filters (only in search tab)
    let advancedMatches = true;
    if (activeTab === "search") {
      if (searchCategory !== "All" && food.category !== searchCategory) {
        advancedMatches = false;
      }
      if (searchSubCategory !== "All" && food.subCategory !== searchSubCategory) {
        advancedMatches = false;
      }
      if (searchNutriScores.length > 0 && !searchNutriScores.includes((food.nutri_grade || 'A').toUpperCase())) {
        advancedMatches = false;
      }
      if (searchNovaScores.length > 0 && (!food.nova_group || !searchNovaScores.includes(food.nova_group))) {
        advancedMatches = false;
      }
      if (searchFavoritesOnly && !favoriteFoodIds.includes(food.id)) {
        advancedMatches = false;
      }
      if (searchMaxCalories < 1000 && food.nutrients_per_100 && (food.nutrients_per_100.kcal || 0) > searchMaxCalories) {
        advancedMatches = false;
      }
    }
    
    return categoryMatches && searchMatches && preferenceMatches && advancedMatches;
  });

  const popularSearches = language === 'en'
    ? ["Dairy", "Produce", "Snacks", "Beverages", "Pantry"]
    : ["Milchprodukte", "Frischeprodukte", "Snacks", "Getränke", "Vorratskammer"];
    
  const availableSubCategories = Array.from(new Set(allFoods.map(f => f.subCategory).filter(Boolean))) as string[];

  const handleQuickSearch = (term: string) => {
    triggerHaptic();
    setSearchQuery(term);
  };

  const handleOpenFood = (id: string) => {
    triggerHaptic();
    setSelectedFoodId(id);
    setDragOffset(0);
  };

  const handleCloseFood = () => {
    triggerHaptic();
    setSelectedFoodId(null);
  };

  const handleTabChange = (tab: "home" | "search" | "swaps" | "bill" | "scan" | "profile") => {
    triggerHaptic();
    setActiveTab(tab);
    // Auto reset some states
    if (tab !== "search") setSearchQuery("");
  };

  // Drag and swipe handling for bottom sheet
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragOffset > 120) {
      setSelectedFoodId(null);
    }
    setDragOffset(0);
  };

  const currentFoodDetail = allFoods.find(f => f.id === selectedFoodId);

  return (
    <div className="h-[100dvh] bg-neutral-100 dark:bg-black flex justify-center items-stretch antialiased selection:bg-emerald-200 transition-colors duration-200">
      {/* App Shell Frame */}
      <div id="app_shell_frame" className="w-full max-w-[430px] h-full bg-[#F7FBF6] dark:bg-black text-neutral-800 dark:text-neutral-100 shadow-xl relative flex flex-col overflow-hidden border-x border-[#E5EAE3] dark:border-black transition-colors duration-200">
        
        {/* SCANNING PROGRESS OVERLAY */}
        {isScanning && (
          <div className="absolute inset-0 z-50 bg-[#F7FBF6]/95 dark:bg-black/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm transition-all duration-300">
            <div className="relative w-28 h-28 flex items-center justify-center mb-8">
              {/* Outer Pulsing Glow */}
              <div className="absolute inset-0 rounded-full bg-[#EAF3EB] dark:bg-emerald-950/45 animate-ping opacity-75" />
              {/* Icon Container */}
              <div className="relative w-20 h-20 rounded-full bg-[#EAF3EB] dark:bg-emerald-950 border-2 border-[#519D46] flex items-center justify-center text-[#2F7E41] dark:text-emerald-400 shadow-md">
                <ScanLine className="w-10 h-10 animate-pulse" />
              </div>
              
              {/* Spinning Ring */}
              <div className="absolute inset-0 border-4 border-transparent border-t-[#519D46] rounded-full animate-spin" />
            </div>

            <div className="space-y-4 max-w-[85%]">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Analyzing Receipt
              </h3>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 min-h-[40px] leading-relaxed">
                {scanStatus || "Uploading image..."}
              </p>
            </div>

            {/* Progress Meter */}
            {scanProgress && (
              <div className="w-full max-w-[260px] space-y-2 mt-6">
                <div className="flex justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
                  <span>Progress</span>
                  <span>{scanProgress.current} / {scanProgress.total}</span>
                </div>
                <div className="h-2 bg-neutral-200/80 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#519D46] rounded-full transition-all duration-300" 
                    style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-neutral-400 font-medium">
                  Connecting to Swiss Food Composition Database...
                </p>
              </div>
            )}
          </div>
        )}

        {/* VIEWPORTS */}
        <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
          
          {/* ==================== HOME TAB ==================== */}
          {activeTab === "home" && (
            <div className="px-5 pt-8 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
                    {t("groceries")}
                  </h1>
                  <p className="text-[15px] text-neutral-500 font-medium">
                    {t("guide")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button onClick={() => handleTabChange('profile')} className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-sm">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700 dark:text-neutral-300">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => { triggerHaptic(); setShowCalorieDetail(true); }}
                    className="bg-[#EAF3EB] dark:bg-emerald-950/45 text-[#2F7E41] dark:text-emerald-400 text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform hover:bg-[#DCEFDE] dark:hover:bg-emerald-950/70"
                  >
                    <Flame className="w-3 h-3 fill-current" />
                    {getDailyCalorieTarget().toLocaleString()} kcal
                  </button>
                </div>
              </div>

              {/* Personalised Pill */}
              <div>
                <button 
                  onClick={() => handleTabChange('profile')} 
                  className="inline-flex items-center gap-1.5 text-[#2F7E41] text-xs font-semibold border border-[#CDE5CE] bg-[#F4F9F4] px-3.5 py-1.5 rounded-full hover:bg-[#EAF3EB] transition-colors shadow-sm"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 21v-7" />
                    <path d="M4 10V3" />
                    <path d="M12 21v-9" />
                    <path d="M12 8V3" />
                    <path d="M20 21v-5" />
                    <path d="M20 12V3" />
                    <path d="M1 14h6" />
                    <path d="M9 8h6" />
                    <path d="M17 16h6" />
                  </svg>
                  {userProfile.dietaryPreference === 'None' ? t("personalise") : (language === 'en' ? userProfile.dietaryPreference : userProfile.dietaryPreference === 'High Protein' ? 'Viel Eiweiß' : userProfile.dietaryPreference === 'Low Carb' ? 'Wenig Kohlenhydrate' : userProfile.dietaryPreference === 'Vegetarian' ? 'Vegetarisch' : userProfile.dietaryPreference === 'Vegan' ? 'Vegan' : userProfile.dietaryPreference)} • {t("recommendedLabel")}
                </button>
              </div>

              {/* Health Points Card */}
              <div className="bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 p-4 min-[380px]:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-row items-center gap-3.5 min-[380px]:gap-5">
                <div className="relative w-20 h-20 min-[380px]:w-[100px] min-[380px]:h-[100px] shrink-0">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="10" />
                    <circle 
                      cx="50" cy="50" r="42" fill="none" stroke="#519D46" strokeWidth="10" 
                      strokeDasharray="264" strokeDashoffset={healthOffset} strokeLinecap="round" 
                      style={{ transition: "stroke-dashoffset 1s ease-out" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl min-[380px]:text-2xl font-bold text-[#3B7A32] dark:text-emerald-400 leading-none">{avgHealthScore}%</span>
                  </div>
                </div>
                <div className="space-y-2 min-[380px]:space-y-2.5 min-w-0 flex-1 text-left">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-[#519D46] dark:text-emerald-400 tracking-wider uppercase">{t("thisWeek")}</p>
                    <h2 className="text-base min-[360px]:text-lg min-[410px]:text-[22px] font-bold text-neutral-900 dark:text-white leading-tight tracking-tight min-[360px]:tracking-normal break-words">{t("healthPoints")}</h2>
                    <p className="text-[11px] min-[380px]:text-xs text-neutral-500 dark:text-neutral-400 font-medium text-left">{t("scanPrompt")}</p>
                  </div>
                  <button 
                    onClick={() => handleTabChange("scan")}
                    className="bg-[#519D46] hover:bg-[#438739] transition-colors text-white text-xs min-[380px]:text-sm font-semibold py-2 min-[380px]:py-2.5 px-3 min-[380px]:px-4 rounded-xl flex items-center gap-1.5 min-[380px]:gap-2"
                  >
                    <Camera className="w-3.5 h-3.5 min-[380px]:w-4 min-[380px]:h-4" />
                    {t("scanReceiptLower")}
                  </button>
                </div>
              </div>

              {/* Spotlight Banner Card */}
              <div 
                onClick={() => handleOpenFood(spotlightFood.id)}
                className="bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1 text-left">
                    <p className="text-[10px] font-bold text-[#519D46] tracking-wider uppercase">{t("spotlight")}</p>
                    <h3 className="text-[22px] font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                      {spotlightFood.name}
                    </h3>
                    
                  </div>
                  <div className="flex-shrink-0 -mt-1">
                    <ScoreRing score={spotlightFood.health_score} size={84} strokeWidth={6} />
                  </div>
                </div>

                

                <div className="bg-[#F7FBF6] dark:bg-neutral-800 rounded-xl flex items-center justify-between p-4 mt-4">
                  <div className="text-center flex-1">
                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{Math.round(spotlightFood.nutrients_per_100.kcal)} kcal / 100g</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{t("calories")}</p>
                  </div>
                  <div className="w-px h-8 bg-[#E5EAE3] dark:bg-neutral-700" />
                  <div className="text-center flex-1">
                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{spotlightFood.nutrients_per_100.protein_g}g</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{t("protein")}</p>
                  </div>
                  <div className="w-px h-8 bg-[#E5EAE3] dark:bg-neutral-700" />
                  <div className="text-center flex-1">
                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{spotlightFood.nutrients_per_100.carbs_g}g</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{language === 'en' ? 'Carbs' : 'Kohlenh.'}</p>
                  </div>
                  <div className="w-px h-8 bg-[#E5EAE3] dark:bg-neutral-700" />
                  <div className="text-center flex-1">
                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{spotlightFood.nutrients_per_100.fat_g}g</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{language === 'en' ? 'Fat' : 'Fett'}</p>
                  </div>
                  
                </div>
              </div>

              {/* My Favorites Section */}
              {(favoriteFoodIds.length > 0 || favoriteSwapIds.length > 0) ? (
                <div className="space-y-4 pt-2 text-left">
                  <h3 className="text-[20px] font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-1.5">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                    {language === 'en' ? 'My Favorites' : 'Meine Favoriten'}
                  </h3>
                  
                  {/* Favorited Foods scrolling container */}
                  {favoriteFoodIds.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-0.5">
                        {language === 'en' ? 'Saved Foods' : 'Gespeicherte Lebensmittel'}
                      </p>
                      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 -mx-5 px-5">
                        {allFoods.filter(f => favoriteFoodIds.includes(f.id)).map((food) => (
                          <div 
                            key={food.id}
                            onClick={() => handleOpenFood(food.id)}
                            className="w-[140px] shrink-0 bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform relative"
                          >
                            <ScoreRing score={food.health_score} size={64} strokeWidth={5} />
                            <div className="text-center w-full">
                              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate w-full">{food.name}</h4>
                              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">{Math.round(food.nutrients_per_100.kcal)} kcal / 100g</p>
                            </div>
                            
                            {/* Heart indicator in corner */}
                            <button
                              onClick={(e) => toggleFavoriteFood(food.id, e)}
                              className="absolute top-2.5 right-2.5 p-1 bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-700 rounded-full shadow-sm z-20"
                            >
                              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Favorited Swaps container */}
                  {favoriteSwapIds.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-0.5">
                        {language === 'en' ? 'Saved Swaps' : 'Gespeicherte Alternativen'}
                      </p>
                      <div className="space-y-2.5">
                        {favoriteSwapIds.map((key) => {
                          const [fromId, toId] = key.split('::');
                          const fromFood = allFoods.find(f => f.id === fromId);
                          const toFood = allFoods.find(f => f.id === toId);
                          if (!fromFood || !toFood) return null;
                          const scoreDiff = Math.round(toFood.health_score - fromFood.health_score);

                          return (
                            <div 
                              key={key}
                              onClick={() => {
                                triggerHaptic();
                                setSelectedFoodId(toFood.id);
                              }}
                              className="bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 p-4 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-start gap-3 relative group"
                            >
                              <div className="flex-1 min-w-0 pr-8">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500">{fromFood.name}</span>
                                  <ArrowRight className="w-3 h-3 text-neutral-300 dark:text-neutral-600" />
                                  <span className="text-sm font-bold text-[#519D46] dark:text-emerald-400">{toFood.name}</span>
                                </div>
                                <p className="text-xs text-neutral-400 dark:text-neutral-550 font-medium mt-1 leading-snug">
                                  {language === 'en' ? `Upgrade to ${toFood.name} and boost score by +${scoreDiff}%` : `Wechseln Sie zu ${toFood.name} für +${scoreDiff}% Gesundheitspunkte`}
                                </p>
                              </div>

                              <button
                                onClick={(e) => toggleFavoriteSwap(fromId, toId, e)}
                                className="absolute top-3.5 right-3.5 p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors z-20"
                              >
                                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Recommended for You */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-baseline px-0.5">
                  <h3 className="text-[20px] font-bold text-neutral-900 tracking-tight">
                    {t("recommended")}
                  </h3>
                  <div className="relative inline-flex items-center">
                    <select 
                      value={userProfile.dietaryPreference}
                      onChange={(e) => setUserProfile(p => ({ ...p, dietaryPreference: e.target.value }))}
                      className="text-xs font-semibold text-[#519D46] dark:text-emerald-400 bg-[#EAF3EB] dark:bg-emerald-900/30 px-3 py-1 rounded-full cursor-pointer hover:bg-[#DCEFDE] dark:hover:bg-emerald-800/40 transition-colors appearance-none outline-none"
                    >
                      <option value="None">{language === 'en' ? 'Balanced' : 'Ausgewogen'}</option>
                      <option value="High Protein">{language === 'en' ? 'High Protein' : 'Viel Eiweiß'}</option>
                      <option value="Low Carb">{language === 'en' ? 'Low Carb' : 'Wenig Kohlenhydrate'}</option>
                      <option value="Vegetarian">{language === 'en' ? 'Vegetarian' : 'Vegetarisch'}</option>
                      <option value="Vegan">{language === 'en' ? 'Vegan' : 'Vegan'}</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5">
                  {foodsMatchingPreference.filter(f => f.health_score > 75).slice(0, 20).map((food) => (
                    <div 
                      key={food.id}
                      onClick={() => handleOpenFood(food.id)}
                      className="w-[140px] shrink-0 bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                    >
                      <ScoreRing score={food.health_score} size={64} strokeWidth={5} />
                      <div className="text-center w-full">
                        <h4 className="text-sm font-bold text-neutral-900 truncate w-full">{food.name}</h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{Math.round(food.nutrients_per_100.kcal)} kcal / 100g</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          
          {/* ==================== PROFILE TAB ==================== */}
          {activeTab === "profile" && (
            <div className="px-5 pt-8 space-y-8">
              {/* Header with Back Button */}
              <div className="flex items-center gap-3.5">
                <button 
                  onClick={() => handleTabChange("home")}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 border border-[#E5EAE3] dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm active:scale-95 transition-transform"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="space-y-0.5 text-left">
                  <h1 className="text-3xl font-bold text-neutral-900 tracking-tight leading-none">
                    {t("myProfile")}
                  </h1>
                  <p className="text-xs text-neutral-500 font-medium">
                    {t("personaliseExp")}
                  </p>
                </div>
              </div>

              {/* Language Selector at the top of profile */}
              <div className="bg-white dark:bg-neutral-900 border border-[#E5EAE3] dark:border-neutral-800 rounded-[24px] p-5 shadow-sm text-left">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-base">Language / Sprache</h3>
                    <p className="text-xs text-neutral-400 font-medium">{language === "en" ? "App language" : "App-Sprache"}</p>
                  </div>
                  <div className="flex bg-[#EEF2ED] dark:bg-neutral-800 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => { triggerHaptic(); setLanguage("en"); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === "en" ? "bg-white dark:bg-[#1a1e17] text-[#519D46] dark:text-emerald-400 shadow-sm" : "text-neutral-500"}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => { triggerHaptic(); setLanguage("de"); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === "de" ? "bg-white dark:bg-[#1a1e17] text-[#519D46] dark:text-emerald-400 shadow-sm" : "text-neutral-500"}`}
                    >
                      Deutsch
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Daily Calorie Target Card */}
              <button 
                onClick={() => { triggerHaptic(); setShowCalorieDetail(true); }}
                className="w-full text-left bg-[#EAF3EB] dark:bg-emerald-950/20 hover:bg-[#DCEFDE] dark:hover:bg-emerald-950/30 transition-all rounded-[24px] p-6 relative overflow-hidden active:scale-[0.98] border border-[#CDE5CE] dark:border-[#1e3e23]"
              >
                <div className="relative z-10 space-y-2 pr-[74px]">
                  <h3 className="text-[#3B7A32] dark:text-emerald-400 text-xs font-bold tracking-wider uppercase">
                    {t("calorieTarget")}
                  </h3>
                  <div className="text-[32px] font-bold text-neutral-900 dark:text-neutral-100 leading-none">
                    {getDailyCalorieTarget().toLocaleString()} kcal
                  </div>
                  <p className="text-[#7F9E82] dark:text-neutral-400 text-sm font-medium text-left">
                    {language === "en" ? "Calculated from your profile • Tap to view breakdown" : "Aus Profil berechnet • Tippen für Aufteilung"}
                  </p>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-6 w-16 h-16 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] border dark:border-neutral-800">
                  <svg className="w-8 h-8 text-[#519D46] dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
              </button>

              {/* Appearance Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-[#519D46]" />
                  <h2 className="text-[22px] font-bold text-neutral-900 tracking-tight">{t("appearance")}</h2>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-[#E5EAE3] dark:border-neutral-800 rounded-[24px] p-5 shadow-sm text-left">
                  <p className="text-[15px] text-neutral-500 font-medium mb-4">{t("colorScheme")}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['Light', 'Auto', 'Dark'].map(scheme => (
                      <button
                        key={scheme}
                        onClick={() => setUserProfile(p => ({ ...p, colorScheme: scheme }))}
                        className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border ${
                          userProfile.colorScheme === scheme 
                            ? 'border-[#519D46] bg-[#F7FBF6] text-[#519D46]' 
                            : 'border-[#E5EAE3] bg-[#FDFDFD] text-neutral-500'
                        } transition-colors`}
                      >
                        {scheme === 'Light' && <Sun className="w-5 h-5" />}
                        {scheme === 'Auto' && <Smartphone className="w-5 h-5" />}
                        {scheme === 'Dark' && <Moon className="w-5 h-5" />}
                        <span className="text-[13px] font-semibold">{scheme === 'Light' ? (language === 'en' ? 'Light' : 'Hell') : scheme === 'Dark' ? (language === 'en' ? 'Dark' : 'Dunkel') : scheme}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Personal Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#519D46]" />
                  <h2 className="text-[22px] font-bold text-neutral-900 tracking-tight">{t("personalInfo")}</h2>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-[#E5EAE3] dark:border-neutral-800 rounded-[24px] p-5 shadow-sm space-y-6 text-left">
                  <div>
                    <p className="text-[15px] text-neutral-500 font-medium mb-3">{t("sex")}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {['Male', 'Female'].map(sex => (
                        <button
                          key={sex}
                          onClick={() => setUserProfile(p => ({ ...p, sex }))}
                          className={`py-3.5 rounded-[16px] font-bold text-[15px] transition-colors border ${
                            userProfile.sex === sex 
                              ? 'bg-[#519D46] border-[#519D46] text-white shadow-sm' 
                              : 'bg-[#FDFDFD] border-[#E5EAE3] text-neutral-500'
                          }`}
                        >
                          {sex === 'Male' ? t("male") : t("female")}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center">
                      <p className="text-[13px] text-neutral-400 font-medium mb-2">{t("age")}</p>
                      <div className="w-full bg-[#FDFDFD] border border-[#E5EAE3] rounded-[16px] py-3 flex flex-col items-center relative overflow-hidden">
                        <input
                          type="number"
                          value={userProfile.age || ''}
                          onChange={e => setUserProfile(p => ({ ...p, age: parseInt(e.target.value) || 0 }))}
                          className="w-full text-center text-xl font-bold text-neutral-900 bg-transparent outline-none appearance-none border-0"
                        />
                        <span className="text-[11px] font-semibold text-neutral-400">{language === 'en' ? 'yrs' : 'Jahre'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-[13px] text-neutral-400 font-medium mb-2">{t("weight")}</p>
                      <div className="w-full bg-[#FDFDFD] border border-[#E5EAE3] rounded-[16px] py-3 flex flex-col items-center relative overflow-hidden">
                        <input
                          type="number"
                          value={userProfile.weight || ''}
                          onChange={e => setUserProfile(p => ({ ...p, weight: parseInt(e.target.value) || 0 }))}
                          className="w-full text-center text-xl font-bold text-neutral-900 bg-transparent outline-none appearance-none border-0"
                        />
                        <span className="text-[11px] font-semibold text-neutral-400">kg</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-[13px] text-neutral-400 font-medium mb-2">{t("height")}</p>
                      <div className="w-full bg-[#FDFDFD] border border-[#E5EAE3] rounded-[16px] py-3 flex flex-col items-center relative overflow-hidden">
                        <input
                          type="number"
                          value={userProfile.height || ''}
                          onChange={e => setUserProfile(p => ({ ...p, height: parseInt(e.target.value) || 0 }))}
                          className="w-full text-center text-xl font-bold text-neutral-900 bg-transparent outline-none appearance-none border-0"
                        />
                        <span className="text-[11px] font-semibold text-neutral-400">cm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Level Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#519D46]" />
                  <h2 className="text-[22px] font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{t("activityLevel")}</h2>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-[#E5EAE3] dark:border-neutral-800 rounded-[24px] p-5 shadow-sm space-y-3">
                  {[
                    { id: 'Sedentary', label: t("sedentary"), desc: t("noExercise") },
                    { id: 'Lightly Active', label: t("lightlyActive"), desc: t("lightExercise") },
                    { id: 'Moderately Active', label: t("moderatelyActive"), desc: t("modExercise") },
                    { id: 'Very Active', label: t("veryActive"), desc: t("heavyExercise") },
                    { id: 'Extra Active', label: t("extraActive"), desc: t("extraExercise") },
                  ].map((level) => {
                    const isSelected = userProfile.activityLevel === level.id || (level.id === 'Moderately Active' && userProfile.activityLevel === 'Active');
                    return (
                      <button
                        key={level.id}
                        onClick={() => setUserProfile(p => ({ ...p, activityLevel: level.id }))}
                        className={`w-full text-left p-3.5 rounded-[18px] transition-all border flex flex-col gap-0.5 ${
                          isSelected 
                            ? 'bg-[#EAF3EB] dark:bg-emerald-950/45 border-[#519D46] text-[#2F7E41] dark:text-emerald-400 shadow-[0_2px_8px_rgba(81,157,70,0.06)]' 
                            : 'bg-[#FDFDFD] dark:bg-neutral-900/40 border-[#E5EAE3] dark:border-neutral-800 text-neutral-500 hover:border-neutral-300 dark:hover:border-neutral-750'
                        }`}
                      >
                        <span className={`font-bold text-[14px] ${isSelected ? 'text-[#2F7E41] dark:text-emerald-400' : 'text-neutral-800 dark:text-neutral-250'}`}>{level.label}</span>
                        <span className="text-[11px] opacity-85 leading-none text-neutral-400 dark:text-neutral-500">{level.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dietary Preference Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-[#519D46]" />
                  <h2 className="text-[22px] font-bold text-neutral-900 tracking-tight">{t("dietaryPreference")}</h2>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-[#E5EAE3] dark:border-neutral-800 rounded-[24px] p-5 shadow-sm space-y-3.5">
                  <p className="text-xs text-neutral-400 font-medium leading-relaxed text-left">
                    {language === "en" ? "Customises your recommendations, smart swaps, and search filters." : "Personalisiert Ihre Empfehlungen, Smart Swaps und Suchfilter."}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {['None', 'High Protein', 'Low Carb', 'Vegetarian', 'Vegan'].map((pref) => (
                      <button
                        key={pref}
                        onClick={() => setUserProfile(p => ({ ...p, dietaryPreference: pref }))}
                        className={`py-3 px-2 rounded-[16px] font-bold text-[13px] transition-all border ${
                          pref === 'None' ? 'col-span-2 py-3.5' : ''
                        } ${
                          userProfile.dietaryPreference === pref 
                            ? 'bg-[#EAF3EB] border-[#519D46] text-[#2F7E41] shadow-[0_2px_8px_rgba(81,157,70,0.1)] scale-[1.01]' 
                            : 'bg-[#FDFDFD] border-[#E5EAE3] text-neutral-500 hover:border-neutral-300'
                        }`}
                      >
                        {pref === 'None' ? (language === 'en' ? 'Balanced (No Filter)' : 'Ausgewogen (kein Filter)') : (language === 'en' ? pref : pref === 'High Protein' ? 'Viel Eiweiß' : pref === 'Low Carb' ? 'Wenig Kohlenhydrate' : pref === 'Vegetarian' ? 'Vegetarisch' : pref === 'Vegan' ? 'Vegan' : pref)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

{/* ==================== SEARCH TAB ==================== */}
          {activeTab === "search" && (
            <div className="px-5 pt-7 space-y-6">
              {/* Header */}
              <div className="space-y-1">
                <h1 className="text-3xl font-display font-bold text-neutral-900 tracking-tight">
                  {t("search")}
                </h1>
                <p className="text-sm text-neutral-500">
                  {t("filterDesc")}
                </p>
              </div>

              {/* iOS Style Search Box with Filter Toggle */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 bg-[#EEF2ED] dark:bg-neutral-800 border-0 rounded-2xl text-[15px] font-medium text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-neutral-900 transition-all outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        triggerHaptic();
                        setSearchQuery("");
                      }}
                      className="absolute inset-y-0 right-3.5 flex items-center text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-5 h-5 bg-neutral-200 hover:bg-neutral-300 rounded-full p-0.5" />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => { triggerHaptic(); setShowAdvancedFilters(!showAdvancedFilters); }}
                  className={`p-3 rounded-2xl flex-shrink-0 transition-colors ${showAdvancedFilters ? 'bg-emerald-500 text-white' : 'bg-[#EEF2ED] dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-[#E5EAE3] dark:hover:bg-neutral-700'}`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              {/* Advanced Filters Panel */}
              {showAdvancedFilters && (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 shadow-sm space-y-5 animate-in slide-in-from-top-2 duration-200">
                  {/* Favorites Only Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{language === 'en' ? 'Favorites Only' : 'Nur Favoriten'}</label>
                    <button
                      onClick={() => setSearchFavoritesOnly(!searchFavoritesOnly)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${searchFavoritesOnly ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                    >
                      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${searchFavoritesOnly ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  
                  {/* Category & SubCategory */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{language === 'en' ? 'Category' : 'Kategorie'}</label>
                      <select 
                        value={searchCategory} 
                        onChange={(e) => { setSearchCategory(e.target.value); setSearchSubCategory("All"); }}
                        className="w-full bg-[#EEF2ED] dark:bg-neutral-800 dark:text-neutral-200 border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-emerald-500/30"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{translateCategoryName(cat, language)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{language === 'en' ? 'Subcategory' : 'Unterkategorie'}</label>
                      <select 
                        value={searchSubCategory} 
                        onChange={(e) => setSearchSubCategory(e.target.value)}
                        className="w-full bg-[#EEF2ED] dark:bg-neutral-800 dark:text-neutral-200 border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-emerald-500/30"
                      >
                        <option value="All">{language === 'en' ? 'All' : 'Alle'}</option>
                        {availableSubCategories.filter(sc => searchCategory === 'All' || allFoods.find(f => f.subCategory === sc && f.category === searchCategory)).map(sc => (
                          <option key={sc} value={sc}>{sc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Nutri Score & NOVA */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Nutri Score</label>
                      <div className="flex gap-2">
                        {['A', 'B', 'C', 'D', 'E'].map(score => {
                          const isSelected = searchNutriScores.includes(score);
                          return (
                            <button
                              key={score}
                              onClick={() => {
                                triggerHaptic();
                                setSearchNutriScores(prev => isSelected ? prev.filter(s => s !== score) : [...prev, score]);
                              }}
                              className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition-all ${isSelected ? 'bg-neutral-800 text-white ring-2 ring-neutral-800 ring-offset-1' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'}`}
                            >
                              {score}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">NOVA-Score</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map(score => {
                          const isSelected = searchNovaScores.includes(score);
                          return (
                            <button
                              key={score}
                              onClick={() => {
                                triggerHaptic();
                                setSearchNovaScores(prev => isSelected ? prev.filter(s => s !== score) : [...prev, score]);
                              }}
                              className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition-all ${isSelected ? 'bg-neutral-800 text-white ring-2 ring-neutral-800 ring-offset-1' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'}`}
                            >
                              {score}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Calories Slider */}
                  <div className="space-y-2 pb-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        {language === 'en' ? 'Max Calories' : 'Max Kalorien'} <span className="text-[10px] lowercase font-medium">(/ 100g)</span>
                      </label>
                      <span className="text-sm font-bold text-emerald-600">{searchMaxCalories} kcal</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1000" 
                      step="10"
                      value={searchMaxCalories}
                      onChange={(e) => setSearchMaxCalories(parseInt(e.target.value))}
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 px-1">
                      <span>0</span>
                      <span>500</span>
                      <span>1000+</span>
                    </div>
                  </div>
                  
                </div>
              )}

              {/* Quick Search Chips */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-400 tracking-widest uppercase">
                  {t("quickSearches")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map(chip => (
                    <button
                      key={chip}
                      onClick={() => handleQuickSearch(chip)}
                      className="px-3.5 py-1.5 bg-white dark:bg-neutral-900 border border-[#E5EAE3] dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-full text-neutral-600 dark:text-neutral-400 text-xs font-semibold text-neutral-600 transition-all cursor-pointer active:scale-95"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time search results */}
              <div className="space-y-3 pt-2" onScroll={() => {
                const activeEl = document.activeElement as HTMLElement;
                if (activeEl) activeEl.blur();
              }}>
                <h4 className="text-xs font-bold text-neutral-400 tracking-widest uppercase">
                  {searchQuery ? t("results") : t("popularFoods")}
                </h4>

                <div className="space-y-2.5">
                  {filteredFoods.map((food, index) => {
                    const colors = getScoreColors(food.health_score);
                    const nova = getNutriGradeDetails(food.nutri_grade);
                    return (
                      <div
                        key={food.id}
                        onClick={() => handleOpenFood(food.id)}
                        style={{
                          animationDelay: `${index * 30}ms`,
                          animationFillMode: "both"
                        }}
                        className="bg-white dark:bg-neutral-900 rounded-xl border border-[#E5EAE3] dark:border-neutral-800 p-3 flex items-center justify-between hover:shadow-sm cursor-pointer transition-all animate-slide-up group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          <div className={`p-2 rounded-lg ${colors.bg} ${colors.text} flex-shrink-0`}>
                            <Apple className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 text-[15px] truncate">
                              {food.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium truncate max-w-[80px] sm:max-w-none">
                                {(food.subCategory || "Grocery")}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap ${nova.color}`}>
                                {nova.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-550 whitespace-nowrap hidden min-[400px]:inline-block">
                            {Math.round(food.nutrients_per_100.kcal)} kcal <span className="hidden sm:inline">/ 100g</span>
                          </span>
                          <button
                            onClick={(e) => toggleFavoriteFood(food.id, e)}
                            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors relative z-10"
                            title={language === 'en' ? 'Favorite' : 'Favorisieren'}
                          >
                            <Heart 
                              className={`w-4 h-4 transition-all active:scale-125 ${
                                favoriteFoodIds.includes(food.id) 
                                  ? "fill-rose-500 text-rose-500" 
                                  : "text-neutral-300 hover:text-neutral-500 dark:text-neutral-600"
                              }`} 
                            />
                          </button>
                          <ScoreRing score={food.health_score} size={44} strokeWidth={4} />
                        </div>
                      </div>
                    );
                  })}

                  {filteredFoods.length === 0 && (
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-[#E5EAE3] dark:border-neutral-800 p-10 text-center space-y-3">
                      <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
                        <Info className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-700">{t("noMatching")}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {t("trySearch")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== [] TAB ==================== */}
          {activeTab === "swaps" && (
            <div className="px-5 pt-8 space-y-6">
              {/* Header */}
              <div className="space-y-1">
                <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
                  Smarter Swaps
                </h1>
                <p className="text-[15px] text-neutral-500 font-medium">
                  Tap any card to compare nutrients
                </p>
              </div>

              {/* Swaps list */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-baseline px-0.5">
                  <h3 className="text-[20px] font-bold text-neutral-900 tracking-tight">
                    Recommended for You
                  </h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSwapsFavoritesOnly(!swapsFavoritesOnly)}
                      className={`p-1.5 rounded-full flex items-center justify-center cursor-pointer transition-colors ${swapsFavoritesOnly ? 'bg-rose-500 border border-rose-500' : 'text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                      title={language === 'en' ? 'Favorites' : 'Favoriten'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${swapsFavoritesOnly ? 'fill-white text-white' : ''}`} />
                    </button>
                    <div className="relative inline-flex items-center">
                      <Settings2 className="w-3 h-3 absolute left-2.5 text-[#2F7E41] dark:text-emerald-400 pointer-events-none" />
                      <select 
                        value={userProfile.dietaryPreference}
                        onChange={(e) => setUserProfile(p => ({ ...p, dietaryPreference: e.target.value }))}
                        className="text-xs font-semibold text-[#2F7E41] dark:text-emerald-400 bg-[#EAF3EB] dark:bg-emerald-900/30 border border-[#CDE5CE] dark:border-emerald-800 rounded-full cursor-pointer hover:bg-[#DCEFDE] dark:hover:bg-emerald-800/40 transition-colors appearance-none pl-6 pr-3 py-1 outline-none"
                      >
                        <option value="None">{language === 'en' ? 'Balanced' : 'Ausgewogen'}</option>
                        <option value="High Protein">{language === 'en' ? 'High Protein' : 'Viel Eiweiß'}</option>
                        <option value="Low Carb">{language === 'en' ? 'Low Carb' : 'Wenig Kohlenhydrate'}</option>
                        <option value="Vegetarian">{language === 'en' ? 'Vegetarian' : 'Vegetarisch'}</option>
                        <option value="Vegan">{language === 'en' ? 'Vegan' : 'Vegan'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {recommendedSwaps.filter(swap => {
                    const fromFood = allFoods.find(f => f.id === swap.fromId);
                    const toFood = allFoods.find(f => f.id === swap.toId);
                    if (!fromFood || !toFood) return false;
                    if (swapsFavoritesOnly && !favoriteSwapIds.includes(`${swap.fromId}::${swap.toId}`) && !favoriteFoodIds.includes(swap.fromId) && !favoriteFoodIds.includes(swap.toId)) return false;
                    if (!matchesDietaryPreference(toFood, userProfile.dietaryPreference)) return false;
                    return true;
                  }).slice(0, 20).map((swap, index) => {
                    const fromFood = allFoods.find(f => f.id === swap.fromId)!;
                    const toFood = allFoods.find(f => f.id === swap.toId)!;
                    
                    const scoreDiff = Math.round(toFood.health_score - fromFood.health_score);
                    const isExpanded = expandedSwapId === swap.fromId;

                    return (
                      <div
                        key={swap.fromId}
                        className="bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                      >
                        {/* Accordion Trigger Header */}
                        <div
                          onClick={() => {
                            triggerHaptic();
                            setExpandedSwapId(isExpanded ? null : swap.fromId);
                          }}
                          className="cursor-pointer relative"
                        >
                          <div className="flex items-start justify-between mb-3 pr-6 relative">
                            {/* From Food */}
                            <div className="flex flex-col w-[42%]">
                               <div className="flex items-baseline gap-1.5 flex-wrap">
                                  <span className="text-[17px] font-bold text-amber-500 dark:text-amber-400">{fromFood.health_score}</span>
                                  <span className="text-[15px] font-medium text-neutral-900 dark:text-neutral-100 leading-tight">{fromFood.name}</span>
                               </div>
                               <div className="text-[11px] text-neutral-400 dark:text-neutral-550 mt-0.5">{Math.round(fromFood.nutrients_per_100?.kcal || 0)} kcal / 100g</div>
                            </div>

                            {/* Arrow */}
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#EAF3EB] dark:bg-emerald-950/40 flex items-center justify-center mt-1">
                              <ArrowRight className="w-4 h-4 text-[#519D46] dark:text-emerald-400" />
                            </div>

                            {/* To Food */}
                            <div className="flex flex-col w-[42%]">
                               <div className="flex items-baseline gap-1.5 flex-wrap">
                                  <span className="text-[17px] font-bold text-[#519D46] dark:text-emerald-400">{toFood.health_score}</span>
                                  <span className="text-[15px] font-medium text-neutral-900 dark:text-neutral-100 leading-tight">{toFood.name}</span>
                               </div>
                               <div className="text-[11px] text-neutral-400 dark:text-neutral-550 mt-0.5">{Math.round(toFood.nutrients_per_100?.kcal || 0)} kcal / 100g</div>
                            </div>
                            
                            {/* Chevron */}
                            <div className="absolute right-0 top-1.5 text-neutral-400">
                              <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          <div className="flex justify-between items-end mt-2">
                            <p className="text-[14px] text-neutral-500 dark:text-neutral-400 max-w-[65%] leading-snug">
                              {language === 'en' ? 'Healthier option in the same category' : 'Gesündere Option in derselben Kategorie'}
                            </p>
                            <div className="flex items-center gap-1.5 shrink-0 relative z-10">
                              <button
                                onClick={(e) => toggleFavoriteSwap(swap.fromId, swap.toId, e)}
                                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-all cursor-pointer"
                                title={language === 'en' ? 'Favorite Swap' : 'Alternative favorisieren'}
                              >
                                <Heart 
                                  className={`w-4.5 h-4.5 transition-all active:scale-125 ${
                                    favoriteSwapIds.includes(`${swap.fromId}::${swap.toId}`) 
                                      ? "fill-rose-500 text-rose-500" 
                                      : "text-neutral-300 hover:text-neutral-500"
                                  }`} 
                                />
                              </button>
                              <span className="text-[13px] font-bold text-[#2F7E41] dark:text-emerald-400 bg-[#EAF3EB] dark:bg-emerald-950/45 px-3 py-1 rounded-full whitespace-nowrap">
                                +{scoreDiff}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Side-by-side expanded comparison details */}
                      <div
                        className={`transition-all duration-300 ease-in-out border-t border-neutral-100 dark:border-neutral-800 overflow-hidden ${
                          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                        }`}
                      >
                        <div className="p-4 bg-[#F9FAF9] dark:bg-neutral-900/60 space-y-4">
                          <h5 className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase text-center">
                            {language === 'en' ? 'Side-By-Side Nutrition Profile (% DV)' : 'Direkter Nährwertvergleich (% DV)'}
                          </h5>

                          {/* Comparison Grid */}
                          <div className="space-y-3 font-sans">
                            {/* Calories Row */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                <span className="text-neutral-500 dark:text-neutral-400">{language === 'en' ? 'Calories' : 'Kalorien'}</span>
                                <div className="flex gap-4">
                                  <span className={isBetterNutrient("kcal", fromFood.nutrients_per_100?.kcal || 0, toFood.nutrients_per_100?.kcal || 0) ? "text-neutral-400 dark:text-neutral-500 font-normal" : "text-amber-600 dark:text-amber-400 font-bold"}>
                                    {Math.round(fromFood.nutrients_per_100?.kcal || 0)}
                                  </span>
                                  <span className={isBetterNutrient("kcal", fromFood.nutrients_per_100?.kcal || 0, toFood.nutrients_per_100?.kcal || 0) ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-neutral-400 dark:text-neutral-500 font-normal"}>
                                    {Math.round(toFood.nutrients_per_100?.kcal || 0)}
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="h-2 bg-neutral-200/75 dark:bg-neutral-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${!isBetterNutrient("kcal", fromFood.nutrients_per_100?.kcal || 0, toFood.nutrients_per_100?.kcal || 0) ? "bg-amber-500" : "bg-neutral-300 dark:bg-neutral-700"}`}
                                    style={{ width: `${Math.min(100, ((fromFood.nutrients_per_100?.kcal || 0) / 300) * 100)}%` }}
                                  />
                                </div>
                                <div className="h-2 bg-neutral-200/75 dark:bg-neutral-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${isBetterNutrient("kcal", fromFood.nutrients_per_100?.kcal || 0, toFood.nutrients_per_100?.kcal || 0) ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700"}`}
                                    style={{ width: `${Math.min(100, ((toFood.nutrients_per_100?.kcal || 0) / 300) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Macro comparison rows */}
                            {Object.keys(fromFood.nutrients_per_100).map(macro => {
                              const fromVal = fromFood.nutrients_per_100[macro as keyof typeof fromFood.nutrients_per_100];
                              const toVal = toFood.nutrients_per_100[macro as keyof typeof toFood.nutrients_per_100];
                              const better = isBetterNutrient(macro, fromVal, toVal);

                              // Format labels nicely
                              const displayLabels: Record<string, any> = {
                                protein: language === 'en' ? "Protein (g)" : "Eiweiß (g)",
                                carbs: language === 'en' ? "Carbohydrates (g)" : "Kohlenhydrate (g)",
                                fiber: language === 'en' ? "Dietary Fiber (g)" : "Ballaststoffe (g)",
                                sugars: language === 'en' ? "Sugars (g)" : "Zucker (g)",
                                fat: language === 'en' ? "Total Fat (g)" : "Fett (g)",
                                saturatedFat: language === 'en' ? "Saturated Fat (g)" : "Gesättigte Fettsäuren (g)",
                                sodium: language === 'en' ? "Sodium (mg)" : "Natrium (mg)"
                              };

                              return (
                                <div key={macro} className="space-y-1">
                                  <div className="flex justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    <span className="text-neutral-500 dark:text-neutral-400">{displayLabels[macro] || macro}</span>
                                    <div className="flex gap-4">
                                      <span className={better ? "text-neutral-400 dark:text-neutral-500 font-normal" : "text-rose-500 dark:text-rose-400 font-bold"}>
                                        {fromVal}
                                      </span>
                                      <span className={better ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-neutral-400 dark:text-neutral-500 font-normal"}>
                                        {toVal}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="h-2 bg-neutral-200/75 dark:bg-neutral-800 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${!better ? "bg-amber-500" : "bg-neutral-300 dark:bg-neutral-700"}`}
                                        style={{ width: `${getMacroDV(macro, fromVal)}%` }}
                                      />
                                    </div>
                                    <div className="h-2 bg-neutral-200/75 dark:bg-neutral-800 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${better ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700"}`}
                                        style={{ width: `${getMacroDV(macro, toVal)}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <p className="text-[11px] text-neutral-400 font-medium italic pt-2 text-center border-t border-neutral-100 dark:border-neutral-800">
                            Green bar indicates nutritionally superior level.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          )}

          {/* ==================== BILLS TAB ==================== */}
          {activeTab === "bill" && (
            <div className="px-5 pt-8 space-y-6 text-left">
              {/* Header */}
              <div className="space-y-1">
                <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
                  {t("bills")}
                </h1>
                <p className="text-[15px] text-neutral-500 font-medium">
                  {t("trackReceipts")}
                </p>
              </div>
              
              {/* Health Points Card */}
              <div className="bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 py-8 px-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center gap-4">
                <div className="relative w-[120px] h-[120px]">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#EAECE9" strokeWidth="10" />
                    <circle 
                      cx="50" cy="50" r="42" fill="none" stroke="#519D46" strokeWidth="10" 
                      strokeDasharray="264" strokeDashoffset={healthOffset} strokeLinecap="round" 
                      style={{ transition: "stroke-dashoffset 1s ease-out" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[#3B7A32] leading-none">{avgHealthScore}%</span>
                  </div>
                </div>
                <p className="text-[13px] text-neutral-500 font-medium">{t("pointsThisWeek")}</p>
              </div>

              {/* Scan Button */}
              <button
                onClick={() => handleTabChange("scan")}
                disabled={isScanning}
                className="w-full bg-[#519D46] hover:bg-[#438739] transition-colors text-white py-4 rounded-[1.25rem] font-bold text-base flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isScanning ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    {t("scanReceipt")}
                  </>
                )}
              </button>


              {/* Recent Bills */}
              <div className="space-y-4 pt-2">
                <h3 className="text-[13px] font-bold text-neutral-400 tracking-wider uppercase px-0.5">
                  {t("recentBills")}
                </h3>

                <div className="space-y-6">
                  {receipts.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-[#E5EAE3] dark:border-neutral-800 p-8 text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-2">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <h3 className="text-neutral-900 dark:text-neutral-100 font-bold text-lg">{t("noHistory")}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {t("noHistoryDesc")}
                      </p>
                    </div>
                  ) : (
                    (() => {
                      const sortedReceipts = [...receipts].sort((a, b) => {
                        const da = new Date(a.date).getTime();
                        const db = new Date(b.date).getTime();
                        return db - da;
                      });
                      
                      const displayedReceipts = showAllBills ? sortedReceipts : sortedReceipts.slice(0, 3);
                      
                      // Grouping
                      const groupedReceipts: { [key: string]: typeof receipts } = {};
                      displayedReceipts.forEach(r => {
                        const label = getWeekLabel(r.date, language);
                        if (!groupedReceipts[label]) {
                          groupedReceipts[label] = [];
                        }
                        groupedReceipts[label].push(r);
                      });
                      
                      return (
                        <div className="space-y-6">
                          {Object.keys(groupedReceipts).map((weekLabel) => (
                            <div key={weekLabel} className="space-y-2.5">
                              {/* Week Section Header */}
                              <h4 className="text-[12px] font-bold text-[#519D46] dark:text-emerald-400 border-b border-neutral-200/60 dark:border-neutral-800/80 pb-1.5 px-0.5 tracking-wider uppercase">
                                {weekLabel}
                              </h4>
                              
                              <div className="space-y-3">
                                {groupedReceipts[weekLabel].map((receipt) => {
                                  const rDate = new Date(receipt.date);
                                  const fullDate = isNaN(rDate.getTime()) ? receipt.date : rDate.toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE', { month: 'short', day: 'numeric', year: 'numeric' });
                                  const isExpanded = expandedBillId === receipt.id;
                                  const calculatedScore = getReceiptScore(receipt);
                                  
                                  return (
                                    <div
                                      key={receipt.id}
                                      className="bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden text-left"
                                    >
                                      <div 
                                         className="p-4 flex items-center gap-4 cursor-pointer text-left"
                                         onClick={() => {
                                           triggerHaptic();
                                           setExpandedBillId(isExpanded ? null : receipt.id);
                                         }}
                                      >
                                        <div className="w-12 h-12 rounded-xl bg-[#F7FBF6] dark:bg-neutral-800 border border-[#E5EAE3] dark:border-neutral-700 flex items-center justify-center shrink-0">
                                          <Receipt className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 space-y-0.5">
                                          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-[15px] truncate">
                                            {receipt.storeName || (language === 'en' ? "Unknown store" : "Unbekanntes Geschäft")}
                                          </h4>
                                          <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                                            {fullDate} • {receipt.totalAmount || "EUR 15.95"} • {receipt.items?.length || 0} {t("items")}
                                          </p>
                                        </div>

                                        <div className="shrink-0 flex items-center gap-2">
                                          <div className="w-10 h-10 rounded-full bg-[#EAF3EB] dark:bg-emerald-950/40 text-[#2F7E41] dark:text-emerald-400 font-bold text-[13px] flex items-center justify-center">
                                            {calculatedScore}
                                            <span className="text-[9px] font-medium ml-0.5 mt-0.5">%</span>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              triggerHaptic();
                                              setReceipts(prev => prev.filter(r => r.id !== receipt.id));
                                            }}
                                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-neutral-300 dark:text-neutral-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                            title={t("deleteBill")}
                                          >
                                            <Trash2 className="w-4.5 h-4.5" />
                                          </button>
                                          <ChevronDown className={`w-5 h-5 text-neutral-400 dark:text-neutral-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                      </div>

                                      {isExpanded && receipt.items && receipt.items.length > 0 && (
                                        <div className="border-t border-[#E5EAE3] dark:border-neutral-800 p-4 bg-[#F7FBF6]/50 dark:bg-neutral-950/40 space-y-2">
                                          {receipt.items.map((item: any, idx: number) => {
                                             const dynFood = dynamicFoods.find(f => f.id === item.id) || item.foodData;
                                             const score = dynFood?.health_score || 50;
                                             const swapFood = dynFood ? getBillItemSwap(dynFood, userProfile.dietaryPreference) : null;
                                             return (
                                             <div 
                                               key={idx}
                                               onClick={() => {
                                                 if (dynFood) {
                                                   triggerHaptic();
                                                   setSelectedFoodId(dynFood.id);
                                                   if (!FOODS.find(f => f.id === dynFood.id)) {
                                                     FOODS.push(dynFood);
                                                   }
                                                 } else {
                                                   handleOpenDynamicFood(item);
                                                 }
                                               }}
                                               className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 rounded-xl border border-[#E5EAE3] dark:border-neutral-800 cursor-pointer shadow-sm hover:border-[#CDE5CE] dark:hover:border-[#3a4736] transition-colors text-left"
                                             >
                                               <div className="flex items-center gap-3 min-w-0 flex-1">
                                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${score >= 75 ? 'bg-[#EAF3EB] dark:bg-emerald-950/40 text-[#2F7E41] dark:text-emerald-400' : score >= 50 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' : 'bg-red-50 dark:bg-rose-950/40 text-red-600 dark:text-rose-400'}`}>
                                                   {score}
                                                 </div>
                                                 <div className="flex flex-col min-w-0 flex-1">
                                                   <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate w-full">{item.cleanName}</span>
                                                   <span className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate w-full">{item.rawName}</span>
                                                 </div>
                                               </div>

                                               {swapFood && (
                                                 <div 
                                                   onClick={(e) => {
                                                     e.stopPropagation();
                                                     triggerHaptic();
                                                     setSelectedFoodId(swapFood.id);
                                                   }}
                                                   className="mx-2 flex items-center gap-1.5 bg-emerald-50 dark:bg-[#1a2d1d] hover:bg-[#DCEFDE] dark:hover:bg-[#254029] border border-emerald-200 dark:border-[#3b5c3e] rounded-lg px-2 py-1 shrink-0 text-left cursor-pointer transition-colors max-w-[45%]"
                                                   title={language === 'en' ? `Swap to ${swapFood.name}` : `Zu ${swapFood.name} tauschen`}
                                                 >
                                                   <Sparkles className="w-3 h-3 text-[#519D46] dark:text-emerald-400 shrink-0 animate-pulse" />
                                                   <div className="min-w-0">
                                                     <p className="text-[8px] font-bold text-[#3B7A32] dark:text-emerald-400 uppercase tracking-wide leading-none">{language === 'en' ? 'Swap' : 'Tausch'}</p>
                                                     <p className="text-xs font-bold text-neutral-800 dark:text-neutral-100 truncate mt-0.5">{swapFood.name}</p>
                                                   </div>
                                                   <div className="text-[10px] font-bold text-[#2F7E41] dark:text-emerald-400 ml-1 bg-white dark:bg-neutral-800 border border-[#CDE5CE] dark:border-neutral-700 px-1 py-0.2 rounded shrink-0">
                                                     {swapFood.health_score}
                                                   </div>
                                                 </div>
                                               )}

                                               <ArrowRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 shrink-0" />
                                             </div>
                                             );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}

                          {receipts.length > 3 && (
                            <div className="pt-2 flex justify-center">
                              <button
                                onClick={() => {
                                  triggerHaptic();
                                  setShowAllBills(prev => !prev);
                                }}
                                className="text-xs font-bold text-[#2F7E41] dark:text-emerald-400 bg-[#EAF3EB] dark:bg-emerald-950/40 hover:bg-[#DCEFDE] dark:hover:bg-[#254029] transition-colors px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm"
                              >
                                {showAllBills ? (
                                  <>
                                    <span>{language === 'en' ? 'Show Less' : 'Weniger anzeigen'}</span>
                                  </>
                                ) : (
                                  <>
                                    <span>{language === 'en' ? `See All Bills (${receipts.length})` : `Alle Belege anzeigen (${receipts.length})`}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== SCAN TAB ==================== */}
          {activeTab === "scan" && (
            <div className="px-5 pt-8 space-y-6 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleTabChange("bill")}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#E5EAE3] text-neutral-900"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  Scan Receipt
                </h1>
              </div>

              <p className="text-[15px] text-neutral-600 font-medium leading-relaxed">
                Take a picture of your grocery bill to check the health score of your purchases.
              </p>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="w-full bg-[#519D46] hover:bg-[#438739] transition-colors text-white py-4 rounded-[1.25rem] font-bold text-base flex items-center justify-center gap-3 shadow-[0_2px_10px_rgba(81,157,70,0.2)] disabled:opacity-50"
                >
                  {isScanning ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      Take Photo
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => fileInputLibRef.current?.click()}
                  disabled={isScanning}
                  className="w-full bg-white dark:bg-neutral-900 border-2 border-[#E5EAE3] dark:border-neutral-800 dark:text-neutral-200 hover:border-[#519D46] hover:text-[#519D46] transition-colors text-neutral-700 py-4 rounded-[1.25rem] font-bold text-base flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
                >
                  <FileImage className="w-5 h-5 text-neutral-400" />
                  Choose from Library
                </button>

                <button
                  onClick={handleLoadDemoBill}
                  disabled={isScanning}
                  className="w-full bg-[#EAF3EB] hover:bg-[#DCEFDE] transition-colors text-[#2F7E41] py-4 rounded-[1.25rem] font-bold text-base flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5 text-[#2F7E41]" />
                  Try with Demo Receipt
                </button>
              </div>

              {/* How it works */}
              <div className="pt-8 space-y-4">
                <h3 className="text-lg font-bold text-neutral-900">How it works</h3>
                <div className="space-y-4">
                  {[
                    { title: "Take a clear picture of your receipt", icon: Camera },
                    { title: "We identify the groceries you bought", icon: Search },
                    { title: "Get a health score for your purchase", icon: Sparkles }
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[1rem] bg-[#EAF3EB] text-[#2F7E41] flex items-center justify-center shrink-0">
                        <step.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[15px] font-medium text-neutral-800 leading-snug">
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleScanBill} 
        />
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputLibRef} 
          onChange={handleScanBill} 
        />

        {/* PREMIUM FLOATING TAB BAR IN PURE WHITE */}
        <div className="absolute bottom-6 inset-x-5 z-40 select-none">
          <div 
            onTouchStart={handleMainTouchStart}
            onTouchMove={handleMainTouchMove}
            onTouchEnd={handleMainTouchEnd}
            onTouchCancel={handleMainTouchEnd}
            className="h-[74px] bg-white dark:bg-black/95 rounded-full border border-neutral-200/90 dark:border-neutral-800/90 shadow-[0_12px_36px_rgba(0,0,0,0.1)] flex justify-around items-center px-2.5 relative overflow-hidden"
          >
            
            {/* Tab 1: Today */}
            <button
              onClick={() => handleTabChange("home")}
              className="flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer relative z-10 transition-colors"
            >
              {activeTab === "home" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="absolute inset-x-1.5 inset-y-2 rounded-full bg-[#F4F8FC] dark:bg-[#222521] border border-[#E0ECFC] dark:border-neutral-700 shadow-[0_2px_6px_rgba(0,122,255,0.03)] overflow-hidden"
                />
              )}
              <Home 
                className={`w-[21px] h-[21px] relative z-10 transition-colors duration-300 ${activeTab === "home" ? "text-[#007AFF] dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-400"}`} 
                strokeWidth={activeTab === "home" ? 2.5 : 1.8} 
              />
              <span className={`text-[10px] font-bold tracking-wide relative z-10 transition-colors duration-300 ${activeTab === "home" ? "text-[#007AFF] dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-400"}`}>
                {t("today")}
              </span>
            </button>
 
            {/* Tab 2: Search */}
            <button
              onClick={() => handleTabChange("search")}
              className="flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer relative z-10 transition-colors"
            >
              {activeTab === "search" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="absolute inset-x-1.5 inset-y-2 rounded-full bg-[#F4F8FC] dark:bg-[#222521] border border-[#E0ECFC] dark:border-neutral-700 shadow-[0_2px_6px_rgba(0,122,255,0.03)] overflow-hidden"
                />
              )}
              <Search 
                className={`w-[21px] h-[21px] relative z-10 transition-colors duration-300 ${activeTab === "search" ? "text-[#007AFF] dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-400"}`} 
                strokeWidth={activeTab === "search" ? 2.5 : 1.8} 
              />
              <span className={`text-[10px] font-bold tracking-wide relative z-10 transition-colors duration-300 ${activeTab === "search" ? "text-[#007AFF] dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-400"}`}>
                {t("search")}
              </span>
            </button>
 
            {/* Tab 3: Swaps */}
            <button
              onClick={() => handleTabChange("swaps")}
              className="flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer relative z-10 transition-colors"
            >
              {activeTab === "swaps" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="absolute inset-x-1.5 inset-y-2 rounded-full bg-[#F4F8FC] dark:bg-[#222521] border border-[#E0ECFC] dark:border-neutral-700 shadow-[0_2px_6px_rgba(0,122,255,0.03)] overflow-hidden"
                />
              )}
              <ArrowLeftRight 
                className={`w-[21px] h-[21px] relative z-10 transition-colors duration-300 ${activeTab === "swaps" ? "text-[#007AFF] dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-400"}`} 
                strokeWidth={activeTab === "swaps" ? 2.5 : 1.8} 
              />
              <span className={`text-[10px] font-bold tracking-wide relative z-10 transition-colors duration-300 ${activeTab === "swaps" ? "text-[#007AFF] dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-400"}`}>
                {t("swaps")}
              </span>
            </button>
 
            {/* Tab 4: Bills */}
            <button
              onClick={() => handleTabChange("bill")}
              className="flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer relative z-10 transition-colors"
            >
              {activeTab === "bill" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="absolute inset-x-1.5 inset-y-2 rounded-full bg-[#F4F8FC] dark:bg-[#222521] border border-[#E0ECFC] dark:border-neutral-700 shadow-[0_2px_6px_rgba(0,122,255,0.03)] overflow-hidden"
                />
              )}
              <Receipt 
                className={`w-[21px] h-[21px] relative z-10 transition-colors duration-300 ${activeTab === "bill" ? "text-[#007AFF] dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-400"}`} 
                strokeWidth={activeTab === "bill" ? 2.5 : 1.8} 
              />
              <span className={`text-[10px] font-bold tracking-wide relative z-10 transition-colors duration-300 ${activeTab === "bill" ? "text-[#007AFF] dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-400"}`}>
                {t("bills")}
              </span>
            </button>
          </div>
        </div>

        {/* ==================== FOOD DETAIL SLIDE-UP SHEET ==================== */}
        {currentFoodDetail && (
          <>
            {/* Dark Dim Backdrop */}
            <div
              onClick={handleCloseFood}
              className="absolute inset-0 bg-black/40 z-50 transition-opacity duration-300"
            />

            {/* Bottom Sheet Modal Panel */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                transform: `translateY(${dragOffset}px)`,
                transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
              className="absolute bottom-0 inset-x-0 h-[88vh] bg-[#F7FBF6] dark:bg-black rounded-t-[24px] shadow-2xl z-50 flex flex-col overflow-hidden border-t border-[#E5EAE3] dark:border-neutral-800"
            >
              {/* Drag Grabber indicator */}
              <div className="w-full flex justify-center py-3 select-none flex-shrink-0 cursor-row-resize">
                <div className="w-10 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
              </div>

              {/* Favorite Button top-right */}
              <button
                onClick={(e) => toggleFavoriteFood(currentFoodDetail.id, e)}
                className="absolute top-3.5 right-12 w-7 h-7 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-[#2c2d2c] rounded-full flex items-center justify-center border border-[#E5EAE3] dark:border-neutral-700 z-50 shadow-sm transition-colors"
                title={language === 'en' ? 'Favorite' : 'Favorisieren'}
              >
                <Heart 
                  className={`w-4 h-4 transition-all active:scale-125 ${
                    favoriteFoodIds.includes(currentFoodDetail.id) 
                      ? "fill-rose-500 text-rose-500" 
                      : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-300"
                  }`} 
                />
              </button>

              {/* Close Button top-right */}
              <button
                onClick={handleCloseFood}
                className="absolute top-3.5 right-3.5 w-7 h-7 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full flex items-center justify-center border border-[#E5EAE3] dark:border-neutral-700 text-neutral-400 hover:text-neutral-600 dark:text-neutral-300 z-50 shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-6 no-scrollbar">
                
                {/* Header with Title and Score Ring */}
                <div className="flex justify-between items-start pt-6 text-left">
                  <div className="space-y-1 w-[60%]">
                    <h2 className="text-[32px] font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-none">
                      {currentFoodDetail.name}
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                      per 100g
                    </p>
                    <div className="flex items-baseline gap-1 pt-1">
                      <span className="text-2xl font-bold text-[#519D46] dark:text-emerald-400">{Math.round(currentFoodDetail.nutrients_per_100.kcal)}</span>
                      <span className="text-sm font-medium text-neutral-400 dark:text-neutral-500">kcal / 100g</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 -mt-2">
                    <ScoreRing score={currentFoodDetail.health_score} size={96} strokeWidth={6.5} />
                  </div>
                </div>
                
                {/* Smart Swap Recommendation */}
                {(() => {
                  const swaps = getSmartSwapsForFood(currentFoodDetail);
                  if (swaps.length === 0) {
                    return (
                      <div className="bg-[#EAF3EB] dark:bg-emerald-950/40 p-4 rounded-2xl border border-[#CDE5CE] dark:border-neutral-800 flex items-start gap-3 mt-4 text-left">
                        <div className="bg-white dark:bg-neutral-800 p-1.5 rounded-full shadow-sm text-[#519D46] dark:text-emerald-400 mt-0.5 shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                            {language === 'en' ? 'Great Choice!' : 'Gute Wahl!'}
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                            {language === 'en' ? 'This product is already a healthy option in its category.' : 'Dieses Produkt ist bereits eine gesunde Option in seiner Kategorie.'}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="pt-3 pb-1 text-left space-y-3">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {language === 'en' ? 'Smarter Swap' : 'Bessere Alternative'}
                      </h3>
                      {swaps.map((swap, idx) => (
                        <div 
                          key={idx}
                          onClick={() => handleOpenFood(swap.toFood.id)}
                          className="bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 p-4 shadow-sm flex gap-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <div className="w-[72px] h-[72px] bg-neutral-100 dark:bg-neutral-800 rounded-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                            {swap.toFood.image ? (
                              <img src={swap.toFood.image} alt={swap.toFood.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl">{swap.toFood.emoji || "🍎"}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-xs font-bold text-[#519D46] dark:text-emerald-400 uppercase tracking-wide mb-0.5">
                              {language === 'en' ? 'Recommended' : 'Empfohlen'}
                            </p>
                            <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100 truncate">
                              {swap.toFood.name}
                            </h4>
                            <p className="text-xs text-neutral-500 font-medium truncate">
                              {swap.toFood.brand || swap.toFood.category}
                            </p>
                          </div>
                          <div className="flex-shrink-0 flex items-center">
                             <div className="bg-[#EAF3EB] dark:bg-emerald-950/40 text-[#2F7E41] dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                               {swap.toFood.health_score} <span className="opacity-70">/ 100</span>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div className="space-y-3 pt-2 text-left">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {language === 'en' ? 'Nutrition Facts' : 'Nährwertangaben'}
                  </h3>
                  <div className="bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-[#F2F6F1] dark:border-neutral-800">
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                        {language === 'en' ? 'Per 100g (% of Daily Value)' : 'Pro 100g (% des Tagesbedarfs)'}
                      </p>
                      <p className="text-[10px] text-[#519D46] dark:text-emerald-400 font-medium bg-[#EAF3EB] dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        {language === 'en' ? 'Source: Swiss Food Composition Database' : 'Quelle: Swiss Food Composition Database'}
                      </p>
                    </div>

                    {/* Macros lists */}
                    <div className="space-y-3.5">
                      {(() => {
                        const labels: Record<string, any> = {
                          kcal: language === 'en' ? "Calories" : "Kalorien",
                          protein_g: language === 'en' ? "Protein" : "Eiweiß",
                          carbs_g: language === 'en' ? "Carbohydrates" : "Kohlenhydrate",
                          fiber_g: language === 'en' ? "Fiber" : "Ballaststoffe",
                          sugars_g: language === 'en' ? "Sugars" : "Zucker",
                          fat_g: language === 'en' ? "Total Fat" : "Fett",
                          saturated_fat_g: language === 'en' ? "Saturated Fat" : "Gesättigte Fettsäuren",
                          salt_g: language === 'en' ? "Salt" : "Salz"
                        };

                        return Object.entries(currentFoodDetail.nutrients_per_100)
                          .filter(([key]) => key !== 'kcal' && key !== 'micros')
                          .map(([key, val]) => {
                            const dv = getMacroDV(key, val as number);
                            return (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between items-end text-sm leading-none">
                                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                    {labels[key] || key}
                                  </span>
                                  <div className="flex gap-3 text-right font-sans">
                                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{val}g</span>
                                    <span className="font-bold text-[#519D46] dark:text-emerald-400 w-8">{dv}%</span>
                                  </div>
                                </div>
                                <div className="h-1 bg-[#F2F6F1] dark:bg-neutral-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#519D46] dark:bg-emerald-500 rounded-full" 
                                    style={{ width: `${Math.min(dv, 100)}%` }}
                                  />
                                </div>
                              </div>
                            );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Vitamins & Minerals Section */}
                {currentFoodDetail.nutrients_per_100.micros && Object.values(currentFoodDetail.nutrients_per_100.micros).some(v => v !== null && v !== undefined) && (
                  <div className="bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mt-4">
                    <h4 className="text-[17px] font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-4">
                      {language === 'en' ? 'Vitamins & Minerals (per 100g)' : 'Vitamine & Mineralstoffe (pro 100g)'}
                    </h4>
                    <div className="space-y-3.5">
                      {Object.entries(currentFoodDetail.nutrients_per_100.micros)
                        .filter(([_, val]) => val !== null && val !== undefined)
                        .map(([key, val]) => {
                          const formatKey = (k) => {
                            const names = {
                              vitamin_a_ug: "Vitamin A", betacarotene_ug: "Beta-Carotene",
                              vitamin_b1_mg: "Vitamin B1", vitamin_b2_mg: "Vitamin B2",
                              vitamin_b6_mg: "Vitamin B6", vitamin_b12_ug: "Vitamin B12",
                              niacin_mg: "Niacin", folate_ug: "Folate",
                              pantothenic_acid_mg: "Pantothenic Acid", vitamin_c_mg: "Vitamin C",
                              vitamin_d_ug: "Vitamin D", vitamin_e_mg: "Vitamin E",
                              sodium_mg: "Sodium", potassium_mg: "Potassium",
                              chloride_mg: "Chloride", calcium_mg: "Calcium",
                              magnesium_mg: "Magnesium", phosphorus_mg: "Phosphorus",
                              iron_mg: "Iron", iodide_ug: "Iodide", zinc_mg: "Zinc"
                            };
                            return names[k] || k.replace(/_/g, ' ');
                          };
                          const getDV = (k, v) => {
                            const dvs = {
                              vitamin_a_ug: 900, vitamin_c_mg: 90, vitamin_d_ug: 20,
                              calcium_mg: 1000, iron_mg: 14, potassium_mg: 3500,
                              magnesium_mg: 400, zinc_mg: 11, sodium_mg: 2300,
                              vitamin_b12_ug: 2.4, vitamin_b6_mg: 1.7
                            };
                            const standard = dvs[k];
                            if (!standard) return null;
                            return Math.round((v / standard) * 100);
                          };
                          const dv = getDV(key, val);
                          const isUg = key.endsWith('_ug');
                          
                          return (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between items-end text-sm leading-none">
                                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                    {formatKey(key)}
                                  </span>
                                  <div className="flex gap-3 text-right font-sans">
                                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{val}{isUg ? 'µg' : 'mg'}</span>
                                    <span className="font-bold text-[#519D46] dark:text-emerald-400 w-8">{dv !== null ? dv + '%' : 'N/A'}</span>
                                  </div>
                                </div>
                                <div className="h-1 bg-[#F2F6F1] dark:bg-neutral-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#519D46] dark:bg-emerald-500 rounded-full" 
                                    style={{ width: `${Math.min(dv || 0, 100)}%` }}
                                  />
                                </div>
                              </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {currentFoodDetail.offUrl && (
                  <div className="pt-2">
                    <a
                      href={currentFoodDetail.offUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#EAF3EB] dark:bg-emerald-950/30 hover:bg-[#DCEFDE] dark:hover:bg-emerald-950/50 transition-colors text-[#2F7E41] dark:text-emerald-400 py-4 rounded-[1.25rem] font-bold text-base flex items-center justify-center gap-3 border border-[#CDE5CE] dark:border-neutral-800 shadow-sm cursor-pointer"
                      id="off_link_button"
                    >
                      <ExternalLink className="w-5 h-5 text-[#2F7E41] dark:text-emerald-400" />
                      {language === 'en' ? 'View in Swiss Food DB' : 'In Schweizer Nährwertdatenbank ansehen'}
                    </a>
                  </div>
                )}

              </div></div></>
        )}

{/* Global Loading Overlay */}
      {isGeneratingFood && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 max-w-[80vw]">
            <div className="w-8 h-8 border-4 border-[#EAF3EB] dark:border-neutral-800 border-t-[#519D46] dark:border-t-emerald-400 rounded-full animate-spin" />
            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 text-center">
              {language === 'en' ? 'Loading nutritional data...' : 'Nährwertdaten werden geladen...'}
            </p>
          </div>
        </div>
      )}

      {/* Custom Scan Error Overlay */}
      {scanError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-[1.5rem] shadow-2xl flex flex-col gap-5 max-w-[90vw] w-[360px] border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/45 rounded-full flex items-center justify-center text-amber-500 self-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {language === 'en' ? 'Receipt Scan Issue' : 'Fehler beim Scannen des Belegs'}
              </h3>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-normal">
                {language === 'en' 
                  ? 'We encountered an issue reading the receipt image. Make sure the photo is clear and well-lit, or try our high-fidelity preloaded Demo Receipt to explore full features instantly!'
                  : 'Es gab ein Problem beim Lesen des Belegs. Stellen Sie sicher, dass das Foto klar und gut beleuchtet ist, oder probieren Sie unseren Demobeleg aus, um alle Funktionen sofort zu testen!'}
              </p>
              <div className="text-[10px] bg-neutral-50 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 rounded-lg p-2.5 mt-2 font-mono text-left max-h-[80px] overflow-y-auto border border-neutral-100 dark:border-neutral-800">
                {scanError}
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  setScanError(null);
                  handleLoadDemoBill();
                }}
                className="w-full bg-[#519D46] hover:bg-[#438739] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {language === 'en' ? 'Try Demo Receipt' : 'Demobeleg probieren'}
              </button>
              <button
                onClick={() => setScanError(null)}
                className="w-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 py-3 rounded-xl font-bold text-sm transition-colors"
              >
                {language === 'en' ? 'Dismiss' : 'Verwerfen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personalized Nutrition Breakdown Details Modal */}
      {showCalorieDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-[#111111] p-6 rounded-[24px] shadow-2xl flex flex-col gap-4 max-w-[95vw] w-[390px] border border-neutral-200/60 dark:border-neutral-800/80 animate-in zoom-in-95 duration-200 text-left">
            {/* Header */}
            <div className="flex justify-between items-center pb-2.5 border-b border-neutral-100 dark:border-neutral-800/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-[#2F7E41] dark:text-emerald-400 shrink-0">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {language === 'en' ? 'Daily Nutrient Guide' : 'Tägliche Nährwert-Ziele'}
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase">
                    {language === 'en' ? 'Based on your profile' : 'Auf Basis Ihres Profils'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { triggerHaptic(); setShowCalorieDetail(false); }}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics brief */}
            <div className="bg-[#F7FBF6] dark:bg-neutral-900/60 p-4 rounded-2xl space-y-1 text-[13px] border border-[#EAF3EB] dark:border-neutral-800/50">
              <div className="flex justify-between text-neutral-500 dark:text-neutral-400 font-medium">
                <span>{language === 'en' ? 'Daily Budget' : 'Tagesbedarf'}:</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">{getDailyCalorieTarget().toLocaleString()} kcal</span>
              </div>
              <div className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed pt-1.5 border-t border-neutral-100 dark:border-neutral-800/40 mt-1.5 text-left">
                {language === 'en' 
                  ? `Optimised for: ${userProfile.sex === 'Male' ? 'Male' : 'Female'}, ${userProfile.age} yrs, ${userProfile.weight}kg, ${userProfile.height}cm (${userProfile.activityLevel === 'Active' ? 'Active' : userProfile.activityLevel}) with a "${userProfile.dietaryPreference === 'None' ? 'Balanced' : userProfile.dietaryPreference}" dietary preference.`
                  : `Optimiert für: ${userProfile.sex === 'Male' ? 'Mann' : 'Frau'}, ${userProfile.age} J., ${userProfile.weight}kg, ${userProfile.height}cm (${userProfile.activityLevel === 'Active' ? 'Aktiv' : userProfile.activityLevel}) mit Präferenz „${userProfile.dietaryPreference === 'None' ? 'Ausgewogen' : userProfile.dietaryPreference}“.`}
              </div>
            </div>

            {/* Macros target */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                {language === 'en' ? 'Macronutrient Split' : 'Makronährstoff-Aufteilung'}
              </h4>
              <div className="space-y-3">
                {getNutritionBreakdown().nutrients_per_100.map(macro => (
                  <div key={macro.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200 leading-none">
                      <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${macro.color.split(' ')[0]}`} />
                        {macro.name}
                      </span>
                      <div className="flex gap-1.5 items-baseline">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">{macro.grams}g</span>
                        {macro.pct && <span className="text-[10px] text-neutral-400 font-normal">({macro.pct}%)</span>}
                      </div>
                    </div>
                    {macro.pct && (
                      <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${macro.color.split(' ')[0]}`}
                          style={{ width: `${macro.pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Micros target */}
            <div className="space-y-2.5 pt-1">
              <h4 className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                {language === 'en' ? 'Recommended Micronutrients' : 'Empfohlene Mikronährstoffe'}
              </h4>
              <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                {([] as any[]).map(micro => (
                  <div key={micro.name} className="flex justify-between items-center p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800/50">
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 leading-none">{micro.name}</p>
                      <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-0.5 leading-none">{micro.desc}</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#2F7E41] dark:text-emerald-400 font-mono bg-[#EAF3EB] dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg shrink-0">
                      {micro.target}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => { triggerHaptic(); setShowCalorieDetail(false); }}
              className="w-full bg-[#519D46] hover:bg-[#438739] text-white py-3 rounded-xl font-bold text-xs transition-colors mt-1 cursor-pointer text-center"
            >
              {language === 'en' ? 'Got it!' : 'Verstanden!'}
            </button>
          </div>
        </div>
      )}
</div>
    </div>
  );
}
