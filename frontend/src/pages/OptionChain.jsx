import { useEffect, useState } from 'react'
import {
  Alert, Box, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography
} from '@mui/material'
import { api } from '../services/api'

const symbols = ['NIFTY', 'BANKNIFTY', 'FINNIFTY']

export default function OptionChain() {
  const [symbol, setSymbol] = useState('NIFTY')
  const [expiry, setExpiry] = useState('')
  const [expiries, setExpiries] = useState([])
  const [data, setData] = useState(null)
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
    setLoading(true); setError('')
    api.optionChain(symbol, expiry).then(result => setData(result)).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [symbol, expiry])

  return <Card>
    <CardContent>
      <Typography variant="h4" gutterBottom>Option Chain</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Sample option-chain data with ATM identification, OI, volume, IV and LTP.</Typography>

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
      {loading && <Typography sx={{ mb: 2 }}>Loading option chain...</Typography>}

      {data && <TableContainer sx={{ maxHeight: 620 }}><Table stickyHeader size="small">
        <TableHead><TableRow>
          <TableCell colSpan={6} align="center">CALL</TableCell><TableCell align="center">STRIKE</TableCell><TableCell colSpan={6} align="center">PUT</TableCell>
        </TableRow><TableRow>
          <TableCell>LTP</TableCell><TableCell>Chg %</TableCell><TableCell>Vol</TableCell><TableCell>OI</TableCell><TableCell>OI Chg</TableCell><TableCell>IV</TableCell><TableCell>Strike</TableCell><TableCell>LTP</TableCell><TableCell>Chg %</TableCell><TableCell>Vol</TableCell><TableCell>OI</TableCell><TableCell>OI Chg</TableCell><TableCell>IV</TableCell>
        </TableRow></TableHead>
        <TableBody>{data.items.map(row => {
          const atm = row.strike === data.atm_strike
          return <TableRow key={row.strike} sx={atm ? { '& td': { fontWeight: 700 } } : undefined} hover>
            <TableCell>{row.call.ltp}</TableCell><TableCell>{row.call.change_pct}%</TableCell><TableCell>{row.call.volume.toLocaleString()}</TableCell><TableCell>{row.call.oi.toLocaleString()}</TableCell><TableCell>{row.call.oi_change.toLocaleString()}</TableCell><TableCell>{row.call.iv}%</TableCell>
            <TableCell align="center" sx={atm ? { fontWeight: 800 } : undefined}>{row.strike.toLocaleString()}</TableCell>
            <TableCell>{row.put.ltp}</TableCell><TableCell>{row.put.change_pct}%</TableCell><TableCell>{row.put.volume.toLocaleString()}</TableCell><TableCell>{row.put.oi.toLocaleString()}</TableCell><TableCell>{row.put.oi_change.toLocaleString()}</TableCell><TableCell>{row.put.iv}%</TableCell>
          </TableRow>
        })}</TableBody>
      </Table></TableContainer>}
    </CardContent>
  </Card>
}
