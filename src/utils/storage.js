const BEANS_KEY = 'bf_beans'
const LOGS_KEY = 'bf_logs'

export const getBeans = () => {
  try { return JSON.parse(localStorage.getItem(BEANS_KEY)) || [] }
  catch { return [] }
}

export const saveBean = (bean) => {
  const beans = getBeans()
  const exists = beans.find(b => b.id === bean.id)
  const updated = exists
    ? beans.map(b => b.id === bean.id ? bean : b)
    : [bean, ...beans]
  localStorage.setItem(BEANS_KEY, JSON.stringify(updated))
  return updated
}

export const getLogs = () => {
  try { return JSON.parse(localStorage.getItem(LOGS_KEY)) || [] }
  catch { return [] }
}

export const saveLog = (log) => {
  const logs = getLogs()
  const updated = [log, ...logs]
  localStorage.setItem(LOGS_KEY, JSON.stringify(updated))
  return updated
}

export const getRelativeDate = (timestamp) => {
  const d = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays} 天前`
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
