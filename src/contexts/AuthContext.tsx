"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { trackEvent } from "@/utils/analytics";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 監聽認證狀態變化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google 登入
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // 追蹤登入事件
      trackEvent("login", {
        method: "google",
        user_id: result.user.uid,
      });
    } catch (error) {
      console.error("Google 登入失敗:", error);
      
      // 追蹤登入失敗
      trackEvent("login_failed", {
        method: "google",
        error: error instanceof Error ? error.message : "unknown_error",
      });
      
      throw error;
    }
  };

  // 登出
  const signOut = async () => {
    try {
      // 追蹤登出事件
      trackEvent("logout", {
        user_id: user?.uid,
      });
      
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("登出失敗:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 自定義 Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

