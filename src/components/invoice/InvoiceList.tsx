"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useInvoiceSettings } from "@/hooks/useInvoiceSettings";
import { useReceipts } from "@/hooks/useReceipts";
import { EInvoice } from "@/types/invoice";
import { Receipt } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface InvoiceListProps {
  onOpenSettings: () => void;
}

export default function InvoiceList({ onOpenSettings }: InvoiceListProps) {
  const { user } = useAuth();
  const { settings, isConfigured, updateSyncStatus } = useInvoiceSettings();
  const { addReceipt } = useReceipts();
  
  const [invoices, setInvoices] = useState<EInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<EInvoice | null>(null);

  // 載入發票列表
  useEffect(() => {
    if (!user) return;

    const invoicesRef = collection(db, "users", user.uid, "invoices");
    const q = query(invoicesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as EInvoice[];
      setInvoices(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 同步發票
  const handleSync = async () => {
    if (!user || !isConfigured) return;

    setIsSyncing(true);
    await updateSyncStatus("syncing");

    try {
      // 計算日期範圍（過去 30 天）
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const response = await fetch("/api/invoice/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrierNumber: settings.carrierNumber,
          verifyCode: settings.verifyCode,
          startDate,
          endDate,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // 儲存發票到 Firestore
        const invoicesRef = collection(db, "users", user.uid, "invoices");
        
        for (const invoice of result.data) {
          const invoiceDoc = doc(invoicesRef, invoice.id);
          await setDoc(invoiceDoc, invoice);
        }

        await updateSyncStatus("success");
      } else {
        await updateSyncStatus("error", result.error);
      }
    } catch (error) {
      console.error("發票同步失敗:", error);
      await updateSyncStatus("error", "同步失敗，請稍後再試");
    } finally {
      setIsSyncing(false);
    }
  };

  // 將發票匯入為收據
  const handleImportAsReceipt = async (invoice: EInvoice) => {
    if (!user) return;

    // 轉換為收據格式
    const receipt: Receipt = {
      id: uuidv4(),
      receiptNo: invoice.invoiceNumber.replace("-", ""),
      date: invoice.invoiceDate.replace(/-/g, "."),
      time: "00:00",
      storeName: invoice.sellerName,
      category: "other",
      items: invoice.items.map((item) => ({
        id: uuidv4(),
        name: item.description,
        price: item.unitPrice,
        quantity: item.quantity,
      })),
      total: invoice.amount,
      paymentMethod: "電子載具",
      createdAt: Date.now(),
    };

    await addReceipt(receipt);

    // 更新發票的匯入狀態
    const invoiceRef = doc(db, "users", user.uid, "invoices", invoice.id);
    await setDoc(invoiceRef, {
      ...invoice,
      importedAsReceiptId: receipt.id,
    });

    setSelectedInvoice(null);
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 格式化最後同步時間
  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return "從未同步";
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  if (!isConfigured) {
    return (
      <div className="receipt-paper rounded-xl p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="font-mono font-bold text-gray-800 mb-2">
          尚未設定電子發票載具
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          設定載具後即可自動同步發票
        </p>
        <button
          onClick={onOpenSettings}
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#C41E3A] to-[#9A1428] text-white font-mono text-sm font-medium hover:shadow-lg transition-all"
        >
          設定載具
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 同步狀態列 */}
      <div className="receipt-paper rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-sm text-gray-600">
              載具：{settings.carrierNumber}
            </p>
            <p className="font-mono text-xs text-gray-400">
              最後同步：{formatLastSync(settings.lastSyncAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C41E3A] to-[#9A1428] text-white font-mono text-xs font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSyncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  同步中...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  同步發票
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 發票列表 */}
      {invoices.length === 0 ? (
        <div className="receipt-paper rounded-xl p-8 text-center">
          <p className="text-gray-500 font-mono text-sm">
            點擊「同步發票」取得最新發票
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedInvoice(invoice)}
              className="receipt-paper rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-mono text-sm font-medium text-gray-800">
                      {invoice.sellerName}
                    </p>
                    <p className="font-mono text-xs text-gray-400">
                      {formatDate(invoice.invoiceDate)} · {invoice.invoiceNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-gray-800">
                    ${invoice.amount}
                  </p>
                  {invoice.importedAsReceiptId && (
                    <span className="text-[10px] text-green-600 font-mono">
                      已匯入
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 發票詳情 Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSelectedInvoice(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-x-4 bottom-4 max-w-md mx-auto z-50"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {selectedInvoice.sellerName}
                      </h3>
                      <p className="font-mono text-xs text-gray-400">
                        {selectedInvoice.invoiceNumber}
                      </p>
                    </div>
                    <p className="font-mono text-xl font-bold text-gray-800">
                      ${selectedInvoice.amount}
                    </p>
                  </div>
                </div>
                
                {/* 明細 */}
                <div className="p-5 max-h-60 overflow-y-auto">
                  {selectedInvoice.items.length > 0 ? (
                    <div className="space-y-2">
                      {selectedInvoice.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {item.description}
                            {item.quantity > 1 && ` x${item.quantity}`}
                          </span>
                          <span className="font-mono text-gray-800">
                            ${item.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 text-sm">
                      無明細資料
                    </p>
                  )}
                </div>

                {/* 按鈕 */}
                <div className="p-4 bg-gray-50 flex gap-3">
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-600 font-mono font-medium"
                  >
                    關閉
                  </button>
                  {!selectedInvoice.importedAsReceiptId && (
                    <button
                      onClick={() => handleImportAsReceipt(selectedInvoice)}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C41E3A] to-[#9A1428] text-white font-mono font-medium"
                    >
                      匯入為收據
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

