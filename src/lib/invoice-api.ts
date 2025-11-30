/**
 * 財政部電子發票 API 整合
 * 
 * 注意：實際使用需要向財政部申請 API 權限
 * 文件：https://www.einvoice.nat.gov.tw/ein_upload/html/ENV/1.0.0/
 */

import { EInvoice, EInvoiceItem, InvoiceQueryParams } from "@/types/invoice";

// API 基礎設定
const EINVOICE_API_BASE = "https://api.einvoice.nat.gov.tw";
const API_VERSION = "V2";

// 環境變數
const APP_ID = process.env.INVOICE_API_APP_ID || "";
const API_KEY = process.env.INVOICE_API_KEY || "";

// API 錯誤類型
export class InvoiceAPIError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = "InvoiceAPIError";
  }
}

// 取得 UNIX timestamp
const getTimestamp = () => Math.floor(Date.now() / 1000);

// 產生簽名（實際實作需要依照財政部文件）
const generateSignature = (params: Record<string, string>): string => {
  // TODO: 實作實際的簽名邏輯
  return "";
};

/**
 * 查詢載具發票表頭
 */
export async function queryCarrierInvoices(
  params: InvoiceQueryParams
): Promise<EInvoice[]> {
  // 這是模擬回傳，實際需要串接財政部 API
  // 實際 API endpoint: /PB2CAPIVAN/invServ/InvServ

  if (!APP_ID || !API_KEY) {
    throw new InvoiceAPIError(
      "尚未設定電子發票 API 金鑰",
      "API_NOT_CONFIGURED"
    );
  }

  try {
    const response = await fetch(`${EINVOICE_API_BASE}/PB2CAPIVAN/${API_VERSION}/Carrier/InvList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: API_VERSION,
        action: "carrierInvList",
        appID: APP_ID,
        timeStamp: getTimestamp(),
        uuid: crypto.randomUUID(),
        cardType: params.carrierType === "phone" ? "3J0002" : "CQ0001",
        cardNo: params.carrierNumber,
        cardEncrypt: params.verifyCode,
        startDate: params.startDate.replace(/-/g, "/"),
        endDate: params.endDate.replace(/-/g, "/"),
        onlyWinningInv: "N",
      }),
    });

    if (!response.ok) {
      throw new InvoiceAPIError(
        "發票查詢失敗",
        "API_REQUEST_FAILED"
      );
    }

    const data = await response.json();

    if (data.code !== "200") {
      throw new InvoiceAPIError(
        data.msg || "發票查詢失敗",
        data.code
      );
    }

    // 轉換 API 回傳格式為我們的格式
    return (data.details || []).map((inv: Record<string, string>) => ({
      id: `${inv.invNum}-${inv.invDate}`,
      invoiceNumber: inv.invNum,
      invoiceDate: inv.invDate,
      sellerName: inv.sellerName || "未知商家",
      sellerBan: inv.sellerBan || "",
      amount: parseInt(inv.amount) || 0,
      items: [],
      carrierType: params.carrierType,
      carrierNumber: params.carrierNumber,
      createdAt: Date.now(),
    }));
  } catch (error) {
    if (error instanceof InvoiceAPIError) {
      throw error;
    }
    throw new InvoiceAPIError(
      "網路錯誤，請稍後再試",
      "NETWORK_ERROR"
    );
  }
}

/**
 * 查詢發票明細
 */
export async function queryInvoiceDetail(
  invoiceNumber: string,
  invoiceDate: string,
  carrierNumber: string,
  verifyCode: string
): Promise<EInvoiceItem[]> {
  if (!APP_ID || !API_KEY) {
    throw new InvoiceAPIError(
      "尚未設定電子發票 API 金鑰",
      "API_NOT_CONFIGURED"
    );
  }

  try {
    const response = await fetch(`${EINVOICE_API_BASE}/PB2CAPIVAN/${API_VERSION}/Carrier/InvDetail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: API_VERSION,
        action: "carrierInvDetail",
        appID: APP_ID,
        timeStamp: getTimestamp(),
        uuid: crypto.randomUUID(),
        invNum: invoiceNumber,
        invDate: invoiceDate,
        cardNo: carrierNumber,
        cardEncrypt: verifyCode,
      }),
    });

    if (!response.ok) {
      throw new InvoiceAPIError(
        "發票明細查詢失敗",
        "API_REQUEST_FAILED"
      );
    }

    const data = await response.json();

    if (data.code !== "200") {
      throw new InvoiceAPIError(
        data.msg || "發票明細查詢失敗",
        data.code
      );
    }

    // 轉換格式
    return (data.details || []).map((item: Record<string, string | number>) => ({
      description: item.description || "商品",
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      amount: Number(item.amount) || 0,
    }));
  } catch (error) {
    if (error instanceof InvoiceAPIError) {
      throw error;
    }
    throw new InvoiceAPIError(
      "網路錯誤，請稍後再試",
      "NETWORK_ERROR"
    );
  }
}

/**
 * 模擬發票資料（開發測試用）
 */
export function getMockInvoices(): EInvoice[] {
  const mockStores = [
    { name: "7-ELEVEN", ban: "22556677" },
    { name: "全家便利商店", ban: "12345678" },
    { name: "全聯福利中心", ban: "87654321" },
    { name: "家樂福", ban: "11223344" },
    { name: "屈臣氏", ban: "55667788" },
  ];

  const mockItems: Record<string, EInvoiceItem[]> = {
    "7-ELEVEN": [
      { description: "御飯糰鮭魚", quantity: 1, unitPrice: 35, amount: 35 },
      { description: "光泉鮮乳", quantity: 1, unitPrice: 45, amount: 45 },
    ],
    "全家便利商店": [
      { description: "咖啡拿鐵", quantity: 1, unitPrice: 55, amount: 55 },
      { description: "蛋沙拉三明治", quantity: 1, unitPrice: 42, amount: 42 },
    ],
    "全聯福利中心": [
      { description: "雞胸肉", quantity: 2, unitPrice: 89, amount: 178 },
      { description: "高麗菜", quantity: 1, unitPrice: 35, amount: 35 },
      { description: "雞蛋一盒", quantity: 1, unitPrice: 65, amount: 65 },
    ],
  };

  const invoices: EInvoice[] = [];
  const now = new Date();

  for (let i = 0; i < 5; i++) {
    const store = mockStores[i % mockStores.length];
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dateStr = date.toISOString().split("T")[0];
    const invNum = `AB-${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`;
    const items = mockItems[store.name] || [
      { description: "商品", quantity: 1, unitPrice: 100, amount: 100 },
    ];

    invoices.push({
      id: `${invNum}-${dateStr}`,
      invoiceNumber: invNum,
      invoiceDate: dateStr,
      sellerName: store.name,
      sellerBan: store.ban,
      amount: items.reduce((sum, item) => sum + item.amount, 0),
      items,
      carrierType: "phone",
      carrierNumber: "/ABC1234",
      createdAt: date.getTime(),
    });
  }

  return invoices;
}

