import { Achievement, ReceiptCategory } from "@/types";

// 成就圖標 (使用 emoji)
const ICONS = {
  streak: "🔥",
  count: "📝",
  saving: "💰",
  category: "⭐",
};

// 定義所有成就
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, "current" | "unlocked" | "unlockedAt">[] = [
  // 記帳天數成就
  {
    id: "streak-7",
    type: "streak",
    title: "初出茅廬",
    description: "連續記帳 7 天",
    icon: ICONS.streak,
    requirement: 7,
  },
  {
    id: "streak-30",
    type: "streak",
    title: "堅持不懈",
    description: "連續記帳 30 天",
    icon: ICONS.streak,
    requirement: 30,
  },
  {
    id: "streak-100",
    type: "streak",
    title: "記帳大師",
    description: "連續記帳 100 天",
    icon: "🏆",
    requirement: 100,
  },

  // 收據數量成就
  {
    id: "count-10",
    type: "count",
    title: "小試身手",
    description: "累積記錄 10 筆收據",
    icon: ICONS.count,
    requirement: 10,
  },
  {
    id: "count-50",
    type: "count",
    title: "記帳達人",
    description: "累積記錄 50 筆收據",
    icon: ICONS.count,
    requirement: 50,
  },
  {
    id: "count-100",
    type: "count",
    title: "記帳專家",
    description: "累積記錄 100 筆收據",
    icon: "📚",
    requirement: 100,
  },
  {
    id: "count-500",
    type: "count",
    title: "記帳傳說",
    description: "累積記錄 500 筆收據",
    icon: "👑",
    requirement: 500,
  },

  // 省錢成就
  {
    id: "saving-month",
    type: "saving",
    title: "省錢達人",
    description: "本月支出低於上月",
    icon: ICONS.saving,
    requirement: 1,
  },

  // 分類專家成就 - 餐飲
  {
    id: "category-food-10",
    type: "category",
    title: "美食探索者",
    description: "記錄 10 筆餐飲消費",
    icon: "🍔",
    requirement: 10,
    category: "food",
  },
  {
    id: "category-food-30",
    type: "category",
    title: "美食愛好者",
    description: "記錄 30 筆餐飲消費",
    icon: "🍜",
    requirement: 30,
    category: "food",
  },
  {
    id: "category-food-50",
    type: "category",
    title: "美食達人",
    description: "記錄 50 筆餐飲消費",
    icon: "🍽️",
    requirement: 50,
    category: "food",
  },

  // 分類專家成就 - 購物
  {
    id: "category-shopping-10",
    type: "category",
    title: "購物新手",
    description: "記錄 10 筆購物消費",
    icon: "🛍️",
    requirement: 10,
    category: "shopping",
  },
  {
    id: "category-shopping-30",
    type: "category",
    title: "購物達人",
    description: "記錄 30 筆購物消費",
    icon: "🛒",
    requirement: 30,
    category: "shopping",
  },
  {
    id: "category-shopping-50",
    type: "category",
    title: "購物專家",
    description: "記錄 50 筆購物消費",
    icon: "💳",
    requirement: 50,
    category: "shopping",
  },

  // 分類專家成就 - 交通
  {
    id: "category-transport-10",
    type: "category",
    title: "通勤族",
    description: "記錄 10 筆交通消費",
    icon: "🚗",
    requirement: 10,
    category: "transport",
  },
  {
    id: "category-transport-30",
    type: "category",
    title: "交通達人",
    description: "記錄 30 筆交通消費",
    icon: "🚌",
    requirement: 30,
    category: "transport",
  },
  {
    id: "category-transport-50",
    type: "category",
    title: "移動大師",
    description: "記錄 50 筆交通消費",
    icon: "✈️",
    requirement: 50,
    category: "transport",
  },

  // 分類專家成就 - 娛樂
  {
    id: "category-entertainment-10",
    type: "category",
    title: "娛樂愛好者",
    description: "記錄 10 筆娛樂消費",
    icon: "🎮",
    requirement: 10,
    category: "entertainment",
  },
  {
    id: "category-entertainment-30",
    type: "category",
    title: "快樂達人",
    description: "記錄 30 筆娛樂消費",
    icon: "🎬",
    requirement: 30,
    category: "entertainment",
  },
  {
    id: "category-entertainment-50",
    type: "category",
    title: "娛樂專家",
    description: "記錄 50 筆娛樂消費",
    icon: "🎪",
    requirement: 50,
    category: "entertainment",
  },

  // 分類專家成就 - 日用品
  {
    id: "category-daily-10",
    type: "category",
    title: "生活管理者",
    description: "記錄 10 筆日用品消費",
    icon: "🧺",
    requirement: 10,
    category: "daily",
  },
  {
    id: "category-daily-30",
    type: "category",
    title: "居家達人",
    description: "記錄 30 筆日用品消費",
    icon: "🏠",
    requirement: 30,
    category: "daily",
  },
  {
    id: "category-daily-50",
    type: "category",
    title: "生活專家",
    description: "記錄 50 筆日用品消費",
    icon: "✨",
    requirement: 50,
    category: "daily",
  },

  // 分類專家成就 - 醫療
  {
    id: "category-medical-10",
    type: "category",
    title: "健康意識者",
    description: "記錄 10 筆醫療消費",
    icon: "💊",
    requirement: 10,
    category: "medical",
  },
  {
    id: "category-medical-30",
    type: "category",
    title: "保健達人",
    description: "記錄 30 筆醫療消費",
    icon: "🏥",
    requirement: 30,
    category: "medical",
  },
  {
    id: "category-medical-50",
    type: "category",
    title: "健康專家",
    description: "記錄 50 筆醫療消費",
    icon: "⚕️",
    requirement: 50,
    category: "medical",
  },

  // 分類專家成就 - 其他
  {
    id: "category-other-10",
    type: "category",
    title: "多元記錄者",
    description: "記錄 10 筆其他消費",
    icon: "📦",
    requirement: 10,
    category: "other",
  },
  {
    id: "category-other-30",
    type: "category",
    title: "全方位達人",
    description: "記錄 30 筆其他消費",
    icon: "🎁",
    requirement: 30,
    category: "other",
  },
  {
    id: "category-other-50",
    type: "category",
    title: "記錄專家",
    description: "記錄 50 筆其他消費",
    icon: "🌟",
    requirement: 50,
    category: "other",
  },
];

// 根據類別獲取成就
export function getAchievementsByCategory(category: ReceiptCategory) {
  return ACHIEVEMENT_DEFINITIONS.filter(
    (achievement) => achievement.type === "category" && achievement.category === category
  );
}

// 根據類型獲取成就
export function getAchievementsByType(type: Achievement["type"]) {
  return ACHIEVEMENT_DEFINITIONS.filter((achievement) => achievement.type === type);
}
