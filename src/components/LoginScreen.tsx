"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError("登入失敗，請稍後再試");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* 復古打字機風格的登入卡片 */}
        <div className="relative">
          {/* 打字機頂部裝飾 */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-6 bg-gradient-to-b from-[#C41E3A] to-[#9A1428] rounded-t-xl" />
          
          {/* 主卡片 */}
          <div className="receipt-paper rounded-2xl p-8 shadow-2xl">
            {/* Logo 區域 */}
            <div className="flex flex-col items-center mb-8">
              {/* 打字機圖標 */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C41E3A] to-[#9A1428] flex items-center justify-center mb-4 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4v16l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V4l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
                  <line x1="8" y1="9" x2="16" y2="9" />
                  <line x1="8" y1="13" x2="14" y2="13" />
                </svg>
              </div>
              
              <h1 className="font-mono text-xl font-bold text-gray-800 tracking-wider">
                RECEIPT TRACKER
              </h1>
              <p className="font-mono text-xs text-gray-500 mt-1">
                復古打字機風格的收據記帳
              </p>
            </div>

            {/* 分隔線 - 模擬收據虛線 */}
            <div className="border-t-2 border-dashed border-gray-300 my-6" />

            {/* 登入按鈕區域 */}
            <div className="space-y-4">
              <p className="font-mono text-xs text-center text-gray-500 mb-4">
                登入以同步您的收據資料
              </p>

              {/* Google 登入按鈕 */}
              <motion.button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-mono text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full"
                  />
                ) : (
                  <>
                    {/* Google Icon */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>使用 Google 帳號登入</span>
                  </>
                )}
              </motion.button>

              {/* 錯誤訊息 */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-mono text-xs text-red-500 text-center"
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* 分隔線 */}
            <div className="border-t-2 border-dashed border-gray-300 my-6" />

            {/* 底部說明 */}
            <div className="text-center space-y-2">
              <p className="font-mono text-[10px] text-gray-400">
                您的資料將安全儲存於雲端
              </p>
              <p className="font-mono text-[10px] text-gray-400">
                可在多裝置間同步
              </p>
            </div>
          </div>

          {/* 底部陰影裝飾 */}
          <div className="absolute -bottom-2 left-4 right-4 h-4 bg-gradient-to-b from-gray-200/50 to-transparent rounded-b-2xl -z-10" />
        </div>

        {/* 底部版權 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-mono text-[10px] text-gray-400 text-center mt-8"
        >
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
        </motion.p>
      </motion.div>
    </div>
  );
}

