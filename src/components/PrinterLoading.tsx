"use client";

import { motion } from "framer-motion";

export default function PrinterLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        {/* 縮小版打字機 */}
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* 打字機主體 */}
          <div className="relative bg-gradient-to-br from-[#D42040] via-[#C01838] to-[#A01830] rounded-lg shadow-xl w-[120px] h-[140px] p-3">
            {/* 頂部出紙口 */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-md shadow-inner" />

            {/* 紙張動畫 */}
            <motion.div
              animate={{
                height: ["0px", "30px", "0px"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 bg-white rounded-t-sm shadow-md overflow-hidden"
              style={{ transformOrigin: "bottom" }}
            >
              {/* 紙張上的線條 */}
              <div className="w-full h-full flex flex-col gap-1 p-1">
                <div className="h-0.5 bg-gray-300 rounded w-full" />
                <div className="h-0.5 bg-gray-300 rounded w-4/5" />
                <div className="h-0.5 bg-gray-300 rounded w-full" />
              </div>
            </motion.div>

            {/* 螢幕 */}
            <div className="bg-gradient-to-br from-[#1a4d2e] to-[#0d2818] rounded border-2 border-gray-800 h-8 flex items-center justify-center mb-2 shadow-inner">
              <motion.span
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="font-mono text-[#7CFC00] text-[8px] tracking-wider font-bold"
              >
                LOADING...
              </motion.span>
            </div>

            {/* 按鈕網格 */}
            <div className="grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    backgroundColor: i === 4 ? ["#FFD700", "#FFA500", "#FFD700"] : "#2a2a2a",
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="h-4 rounded-sm shadow-md"
                  style={{
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
                  }}
                />
              ))}
            </div>

            {/* 側邊裝飾條 */}
            <div className="absolute left-0 top-4 bottom-2 w-1 bg-gradient-to-b from-[#D42040] via-[#A01830] to-[#D42040] rounded-r-sm" />
            <div className="absolute right-0 top-4 bottom-2 w-1 bg-gradient-to-b from-[#D42040] via-[#A01830] to-[#D42040] rounded-l-sm" />
          </div>

          {/* 底座 */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-2 bg-gradient-to-b from-gray-700 to-gray-900 rounded-b-md shadow-lg" />
        </motion.div>

        {/* Loading 文字 */}
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-sm text-gray-600 tracking-wider">
            RECEIPT TRACKER
          </span>
          <div className="flex gap-1">
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-1.5 h-1.5 rounded-full bg-thermal-amber"
            />
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              className="w-1.5 h-1.5 rounded-full bg-thermal-amber"
            />
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
              className="w-1.5 h-1.5 rounded-full bg-thermal-amber"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
