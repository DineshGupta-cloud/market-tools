# Options analytics API

The feature is additive to the existing Market Tools API.

GET /api/options/analytics?symbol=NIFTY&expiry=2026-11-19
GET /api/options/copilot?symbol=NIFTY&expiry=2026-11-19

The analytics endpoint returns a Greeks-enriched copy of the existing chain, summary metrics and a transparent rule score. The copilot endpoint adds deterministic chain, volatility, risk and portfolio analyst summaries. It does not call an LLM, broker or external market-data provider.

Run tests from this directory with python -m unittest discover -s tests -v.
