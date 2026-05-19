# Barista Flow v2 — 產品規格

## 一、產品背景

### 目標受眾

自己在家手沖的咖啡愛好者。不是專業咖啡師，但認真想沖好。

### 三個核心痛點

| # | 痛點 | 根本原因 |
|---|------|---------|
| 1 | 風味不穩定 | 每次都有很多變數在變，但不知道是哪個 |
| 2 | 水流失控 | 計時器只給目標值，沒有告訴你「現在應該多快」 |
| 3 | 酸苦分不清 | 初學者沒有感官詞彙，不知道怎麼描述、怎麼調 |

### 定位轉移

| 舊思維 | 新思維 |
|--------|--------|
| 沖煮計時器＋日誌 | 每杯咖啡的診斷工具 |
| 使用者管理所有變數 | App 引導、使用者只說感受 |
| 沖煮者語言（食譜、比例） | 感受語言（酸、甜、苦、淡） |

---

## 二、使用者流程

```
選豆  →  設定粉量  →  計時沖煮  →  酸甜苦淡回饋  →  回首頁
```

**設計原則：三個畫面，一條線，沖完一個動作完成。**

---

## 三、畫面規格

### Screen 1：選豆（BeanScreen）

**功能**
- 列出歷史豆子（從 localStorage `bf_beans` 讀取）
- 點選任一豆 → 直接進入沖煮
- 「+ 新增豆子」展開表單：豆名 + 烘焙程度

**烘焙程度選項**

| ID | 顯示 | 說明 |
|----|------|------|
| `light` | 淺焙 | 果酸清爽 |
| `medium` | 中焙 | 圓潤平衡 |
| `dark` | 深焙 | 醇厚甘苦 |

**食譜自動對應邏輯**
- `light` / `medium` → V60（James Hoffmann）
- `dark` → 4:6 法（Tetsu Kasuya）

---

### Screen 2：計時沖煮（BrewScreen）

**功能**
- 頂部：豆名、食譜名、粉量調整（±1g，預設 20g）
- 計時器大字顯示（MM:SS）
- 當前步驟卡：名稱、說明、目標水量
- 步驟進度條（當前步驟內的進度）
- idle 狀態時顯示全部步驟清單
- 開始 / 暫停 按鈕
- 「完成，來品嘗」手動結束

**計時行為**
- 每 100ms 累加 0.1 秒
- 步驟切換時：音效（880Hz sine）+ 震動 40ms
- 計時結束時：雙音效（440Hz + 660Hz）+ 自動進入回饋畫面

**粉水比**
- V60：1:16.7
- 4:6 法：1:15
- 水量 = `Math.round(coffeeGrams × ratio)`

---

### Screen 3：味道回饋（FeedbackScreen）

三層 Progressive Disclosure，越往下越細，每層獨立完成。

**Layer 1｜風味強度（畫面主體）**

四個維度，每個可選「低 / 中 / 高」，點一下選，再點取消。未選 = 沒有感受到。

| 維度 | 說明 | 診斷意義 |
|------|------|---------|
| 酸感 | 果酸、刺激感 | 萃取不足 |
| 甜感 | 圓潤、尾韻甘 | 接近理想 |
| 苦味 | 焦感、口腔澀 | 萃取過度 |
| 醇厚 | 飽滿、重量感 | 濃度指標 |

**Layer 2｜整體評分**
- 1–5 顆星，點選，可反選歸零

**Layer 3｜沖煮參數（預設收合，展開才顯示）**
- 研磨刻度（文字，e.g. 24、C40-26）
- 水溫（數字，°C）
- 水流速度（太快 / 剛好 / 堵塞）
- 備註（多行文字）

**儲存行為**
- 「儲存這杯紀錄」→ 寫 log → 回 Screen 1
- 「不記了」→ 不儲存，回 Screen 1

---

## 四、資料結構

### 豆子（localStorage `bf_beans`）

```js
[{
  id: string,          // Date.now().toString()
  name: string,        // 使用者輸入
  roastLevel: string,  // 'light' | 'medium' | 'dark'
}]
```

### 沖煮日誌（localStorage `bf_logs`）

```js
[{
  id: string,
  beanId: string,
  beanName: string,
  roastLevel: string,
  coffeeGrams: number,
  waterTotal: number,
  ratio: number,
  recipeName: string,
  time: number,              // 實際沖煮秒數
  taste: {
    acidity:    0|1|2|3,    // 0=未選, 1=低, 2=中, 3=高
    sweetness:  0|1|2|3,
    bitterness: 0|1|2|3,
    body:       0|1|2|3,
  },
  rating: number,            // 0–5 顆星（0 = 未評）
  grindSetting: string|null, // e.g. '24', 'C40-26'
  waterTemp: number|null,    // °C
  flowRate: 'fast'|'good'|'clog'|null,
  notes: string|null,
  stepTimes: [{
    name: string,
    planned: number,         // 秒
    actual: number,          // 秒
  }],
  createdAt: number,         // timestamp
}]
```

---

## 五、食譜

### V60（James Hoffmann）

| 步驟 | 結束時間 | 目標水量 |
|------|---------|---------|
| 悶蒸 | 0:45 | 粉重 × 2 |
| 主注水 | 1:15 | 總量 60% |
| 補足水量 | 1:45 | 總量 100% |
| 等待濾乾 | 3:00 | 維持 100% |

### 4:6 法（Tetsu Kasuya）

| 步驟 | 結束時間 | 目標水量 |
|------|---------|---------|
| 第 1 注 | 0:45 | 總量 20% |
| 第 2 注 | 1:30 | 總量 40% |
| 第 3 注 | 2:15 | 總量 60% |
| 第 4 注 | 3:00 | 總量 80% |
| 第 5 注 | 3:45 | 總量 100% |

---

## 六、設計系統

### 色彩

| 用途 | Hex |
|------|-----|
| Primary（文字、主按鈕） | `#171717` |
| Accent（品牌、強調） | `#A16207` |
| Background | `#FFFFFF` |
| Surface（卡片底色） | `#FAFAF9` |
| Muted（次要文字） | `#78716C` |
| Border | `#E8ECF0` |

### 字型

- 標題：Calistoga（Google Fonts）
- 內文：Inter（Google Fonts）

### 風格

- Flat Design，無陰影
- 圓角統一 `rounded-2xl`（16px）
- 過渡動畫 150–200ms ease
- 手機優先，375px 基準

---

## 七、MVP 不包含

以下功能刻意不做，留待驗證後再加：

- 系統學習與調整建議（根據 taste 回饋自動推薦下次參數）
- 注水節奏視覺條（即時倒水速度引導）
- 多食譜支援（目前只有 V60 + 4:6）
- 日誌列表與歷史比對
- 深色模式

---

## 八、檔案結構

```
src/
├── App.jsx                  # 畫面路由（screen state）
├── index.css                # Tailwind v4 @theme tokens
├── data/
│   └── recipes.js           # 食譜資料 + 工具函數
├── utils/
│   ├── audio.js             # Web Audio API 音效引擎
│   └── storage.js           # localStorage read/write
└── screens/
    ├── BeanScreen.jsx        # Screen 1
    ├── BrewScreen.jsx        # Screen 2
    └── FeedbackScreen.jsx    # Screen 3
```
