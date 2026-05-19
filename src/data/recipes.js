export const RECIPES = {
  v60: {
    id: 'v60',
    name: 'V60（James Hoffmann）',
    ratio: 16.7,
    steps: [
      {
        name: '悶蒸',
        desc: '注入粉重 2 倍的水，等 45 秒讓粉排氣',
        endTime: 45,
        waterMultiple: 2,
      },
      {
        name: '主注水',
        desc: '繞圈穩定注水，1:15 前注到總量 60%',
        endTime: 75,
        waterPct: 0.6,
      },
      {
        name: '補足水量',
        desc: '繼續注到 100%，約 1:45 前完成',
        endTime: 105,
        waterPct: 1.0,
      },
      {
        name: '等待濾乾',
        desc: '輕攪兩下整平，靜待濾乾，目標 3:00 完成',
        endTime: 180,
        waterPct: 1.0,
      },
    ],
  },
  fourSix: {
    id: 'fourSix',
    name: '4:6 法（Tetsu Kasuya）',
    ratio: 15,
    steps: [
      { name: '第 1 注', desc: '注到總量 20%，建立前段風味', endTime: 45, waterPct: 0.2 },
      { name: '第 2 注', desc: '補到總量 40%，平衡酸甜', endTime: 90, waterPct: 0.4 },
      { name: '第 3 注', desc: '補到總量 60%，建立醇厚', endTime: 135, waterPct: 0.6 },
      { name: '第 4 注', desc: '補到總量 80%，維持節奏', endTime: 180, waterPct: 0.8 },
      { name: '第 5 注', desc: '補到 100%，等候濾乾', endTime: 225, waterPct: 1.0 },
    ],
  },
}

export const getRecipeForRoast = (roastLevel) =>
  roastLevel === 'dark' ? RECIPES.fourSix : RECIPES.v60

export const getStepWater = (step, waterTotal, coffeeGrams) => {
  if (step.waterMultiple != null) return Math.round(step.waterMultiple * coffeeGrams)
  return Math.round((step.waterPct ?? 0) * waterTotal)
}

export const formatTime = (seconds) => {
  const s = Math.max(0, Math.floor(seconds || 0))
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
}
