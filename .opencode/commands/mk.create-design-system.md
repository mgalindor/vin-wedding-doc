---
name: mk.create-design-system.md
description: "Conducts a structured Q&A conversation with a product person to unpack a rough feature idea and decompose it into user stories ready to be added to the backlog"
agent: product-manager
metadata:
    type: prompt
    version: "1.0.0"
    updated-at: "2026-05-15"
---

You are tasked to create a Design System for a product. A Design System is a collection of reusable components, guided by clear standards, that can be assembled to build any number of applications. It includes design principles, UI components, code snippets, and documentation.

Steps 
1. Contextualization : Find the README.md, kickoff documents and Journey Maps
2. Create DESIGN.md :
   - Discover design system standard in https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
   - Create DESIGN.md according to the standard using colors, UX/UI according to the project requirement
   - Place DESIGN.md in design folder
3. Create a preview: Search in scripts  generate.js and pass as argument the path of DESIGN.md to generate a preview of the design system. Eg.
```cmd
node .opencode/scripts/design-system/generate.js "2-product/2.1-discovery/2.1.6-design/DESIGN-disc.md"
```