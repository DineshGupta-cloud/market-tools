const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

async function request(path, options = {}) {
  const response = await fetch(API_BASE_URL + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  return response.json()
}

export const api = {
  health: () => request('/health'),
  stocks: () => request('/stocks'),
  runScreener: (filters) => request('/stocks/screener/run', { method: 'POST', body: JSON.stringify(filters) }),
  expiries: (symbol) => request(`/options/expiries?symbol=${encodeURIComponent(symbol)}`),
  optionChain: (symbol, expiry) => request(`/options/chain?symbol=${encodeURIComponent(symbol)}&expiry=${encodeURIComponent(expiry)}`),
  atmPremium: (symbol, expiry) => request(`/options/atm-premium?symbol=${encodeURIComponent(symbol)}&expiry=${encodeURIComponent(expiry)}`),
  calculateRisk: (payload) => request('/risk/calculate', { method: 'POST', body: JSON.stringify(payload) })
}
