# Activity Diagram Notation Guide

This guide defines the exact UML activity diagram notations we will use (consistent with `Activity-Diagram-Notations.jpg`). All new activity diagrams in this project must follow these rules.

## Core Nodes

- **Initial State**: Solid black circle.
- **Final State**: Bull’s-eye (outer ring + inner filled circle).
- **Activity (Action) State**: Rounded rectangle, verb-phrase labels (e.g., “Validate Prerequisites”).
- **Decision Node**: Diamond. Outgoing edges must be labeled with guard conditions in square brackets, e.g., `[valid]`, `[invalid]`.
- **Merge**: Diamond used to merge alternative flows back together.
- **Fork**: Thick horizontal/vertical bar splitting one flow into parallel flows.
- **Join**: Thick bar synchronizing parallel flows back to one.
- **Time Event** (if needed): Hourglass/timeout symbol; label with the event, e.g., `after 24h`.
- **Control Flow**: Solid arrow connecting nodes. No text unless a guard label is required from a decision node.

## Guards and Labels

- Use square brackets for guards only on outgoing edges from a decision node. Example: `[demand < 60%]`, `[demand ≥ 60%]`.
- Do not place guards on incoming edges, actions, or merges.
- Use concise, testable labels. Prefer symbols (≥, ≤) where clear.

## Swimlanes (always)

- Use vertical swimlanes to separate responsibilities (e.g., Student, System, Staff). Place actions in the lane of the performer.
- Cross-lane flows are allowed; keep crossings minimal with clean routing.

## Style Conventions (draw.io)

- Action nodes: `rounded=1`.
- Initial state: small filled black ellipse.
- Final state: outer unfilled ellipse plus inner filled black ellipse (bull’s-eye).
- Decision/Merge: `rhombus` (diamond).
- Control flows: solid line with closed arrowhead.
- Parallelism: fork/join as thick bars (use a thin, long rectangle styled as a bar if needed).


## Example Guard Usage

- From a decision node labeled “Demand ≥ 60%?”:
  - Edge A: `[demand < 60%]` → “Allow free selection (within period)”
  - Edge B: `[demand ≥ 60%]` → “Allocate by GPA priority; lock changes”

Following this guide ensures all activity diagrams are consistent, unambiguous, and aligned with UML best practices.



