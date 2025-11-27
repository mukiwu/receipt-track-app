"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Printer from "@/components/Printer";
import Archive from "@/components/Archive";
import { useReceipts } from "@/hooks/useReceipts";

export default function Home() {
  const { receipts, isLoaded, addReceipt, deleteReceipt } = useReceipts();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-2 border-thermal-amber border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-sm text-gray-500">Loading...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="flex flex-col items-center">
        {/* 打字機 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Printer onReceiptSaved={addReceipt} />
        </motion.div>

        {/* 收據存檔 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Archive receipts={receipts} onDelete={deleteReceipt} />
        </motion.div>

        {/* 底部資訊 */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 mb-8 text-center"
        >
          <p className="font-mono text-[10px] text-gray-400 tracking-wider">
            RECEIPT TRACKER
          </p>
          <p className="font-mono text-[10px] text-gray-300 mt-1">
            © 2024 · Made with ♥
          </p>
        </motion.footer>
      </div>
    </main>
  );
}

