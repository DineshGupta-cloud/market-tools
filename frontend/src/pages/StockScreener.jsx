import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { api } from '../services/api'

const emptyFilters={search:'',min_price:'',max_price:'',min_rsi:'',max_rsi:'',min_change_pct:'',max_change_pct:'',price_above_ema20:false,ema_alignment:false,near_52w_high_pct:''}
const columns=[
 {field:'symbol',headerName:'Symbol',width:120},{field:'name',headerName:'Company',width:220},{field:'price',headerName:'Price',width:110,type:'number'},
 {field:'change_pct',headerName:'Change %',width:110,type:'number'},{field:'volume',headerName:'Volume',width:130,type:'number'},
 {field:'ema9',headerName:'EMA 9',width:100,type:'number'},{field:'ema20',headerName:'EMA 20',width:100,type:'number'},
 {field:'ema50',headerName:'EMA 50',width:100,type:'number'},{field:'ema100',headerName:'EMA 100',width:105,type:'number'},
 {field:'rsi',headerName:'RSI',width:90,type:'number'},{field:'week52_high',headerName:'52W High',width:110,type:'number'}
]

export default function StockScreener(){
 const [filters,setFilters]=useState(emptyFilters); const [rows,setRows]=useState([]); const [loading,setLoading]=useState(false); const [error,setError]=useState('')
 const update=(name,value)=>setFilters(f=>({...f,[name]:value}))
 const run=async()=>{setLoading(true);setError('');try{const payload={...filters};Object.keys(payload).forEach(k=>{if(payload[k]==='')delete payload[k];else if(['min_price','max_price','min_rsi','max_rsi','min_change_pct','max_change_pct','near_52w_high_pct'].includes(k))payload[k]=Number(payload[k])});const data=await api.runScreener(payload);setRows(data.items.map((x,i)=>({...x,id:x.symbol||i})))}catch(e){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{run()},[])
 return <Box><Typography variant="h4" fontWeight={700} gutterBottom>Stock Screener</Typography><Typography color="text.secondary" sx={{mb:2}}>Filter stocks by price, RSI, momentum and EMA structure.</Typography>
 <Card sx={{mb:2}}><CardContent><Grid container spacing={2}>
  <Grid size={{xs:12,sm:6,md:3}}><TextField fullWidth label="Search symbol/company" value={filters.search} onChange={e=>update('search',e.target.value)}/></Grid>
  {['min_price','max_price','min_rsi','max_rsi','min_change_pct','max_change_pct','near_52w_high_pct'].map(k=><Grid key={k} size={{xs:6,sm:3,md:1.2}}><TextField fullWidth label={k.replaceAll('_',' ')} type="number" value={filters[k]} onChange={e=>update(k,e.target.value)}/></Grid>)}
 </Grid><Stack direction="row" spacing={2} sx={{mt:2}}><Button variant={filters.price_above_ema20?'contained':'outlined'} onClick={()=>update('price_above_ema20',!filters.price_above_ema20)}>Price &gt; EMA20</Button><Button variant={filters.ema_alignment?'contained':'outlined'} onClick={()=>update('ema_alignment',!filters.ema_alignment)}>EMA 9 &gt; 20 &gt; 50 &gt; 100</Button><Button variant="contained" onClick={run} disabled={loading}>{loading?'Scanning...':'Run Screener'}</Button><Button onClick={()=>{setFilters(emptyFilters);setTimeout(run,0)}}>Reset</Button></Stack>{error&&<Typography color="error" sx={{mt:2}}>{error}</Typography>}</CardContent></Card>
 <Card><CardContent><Box sx={{height:560,width:'100%'}}><DataGrid rows={rows} columns={columns} loading={loading} pageSizeOptions={[10,25,50]} initialState={{pagination:{paginationModel:{pageSize:10,page:0}}}} disableRowSelectionOnClick /></Box></CardContent></Card></Box>
}
