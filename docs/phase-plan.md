# Phase Plan

This plan is written for a 2-person, 4-hour hackathon build.

## Pre-work

- Create and verify environment variables locally.
- Confirm one short test clip can be processed end to end.
- Preload a small historical context set into the local vector store.
- Draft the prompt templates before the hackathon starts.

## Phase 1: Pipeline skeleton, hour 0 to 1

- Person A owns the orchestration adapter layer.
- Person B owns the Gemini report prompt and the UI shell.
- Success criterion: a fake clip request flows through mocked analysis and produces a structured packet.

Prompt focus:

- GMI analysis prompt should force the model to return structured JSON only.
- RocketRide prompt should retrieve context hits by formation, pressing style, and team identity.
- Gemini prompt should turn structured JSON into a scouting report with fixed sections.

## Phase 2: Integration, hour 1 to 2.5

- Connect the upload or URL input to a backend endpoint.
- Route the request through the pipeline object.
- Keep the real vendor SDKs behind adapter classes so the core tests stay stable.

Prompt focus:

- GMI output should include observations, confidence, formations, and notable events.
- RocketRide should add historical parallels and opponent context.
- Gemini should compress everything into analyst-ready language without inventing facts.

## Phase 3: Quality, hour 2.5 to 3.5

- Improve section names and the order of evidence.
- Add a cached demo result so latency does not dominate the live pitch.
- Refine the report tone until it reads like a real scouting brief.

Prompt focus:

- Emphasize tactical specificity.
- Ban unsupported claims.
- Require each recommendation to cite an observation or context hit.

## Phase 4: Buffer, hour 3.5 to 4

- Freeze code.
- Prepare the live pitch.
- Keep the demo path as short as possible.

## Output contract

The pipeline should produce a packet with:

- source metadata
- raw video observations
- context hits from RocketRide
- a final scouting report

The report should contain:

- team profile
- key threats
- set piece tendencies
- historical context
- coaching recommendations