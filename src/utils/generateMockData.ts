import { Receipt, ReceiptCategory } from "@/types";
import { v4 as uuidv4 } from "uuid";

const stores = {
  food: ["星巴克", "麥當勞", "全家便利商店", "7-11", "丹堤咖啡", "鼎泰豐", "海底撈"],
  shopping: ["誠品書店", "UNIQLO", "NET", "寶雅", "屈臣氏", "康是美"],
  transport: ["台北捷運", "Uber", "中油加油站", "台灣大車隊"],
  entertainment: ["威秀影城", "錢櫃KTV", "誠品書店", "Steam"],
  daily: ["全聯福利中心", "家樂福", "大潤發", "好市多"],
  medical: ["屈臣氏藥局", "康是美", "台大醫院", "診所"],
  other: ["郵局", "銀行", "其他"],
};

const items = {
  food: [
    { name: "拿鐵咖啡", price: [120, 150] },
    { name: "美式咖啡", price: [90, 120] },
    { name: "套餐", price: [150, 250] },
    { name: "麵包", price: [30, 80] },
    { name: "便當", price: [80, 150] },
    { name: "飲料", price: [25, 60] },
    { name: "小菜", price: [30, 80] },
  ],
  shopping: [
    { name: "T恤", price: [290, 590] },
    { name: "牛仔褲", price: [590, 1290] },
    { name: "書籍", price: [250, 450] },
    { name: "文具", price: [50, 200] },
    { name: "保養品", price: [199, 699] },
  ],
  transport: [
    { name: "捷運票", price: [20, 65] },
    { name: "計程車", price: [100, 350] },
    { name: "加油", price: [500, 1500] },
    { name: "停車費", price: [30, 100] },
  ],
  entertainment: [
    { name: "電影票", price: [280, 350] },
    { name: "包廂費", price: [500, 1200] },
    { name: "遊戲", price: [490, 1590] },
  ],
  daily: [
    { name: "衛生紙", price: [99, 199] },
    { name: "洗髮精", price: [129, 299] },
    { name: "牙膏", price: [59, 129] },
    { name: "清潔劑", price: [79, 159] },
    { name: "零食", price: [35, 99] },
  ],
  medical: [
    { name: "感冒藥", price: [150, 300] },
    { name: "OK繃", price: [50, 120] },
    { name: "維他命", price: [299, 599] },
    { name: "掛號費", price: [150, 300] },
  ],
  other: [
    { name: "郵資", price: [25, 100] },
    { name: "手續費", price: [10, 50] },
    { name: "雜費", price: [50, 200] },
  ],
};

const paymentMethods = ["現金", "信用卡", "行動支付", "悠遊卡"];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomPrice(range: number[]): number {
  return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
}

function generateDate(daysAgo: number): { date: string; time: string } {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);

  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);

  const hour = Math.floor(Math.random() * 14 + 8); // 8-21點
  const minute = Math.floor(Math.random() * 60);
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  return {
    date: `${day}/${month}/${year}`,
    time,
  };
}

export function generateMockReceipts(count: number = 30): Receipt[] {
  const receipts: Receipt[] = [];
  const categories: ReceiptCategory[] = ["food", "shopping", "transport", "entertainment", "daily", "medical", "other"];

  for (let i = 0; i < count; i++) {
    const category = randomItem(categories);
    const store = randomItem(stores[category]);
    const categoryItems = items[category];

    // 每張收據 1-4 個項目
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const receiptItems = [];
    let total = 0;

    for (let j = 0; j < itemCount; j++) {
      const itemTemplate = randomItem(categoryItems);
      const price = randomPrice(itemTemplate.price);
      const quantity = Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 2 : 1;

      receiptItems.push({
        id: uuidv4(),
        name: itemTemplate.name,
        price,
        quantity,
      });

      total += price * quantity;
    }

    const { date, time } = generateDate(Math.floor(Math.random() * 60)); // 過去60天內

    receipts.push({
      id: uuidv4(),
      receiptNo: (1000 + i).toString(),
      date,
      time,
      storeName: store,
      category,
      items: receiptItems,
      total,
      paymentMethod: randomItem(paymentMethods),
      createdAt: Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000),
    });
  }

  // 按日期排序（最新的在前）
  return receipts.sort((a, b) => b.createdAt - a.createdAt);
}
