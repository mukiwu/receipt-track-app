"use client";

import { motion } from "framer-motion";
import { Achievement } from "@/types";
import { CATEGORY_INFO } from "@/types";

interface AchievementsProps {
  achievements: Achievement[];
  unlockedCount: number;
}

export default function Achievements({ achievements, unlockedCount }: AchievementsProps) {
  const totalCount = achievements.length;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  // 按類型分組成就
  const groupedAchievements = {
    streak: achievements.filter((a) => a.type === "streak"),
    count: achievements.filter((a) => a.type === "count"),
    saving: achievements.filter((a) => a.type === "saving"),
    category: achievements.filter((a) => a.type === "category"),
  };

  return (
    <div className="w-[320px] mt-8">
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
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
        <span className="font-mono text-sm tracking-[0.3em] text-gray-500">
          ACHIEVEMENTS
        </span>
        <div className="flex-1 border-t border-gray-300" />
      </div>

      {/* 總進度卡片 */}
      <div className="receipt-paper rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-mono text-xl font-bold text-gray-800">
              {unlockedCount} / {totalCount}
            </h2>
            <p className="font-mono text-xs text-gray-500">成就已解鎖</p>
          </div>
          <div className="text-4xl">🏆</div>
        </div>

        {/* 進度條 */}
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
          />
        </div>
        <p className="font-mono text-xs text-gray-400 text-right mt-2">
          {progress.toFixed(1)}% 完成
        </p>
      </div>

      {/* 記帳天數成就 */}
      <AchievementSection
        title="📅 記帳天數"
        achievements={groupedAchievements.streak}
      />

      {/* 收據數量成就 */}
      <AchievementSection
        title="📝 收據數量"
        achievements={groupedAchievements.count}
      />

      {/* 省錢成就 */}
      <AchievementSection
        title="💰 省錢達人"
        achievements={groupedAchievements.saving}
      />

      {/* 分類專家成就 */}
      <AchievementSection
        title="⭐ 分類專家"
        achievements={groupedAchievements.category}
      />
    </div>
  );
}

interface AchievementSectionProps {
  title: string;
  achievements: Achievement[];
}

function AchievementSection({ title, achievements }: AchievementSectionProps) {
  if (achievements.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="font-mono text-sm text-gray-600 mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {achievements.map((achievement, index) => (
          <AchievementCard key={achievement.id} achievement={achievement} index={index} />
        ))}
      </div>
    </div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
}

function AchievementCard({ achievement, index }: AchievementCardProps) {
  const isUnlocked = achievement.unlocked;
  const progress = Math.min((achievement.current / achievement.requirement) * 100, 100);

  // 獲取類別顏色（用於分類專家成就）
  const getCategoryColor = () => {
    if (achievement.category) {
      return CATEGORY_INFO[achievement.category].color;
    }
    return "#D97706"; // 預設琥珀色
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`receipt-paper rounded-lg p-4 transition-all ${
        isUnlocked
          ? "shadow-md hover:shadow-lg"
          : "opacity-60 grayscale hover:grayscale-0"
      }`}
    >
      {/* 成就圖標 */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={`text-4xl ${isUnlocked ? "" : "opacity-40"}`}
        >
          {achievement.icon}
        </div>
        {isUnlocked && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl"
          >
            ✅
          </motion.div>
        )}
      </div>

      {/* 成就標題和描述 */}
      <h4 className="font-mono text-sm font-bold text-gray-800 mb-1">
        {achievement.title}
      </h4>
      <p className="font-mono text-xs text-gray-600 mb-3">
        {achievement.description}
      </p>

      {/* 進度 */}
      {!isUnlocked && (
        <>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
              className="h-full rounded-full"
              style={{ backgroundColor: getCategoryColor() }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-500">
              {achievement.current} / {achievement.requirement}
            </span>
            <span className="font-mono text-xs text-gray-400">
              {progress.toFixed(0)}%
            </span>
          </div>
        </>
      )}

      {/* 解鎖時間 */}
      {isUnlocked && achievement.unlockedAt && (
        <p className="font-mono text-xs text-amber-600 mt-2">
          🎉 {new Date(achievement.unlockedAt).toLocaleDateString("zh-TW")} 解鎖
        </p>
      )}
    </motion.div>
  );
}
