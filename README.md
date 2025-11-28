# Receipt Tracker - 收據記帳 APP

一個復古熱感應打字機風格的收據記帳應用程式。

## 功能特色

- 🖨️ **擬真打字機介面** - 復古的熱感應打字機設計
- 📝 **簡易記帳** - 輸入商店名稱和消費項目
- 🧾 **收據生成** - 自動生成收據並有列印動畫
- 📂 **存檔管理** - 查看和管理歷史收據
- 💾 **本地儲存** - 資料儲存在瀏覽器中

## 技術棧

- **Next.js 14** - React 框架
- **TypeScript** - 型別安全
- **Tailwind CSS** - 樣式框架
- **Framer Motion** - 動畫效果
- **LocalStorage** - 資料持久化

## 開始使用

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用。

### 建置專案

```bash
npm run build
```

### 啟動生產版本

```bash
npm start
```

## 專案結構

```
src/
├── app/
│   ├── globals.css      # 全域樣式
│   ├── layout.tsx       # 應用佈局
│   └── page.tsx         # 主頁面
├── components/
│   ├── Printer.tsx  # 打字機主元件
│   ├── InputScreen.tsx     # 輸入螢幕
│   ├── ReceiptPaper.tsx    # 收據元件
│   └── Archive.tsx         # 存檔列表
├── hooks/
│   └── useReceipts.ts   # 收據資料 Hook
└── types/
    └── index.ts         # TypeScript 型別定義
```

## 設計理念

本應用的設計靈感來自復古熱感應打字機，結合現代的 UI/UX 設計原則：

- 米色/奶油色的溫暖配色
- 打字機風格的等寬字體
- 擬真的收據紙張效果
- 流暢的列印和撕紙動畫

## 開發路線圖

### ✅ 已完成
- [x] 擬真打字機介面設計
- [x] 收據生成與列印動畫
- [x] 本地存檔管理
- [x] 圖表統計功能
- [x] 日期篩選 (年/月/日)
- [x] 相機掃描功能 (OCR 自動辨識)
- [x] 成就系統

### 🚧 開發中
- [ ] OCR 辨識結果自動填入打字機

### 📋 計劃中
- [ ] AI 數據洞察分析
- [ ] 雲端備份與同步
- [ ] 多主題切換
- [ ] 預算設定與追蹤
- [ ] 匯出報表 (PDF/CSV)

## 授權

MIT License

