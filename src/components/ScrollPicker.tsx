"use client";

import { useRef, useEffect, useState } from "react";

interface ScrollPickerProps {
  items: string[];
  selectedValue: string;
  onChange: (value: string) => void;
  unit?: string;
}

export default function ScrollPicker({
  items,
  selectedValue,
  onChange,
  unit = "",
}: ScrollPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const itemHeight = 40; // 每個項目的高度

  // 滾動到選中的項目
  const scrollToValue = (value: string, smooth = true) => {
    if (!scrollRef.current) return;

    const index = items.indexOf(value);
    if (index === -1) return;

    const scrollPosition = index * itemHeight;
    scrollRef.current.scrollTo({
      top: scrollPosition,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // 初始化滾動位置
  useEffect(() => {
    scrollToValue(selectedValue, false);
  }, []);

  // 監聽滾動事件，自動對齊到最近的項目
  const handleScroll = () => {
    if (!scrollRef.current || isDragging) return;

    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

    if (items[clampedIndex] !== selectedValue) {
      onChange(items[clampedIndex]);
      scrollToValue(items[clampedIndex]);
    }
  };

  // 處理滾動結束
  const handleScrollEnd = () => {
    setIsDragging(false);
    handleScroll();
  };

  return (
    <div className="relative w-full h-[160px]">
      {/* 中心指示器 */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[40px] pointer-events-none z-10">
        <div className="absolute inset-0 border-y-2 border-thermal-dark/20 bg-thermal-dark/5" />
        {/* 左側三角形指針 */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-thermal-dark" />
        {/* 右側三角形指針 */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-thermal-dark" />
      </div>

      {/* 滾動容器 */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-scroll scrollbar-hide"
        onScroll={handleScroll}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={handleScrollEnd}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={handleScrollEnd}
        style={{
          scrollSnapType: "y mandatory",
          paddingTop: "60px",
          paddingBottom: "60px",
        }}
      >
        {items.map((item, index) => {
          const isSelected = item === selectedValue;
          return (
            <div
              key={item}
              className={`h-[40px] flex items-center justify-center font-mono text-lg transition-all cursor-pointer ${
                isSelected
                  ? "text-thermal-dark font-bold scale-110"
                  : "text-gray-400"
              }`}
              style={{ scrollSnapAlign: "center" }}
              onClick={() => {
                onChange(item);
                scrollToValue(item);
              }}
            >
              {item}
              {unit && <span className="ml-1 text-sm">{unit}</span>}
            </div>
          );
        })}
      </div>

      {/* 上下漸變遮罩 */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#F0EDE7] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F0EDE7] to-transparent pointer-events-none" />
    </div>
  );
}
