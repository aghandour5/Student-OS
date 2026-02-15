## 2026-02-15 - [Reflected XSS via Host Header Injection]
**Vulnerability:** The landing page generation logic used `Host` and `X-Forwarded-Host` headers directly to construct deep links and injected them into the HTML template without validation or escaping.
**Learning:** Attacker-controlled headers can be used to inject malicious scripts into the page if they are used in string replacement without sanitization.
**Prevention:** Always validate host/protocol headers against a strict whitelist or regex and use HTML escaping when injecting them into templates.
