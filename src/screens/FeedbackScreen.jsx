import { useState } from 'react'
import { saveLog } from '../utils/storage'
import { formatTime } from '../data/recipes'

const FLAVORS = [
  { key: 'acidity',   label: '酸感', desc: '果酸、刺激感' },
  { key: 'sweetness', label: '甜感', desc: '圓潤、尾韻甘' },
  { key: 'bitterness',label: '苦味', desc: '焦感、口腔澀' },
  { key: 'body',      label: '醇厚', desc: '飽滿、重量感' },
]

const LEVELS = [
  { value: 1, label: '低' },
  { value: 2, label: '中' },
  { value: 3, label: '高' },
]

const FLOW_OPTS = [
  { id: 'fast', label: '太快' },
  { id: 'good', label: '剛好' },
  { id: 'clog', label: '堵塞' },
]

function FlavorRow({ flavor, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 flex-shrink-0">
        <p className="text-sm font-semibold text-[#171717]">{flavor.label}</p>
        <p className="text-xs text-[#78716C]">{flavor.desc}</p>
      </div>
      <div className="flex-1 grid grid-cols-3 gap-1.5">
        {LEVELS.map(lv => (
          <button
            key={lv.value}
            onClick={() => onChange(value === lv.value ? 0 : lv.value)}
            className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
              value === lv.value
                ? 'bg-[#171717] text-white'
                : 'bg-[#F5F5F4] text-[#78716C] border border-[#E8ECF0]'
            }`}
          >
            {lv.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(value === n ? 0 : n)}
          className="p-1 transition-transform active:scale-90"
          aria-label={`${n} 顆星`}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill={n <= value ? '#A16207' : 'none'} stroke={n <= value ? '#A16207' : '#D6D3D1'} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function FeedbackScreen({ brewData, onDone }) {
  const [taste, setTaste] = useState({ acidity: 0, sweetness: 0, bitterness: 0, body: 0 })
  const [rating, setRating] = useState(0)
  const [showParams, setShowParams] = useState(false)
  const [grindSetting, setGrindSetting] = useState('')
  const [waterTemp, setWaterTemp] = useState('')
  const [flowRate, setFlowRate] = useState('')
  const [notes, setNotes] = useState('')

  const setFlavorLevel = (key, val) => setTaste(prev => ({ ...prev, [key]: val }))

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
      taste,
      rating,
      grindSetting: grindSetting.trim() || null,
      waterTemp: waterTemp ? Number(waterTemp) : null,
      flowRate: flowRate || null,
      notes: notes.trim() || null,
      stepTimes: brewData.stepTimes,
      createdAt: Date.now(),
    }
    saveLog(log)
    onDone()
  }

  const hasAnyTaste = Object.values(taste).some(v => v > 0)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      {/* Header */}
      <div className="px-6 pt-14 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-[#A16207]">{brewData.bean.name}</span>
          <span className="text-sm text-[#78716C]">· {formatTime(brewData.time)}</span>
        </div>
        <h1 className="text-3xl text-[#171717]" style={{ fontFamily: 'Calistoga, serif' }}>
          這杯喝起來？
        </h1>
        <p className="text-xs text-[#78716C] mt-1.5">點一下選強度，再點一下取消</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-6 space-y-6">

        {/* Layer 1：風味強度 */}
        <div className="space-y-4">
          {FLAVORS.map(f => (
            <FlavorRow
              key={f.key}
              flavor={f}
              value={taste[f.key]}
              onChange={val => setFlavorLevel(f.key, val)}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-[#E8ECF0]" />

        {/* Layer 2：整體評分 */}
        <div>
          <p className="text-sm font-semibold text-[#171717] mb-3">整體評分</p>
          <StarRating value={rating} onChange={setRating} />
        </div>

        {/* Divider */}
        <div className="border-t border-[#E8ECF0]" />

        {/* Layer 3：沖煮參數（可收合） */}
        <div>
          <button
            onClick={() => setShowParams(p => !p)}
            className="flex items-center justify-between w-full"
          >
            <p className="text-sm font-semibold text-[#171717]">記錄沖煮參數</p>
            <svg
              width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#78716C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: showParams ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {showParams && (
            <div className="mt-4 space-y-4">
              {/* 研磨刻度 */}
              <div className="flex items-center gap-4">
                <label className="text-sm text-[#78716C] w-16 flex-shrink-0">研磨刻度</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 24, C40-26"
                  value={grindSetting}
                  onChange={e => setGrindSetting(e.target.value)}
                  className="flex-1 border-b border-[#E8ECF0] pb-1.5 text-[#171717] placeholder-[#D6D3D1] outline-none bg-transparent text-sm"
                />
              </div>

              {/* 水溫 */}
              <div className="flex items-center gap-4">
                <label className="text-sm text-[#78716C] w-16 flex-shrink-0">水溫</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="90"
                    min="60" max="100"
                    value={waterTemp}
                    onChange={e => setWaterTemp(e.target.value)}
                    className="w-20 border-b border-[#E8ECF0] pb-1.5 text-[#171717] placeholder-[#D6D3D1] outline-none bg-transparent text-sm"
                  />
                  <span className="text-sm text-[#78716C]">°C</span>
                </div>
              </div>

              {/* 水流速度 */}
              <div className="flex items-center gap-4">
                <label className="text-sm text-[#78716C] w-16 flex-shrink-0">水流速度</label>
                <div className="flex gap-2">
                  {FLOW_OPTS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setFlowRate(flowRate === opt.id ? '' : opt.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        flowRate === opt.id
                          ? 'bg-[#171717] text-white'
                          : 'bg-[#F5F5F4] text-[#78716C] border border-[#E8ECF0]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 備註 */}
              <div>
                <label className="text-sm text-[#78716C] block mb-2">備註</label>
                <textarea
                  rows={3}
                  placeholder="這次有什麼特別觀察？"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border border-[#E8ECF0] rounded-xl p-3 text-sm text-[#171717] placeholder-[#D6D3D1] outline-none bg-[#FAFAF9] resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-10 pt-3 space-y-2 border-t border-[#E8ECF0]">
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl bg-[#171717] text-white text-base font-semibold active:bg-[#404040] transition-colors"
        >
          {hasAnyTaste || rating > 0 ? '儲存這杯紀錄' : '跳過，直接儲存'}
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
