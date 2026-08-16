# HeatOps

> Turn Tomorrow's Heat Into Today's Operating Plan.

HeatOps is an AI operational intelligence platform that turns thermal intelligence into operational decisions for physical sites.

## Architecture

Thermal Provider
→ Normalized Thermal Data
→ Impact
→ Risk
→ Decision
→ Heat-Adaptive Operating Plan
→ Simulation
→ Action
→ Outcome

## Product Principles

- Action over information
- Proactive over reactive
- Useful over noisy
- Explainable over magical
- Measurable over impressive
- Narrow before broad
- Real data over assumptions
- Trust over hype

## Development

HeatOps uses a provider architecture so thermal intelligence providers can be replaced without changing the core product logic.

Initial development provider:

- Development / Mock provider

Production thermal provider:

- FortyGuard

FortyGuard API details will only be implemented after official API access and documentation are available.

## Security

Secrets are stored in the hosting environment.

Never commit:

- API keys
- Service-role keys
- passwords
- private credentials