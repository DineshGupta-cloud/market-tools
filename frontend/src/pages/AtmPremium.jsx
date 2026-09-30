import { useEffect, useState } from 'react'
import { Alert, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material'
import { api } from '../services/api'

const symbols = ['NIFTY', 'BANKNIFTY', 'FINNIFTY']

export default function AtmPremium() {
  const [symbol, setSymbol] = useState('NIFTY')
  const [expiry, setExpiry] = useState('')
  const [expiries, setExpiries] = useState([])
  const [premium, setPremium] = useState(null)
  const [history, setHistory] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    api.expiries(symbol).then(r => {
      setExpiries(r.items || [])
      setExpiry(r.items?.[0] || '')
    }).catch(e => setError(e.message))
  }, [symbol])

  useEffect(() => {
    if (!expiry) return
    setError('')
    Promise.all([api.atmPremium(symbol, expiry), api.atmPremiumHistory(symbol, expiry)])
      .then(([p, h]) => { setPremium(p); setHistory(h) })
      .catch(e => setError(e.message))
  }, [symbol, expiry])

  const max = history ? Math.max(...history.items.map(x => x.total_premium), 1) : 1

  return <Stack spacing={3}>
    <Card><CardContent>
      <Typography variant="h4">ATM Premium</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Track ATM call, put and combined premium for the selected index and expiry.</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}><FormControl fullWidth><InputLabel>Index</InputLabel><Select value={symbol} label="Index" onChange={e => setSymbol(e.target.value)}>{symbols.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl></Grid>
        <Grid size={{ xs: 12, md: 4 }}><FormControl fullWidth disabled={!expiries.length}><InputLabel>Expiry</InputLabel><Select value={expiry} label="Expiry" onChange={e => setExpiry(e.target.value)}>{expiries.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}</Select></FormControl></Grid>
      </Grid>
    </CardContent></Card>

    {error && <Alert severity="error">{error}</Alert>}
    {premium && <Grid container spacing={2}>
      {[['Spot', premium.spot], ['ATM Strike', premium.atm_strike], ['ATM CE', premium.call_ltp], ['ATM PE', premium.put_ltp], ['Total Premium', premium.total_premium]].map(([label, value]) => <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={label}><Card><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{Number(value).toLocaleString()}</Typography></CardContent></Card></Grid>)}
    </Grid>}

    {history && <Card><CardContent>
      <Typography variant="h6" gutterBottom>Premium History</Typography>
      <Stack spacing={1.2}>{history.items.map(item => {
        const width = Math.max(3, item.total_premium / max * 100)
        return <Stack key={item.time} direction="row" spacing={2} alignItems="center">
          <Typography sx={{ width: 50, fontSize: 12 }}>{item.time}</Typography>
          <div style={{ width: '100%', height: 22, position: 'relative', background: 'rgba(0,0,0,0.04)', borderRadius: 4 }}>
            <div style={{ width: `${width}%`, height: '100%', borderRadius: 4, background: 'currentColor', opacity: 0.35 }} />
            <Typography sx={{ position: 'absolute', top: 1, left: 8, fontSize: 12 }}>{item.total_premium} total | CE {item.call_premium} | PE {item.put_premium}</Typography>
          </div>
        </Stack>
      })}</Stack>
    </CardContent></Card>}
  </Stack>
}
