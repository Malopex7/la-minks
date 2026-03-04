# Adaptive Preferences & Coding Standards

This document tracks the enforced styling, architectural, and behavior rules for the La-Minks project.

## 1. Technology Rules
- **Package Manager**: npm strictly.
- **Docker**: Strictly prohibited.
- **UI Architecture**: Next.js App Router (React 19, TS 5).
- **Styling**: Tailwind CSS v4 and shadcn/ui.
- **API**: Express 5.1.x & ES Modules.
- **Database**: MongoDB (Mongoose 8.16.x).

## 2. Code Quality & Formatting
- **Validation**: All user input MUST be validated via Zod on both the client (React Hook Form) and server (Express).
- **Types**: Strict TypeScript formatting without `any`.
- **Modularity**: Code must prioritize readability, maintainability, and modular separation of concerns.

## 3. UI/UX Standards
- Clean, modern UI using shadcn components (Button, Card, Table, Form, Dialog, etc.).
- Loading skeletons must be used during data fetching.
- Active use of Toast notifications for errors and success states.

## 4. State Management
- **Server State**: Built using TanStack Query.
- **Global UI State**: Managed via Zustand (keep atomic).

## 5. Security Practices
- Environment-specific settings remain purely in `.env`/`.env.local`.
- Passwords are strictly hashed with bcrypt before saving.
- Payment amounts are strictly calculated server-side. The frontend should never submit final prices to the backend to prevent manipulation.
