export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// 記帳類別
export type ReceiptCategory =
  | "food"        // 餐飲
  | "shopping"    // 購物
  | "transport"   // 交通
  | "entertainment" // 娛樂
  | "daily"       // 日用品
  | "medical"     // 醫療
  | "other";      // 其他

export const CATEGORY_INFO: Record<ReceiptCategory, { label: string; color: string }> = {
  food: { label: "餐飲", color: "#F59E0B" },
  shopping: { label: "購物", color: "#EC4899" },
  transport: { label: "交通", color: "#3B82F6" },
  entertainment: { label: "娛樂", color: "#8B5CF6" },
  daily: { label: "日用品", color: "#10B981" },
  medical: { label: "醫療", color: "#EF4444" },
  other: { label: "其他", color: "#6B7280" },
};

export interface Receipt {
  id: string;
  receiptNo: string;
  date: string;
  time: string;
  storeName: string;
  category: ReceiptCategory;
  items: ReceiptItem[];
  total: number;
  paymentMethod: string;
  note?: string;
  createdAt: number;
}

export interface PrinterState {
  status: "ready" | "printing" | "done";
  message: string;
}

// 成就類型
export type AchievementType = "streak" | "count" | "saving" | "category";

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  current: number;
  unlocked: boolean;
  unlockedAt?: number;
  category?: ReceiptCategory; // 用於分類專家成就
}

export interface AchievementNotification {
  achievement: Achievement;
  timestamp: number;
  isRead: boolean;
}

// AI 相關類型
export type AIProvider = "openai" | "anthropic" | "google";

export interface AISettings {
  provider: AIProvider;
  model: string;
  apiKey: string;
}

export const AI_MODELS: Record<AIProvider, { id: string; name: string }[]> = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  ],
  anthropic: [
    { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5" },
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
  ],
  google: [
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
  ],
};

export const AI_PROVIDER_INFO: Record<AIProvider, { name: string; color: string }> = {
  openai: { name: "OpenAI", color: "#10A37F" },
  anthropic: { name: "Anthropic", color: "#D97706" },
  google: { name: "Google", color: "#4285F4" },
};

// AI 辨識收據結果（不含 id, receiptNo, createdAt 等自動生成的欄位）
export interface AIReceiptResult {
  storeName: string;
  category: ReceiptCategory;
  items: Omit<ReceiptItem, "id">[];
  paymentMethod: string;
  total: number;
}

