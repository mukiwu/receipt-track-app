"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

// 功能特色資料
const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "AI 智慧掃描",
    description: "拍照即可自動辨識收據內容，支援多家 AI 服務商",
    pro: false,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "視覺化統計",
    description: "直覺圖表分析消費類別與趨勢，掌握支出狀況",
    pro: false,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: "成就系統",
    description: "記帳也能有成就感！解鎖各種有趣的里程碑",
    pro: false,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "電子發票同步",
    description: "串接財政部載具，發票自動匯入不漏記",
    pro: true,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    title: "雲端同步",
    description: "跨裝置同步資料，手機電腦都能用",
    pro: false,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    title: "資料匯出",
    description: "支援 Excel/PDF 格式匯出，報帳超方便",
    pro: true,
  },
];

// 訂閱方案資料
const plans = [
  {
    name: "Free",
    price: "0",
    period: "永久免費",
    description: "適合輕度使用者",
    features: [
      "每月 30 筆收據",
      "基本圖表統計",
      "AI 掃描（每月 10 次）",
      "成就系統",
      "雲端同步",
    ],
    cta: "免費開始",
    popular: false,
  },
  {
    name: "Pro 早鳥版",
    price: "99",
    period: "每月",
    description: "適合認真記帳的你",
    features: [
      "無限收據記錄",
      "進階圖表分析",
      "AI 掃描無限次",
      "電子發票自動同步",
      "資料匯出 (Excel/PDF)",
      "優先客服支援",
    ],
    cta: "升級 Pro",
    popular: true,
  },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* 標籤 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-xs text-gray-600">
              支援電子發票同步
            </span>
          </motion.div>

          {/* 主標題 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            復古打字機風格的
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C41E3A] to-[#9A1428]">
              收據記帳 APP
            </span>
          </motion.h1>

          {/* 副標題 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
          >
            AI 智慧掃描、電子發票同步、視覺化統計
            <br className="hidden sm:block" />
            讓記帳變成一件有趣的事
          </motion.p>

          {/* CTA 按鈕 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={user ? "/app" : "/login"}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C41E3A] to-[#9A1428] text-white font-mono font-medium text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              {user ? "進入儀表板" : "免費開始使用"}
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-gray-700 font-mono font-medium text-lg shadow-lg hover:shadow-xl transition-all border border-gray-200"
            >
              了解更多
            </a>
          </motion.div>

          {/* 打字機預覽圖 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16 relative"
          >
            <div className="relative mx-auto max-w-md">
              {/* 打字機示意圖 */}
              <div className="bg-gradient-to-b from-[#C41E3A] to-[#9A1428] rounded-3xl p-6 shadow-2xl">
                {/* 螢幕區域 */}
                <div className="bg-[#1a2e1a] rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                    <span className="font-mono text-xs text-green-400/70 tracking-widest">
                      RECEIPT TRACKER
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-green-500/20 rounded w-3/4 mx-auto" />
                    <div className="h-3 bg-green-500/20 rounded w-1/2 mx-auto" />
                  </div>
                </div>
                {/* 按鍵區域 */}
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-[#E8E4DC] shadow-lg flex items-center justify-center"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>
              {/* 裝飾光暈 */}
              <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-amber-500/20 rounded-3xl blur-2xl -z-10" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              功能特色
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              結合復古美學與現代科技，打造最有溫度的記帳體驗
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 rounded-2xl bg-[#FDFBF7] border border-gray-100 hover:shadow-lg transition-shadow group"
              >
                {feature.pro && (
                  <span className="absolute top-4 right-4 px-2 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-mono font-bold">
                    PRO
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C41E3A]/10 to-[#9A1428]/10 flex items-center justify-center text-[#C41E3A] mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-[#F5F1EB]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              訂閱方案
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              選擇適合你的方案，開始聰明記帳
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-8 rounded-3xl ${
                  plan.popular
                    ? "bg-gradient-to-br from-[#C41E3A] to-[#9A1428] text-white shadow-2xl scale-105"
                    : "bg-white text-gray-900 shadow-lg"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-gray-900 text-xs font-mono font-bold">
                    最受歡迎
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
                  <p
                    className={`text-sm ${
                      plan.popular ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">NT${plan.price}</span>
                  <span
                    className={`text-sm ${
                      plan.popular ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    /{plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${
                          plan.popular ? "text-white" : "text-green-500"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span
                        className={`text-sm ${
                          plan.popular ? "text-white/90" : "text-gray-600"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={user ? "/app" : "/login"}
                  className={`block w-full py-3 rounded-xl font-mono font-medium text-center transition-all ${
                    plan.popular
                      ? "bg-white text-[#C41E3A] hover:bg-gray-100"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              準備好開始記帳了嗎？
            </h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              免費版功能就很強大，現在就開始體驗吧
            </p>
            <Link
              href={user ? "/app" : "/login"}
              className="inline-block px-10 py-4 rounded-2xl bg-gradient-to-r from-[#C41E3A] to-[#9A1428] text-white font-mono font-medium text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              {user ? "進入儀表板" : "立即免費註冊"}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

