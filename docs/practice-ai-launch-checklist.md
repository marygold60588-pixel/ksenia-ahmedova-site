# Interactive practice: release checklist

Price target: 790 RUB. Not yet for sale.

## Legal review required before real stories are sent to OpenRouter
- Identify the data controller, approved model, inference endpoint, jurisdiction and subcontractors.
- Review applicable Russian personal-data law (including sensitive health/intimate data), localization and cross-border transfer requirements with qualified counsel.
- Prepare separate privacy policy, specific informed consent, withdrawal mechanism and deletion/contact procedures.
- Review payment terms, refund rules, receipt/fiscal requirements and consumer disclosures before enabling checkout.
- Confirm that the product is an educational self-reflection practice, not medical diagnosis, treatment or emergency support.

## Technical gate
- Keep PRACTICE_AI_ENABLED unset in production until approved.
- Keep OPENROUTER_API_KEY server-side only; never commit secrets.
- Choose PRACTICE_AI_MODEL explicitly. Require ZDR, deny collection and disallow fallbacks.
- Turn off prompt logging and response caching where available.
- Add server-side rate limits and spending cap before public AI launch.
- Never transmit user text to analytics or ordinary feedback endpoints.
- Test synthetic cases, refusals, unsafe relationships, ambiguous context, invalid consent, provider errors and build.

## Current state
The AI route exists but is disabled by default. No real prompts or paid calls have been made. No deployment to Timeweb has occurred.
