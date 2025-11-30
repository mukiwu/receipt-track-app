"use client";

import { useState, useCallback } from "react";
import { AISettings, AIReceiptResult, ReceiptCategory } from "@/types";

const RECEIPT_PROMPT = `分析這張收據圖片，提取收據資訊並以 JSON 格式回傳。

請嚴格按照以下格式回傳，不要包含任何其他文字或 markdown 標記：
{
  "storeName": "商店名稱",
  "category": "類別代碼",
  "items": [
    { "name": "品項名稱", "quantity": 數量, "price": 單價 }
  ],
  "paymentMethod": "付款方式",
  "total": 總金額
}

類別代碼必須是以下其中之一：
- food (餐飲)
- shopping (購物)
- transport (交通)
- entertainment (娛樂)
- daily (日用品)
- medical (醫療)
- other (其他)

付款方式通常是「現金」或「信用卡」。
如果無法辨識某些欄位，請合理推測或使用預設值。
金額請使用數字格式，不要包含貨幣符號。`;

interface UseAIReceiptResult {
  analyzeReceipt: (imageFile: File, settings: AISettings) => Promise<AIReceiptResult>;
  isProcessing: boolean;
  error: string | null;
}

export function useAIReceipt(): UseAIReceiptResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 將圖片轉換為 base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 移除 data URL 前綴，只保留 base64 部分
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 取得圖片的 MIME 類型
  const getMimeType = (file: File): string => {
    return file.type || "image/jpeg";
  };

  // 呼叫 OpenAI API
  const callOpenAI = async (
    base64Image: string,
    mimeType: string,
    settings: AISettings
  ): Promise<string> => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: RECEIPT_PROMPT },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "OpenAI API 呼叫失敗");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  // 呼叫 Anthropic API
  const callAnthropic = async (
    base64Image: string,
    mimeType: string,
    settings: AISettings
  ): Promise<string> => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": settings.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: settings.model,
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: RECEIPT_PROMPT,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Anthropic API 呼叫失敗");
    }

    const data = await response.json();
    return data.content[0].text;
  };

  // 呼叫 Google Gemini API
  const callGoogle = async (
    base64Image: string,
    mimeType: string,
    settings: AISettings
  ): Promise<string> => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: RECEIPT_PROMPT },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Google API 呼叫失敗");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  // 解析 AI 回傳的 JSON
  const parseAIResponse = (response: string): AIReceiptResult => {
    // 嘗試從回應中提取 JSON
    let jsonStr = response;
    
    // 移除 markdown code block 標記
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // 嘗試找到 JSON 物件
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }

    try {
      const parsed = JSON.parse(jsonStr);
      
      // 驗證並轉換資料
      const validCategories: ReceiptCategory[] = [
        "food", "shopping", "transport", "entertainment", "daily", "medical", "other"
      ];
      
      const category = validCategories.includes(parsed.category) 
        ? parsed.category 
        : "other";

      const items = Array.isArray(parsed.items) 
        ? parsed.items.map((item: { name?: string; quantity?: number; price?: number }) => ({
            name: String(item.name || "未知品項"),
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
          }))
        : [];

      return {
        storeName: String(parsed.storeName || "未知商店"),
        category,
        items,
        paymentMethod: String(parsed.paymentMethod || "現金"),
        total: Number(parsed.total) || items.reduce(
          (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 
          0
        ),
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("無法解析 AI 回傳的收據資料");
    }
  };

  // 主要的分析函數
  const analyzeReceipt = useCallback(
    async (imageFile: File, settings: AISettings): Promise<AIReceiptResult> => {
      if (!settings.apiKey) {
        throw new Error("請先設定 API Key");
      }

      setIsProcessing(true);
      setError(null);

      try {
        const base64Image = await fileToBase64(imageFile);
        const mimeType = getMimeType(imageFile);

        let response: string;

        switch (settings.provider) {
          case "openai":
            response = await callOpenAI(base64Image, mimeType, settings);
            break;
          case "anthropic":
            response = await callAnthropic(base64Image, mimeType, settings);
            break;
          case "google":
            response = await callGoogle(base64Image, mimeType, settings);
            break;
          default:
            throw new Error("不支援的 AI 提供商");
        }

        return parseAIResponse(response);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "AI 辨識失敗";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    analyzeReceipt,
    isProcessing,
    error,
  };
}

