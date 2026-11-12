"""Explainable option analytics inspired by Strike & Hedge's public MIT project."""
from __future__ import annotations
from datetime import datetime, time
from math import erf, exp, log, pi, sqrt
from zoneinfo import ZoneInfo
IST=ZoneInfo("Asia/Kolkata")
DEFAULT_RATE=0.065

def _n(v):
    try:
        x=float(v)
        return x if x==x and abs(x)!=float("inf") else None
    except (TypeError,ValueError): return None

def _cdf(x): return 0.5*(1.0+erf(x/sqrt(2.0)))
def _pdf(x): return exp(-0.5*x*x)/sqrt(2.0*pi)

def black_scholes_greeks(spot,strike,years,rate,volatility,option_type):
    s,k,t,sigma=map(_n,(spot,strike,years,volatility)); r=_n(rate); kind=str(option_type).upper()
    if kind not in {"CE","PE"}: raise ValueError("option_type must be CE or PE")
    if None in (s,k,t,sigma,r) or min(s,k)<=0 or t<=0 or sigma<=0: raise ValueError("spot, strike, years and volatility must be positive finite numbers")
    rt=sqrt(t); d1=(log(s/k)+(r+0.5*sigma*sigma)*t)/(sigma*rt); d2=d1-sigma*rt; disc=exp(-r*t)
    gamma=_pdf(d1)/(s*sigma*rt); vega=s*_pdf(d1)*rt/100.0
    if kind=="CE":
        delta=_cdf(d1); theta=(-s*_pdf(d1)*sigma/(2*rt)-r*k*disc*_cdf(d2))/365.0; rho=k*t*disc*_cdf(d2)/100.0
    else:
        delta=_cdf(d1)-1.0; theta=(-s*_pdf(d1)*sigma/(2*rt)+r*k*disc*_cdf(-d2))/365.0; rho=-k*t*disc*_cdf(-d2)/100.0
    return {a:round(b,8) for a,b in {"delta":delta,"gamma":gamma,"vega":vega,"theta":theta,"rho":rho}.items()}

def _years(expiry,now=None):
    try: d=datetime.fromisoformat(expiry).date()
    except (TypeError,ValueError): return 7/365.0
    current=now or datetime.now(IST)
    if current.tzinfo is None: current=current.replace(tzinfo=IST)
    close=datetime.combine(d,time(15,30),tzinfo=IST)
    return max((close-current.astimezone(IST)).total_seconds(),60)/(365*24*3600)

def _iv(leg):
    v=_n(leg.get("iv"))
    return None if not v or v<=0 else (v/100.0 if v>3 else v)

def enrich_chain(chain,rate=DEFAULT_RATE,now=None):
    result={**chain,"items":[]}; years=_years(chain.get("expiry"),now); result["time_to_expiry_years"]=round(years,8)
    for source in chain.get("items") or []:
        row={**source}
        for side,kind in (("call","CE"),("put","PE")):
            leg=dict(source.get(side) or {}); iv=_iv(leg); strike=_n(source.get("strike")); spot=_n(chain.get("spot"))
            leg["greeks"]=black_scholes_greeks(spot,strike,years,rate,iv,kind) if iv and strike and spot else None
            leg["iv_source"]="provided" if iv else "unavailable"; row[side]=leg
        result["items"].append(row)
    return result

def summarize_chain(chain):
    rows=[r for r in (chain.get("items") or []) if _n(r.get("strike")) is not None]; spot=_n(chain.get("spot"))
    if not rows or not spot or spot<=0: return {"error":"A non-empty chain and positive spot are required."}
    c_oi=sum(_n((r.get("call") or {}).get("oi")) or 0 for r in rows); p_oi=sum(_n((r.get("put") or {}).get("oi")) or 0 for r in rows)
    c_vol=sum(_n((r.get("call") or {}).get("volume")) or 0 for r in rows); p_vol=sum(_n((r.get("put") or {}).get("volume")) or 0 for r in rows)
    cw=max(rows,key=lambda r:_n((r.get("call") or {}).get("oi")) or 0); pw=max(rows,key=lambda r:_n((r.get("put") or {}).get("oi")) or 0)
    pain=[]
    for candidate in rows:
        settlement=_n(candidate.get("strike")); payout=0.0
        for r in rows:
            k=_n(r.get("strike")); payout+=max(settlement-k,0)*(_n((r.get("call") or {}).get("oi")) or 0); payout+=max(k-settlement,0)*(_n((r.get("put") or {}).get("oi")) or 0)
        pain.append((payout,settlement))
    atm=min(rows,key=lambda r:abs(_n(r.get("strike"))-spot)); ce=atm.get("call") or {}; pe=atm.get("put") or {}
    ivs=[_iv(ce),_iv(pe)]; ivs=[v*100 for v in ivs if v and v>0]; straddle=(_n(ce.get("ltp")) or 0)+(_n(pe.get("ltp")) or 0)
    return {"spot":spot,"pcr_oi":round(p_oi/c_oi,4) if c_oi else None,"pcr_volume":round(p_vol/c_vol,4) if c_vol else None,
      "call_oi_total":c_oi,"put_oi_total":p_oi,"call_volume_total":c_vol,"put_volume_total":p_vol,
      "call_oi_wall":_n(cw.get("strike")),"put_oi_wall":_n(pw.get("strike")),"max_pain":min(pain)[1],
      "atm_strike":_n(atm.get("strike")),"atm_iv":round(sum(ivs)/len(ivs),4) if ivs else None,
      "atm_straddle":round(straddle,2) if straddle else None,"straddle_implied_move_pct":round(straddle/spot*100,4) if straddle else None,
      "time_to_expiry_years":chain.get("time_to_expiry_years"),"data_note":"Metrics use only the option-chain snapshot supplied to this API."}

def score_signal(metrics):
    if metrics.get("error"): return {"bias":"AVOID","score":0,"confidence":0,"reasons":[metrics["error"]]}
    score=0; reasons=[]; pcr=_n(metrics.get("pcr_oi")); spot=_n(metrics.get("spot")); pain=_n(metrics.get("max_pain"))
    if pcr is not None:
        if pcr>=1.25: score+=2; reasons.append(f"OI PCR {pcr:.2f} is above the 1.25 bullish-lean threshold.")
        elif pcr<=0.75: score-=2; reasons.append(f"OI PCR {pcr:.2f} is below the 0.75 bearish-lean threshold.")
        else: reasons.append(f"OI PCR {pcr:.2f} is within the neutral band.")
    if spot is not None and pain is not None:
        if spot>pain: score+=1; reasons.append("Spot is above calculated max pain.")
        elif spot<pain: score-=1; reasons.append("Spot is below calculated max pain.")
    put_wall=_n(metrics.get("put_oi_wall")); call_wall=_n(metrics.get("call_oi_wall"))
    if spot is not None and put_wall is not None and spot<put_wall: score-=1; reasons.append("Spot is below the highest put-OI strike.")
    if spot is not None and call_wall is not None and spot>call_wall: score+=1; reasons.append("Spot is above the highest call-OI strike.")
    bias="BULLISH" if score>=2 else "BEARISH" if score<=-2 else "RANGE"
    return {"bias":bias,"score":score,"confidence":min(80,40+abs(score)*10),"reasons":reasons}

def build_copilot_brief(metrics,signal):
    reasons=signal.get("reasons") or ["Insufficient chain evidence for a directional view."]
    return {"mode":"deterministic","agents":[
      {"role":"Chain analyst","summary":f"OI PCR: {metrics.get('pcr_oi')}; max pain: {metrics.get('max_pain')}; put wall: {metrics.get('put_oi_wall')}; call wall: {metrics.get('call_oi_wall')}."},
      {"role":"Volatility analyst","summary":f"ATM IV: {metrics.get('atm_iv')}; ATM straddle: {metrics.get('atm_straddle')}; implied move: {metrics.get('straddle_implied_move_pct')}%."},
      {"role":"Risk analyst","summary":"Use defined-risk paper trades only. Verify live bid/ask, lot size, expiry and capital before sizing; no order is generated."},
      {"role":"Portfolio analyst","summary":f"Rule-based bias is {signal.get('bias')} (score {signal.get('score')}). "+" ".join(reasons)}],
      "limitations":["Deterministic rules, not an LLM.","No live market data is fetched.","No trade is placed; this is not investment advice."]}
