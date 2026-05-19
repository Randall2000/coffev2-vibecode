import { useState } from 'react'
import { saveLog } from '../utils/storage'
import { formatTime } from '../data/recipes'

const TASTE_OPTIONS = [
  { id: '酸', emoji: '🍋', desc: '刺激感、像咬青蘋果' },
  { id: '甜', emoji: '🍯', desc: '圓潤、尾韻甘甜' },
  { id: '苦', emoji: '🫖', desc: '喝完嘴有點澀' },
  { id: '淡', emoji: '💧', desc: '味道偏薄、無存在感' },
]

export default function FeedbackScreen({ brewData, onDone }) {
  const [selected, setSelected] = useState([])

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const handleSave = () => {
    const log = {
      id: Date.now().toString(),
      beanId: brewData.bean.id,
      beanName: brewData.bean.name,
      roastLevel: brewData.bean.roastLevel,
      coffeeGrams: brewData.coffeeGrams,
      waterTotal: brewData.waterTotal,
      ratio: brewData.recipe.ratio,
      recipeName: brewData.recipe.name,
      time: brewData.time,
      taste: selected,
      stepTimes: brewData.stepTimes,
      createdAt: Date.now(),
    }
    saveLog(log)
    onDone()
  }

  return (
    <div className="flex flex-col h-full min-h-[100dvh] bg-white">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-[#A16207]">{brewData.bean.name}</span>
          <span className="text-sm text-[#78716C]">· {formatTime(brewData.time)}</span>
        </div>
        <h1 className="text-3xl text-[#171717]" style={{ fontFamily: 'Calistoga, serif' }}>
          這杯喝起來？
        </h1>
        <p className="text-sm text-[#78716C] mt-2">可以複選，也可以跳過</p>
      </div>

      {/* Taste buttons */}
      <div className="flex-1 px-6 grid grid-cols-2 gap-3 content-start">
        {TASTE_OPTIONS.map(opt => {
          const active = selected.includes(opt.id)
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`rounded-2xl p-5 text-left transition-all active:scale-95 ${
                active
                  ? 'bg-[#171717] text-white border-2 border-[#171717]'
                  : 'bg-[#FAFAF9] border-2 border-[#E8ECF0] text-[#171717]'
              }`}
            >
              <div className="text-3xl mb-2">{opt.emoji}</div>
              <div className="text-xl font-semibold mb-1">{opt.id}</div>
              <div className={`text-xs leading-relaxed ${active ? 'text-white/70' : 'text-[#78716C]'}`}>
                {opt.desc}
              </div>
            </button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="px-6 pb-10 pt-6 space-y-3">
        <button
          onClick={handleSave}
          className="w-full py-5 rounded-2xl bg-[#A16207] text-white text-lg font-semibold active:bg-[#92400E] transition-colors"
        >
          {selected.length > 0 ? `記住這杯（${selected.join('、')}）` : '儲存紀錄'}
        </button>
        <button
          onClick={onDone}
          className="w-full py-3 text-[#78716C] text-sm"
        >
          不記了
        </button>
      </div>
    </div>
  )
}
