"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // 確保只在客戶端執行
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    
    // 設定初始值
    setMatches(mediaQuery.matches);

    // 監聽變化
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);

    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}

// 預設的斷點
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 768px)");
}

export function useIsMobile(): boolean {
  return !useMediaQuery("(min-width: 768px)");
}

