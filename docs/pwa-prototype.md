# China Travel Agent PWA Prototype

## Product Goal

Build a persistent digital local guide for foreign travelers in China. The product
should reduce setup failure before departure, provide contextual help during the
trip, and route complex situations to a qualified local guide.

## Primary Navigation

1. **Today**: Current location, itinerary, next best action, and time-sensitive alerts.
2. **Agent**: Camera, voice, location-aware questions, driver cards, and diagnostics.
3. **Prepare**: Guided verification for internet, payment, maps, Didi, and translation.
4. **Offline**: Hotel, dietary, emergency, and transport cards available without signal.
5. **Me**: Trip context, device setup, personal needs, permissions, and privacy controls.

## Core Prototype Flows

### Arrival readiness

The traveler completes real tests before departure instead of only marking a checklist.
The result is a verified setup state and a personalized first-hour arrival playbook.

### In-trip assistance

The Agent combines location, itinerary, device setup, preferences, and camera input.
It changes modes for menus, drivers, attractions, transport, and technical failures.

### Human handoff

When a request needs deep interpretation, complex routing, family care, or disruption
handling, the Agent recommends a matched local guide. Context is shared only after the
traveler approves.

## Persistent Context Model

- Traveler profile and language
- Current trip, city, location, and itinerary
- Device, eSIM, payment, maps, and ride-hailing setup
- Dietary, medical, mobility, and family needs
- Completed verification tests
- Saved offline cards and booking references
- Local inventory: attractions, transit, tickets, and guide availability

## PWA Foundation Included

- Installable web app manifest
- Standalone portrait display mode
- Maskable and standard app icons
- Service worker registration
- App shell and visited-resource caching
- Safe-area-aware mobile navigation
- Offline-first emergency card experience

## MVP Boundary

The current prototype uses local sample context and simulated actions. The next build
phase should add onboarding, persisted trip data, real camera input, geolocation,
model-backed Agent responses, and a local service integration layer.
