"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AchievementNotification } from "@/types";

interface AchievementToastProps {
  notifications: AchievementNotification[];
  onDismiss: (timestamp: number) => void;
}

export default function AchievementToast({ notifications, onDismiss }: AchievementToastProps) {
  // 只顯示未讀的最新 3 個通知
  const unreadNotifications = notifications
    .filter((notif) => !notif.isRead)
    .slice(-3);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {unreadNotifications.map((notification, index) => (
          <motion.div
            key={notification.timestamp}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
            }}
            className="pointer-events-auto"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 4px 6px rgba(0,0,0,0.1)",
                  "0 8px 16px rgba(217, 119, 6, 0.3)",
                  "0 4px 6px rgba(0,0,0,0.1)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-80 bg-gradient-to-br from-white to-amber-50 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => onDismiss(notification.timestamp)}
            >
              {/* 金色光暈效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent animate-pulse" />

              <div className="relative p-4 flex items-center gap-4">
                {/* 成就圖標 */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-5xl flex-shrink-0"
                >
                  {notification.achievement.icon}
                </motion.div>

                {/* 成就內容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-amber-600 font-bold tracking-wider">
                      🎉 成就解鎖
                    </span>
                  </div>
                  <h3 className="font-mono text-sm font-bold text-gray-800 truncate">
                    {notification.achievement.title}
                  </h3>
                  <p className="font-mono text-xs text-gray-600 truncate">
                    {notification.achievement.description}
                  </p>
                </div>

                {/* 關閉按鈕 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(notification.timestamp);
                  }}
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-3 h-3 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* 底部金色邊框 */}
              <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
