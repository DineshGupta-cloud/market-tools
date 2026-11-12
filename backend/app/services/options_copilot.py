"""Optional OpenAI-compatible multi-agent copilot with deterministic offline fallback."""
import json
import os
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from app.services.options_analytics import build_copilot_brief


def generate_copilot_brief(metrics, signal):
    fallback = build_copilot_brief(metrics, signal)
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return fallback
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    payload = {
        "model": model,
        "temperature": 0.1,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": (
                "You are a cautious Indian index-options research desk. Return JSON with an agents array "
                "containing exactly four objects: role and summary for Chain analyst, Volatility analyst, "
                "Risk analyst and Portfolio analyst. Use only the supplied metrics and rule signal. "
                "Never invent live prices, news, lot sizes, expiry details or fills. Do not issue an order. "
                "If a field is absent, say unavailable. Include an explicit educational-only disclaimer."
            )},
            {"role": "user", "content": json.dumps({"metrics": metrics, "rule_signal": signal}, separators=(",", ":"))},
        ],
    }
    request = Request(
        base_url + "/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": "Bearer " + api_key, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=12) as response:
            body = json.loads(response.read().decode("utf-8"))
        content = body["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        agents = parsed.get("agents")
        expected = {"Chain analyst", "Volatility analyst", "Risk analyst", "Portfolio analyst"}
        if not isinstance(agents, list) or {item.get("role") for item in agents if isinstance(item, dict)} != expected:
            return fallback
        return {
            "mode": "llm",
            "model": model,
            "agents": [{"role": item["role"], "summary": str(item.get("summary", ""))[:1600]} for item in agents],
            "limitations": fallback["limitations"] + ["LLM summaries can still be wrong; verify all inputs independently."],
        }
    except (KeyError, TypeError, ValueError, HTTPError, URLError, TimeoutError, OSError):
        return fallback
