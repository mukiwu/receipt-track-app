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

