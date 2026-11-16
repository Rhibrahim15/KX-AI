# Security policy

## Current security posture

KX Sanctuary OS is a private development project. It is **not yet approved for unrestricted public deployment**.

Implemented on the rebuild branch:
- Production API startup requires `API_AUTH_TOKEN`.
- Protected API routes require a bearer token.
- The web application has a single-password access gate with signed 12-hour HttpOnly/SameSite Strict cookies.
- Login and chat BFF enforce same-origin requests.
- The BFF forwards the backend token server-side; it is not exposed to browser JavaScript.
- Express uses Helmet security headers and an explicit CORS allowlist.
- API and BFF enforce request count and character limits.
- Provider keys are not stored in the browser's standard chat path.

Still missing:
- Distributed login brute-force protection.
- Distributed rate limiting for the BFF and API.
- Provider usage/spend limits and abuse monitoring.
- User accounts, per-user authorization and role-based access.
- Production monitoring, incident response and tested backup/restore.
- A formal privacy/security assessment.

Do not interpret a password gate as a complete authentication, authorization or abuse-prevention system.

## Secrets

- Never commit `.env`, provider API keys, bot tokens, access tokens, session secrets or database URLs.
- Store credentials in local environment files or the deployment provider's secret manager.
- Do not paste secrets into chats, screenshots, logs or issue reports.
- Rotate credentials that may have been exposed.
- Do not log authorization headers, cookies or raw secrets.

## Data handling

- Browser conversations are stored locally in the user's browser.
- Chat content is sent to the KX API and then to the provider selected by the server-side router.
- Provider retention and data processing are governed by that provider's terms and configuration.
- KX does not claim zero-PII storage or zero provider retention.
- PostgreSQL persistence is not yet active in the rebuilt path.

## Reporting a vulnerability

Please do not publish exploit details in an ordinary public issue. Use GitHub's private vulnerability reporting feature for this repository if enabled. Otherwise contact the repository maintainer through a private channel available to you.

Include:
- A concise description and affected component.
- Reproduction steps or a proof of concept.
- Impact and any relevant logs with secrets removed.
- Suggested mitigation, if known.

Do not include live credentials or personal data in a report.

## Release support

There is no production release or supported-version guarantee for the current rebuild branch. The `main` branch is preserved while the draft rebuild pull request is reviewed.
