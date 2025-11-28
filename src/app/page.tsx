"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Printer from "@/components/Printer";
import Archive from "@/components/Archive";
import Chart from "@/components/Chart";
import PrinterLoading from "@/components/PrinterLoading";
import Achievements from "@/components/Achievements";
import AchievementToast from "@/components/AchievementToast";
import CameraScan from "@/components/CameraScan";
import { useReceipts } from "@/hooks/useReceipts";
import { useAchievements } from "@/hooks/useAchievements";

export default function Home() {
  const { receipts, isLoaded, addReceipt, deleteReceipt } = useReceipts();
  const {
    achievements,
    notifications,
    unreadCount,
    unlockedCount,
    markNotificationAsRead,
  } = useAchievements(receipts);
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"none" | "archive" | "chart" | "achievements">("none");
  const [showLoading, setShowLoading] = useState(true);
  const [showCameraScan, setShowCameraScan] = useState(false);

  // 處理 OCR 文字提取
  const handleTextExtracted = (text: string) => {
    // TODO: 將 OCR 文字填入打字機輸入區
    // 目前只是將文字輸出到 console，後續可以整合到輸入流程
    console.log("OCR extracted text:", text);
    setShowCameraScan(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // 最小顯示時間 1.5 秒，確保 loading 動畫能完整呈現
  useEffect(() => {
    if (mounted && isLoaded) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 1500); // 1.5 秒延遲

      return () => clearTimeout(timer);
    }
  }, [mounted, isLoaded]);

  if (!mounted || !isLoaded || showLoading) {
    return <PrinterLoading />;
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
          <Printer
            onReceiptSaved={addReceipt}
            onShowChart={() => setView("chart")}
            onShowArchive={() => setView("archive")}
            onShowAchievements={() => setView("achievements")}
            unreadAchievements={unreadCount}
            onShowCameraScan={() => setShowCameraScan(true)}
          />
        </motion.div>

        {/* 收據存檔 / 圖表統計 / 成就系統 */}
        {view !== "none" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {view === "chart" ? (
              <Chart receipts={receipts} />
            ) : view === "achievements" ? (
              <Achievements achievements={achievements} unlockedCount={unlockedCount} />
            ) : (
              <Archive receipts={receipts} onDelete={deleteReceipt} />
            )}
          </motion.div>
        )}

        {/* 成就解鎖通知 */}
        <AchievementToast
          notifications={notifications}
          onDismiss={markNotificationAsRead}
        />

        {/* 相機掃描 */}
        {showCameraScan && (
          <CameraScan
            onTextExtracted={handleTextExtracted}
            onClose={() => setShowCameraScan(false)}
          />
        )}

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
          <p className="font-mono text-[10px] text-gray-500 mt-3">
            © 2025 · Made with ♥{" "}
            <a
              href="https://muki.tw"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-dotted"
            >
              MUKI WU
            </a>{" "}
            & AI
          </p>
        </motion.footer>
      </div>
    </main>
  );
}

