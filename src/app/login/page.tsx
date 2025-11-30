"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { trackLogin } from "@/utils/analytics";

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  // 已登入則跳轉到儀表板
  useEffect(() => {
    if (user && !loading) {
      router.push("/app");
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      trackLogin("google");
      router.push("/app");
    } catch (error) {
      console.error("登入失敗:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C41E3A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center px-4">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* 登入卡片 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* 頂部裝飾 - 打字機風格 */}
          <div className="bg-gradient-to-r from-[#C41E3A] to-[#9A1428] p-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
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
              <div>
                <h1 className="font-mono font-bold text-xl text-white">
                  RECEIPT TRACKER
                </h1>
                <p className="font-mono text-xs text-white/70">
                  收據記帳 APP
                </p>
              </div>
            </div>
          </div>

          {/* 登入內容 */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                歡迎回來
              </h2>
              <p className="text-gray-500 text-sm">
                登入以同步你的記帳資料
              </p>
            </div>

            {/* Google 登入按鈕 */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group"
            >
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
              <span className="font-medium text-gray-700 group-hover:text-gray-900">
                使用 Google 帳號登入
              </span>
            </button>

            {/* 說明文字 */}
            <p className="text-center text-xs text-gray-400 mt-6">
              登入即表示你同意我們的服務條款與隱私政策
            </p>
          </div>
        </div>

        {/* 返回首頁連結 */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="font-mono text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← 返回首頁
          </a>
        </div>
      </motion.div>
    </div>
  );
}

