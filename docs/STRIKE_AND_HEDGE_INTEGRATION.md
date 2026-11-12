# Strike & Hedge analytics integration

Market Tools now includes an additive options-analytics layer inspired by the public [Strike & Hedge](https://github.com/85599/Strike-and-Hedge) project.

## Added
- Black–Scholes Greeks: delta, gamma, vega, theta and rho for European CE/PE options.
- OI PCR, volume PCR, max pain, highest-OI call/put strikes, ATM IV, ATM straddle and straddle-implied move.
- Transparent heuristic bias scoring and chain, volatility, risk and portfolio analyst summaries.
- Optional OpenAI-compatible model integration with a deterministic no-key fallback.
- Offline unit tests for formulas, metrics, signals and copilot fallback.

## API
- GET /api/options/analytics?symbol=NIFTY&expiry=YYYY-MM-DD
- GET /api/options/copilot?symbol=NIFTY&expiry=YYYY-MM-DD

## Optional AI configuration
Set OPENAI_API_KEY, and optionally OPENAI_BASE_URL (default https://api.openai.com/v1) and OPENAI_MODEL (default gpt-4o-mini) in the backend environment. Without a key, the copilot uses deterministic analyst-role summaries. If the model endpoint fails or returns an invalid response, it falls back to deterministic output. The prompt is grounded in computed metrics and forbids invented quotes or orders, but LLM output still requires independent verification.

## Important limitations
The existing options route generates illustrative sample data. These endpoints analyse that same sample provider; they do not fetch live NSE/BSE data. Greeks are theoretical and use supplied IV, a default 6.5% risk-free rate, no dividend yield, and an expiry-time convention of 15:30 IST. Max pain uses only strikes present in the supplied chain. The bias score is not a backtested strategy. No broker integration, live snapshots, historical snapshots, backtesting, paper ledger or order placement is included.

## Tests
From backend run: python -m unittest discover -s tests -v

## Attribution
This implementation adapts mathematical and architectural ideas from Strike & Hedge by Khushal under the MIT License. See THIRD_PARTY_NOTICES.md.
