import os
import unittest
from datetime import datetime
from unittest.mock import patch
from zoneinfo import ZoneInfo
from app.services.options_analytics import black_scholes_greeks,build_copilot_brief,enrich_chain,score_signal,summarize_chain
from app.services.options_copilot import generate_copilot_brief
class GreeksTests(unittest.TestCase):
 def test_atm_call_delta_and_positive_convexity(self):
  g=black_scholes_greeks(100,100,1,0,0.2,"CE"); self.assertAlmostEqual(g["delta"],0.5398,places=3); self.assertGreater(g["gamma"],0); self.assertGreater(g["vega"],0)
 def test_put_delta_negative(self): self.assertLess(black_scholes_greeks(100,100,1,0.05,0.2,"PE")["delta"],0)
 def test_invalid_time_rejected(self):
  with self.assertRaises(ValueError): black_scholes_greeks(100,100,0,0.05,0.2,"CE")
class AnalyticsTests(unittest.TestCase):
 def setUp(self):
  self.chain={"symbol":"NIFTY","expiry":"2026-12-31","spot":100,"items":[
   {"strike":90,"call":{"ltp":12,"oi":100,"volume":50,"iv":20},"put":{"ltp":2,"oi":300,"volume":80,"iv":22}},
   {"strike":100,"call":{"ltp":5,"oi":200,"volume":100,"iv":18},"put":{"ltp":5,"oi":400,"volume":120,"iv":20}},
   {"strike":110,"call":{"ltp":2,"oi":500,"volume":150,"iv":21},"put":{"ltp":12,"oi":100,"volume":40,"iv":23}}]}
 def test_pcr_walls_and_atm(self):
  m=summarize_chain(self.chain); self.assertEqual(m["pcr_oi"],1.0); self.assertEqual(m["call_oi_wall"],110); self.assertEqual(m["put_oi_wall"],100); self.assertEqual(m["atm_straddle"],10)
 def test_greeks_enriched_without_mutating_source(self):
  now=datetime(2026,12,1,12,tzinfo=ZoneInfo("Asia/Kolkata")); out=enrich_chain(self.chain,now=now); self.assertIsNotNone(out["items"][1]["call"]["greeks"]); self.assertNotIn("greeks",self.chain["items"][1]["call"])
 def test_copilot_has_four_analyst_roles(self):
  m=summarize_chain(self.chain); s=score_signal(m); b=build_copilot_brief(m,s); self.assertEqual(b["mode"],"deterministic"); self.assertEqual(len(b["agents"]),4)
 def test_copilot_uses_offline_fallback_without_key(self):
  with patch.dict(os.environ,{},clear=True):
   result=generate_copilot_brief(summarize_chain(self.chain),score_signal(summarize_chain(self.chain)))
  self.assertEqual(result["mode"],"deterministic")
 def test_empty_chain_avoids(self): self.assertEqual(score_signal(summarize_chain({"spot":100,"items":[]}))["bias"],"AVOID")
if __name__=="__main__": unittest.main()
