"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import DesktopLayout from "./DesktopLayout";
import DashboardContent from "./DashboardContent";
import Archive from "../Archive";
import Chart from "../Chart";
import Achievements from "../Achievements";
import AchievementToast from "../AchievementToast";
import CameraScan from "../CameraScan";
import AISettingsModal from "../AISettingsModal";
import { useReceipts } from "@/hooks/useReceipts";
import { useAchievements } from "@/hooks/useAchievements";
import { useAISettings } from "@/hooks/useAISettings";
import { AIReceiptResult, Receipt } from "@/types";
import {
  trackReceiptCreated,
  trackReceiptDeleted,
  trackViewChanged,
  trackCameraScanOpened,
  trackAISettingsOpened,
} from "@/utils/analytics";

type NavItem = "dashboard" | "archive" | "chart" | "achievements" | "settings";

export default function DesktopApp() {
  const { receipts, addReceipt, deleteReceipt } = useReceipts();
  const {
    achievements,
    notifications,
    unreadCount,
    unlockedCount,
    markNotificationAsRead,
  } = useAchievements(receipts);
  const {
    settings: aiSettings,
    isConfigured,
    saveSettings,
  } = useAISettings();

  const [activeNav, setActiveNav] = useState<NavItem>("dashboard");
  const [showCameraScan, setShowCameraScan] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);

  // 格式化日期
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
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

  // 處理導航切換
  const handleNavChange = (nav: NavItem) => {
    setActiveNav(nav);

    // 如果是設定，直接打開設定彈窗
    if (nav === "settings") {
      setShowAISettings(true);
      trackAISettingsOpened();
      return;
    }

    // 追蹤視圖切換
    if (nav === "archive" || nav === "chart" || nav === "achievements") {
      trackViewChanged(nav);
    }
  };

  // 渲染主內容
  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return (
          <DashboardContent
            receipts={receipts}
            onReceiptSaved={addReceipt}
            onShowCameraScan={() => {
              setShowCameraScan(true);
              trackCameraScanOpened();
            }}
            onShowSettings={() => {
              setShowAISettings(true);
              trackAISettingsOpened();
            }}
            isAIConfigured={isConfigured}
            unreadAchievements={unreadCount}
            onShowChart={() => handleNavChange("chart")}
            onShowArchive={() => handleNavChange("archive")}
            onShowAchievements={() => handleNavChange("achievements")}
          />
        );
      case "archive":
        return <Archive receipts={receipts} onDelete={handleDeleteReceipt} />;
      case "chart":
        return <Chart receipts={receipts} />;
      case "achievements":
        return <Achievements achievements={achievements} unlockedCount={unlockedCount} />;
      default:
        return null;
    }
  };

  return (
    <>
      <DesktopLayout activeNav={activeNav} onNavChange={handleNavChange}>
        {renderContent()}
      </DesktopLayout>

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
    </>
  );
}

