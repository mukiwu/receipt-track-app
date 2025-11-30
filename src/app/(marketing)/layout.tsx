"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F1EB]">
      {/* 導航列 */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#F5F1EB]/80 backdrop-blur-md border-b border-gray-200/50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C41E3A] to-[#9A1428] flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
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
              <span className="font-mono font-bold text-lg text-gray-800 tracking-tight">
                RECEIPT TRACKER
              </span>
            </Link>

            {/* 導航連結 */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="font-mono text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                功能特色
              </a>
              <a
                href="#pricing"
                className="font-mono text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                訂閱方案
              </a>
            </div>

            {/* CTA 按鈕 */}
            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  href="/app"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C41E3A] to-[#9A1428] text-white font-mono text-sm font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  進入儀表板
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 font-mono text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    登入
                  </Link>
                  <Link
                    href="/login"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C41E3A] to-[#9A1428] text-white font-mono text-sm font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    免費開始
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* 主內容 */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C41E3A] to-[#9A1428] flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 4v16l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V4l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
                </svg>
              </div>
              <span className="font-mono text-sm text-gray-300">
                RECEIPT TRACKER
              </span>
            </div>
            <p className="font-mono text-xs">
              © 2025 · Made with ♥{" "}
              <a
                href="https://muki.tw"
                target="_blank"
                rel="noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                MUKI WU
              </a>{" "}
              & AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

