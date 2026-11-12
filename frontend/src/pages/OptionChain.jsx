import { useEffect, useState } from 'react'
import {
  Alert, Box, Card, CardContent, Chip, Divider, FormControl, Grid, InputLabel, MenuItem, Select,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography
} from '@mui/material'
import { api } from '../services/api'

const symbols = ['NIFTY', 'BANKNIFTY', 'FINNIFTY']
const fmt = value => value === null || value === undefined ? '—' : Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })

export default function OptionChain() {
  const [symbol, setSymbol] = useState('NIFTY')
  const [expiry, setExpiry] = useState('')
  const [expiries, setExpiries] = useState([])
  const [data, setData] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true); setError('')
    api.expiries(symbol).then(result => {
      if (!active) return
      setExpiries(result.items || [])
      setExpiry(result.items?.[0] || '')
    }).catch(e => active && setError(e.message)).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [symbol])

  useEffect(() => {
    if (!expiry) return
    let active = true
    setLoading(true); setError('')
    Promise.all([api.optionChain(symbol, expiry), api.optionCopilot(symbol, expiry)])
      .then(([chain, result]) => {
        if (!active) return
        setData(chain); setAnalysis(result)
      })
      .catch(e => active && setError(e.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [symbol, expiry])

  const metrics = analysis?.metrics
  const atmRow = analysis?.chain?.items?.find(row => row.strike === metrics?.atm_strike)
  const metricCards = metrics ? [
    ['OI PCR', fmt(metrics.pcr_oi)], ['Volume PCR', fmt(metrics.pcr_volume)],
    ['Max pain', fmt(metrics.max_pain)], ['Call OI wall', fmt(metrics.call_oi_wall)],
    ['Put OI wall', fmt(metrics.put_oi_wall)], ['ATM IV', metrics.atm_iv == null ? '—' : fmt(metrics.atm_iv) + '%'],
    ['ATM straddle', fmt(metrics.atm_straddle)],
    ['Implied move', metrics.straddle_implied_move_pct == null ? '—' : fmt(metrics.straddle_implied_move_pct) + '%']
  ] : []

  return <Card>
    <CardContent>
      <Typography variant="h4" gutterBottom>Option Chain</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Chain view with calculated Greeks, PCR, max pain, OI walls and explainable analyst notes.</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth><InputLabel>Index</InputLabel><Select value={symbol} label="Index" onChange={e => setSymbol(e.target.value)}>{symbols.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth disabled={!expiries.length}><InputLabel>Expiry</InputLabel><Select value={expiry} label="Expiry" onChange={e => setExpiry(e.target.value)}>{expiries.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}</Select></FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}><Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}><Typography variant="body2">Spot</Typography><Typography variant="h6">{data ? data.spot.toLocaleString() : '-'}</Typography><Typography variant="body2">ATM</Typography><Typography variant="h6">{data ? data.atm_strike.toLocaleString() : '-'}</Typography></Stack></Grid>
      </Grid>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Typography sx={{ mb: 2 }}>Loading option chain and analytics...</Typography>}

      {metrics && <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Market structure</Typography>
        <Grid container spacing={1.5}>
          {metricCards.map(([label, value]) => <Grid key={label} size={{ xs: 6, sm: 3 }}><Card variant="outlined"><CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="h6">{value}</Typography></CardContent></Card></Grid>)}
        </Grid>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, mb: 1 }}>
          <Typography variant="subtitle1">Rule-based bias</Typography>
          <Chip label={analysis.signal.bias} color={analysis.signal.bias === 'BULLISH' ? 'success' : analysis.signal.bias === 'BEARISH' ? 'error' : 'default'} />
          <Typography variant="body2" color="text.secondary">Score {analysis.signal.score} · confidence indicator {analysis.signal.confidence}%</Typography>
        </Stack>
        {analysis.signal.reasons.map((reason, index) => <Typography key={index} variant="body2" color="text.secondary">• {reason}</Typography>)}
        {atmRow && <><Divider sx={{ my: 2 }} /><Typography variant="subtitle1" gutterBottom>ATM theoretical Greeks</Typography><Grid container spacing={2}>{[['CALL', atmRow.call], ['PUT', atmRow.put]].map(([label, leg]) => <Grid key={label} size={{ xs: 12, md: 6 }}><Typography variant="subtitle2">{label}</Typography><Stack direction="row" spacing={2} flexWrap="wrap">{['delta','gamma','theta','vega','rho'].map(key => <Typography key={key} variant="body2" color="text.secondary">{key.toUpperCase()}: {fmt(leg.greeks?.[key])}</Typography>)}</Stack></Grid>)}</Grid></>}
        {analysis.copilot && <><Divider sx={{ my: 2 }} /><Typography variant="h6" gutterBottom>Options copilot <Chip size="small" label="Deterministic · no LLM" /></Typography><Grid container spacing={2}>{analysis.copilot.agents.map(agent => <Grid key={agent.role} size={{ xs: 12, md: 6 }}><Card variant="outlined"><CardContent><Typography variant="subtitle2">{agent.role}</Typography><Typography variant="body2" color="text.secondary">{agent.summary}</Typography></CardContent></Card></Grid>)}</Grid><Alert severity="warning" sx={{ mt: 2 }}>This repository currently uses sample option-chain values, not live NSE data. Analytics are for software testing and education only—not trading decisions.</Alert></>}
      </Box>}

      {data && <TableContainer sx={{ maxHeight: 620 }}><Table stickyHeader size="small">
        <TableHead><TableRow><TableCell colSpan={6} align="center">CALL</TableCell><TableCell align="center">STRIKE</TableCell><TableCell colSpan={6} align="center">PUT</TableCell></TableRow><TableRow>
          <TableCell>LTP</TableCell><TableCell>Chg %</TableCell><TableCell>Vol</TableCell><TableCell>OI</TableCell><TableCell>OI Chg</TableCell><TableCell>IV</TableCell><TableCell>Strike</TableCell><TableCell>LTP</TableCell><TableCell>Chg %</TableCell><TableCell>Vol</TableCell><TableCell>OI</TableCell><TableCell>OI Chg</TableCell><TableCell>IV</TableCell>
        </TableRow></TableHead>
        <TableBody>{data.items.map(row => { const atm = row.strike === data.atm_strike; return <TableRow key={row.strike} sx={atm ? { '& td': { fontWeight: 700 } } : undefined} hover>
          <TableCell>{row.call.ltp}</TableCell><TableCell>{row.call.change_pct}%</TableCell><TableCell>{row.call.volume.toLocaleString()}</TableCell><TableCell>{row.call.oi.toLocaleString()}</TableCell><TableCell>{row.call.oi_change.toLocaleString()}</TableCell><TableCell>{row.call.iv}%</TableCell><TableCell align="center" sx={atm ? { fontWeight: 800 } : undefined}>{row.strike.toLocaleString()}</TableCell>
          <TableCell>{row.put.ltp}</TableCell><TableCell>{row.put.change_pct}%</TableCell><TableCell>{row.put.volume.toLocaleString()}</TableCell><TableCell>{row.put.oi.toLocaleString()}</TableCell><TableCell>{row.put.oi_change.toLocaleString()}</TableCell><TableCell>{row.put.iv}%</TableCell>
        </TableRow>})}</TableBody>
      </Table></TableContainer>}
    </CardContent>
  </Card>
}
