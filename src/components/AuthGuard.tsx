"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoginScreen from "./LoginScreen";
import PrinterLoading from "./PrinterLoading";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

  // 載入中
  if (loading) {
    return <PrinterLoading />;
  }

  // 未登入
  if (!user) {
    return <LoginScreen />;
  }

  // 已登入
  return <>{children}</>;
}

