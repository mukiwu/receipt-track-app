"use client";

import { ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";

interface FeatureGateProps {
  children: ReactNode;
  feature: "invoice_sync" | "export" | "unlimited_receipts" | "unlimited_ai_scans";
  fallback?: ReactNode;
  onUpgradeClick?: () => void;
}

// Pro 功能對應
const PRO_FEATURES = {
  invoice_sync: "電子發票同步",
  export: "資料匯出",
  unlimited_receipts: "無限收據",
  unlimited_ai_scans: "無限 AI 掃描",
};

export default function FeatureGate({
  children,
  feature,
  fallback,
  onUpgradeClick,
}: FeatureGateProps) {
  const { isPro } = useSubscription();

  if (isPro) {
    return <>{children}</>;
  }

  // 顯示預設的升級提示或自訂的 fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      {/* 模糊的功能預覽 */}
      <div className="blur-sm pointer-events-none opacity-50">{children}</div>

      {/* 升級提示覆蓋層 */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
        <div className="text-center p-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <p className="font-mono text-sm font-medium text-gray-800 mb-1">
            {PRO_FEATURES[feature]}
          </p>
          <p className="font-mono text-xs text-gray-500 mb-3">
            升級 Pro 解鎖此功能
          </p>
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#C41E3A] to-[#9A1428] text-white font-mono text-xs font-medium hover:shadow-lg transition-all"
            >
              升級 Pro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Pro 徽章元件
export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white ${className}`}
    >
      PRO
    </span>
  );
}

// 鎖頭圖示元件
export function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

