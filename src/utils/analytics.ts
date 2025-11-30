// Google Analytics 事件追蹤工具

// 定義 gtag 函式類型
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

// 通用事件追蹤函式
export const trackEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
};

// ===== 收據相關事件 =====

interface ReceiptCreatedParams {
  category: string;
  total: number;
  item_count: number;
  payment_method: string;
  source: "manual" | "ai_scan";
}

export const trackReceiptCreated = (params: ReceiptCreatedParams) => {
  trackEvent("receipt_created", {
    category: params.category,
    value: Math.round(params.total),
    item_count: params.item_count,
    payment_method: params.payment_method,
    source: params.source,
  });
};

interface ReceiptDeletedParams {
  category: string;
  total: number;
}

export const trackReceiptDeleted = (params: ReceiptDeletedParams) => {
  trackEvent("receipt_deleted", {
    category: params.category,
    value: Math.round(params.total),
  });
};

// ===== AI 掃描相關事件 =====

interface AIScanStartedParams {
  provider: string;
  model: string;
}

export const trackAIScanStarted = (params: AIScanStartedParams) => {
  trackEvent("ai_scan_started", {
    ai_provider: params.provider,
    ai_model: params.model,
  });
};

interface AIScanCompletedParams {
  provider: string;
  model: string;
  item_count: number;
  was_edited: boolean;
}

export const trackAIScanCompleted = (params: AIScanCompletedParams) => {
  trackEvent("ai_scan_completed", {
    ai_provider: params.provider,
    ai_model: params.model,
    item_count: params.item_count,
    was_edited: params.was_edited,
  });
};

interface AIScanFailedParams {
  provider: string;
  model: string;
  error_type: string;
}

export const trackAIScanFailed = (params: AIScanFailedParams) => {
  trackEvent("ai_scan_failed", {
    ai_provider: params.provider,
    ai_model: params.model,
    error_type: params.error_type,
  });
};

// ===== AI 設定相關事件 =====

interface AISettingsSavedParams {
  provider: string;
  model: string;
}

export const trackAISettingsSaved = (params: AISettingsSavedParams) => {
  trackEvent("ai_settings_saved", {
    ai_provider: params.provider,
    ai_model: params.model,
  });
};

// ===== UI 互動事件 =====

type ViewType = "archive" | "chart" | "achievements";

export const trackViewChanged = (view: ViewType) => {
  trackEvent("view_changed", {
    view_name: view,
  });
};

type FilterType = "all" | "year" | "month" | "day";

export const trackArchiveFilterChanged = (filterType: FilterType) => {
  trackEvent("archive_filter_changed", {
    filter_type: filterType,
  });
};

// ===== 成就系統事件 =====

interface AchievementUnlockedParams {
  achievement_id: string;
  achievement_type: string;
  achievement_title: string;
}

export const trackAchievementUnlocked = (params: AchievementUnlockedParams) => {
  trackEvent("achievement_unlocked", {
    achievement_id: params.achievement_id,
    achievement_type: params.achievement_type,
    achievement_title: params.achievement_title,
  });
};

// ===== 功能使用事件 =====

export const trackCameraScanOpened = () => {
  trackEvent("camera_scan_opened");
};

export const trackAISettingsOpened = () => {
  trackEvent("ai_settings_opened");
};

