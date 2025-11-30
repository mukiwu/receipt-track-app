"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import Printer from "@/components/Printer";
import Archive from "@/components/Archive";
import Chart from "@/components/Chart";
import PrinterLoading from "@/components/PrinterLoading";
import Achievements from "@/components/Achievements";
import AchievementToast from "@/components/AchievementToast";
import CameraScan from "@/components/CameraScan";
import AISettingsModal from "@/components/AISettingsModal";
import AuthGuard from "@/components/AuthGuard";
import UserMenu from "@/components/UserMenu";
import DesktopApp from "@/components/desktop/DesktopApp";
import { useReceipts } from "@/hooks/useReceipts";
import { useAchievements } from "@/hooks/useAchievements";
import { useAISettings } from "@/hooks/useAISettings";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { AIReceiptResult, Receipt } from "@/types";
import {
  trackReceiptCreated,
  trackReceiptDeleted,
  trackViewChanged,
  trackCameraScanOpened,
  trackAISettingsOpened,
  trackEvent,
} from "@/utils/analytics";

// 行動版應用
function MobileApp() {
  const { receipts, isLoaded, addReceipt, deleteReceipt } = useReceipts();
  const {
    achievements,
    notifications,
    unreadCount,
    unlockedCount,
    markNotificationAsRead,
  } = useAchievements(receipts);
  const {
    settings: aiSettings,
    isLoaded: aiSettingsLoaded,
    isConfigured,
    saveSettings,
  } = useAISettings();

  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"none" | "archive" | "chart" | "achievements">("archive");
  const [showLoading, setShowLoading] = useState(true);
  const [showCameraScan, setShowCameraScan] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);

  // 格式化日期 YYYY.MM.DD
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}.${month}.${day}`;
  };

  // 格式化時間
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // 生成收據編號
  const generateReceiptNo = () => {
    return Math.random().toString(16).substring(2, 8).toUpperCase();
  };

  // 處理 AI 收據辨識結果
  const handleReceiptScanned = (result: AIReceiptResult) => {
    const now = new Date();

    const receipt: Receipt = {
      id: uuidv4(),
      receiptNo: generateReceiptNo(),
      date: formatDate(now),
      time: formatTime(now),
      storeName: result.storeName,
      category: result.category,
      items: result.items.map((item) => ({
        ...item,
        id: uuidv4(),
      })),
      total: result.total,
      paymentMethod: result.paymentMethod,
      createdAt: now.getTime(),
    };

    trackReceiptCreated({
      category: receipt.category,
      total: receipt.total,
      item_count: receipt.items.length,
      payment_method: receipt.paymentMethod,
      source: "ai_scan",
    });

    addReceipt(receipt);
    setShowCameraScan(false);
  };

  // 處理刪除收據
  const handleDeleteReceipt = (id: string) => {
    const receipt = receipts.find((r) => r.id === id);
    if (receipt) {
      trackReceiptDeleted({
        category: receipt.category,
        total: receipt.total,
      });
    }
    deleteReceipt(id);
  };

  // 處理視圖切換
  const handleViewChange = (newView: "archive" | "chart" | "achievements") => {
    setView(newView);
    trackViewChanged(newView);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isLoaded && aiSettingsLoaded) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [mounted, isLoaded, aiSettingsLoaded]);

  if (!mounted || !isLoaded || !aiSettingsLoaded || showLoading) {
    return <PrinterLoading />;
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="flex flex-col items-center">
        {/* 用戶選單 - 放在打字機上方 */}
        <div className="w-full max-w-[360px] flex justify-end mb-2">
          <UserMenu />
        </div>

        {/* 打字機 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Printer
            onReceiptSaved={addReceipt}
            onShowChart={() => handleViewChange("chart")}
            onShowArchive={() => handleViewChange("archive")}
            onShowAchievements={() => handleViewChange("achievements")}
            unreadAchievements={unreadCount}
            onShowCameraScan={() => {
              setShowCameraScan(true);
              trackCameraScanOpened();
            }}
            onShowSettings={() => {
              setShowAISettings(true);
              trackAISettingsOpened();
            }}
            isAIConfigured={isConfigured}
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
              <Archive receipts={receipts} onDelete={handleDeleteReceipt} />
            )}
          </motion.div>
        )}

        {/* 成就解鎖通知 */}
        <AchievementToast
          notifications={notifications}
          onDismiss={markNotificationAsRead}
        />

        {/* AI 收據掃描 */}
        {showCameraScan && (
          <CameraScan
            onReceiptScanned={handleReceiptScanned}
            onClose={() => setShowCameraScan(false)}
            aiSettings={aiSettings}
            onOpenSettings={() => {
              setShowCameraScan(false);
              setShowAISettings(true);
            }}
          />
        )}

        {/* AI 設定彈窗 */}
        <AISettingsModal
          isOpen={showAISettings}
          onClose={() => setShowAISettings(false)}
          settings={aiSettings}
          onSave={saveSettings}
        />

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

// 主頁面
export default function Home() {
  const isDesktop = useIsDesktop();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 追蹤裝置類型
    trackEvent("device_type", {
      type: isDesktop ? "desktop" : "mobile",
    });
  }, [isDesktop]);

  // 避免 SSR 閃爍
  if (!mounted) {
    return <PrinterLoading />;
  }

  return (
    <AuthGuard>
      {isDesktop ? <DesktopApp /> : <MobileApp />}
    </AuthGuard>
  );
}
