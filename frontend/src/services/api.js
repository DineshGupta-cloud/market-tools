const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

async function request(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(API_BASE_URL + path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options, signal: options.signal || controller.signal })
    const contentType = response.headers.get('content-type') || ''
    const body = contentType.includes('application/json') ? await response.json() : await response.text()
    if (!response.ok) throw new Error(typeof body === 'object' && body?.detail ? body.detail : 'API request failed: ' + response.status)
    return body
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Request timed out. Please try again.')
    throw error
  } finally { clearTimeout(timeout) }
}

export const api = {
  health: () => request('/health'), stocks: () => request('/stocks'),
  runScreener: filters => request('/stocks/screener/run', { method:'POST', body:JSON.stringify(filters) }),
  expiries: symbol => request('/options/expiries?symbol='+encodeURIComponent(symbol)),
  optionChain: (symbol, expiry) => request('/options/chain?symbol='+encodeURIComponent(symbol)+'&expiry='+encodeURIComponent(expiry)),
  atmPremium: (symbol, expiry) => request('/options/atm-premium?symbol='+encodeURIComponent(symbol)+'&expiry='+encodeURIComponent(expiry)),
  atmPremiumHistory: (symbol, expiry) => request('/options/atm-premium/history?symbol='+encodeURIComponent(symbol)+'&expiry='+encodeURIComponent(expiry)),
  calculateRisk: payload => request('/risk/calculate', { method:'POST', body:JSON.stringify(payload) })
}
