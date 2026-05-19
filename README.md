# Barista Flow v2

手機版咖啡沖煮教練。三個畫面，解決三個痛點。

---

## 產品定位

目標受眾的三個核心痛點：

1. **風味不穩定** — 同一包豆、同一支壺，每次味道都不一樣
2. **水流失控** — 手抖、節奏亂，不知道影響了什麼
3. **酸苦分不清** — 喝到不對勁，但不知道怎麼描述、怎麼調整

定位：不是「計時器＋日誌」，而是每杯咖啡的**診斷工具**。

---

## 使用流程

```
選豆  →  計時沖煮  →  酸甜苦淡回饋
```

三個畫面，一條線，沖完只需一個動作。

---

## Tech Stack

| 層 | 技術 |
|---|---|
| UI | React 18 |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| 資料 | LocalStorage（無後端） |
| 部署 | Vercel（push to main 自動部署） |

---

## 本地開發

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 產生 dist/
```

---

## 設計規範

詳見 [`SPEC.md`](./SPEC.md)
