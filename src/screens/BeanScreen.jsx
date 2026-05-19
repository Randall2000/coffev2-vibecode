import { useState } from 'react'
import { getBeans, saveBean } from '../utils/storage'

const ROAST_OPTS = [
  { id: 'light', label: '淺焙', sub: '果酸清爽' },
  { id: 'medium', label: '中焙', sub: '圓潤平衡' },
  { id: 'dark', label: '深焙', sub: '醇厚甘苦' },
]

export default function BeanScreen({ onSelect }) {
  const [beans, setBeans] = useState(() => getBeans())
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [roast, setRoast] = useState('light')

  const handleAdd = () => {
    if (!name.trim()) return
    const bean = { id: Date.now().toString(), name: name.trim(), roastLevel: roast }
    const updated = saveBean(bean)
    setBeans(updated)
    setAdding(false)
    setName('')
    setRoast('light')
    onSelect(bean)
  }

  return (
    <div className="flex flex-col h-full min-h-[100dvh] bg-white">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <p className="text-sm font-medium text-[#A16207] tracking-wide uppercase mb-1">Barista Flow</p>
        <h1 className="text-3xl text-[#171717]" style={{ fontFamily: 'Calistoga, serif' }}>
          今天用哪包豆？
        </h1>
      </div>

      {/* Bean list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-6 space-y-3">
        {beans.length === 0 && !adding && (
          <div className="py-16 text-center text-[#78716C]">
            <div className="text-5xl mb-4">☕</div>
            <p className="text-base">還沒有豆子紀錄</p>
            <p className="text-sm mt-1">新增第一包豆子開始沖</p>
          </div>
        )}

        {beans.map(bean => (
          <button
            key={bean.id}
            onClick={() => onSelect(bean)}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-[#E8ECF0] active:bg-[#FAFAF9] transition-colors text-left"
          >
            <div>
              <p className="font-semibold text-[#171717] text-base">{bean.name}</p>
              <p className="text-sm text-[#78716C] mt-0.5">
                {ROAST_OPTS.find(r => r.id === bean.roastLevel)?.label}
                {' · '}
                {ROAST_OPTS.find(r => r.id === bean.roastLevel)?.sub}
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A16207" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}

        {/* Add form */}
        {adding && (
          <div className="border border-[#A16207] rounded-2xl p-4 space-y-4">
            <input
              autoFocus
              type="text"
              placeholder="豆子名稱（例：衣索比亞耶加）"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="w-full border-b border-[#E8ECF0] pb-2 text-[#171717] placeholder-[#78716C] outline-none bg-transparent"
            />
            <div className="grid grid-cols-3 gap-2">
              {ROAST_OPTS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setRoast(opt.id)}
                  className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                    roast === opt.id
                      ? 'bg-[#A16207] text-white'
                      : 'bg-[#FAFAF9] text-[#78716C] border border-[#E8ECF0]'
                  }`}
                >
                  <div>{opt.label}</div>
                  <div className="text-xs mt-0.5 opacity-75">{opt.sub}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setAdding(false); setName('') }}
                className="flex-1 py-3 rounded-xl border border-[#E8ECF0] text-[#78716C] text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                disabled={!name.trim()}
                className="flex-1 py-3 rounded-xl bg-[#171717] text-white text-sm font-medium disabled:opacity-40"
              >
                開始沖
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add button */}
      {!adding && (
        <div className="px-6 pb-10 pt-2">
          <button
            onClick={() => setAdding(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-[#E8ECF0] text-[#78716C] text-base font-medium flex items-center justify-center gap-2 active:bg-[#FAFAF9] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            新增豆子
          </button>
        </div>
      )}
    </div>
  )
}
