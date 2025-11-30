import { NextRequest, NextResponse } from "next/server";
import { getMockInvoices } from "@/lib/invoice-api";

// POST /api/invoice/sync - 同步電子發票
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carrierNumber, verifyCode, startDate, endDate } = body;

    // 驗證必要參數
    if (!carrierNumber || !verifyCode) {
      return NextResponse.json(
        { error: "缺少必要參數" },
        { status: 400 }
      );
    }

    // TODO: 實際串接財政部 API
    // 目前先使用模擬資料
    const invoices = getMockInvoices();

    // 根據日期範圍過濾（如果有提供）
    let filteredInvoices = invoices;
    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      filteredInvoices = invoices.filter((inv) => {
        const invDate = new Date(inv.invoiceDate).getTime();
        return invDate >= start && invDate <= end;
      });
    }

    return NextResponse.json({
      success: true,
      data: filteredInvoices,
      count: filteredInvoices.length,
      message: `已同步 ${filteredInvoices.length} 筆發票`,
    });
  } catch (error) {
    console.error("發票同步錯誤:", error);
    return NextResponse.json(
      { error: "發票同步失敗" },
      { status: 500 }
    );
  }
}

