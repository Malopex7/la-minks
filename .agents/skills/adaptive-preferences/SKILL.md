---
name: Adaptive Preferences & Coding Standards
description: Enforced styling, architectural, behavior rules, and coding standards for La-Minks project.
---

# Adaptive Preferences & Coding Standards

This skill outlines the enforced rules and standards for the La-Minks project to ensure consistency across the codebase.

## 1. Technology Rules
- **Package Manager**: Always use `npm`.
- **Docker**: Strictly prohibited.
- **UI Architecture**: Next.js App Router with React 19 and TS 5.
- **Styling**: Tailwind CSS v4 alongside shadcn/ui.
- **API**: Express 5.1.x using ES Modules.
- **Database**: MongoDB with Mongoose 8.16.x.

## 2. Code Quality & Formatting
- **Validation**: All user inputs MUST be validated via Zod on the client (React Hook Form) and the server (Express).
- **Types**: Use strictly typed TypeScript with no `any`.
- **Modularity**: Focus on code readability, maintainability, and clear separation of concerns.

## 3. UI/UX Standards
- Implement a clean, modern UI utilizing shadcn components (e.g., Button, Card, Table).
- Provide loading skeletons during data fetching processes.
- Actively utilize Toast notifications to alert users of errors and success states.
- **CRITICAL**: The Stitch MCP Server MUST be heavily utilized for all UI/UX design and code generation. It carries significant weight in ensuring a premium, modern aesthetic, particularly for public-facing customer portal pages. When building new Next.js screens, prompt Stitch to generate the designs and components.
- **Image Generation**: When using `generate_image` (Nano Banana) for placeholder/stock images, all generated images MUST always maintain a **South African aesthetic**. Nano Banana is strictly an image generation tool — it has zero influence on site theme or colors.

## 4. State Management
- **Server State**: Managed via TanStack Query.
- **Global UI State**: Managed via Zustand (ensure stores are kept atomic).

## 5. Security Practices
- Environment variables must remain strictly in `.env`/`.env.local`. Do not commit these.
- Always hash passwords with `bcrypt` prior to saving.
- Payment amounts and logic must be exclusively calculated on the server. The frontend must never send final prices directly.

## 6. Testing & Verification Rules
- **Do not test unless requested**: Do not run test suites (Playwright, unit tests, integration tests, E2E tests, etc.) unless the user explicitly requests a test.
