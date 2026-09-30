import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import { Link, Outlet, useLocation } from 'react-router-dom'

const links = [['Screener','/screener'],['Option Chain','/option-chain'],['ATM Premium','/atm-premium'],['Risk Calculator','/risk-calculator']]

export default function AppLayout() {
  const location = useLocation()
  return <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
    <AppBar position="sticky" color="inherit" elevation={1}><Toolbar sx={{ gap: 1 }}>
      <Typography component={Link} to="/" variant="h6" sx={{ textDecoration:'none', color:'inherit', mr:2, fontWeight:700 }}>Market Tools</Typography>
      {links.map(([label,path]) => <Button key={path} component={Link} to={path} variant={location.pathname===path?'contained':'text'}>{label}</Button>)}
    </Toolbar></AppBar>
    <Container maxWidth="xl" sx={{ py:4 }}><Outlet /></Container>
  </Box>
}
