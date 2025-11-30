"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import DataMigrationModal from "./DataMigrationModal";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <DataMigrationModal />
    </AuthProvider>
  );
}

