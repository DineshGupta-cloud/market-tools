import { useState } from 'react'
import { Alert, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material'
import { api } from '../services/api'

const initial = { capital: 100000, risk_percent: 2, entry_price: 100, stop_loss: 95, target_price: 115, lot_size: 1, brokerage_per_lot: 0 }

export default function RiskCalculator() {
  const [form, setForm] = useState(initial)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const change = key => e => setForm({ ...form, [key]: e.target.value })
  const calculate = async () => {
    setLoading(true); setError('')
    try { setResult(await api.calculateRisk(Object.fromEntries(Object.entries(form).map(([k,v]) => [k, Number(v)])))) }
    catch (e) { setError(e.message); setResult(null) }
    finally { setLoading(false) }
  }
  const fields = [['capital','Capital'],['risk_percent','Risk %'],['entry_price','Entry Price'],['stop_loss','Stop Loss'],['target_price','Target Price'],['lot_size','Lot Size'],['brokerage_per_lot','Brokerage / Lot']]
  return <Stack spacing={3}>
    <Card><CardContent><Typography variant="h4">Risk Calculator</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Calculate position size from account risk, stop-loss and target.</Typography>
      <Grid container spacing={2}>{fields.map(([key,label]) => <Grid size={{ xs:12, sm:6, md:3 }} key={key}><TextField fullWidth label={label} type="number" value={form[key]} onChange={change(key)} inputProps={{ min: 0, step: 'any' }} /></Grid>)}</Grid>
      <Button variant="contained" sx={{ mt: 3 }} onClick={calculate} disabled={loading}>{loading ? 'Calculating...' : 'Calculate Risk'}</Button>
    </CardContent></Card>
    {error && <Alert severity="error">{error}</Alert>}
    {result && <Grid container spacing={2}>{[
      ['Risk Budget', result.risk_amount], ['Quantity', result.quantity], ['Lots', result.lots], ['Investment', result.max_investment], ['Actual Risk', result.actual_risk], ['Gross Profit', result.gross_profit], ['Net Profit', result.net_profit], ['R:R Ratio', result.reward_risk_ratio]
    ].map(([label,value]) => <Grid size={{ xs:12, sm:6, md:3 }} key={label}><Card><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h5" sx={{ mt:1, fontWeight:700 }}>{typeof value === 'number' ? value.toLocaleString(undefined,{maximumFractionDigits:2}) : value}</Typography></CardContent></Card></Grid>)}</Grid>}
    {result && <Card><CardContent><Typography variant="h6" gutterBottom>Risk Summary</Typography><Typography>Risk utilization: <strong>{result.risk_utilization_percent}%</strong> of capital</Typography><Typography>Brokerage allowance: <strong>{result.brokerage.toLocaleString()}</strong></Typography><Typography sx={{ mt: 1 }} color="text.secondary">Position sizing is based on the maximum planned loss at the stop-loss price.</Typography></CardContent></Card>}
  </Stack>
}
