# CLAUDE.md

This folder is for building a **simple website** that acts as a **decision tree** for **Purdue Pre-Awards Specialists** to determine what type of **cost share** they need to calculate.

## Purpose

- Provide a guided, question-and-answer flow (decision tree).
- Help users identify the **type of cost share** applicable to their situation.
- Keep the experience simple, fast, and easy to use during pre-award work.

## What we are building

- A small static site (HTML/CSS/JS or a lightweight static framework is fine).
- The core feature is the decision tree UI (questions, answers, and resulting guidance).
- No backend services required.

## Deployment workflow (expected)

- Code is pushed to **GitHub**.
- **Netlify** builds/deploys from the GitHub repository.
- That’s it—keep the architecture and dependencies minimal and Netlify-friendly.

## Constraints / guidelines

- Prefer simple, maintainable code over complex abstractions.
- Keep content and decision logic easy to update (ideally data-driven).
- Accessibility matters (keyboard navigation, readable typography, clear focus states).
