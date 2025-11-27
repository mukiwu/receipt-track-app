"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Receipt } from "@/types";
import ReceiptPaper from "./ReceiptPaper";

interface ArchiveProps {
  receipts: Receipt[];
  onDelete: (id: string) => void;
}

export default function Archive({ receipts, onDelete }: ArchiveProps) {
  const totalAmount = receipts.reduce((sum, r) => sum + r.total, 0);

  if (receipts.length === 0) {
    return null;
  }

  return (
    <div id="archive-section" className="w-[320px] mt-8">
      {/* 標題區 */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
        <span className="font-mono text-sm tracking-[0.3em] text-gray-500">
          ARCHIVE
        </span>
        <div className="flex-1 border-t border-gray-300" />
      </div>

      {/* 統計資訊 */}
      <div className="flex justify-between items-center mb-4 px-2">
        <span className="font-mono text-xs text-gray-500">
          {receipts.length} 筆記錄
        </span>
        <span className="font-mono text-sm text-thermal-text font-bold">
          總計 ${totalAmount.toFixed(0)}
        </span>
      </div>

      {/* 長按提示 */}
      <div className="text-center mb-3">
        <span className="font-mono text-[10px] text-gray-400">
          長按收據可刪除
        </span>
      </div>

      {/* 收據列表 */}
      <div className="space-y-4">
        <AnimatePresence>
          {receipts.map((receipt, index) => (
            <motion.div
              key={receipt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.1 }}
            >
              <ReceiptPaper
                receipt={receipt}
                isArchived={true}
                onDelete={() => onDelete(receipt.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
