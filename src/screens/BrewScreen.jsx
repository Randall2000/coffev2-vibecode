import { useState, useEffect, useRef } from 'react'
import { getRecipeForRoast, getStepWater, formatTime } from '../data/recipes'
import { unlockAudio, playBeep } from '../utils/audio'

export default function BrewScreen({ bean, onFinish, onBack }) {
  const recipe = getRecipeForRoast(bean.roastLevel)
  const [coffeeGrams, setCoffeeGrams] = useState(20)
  const waterTotal = Math.round(coffeeGrams * recipe.ratio)

  const [status, setStatus] = useState('idle') // idle | running | paused | done
  const [currentTime, setCurrentTime] = useState(0)
  const prevTimeRef = useRef(0)
  const stepTimesRef = useRef([])
  const stepStartRef = useRef(0)

  const currentStepIdx = recipe.steps.findIndex(s => s.endTime > currentTime)
  const stepIdx = currentStepIdx === -1 ? recipe.steps.length - 1 : currentStepIdx
  const step = recipe.steps[stepIdx]
  const prevEnd = stepIdx > 0 ? recipe.steps[stepIdx - 1].endTime : 0
  const timeInStep = Math.min(Math.max(currentTime - prevEnd, 0), step.endTime - prevEnd)
  const stepDuration = step.endTime - prevEnd
  const stepProgress = stepDuration > 0 ? timeInStep / stepDuration : 1

  const totalTime = recipe.steps[recipe.steps.length - 1].endTime
  const isDone = currentTime >= totalTime

  // Timer tick
  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => setCurrentTime(t => t + 0.1), 100)
    return () => clearInterval(id)
  }, [status])

  // Step change detection + finish detection
  useEffect(() => {
    if (status !== 'running') return
    const prev = prevTimeRef.current
    const now = currentTime

    const prevIdx = recipe.steps.findIndex(s => s.endTime > prev)
    const nowIdx = recipe.steps.findIndex(s => s.endTime > now)

    if (prevIdx !== -1 && nowIdx !== -1 && prevIdx !== nowIdx) {
      const done = recipe.steps[prevIdx]
      const pEnd = prevIdx > 0 ? recipe.steps[prevIdx - 1].endTime : 0
      stepTimesRef.current[prevIdx] = {
        name: done.name,
        planned: done.endTime - pEnd,
        actual: Math.round(done.endTime - stepStartRef.current),
      }
      stepStartRef.current = done.endTime
      playBeep(880, 'sine', 0.2)
      if (navigator.vibrate) navigator.vibrate(40)
    }

    if (now >= totalTime && prev < totalTime && !finishedRef.current) {
      setStatus('done')
      playBeep(440, 'sine', 0.1)
      setTimeout(() => playBeep(660, 'sine', 0.3), 150)
    }

    prevTimeRef.current = now
  }, [currentTime, status, recipe, totalTime])

  const handleStart = () => {
    unlockAudio()
    if (status === 'idle') {
      stepTimesRef.current = []
      stepStartRef.current = 0
      playBeep(600, 'triangle', 0.1)
      setStatus('running')
    } else if (status === 'running') {
      setStatus('paused')
    } else if (status === 'paused') {
      setStatus('running')
    }
  }

  const finishedRef = useRef(false)

  const buildBrewData = () => ({
    bean,
    recipe,
    coffeeGrams,
    waterTotal,
    time: Math.round(currentTime),
    stepTimes: stepTimesRef.current.filter(Boolean),
  })

  // Auto-navigate when timer naturally ends
  useEffect(() => {
    if (status === 'done' && !finishedRef.current) {
      finishedRef.current = true
      onFinish(buildBrewData())
    }
  }, [status])

  const handleFinish = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    setStatus('done')
    onFinish(buildBrewData())
  }

  const targetWater = getStepWater(step, waterTotal, coffeeGrams)

  return (
    <div className="flex flex-col h-full min-h-[100dvh] bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-14 pb-4">
        {status === 'idle' && (
          <button onClick={onBack} className="p-2 -ml-2 text-[#78716C]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-[#A16207]">{bean.name}</p>
          <h2 className="text-lg font-semibold text-[#171717]">{recipe.name}</h2>
        </div>
        {/* Coffee grams adjuster (only when idle) */}
        {status === 'idle' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCoffeeGrams(g => Math.max(10, g - 1))}
              className="w-8 h-8 rounded-full border border-[#E8ECF0] flex items-center justify-center text-[#78716C] active:bg-[#FAFAF9]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <div className="text-center">
              <span className="text-lg font-semibold text-[#171717]">{coffeeGrams}</span>
              <span className="text-xs text-[#78716C]">g</span>
            </div>
            <button
              onClick={() => setCoffeeGrams(g => Math.min(40, g + 1))}
              className="w-8 h-8 rounded-full border border-[#E8ECF0] flex items-center justify-center text-[#78716C] active:bg-[#FAFAF9]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {/* Big timer display */}
        <div className="text-center">
          <div
            className="text-8xl font-light tracking-tight text-[#171717] tabular-nums"
            style={{ fontFamily: 'Calistoga, serif' }}
          >
            {formatTime(currentTime)}
          </div>
          <p className="text-sm text-[#78716C] mt-2">
            {coffeeGrams}g · {waterTotal}mL · 1:{recipe.ratio}
          </p>
        </div>

        {/* Step card */}
        <div className="w-full rounded-2xl bg-[#FAFAF9] border border-[#E8ECF0] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#A16207] uppercase tracking-wide">
              {status === 'idle' ? '第一步' : `步驟 ${stepIdx + 1}／${recipe.steps.length}`}
            </span>
            <span className="text-sm font-semibold text-[#171717]">→ {targetWater}mL</span>
          </div>

          <p className="font-semibold text-[#171717] text-base mb-1">{step.name}</p>
          <p className="text-sm text-[#78716C] leading-relaxed">{step.desc}</p>

          {/* Step progress bar */}
          {status !== 'idle' && (
            <div className="mt-4 h-1.5 bg-[#E8ECF0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#A16207] rounded-full transition-all duration-100"
                style={{ width: `${Math.min(stepProgress * 100, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Steps preview (only when idle) */}
        {status === 'idle' && (
          <div className="w-full space-y-2">
            {recipe.steps.map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-[#78716C]">
                <span className="w-5 h-5 rounded-full border border-[#E8ECF0] flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
                <span className="flex-1">{s.name}</span>
                <span className="tabular-nums">{formatTime(s.endTime)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 pb-10 pt-4 space-y-3">
        <button
          onClick={handleStart}
          className={`w-full py-5 rounded-2xl text-lg font-semibold transition-colors ${
            status === 'running'
              ? 'bg-[#FAFAF9] border border-[#E8ECF0] text-[#171717]'
              : 'bg-[#171717] text-white active:bg-[#404040]'
          }`}
        >
          {status === 'idle' ? '開始沖煮' : status === 'running' ? '暫停' : '繼續'}
        </button>

        {status !== 'idle' && (
          <button
            onClick={handleFinish}
            className="w-full py-4 rounded-2xl border border-[#E8ECF0] text-[#78716C] text-base font-medium active:bg-[#FAFAF9]"
          >
            完成，來品嘗
          </button>
        )}
      </div>
    </div>
  )
}
