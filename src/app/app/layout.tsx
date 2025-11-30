"use client";

import { ReactNode } from "react";
import AuthGuard from "@/components/AuthGuard";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return <AuthGuard>{children}</AuthGuard>;
}

