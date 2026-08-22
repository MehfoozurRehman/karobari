# Karobari AI Business OS & Operations Platform

An AI-powered operating system for small and medium businesses (SMBs) built with Next.js 16 App Router, React 19, Convex real-time backend, Clerk authentication, Vercel AI SDK (OpenAI & Gemini), and Tailwind CSS v4.

## Overview

`karobari` unifies financial bookkeeping, customer communications, invoice generation, and AI-assisted workflow automation for regional business owners. It features Clerk user authentication, real-time sync with Convex, multi-model AI inference (`@ai-sdk/openai`, `@ai-sdk/google`), transactional notifications (Resend), and product telemetry (PostHog).

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (v16 App Router)
- **Backend & Database**: [Convex](https://convex.dev/) (`convex`)
- **Authentication**: [Clerk](https://clerk.com/) (`@clerk/nextjs`)
- **AI Engine**: Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/google`)
- **Frontend Core**: React 19, TypeScript, Zustand, Base UI (`@base-ui/react`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Email & Analytics**: Resend API, PostHog

## Prerequisites

- Node.js (v20 or higher recommended)
- Package manager (`pnpm` recommended)
- Clerk, Convex, OpenAI/Google AI, and Resend credentials

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_CONVEX_URL="your-convex-deployment-url"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   OPENAI_API_KEY="your-openai-api-key"
   GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
   RESEND_API_KEY="your-resend-api-key"
   ```

3. **Start the Convex Backend**:
   ```bash
   npx convex dev
   ```

4. **Run the Development Server**:
   ```bash
   pnpm dev
   ```

5. **Access the Application**:
   Open `http://localhost:3000` in your web browser.

## Available Scripts

- `pnpm dev` - Starts the Next.js development server.
- `pnpm build` - Compiles the application for production.
- `pnpm start` - Starts the production server.
- `pnpm lint` - Runs ESLint code quality checks.

## Author

Created by [Mehfooz-ur-Rehman](https://github.com/MehfoozurRehman).
