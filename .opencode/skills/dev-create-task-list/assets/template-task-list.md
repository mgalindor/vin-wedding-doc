<!--
TEMPLATE: {tier}-task-list.md
PURPOSE : Implementation task list for a single application tier of a user story.
USAGE   : Fill in all {placeholder} values. Remove all HTML comments before saving the final document.
SECTIONS:
  - Front matter     : metadata of the task list
  - Header           : story reference and tier context
  - One block per architectural layer of the tier, in dependency order
  - End To end Testing    : the end to end tests to be created
  - ToDo in other feature: List of comments to add in the code to show that something is not implemented because is going to be implemented in other feature, this comment have to include the id of the other feature

PLACEHOLDER FORMAT : {kebab-case-name}

Very important remove comments before release the document. Comments only indicates how to fill each sectioon
-->

---
title: "Task List — {story-id}: {story-short-title} [{tier-label} Tier]"
date: {YYYY-MM-DD}
type: specification
scope: internal
story-id: "{story-id}"
tier: "{tier}"
status: draft
version: 1.0.0
updated: {YYYY-MM-DD}
---

# Task List — {story-id}: {story-short-title}
## Tier: {tier-label}


---

<!-- =====================================================================
  BLOCK: {first-layer-name}
  PURPOSE: {What this layer does — e.g., "Database schema changes"}
  DEPENDENCY: No prior task required. This is the foundation of the tier.
====================================================================== -->
## {First Layer Name}

<!-- Each task follows this format:
     - [ ] {Action} `{exact target}` — {expected outcome in one sentence}
     Action is one of: Create · Modify · Delete                          -->

- [ ] {Action} `{target-1}` — {expected outcome}
- [ ] {Action} `{target-2}` — {expected outcome}
- [ ] {Action} `{test-file-1}` — {what behavior or class this test covers}
---

<!-- =====================================================================
  BLOCK: {second-layer-name}
  PURPOSE: {What this layer does}
  DEPENDENCY: Requires {first-layer-name} to be completed first.
====================================================================== -->
## {Second Layer Name}

- [ ] {Action} `{target-3}` — {expected outcome}
- [ ] {Action} `{target-4}` — {expected outcome}
- [ ] {Action} `{test-file-1}` — {what behavior or class this test covers}
---

<!-- =====================================================================
  BLOCK: {third-layer-name}
  PURPOSE: {What this layer does}
  DEPENDENCY: Requires {second-layer-name} to be completed first.
====================================================================== -->
## {Third Layer Name}

- [ ] {Action} `{target-5}` — {expected outcome}
- [ ] {Action} `{target-6}` — {expected outcome}
- [ ] {Action} `{test-file-1}` — {what behavior or class this test covers}
---

<!-- =====================================================================
  Add as many layer blocks as the tier requires.
  The number and names of blocks are determined by the tier blueprint.
  Common backend blocks: Migration · Entity · Public Contract (DTOs, Interface, Token) · Service · Controller · Module Wiring
  Common web frontend blocks: API Service · State / Hooks · Components · Screens · Route Registration
  Common mobile blocks: API Service · State · Components · Screens · Navigation
====================================================================== -->

---

<!-- =====================================================================
  BLOCK: End To end Testing
  PURPOSE: 
  DEPENDENCY: All production code tasks above must be completed first.
  NOTE: Keep test tasks small and scoped to one class or behavior per task.
====================================================================== -->
## End To end Testing

- [ ] {Action} `{test-file-1}` — {what behavior or class this test covers}
- [ ] {Action} `{test-file-2}` — {what behavior or class this test covers}

<!-- =====================================================================
  BLOCK: To Do in other features
  PURPOSE: List the list of todo comments to be added showing that something is not going to be implemented in this task list because is part of other feature
====================================================================== -->
## To Do in other features
- [ ] Add todo comment in {class , method, function },  {missing feature} is going to be implemented in {id of other feature}