// 電子發票相關類型定義

// 載具類型
export type CarrierType = "phone" | "natural" | "credit_card";

// 發票設定
export interface InvoiceSettings {
  // 載具設定
  carrierType: CarrierType;
  carrierNumber: string; // 手機條碼 /ABC1234 或自然人憑證 AB12345678901234
  verifyCode: string; // 驗證碼
  // 同步設定
  autoSync: boolean;
  lastSyncAt: number | null;
  syncStatus: "idle" | "syncing" | "success" | "error";
  syncError?: string;
}

// 電子發票資料
export interface EInvoice {
  id: string;
  // 發票基本資訊
  invoiceNumber: string; // 發票號碼 AB-12345678
  invoiceDate: string; // 開立日期 YYYY-MM-DD
  sellerName: string; // 賣方名稱
  sellerBan: string; // 賣方統編
  // 金額資訊
  amount: number; // 發票金額
  // 發票明細
  items: EInvoiceItem[];
  // 載具資訊
  carrierType: CarrierType;
  carrierNumber: string;
  // 是否已匯入為收據
  importedAsReceiptId?: string;
  // 時間戳記
  createdAt: number;
}

// 發票明細項目
export interface EInvoiceItem {
  description: string; // 品名
  quantity: number; // 數量
  unitPrice: number; // 單價
  amount: number; // 金額
}

// 發票查詢參數
export interface InvoiceQueryParams {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  carrierType: CarrierType;
  carrierNumber: string;
  verifyCode: string;
}

// 預設發票設定
export const defaultInvoiceSettings: InvoiceSettings = {
  carrierType: "phone",
  carrierNumber: "",
  verifyCode: "",
  autoSync: true,
  lastSyncAt: null,
  syncStatus: "idle",
};

