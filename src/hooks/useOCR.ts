"use client";

import { useState, useCallback, useRef } from "react";
import Tesseract from "tesseract.js";

export interface OCRResult {
  text: string;
  confidence: number;
}

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Tesseract.Worker | null>(null);

  // 初始化 Worker
  const initWorker = useCallback(async () => {
    if (workerRef.current) return workerRef.current;

    try {
      const worker = await Tesseract.createWorker("chi_tra+eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      workerRef.current = worker;
      return worker;
    } catch (err) {
      console.error("Failed to initialize OCR worker:", err);
      throw err;
    }
  }, []);

  // 處理圖片
  const processImage = useCallback(
    async (imageFile: File): Promise<OCRResult> => {
      setIsProcessing(true);
      setProgress(0);
      setError(null);

      try {
        const worker = await initWorker();
        const { data } = await worker.recognize(imageFile);

        return {
          text: data.text,
          confidence: data.confidence,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "OCR 處理失敗";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsProcessing(false);
        setProgress(0);
      }
    },
    [initWorker]
  );

  // 清理 Worker
  const cleanup = useCallback(async () => {
    if (workerRef.current) {
      await workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    processImage,
    isProcessing,
    progress,
    error,
    cleanup,
  };
}
