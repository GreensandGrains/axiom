# Discord Directory Application

## Overview

A full-stack Discord directory application that allows users to discover and list Discord servers and bots. The platform features a modern React frontend with server-side API endpoints for managing categories, servers, and bots. Users can search, filter by categories, and browse popular Discord communities and bots in a curated directory format.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **Styling**: Tailwind CSS with CSS variables for theming, supporting dark mode
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with structured route handlers
- **Database Integration**: Drizzle ORM for type-safe database operations
- **Error Handling**: Centralized error middleware with structured error responses
- **Development Tools**: Hot module replacement with Vite integration in development

### Data Storage
- **Database**: PostgreSQL configured through Drizzle with Neon serverless adapter
- **Schema Management**: Type-safe schema definitions with automatic TypeScript generation
- **Migrations**: Drizzle Kit for database schema migrations
- **Connection Pooling**: Neon serverless connection pooling for scalability

### Authentication & Authorization
- **Authentication System**: Placeholder Discord OAuth integration (routes defined but not implemented)
- **Session Management**: Express sessions with PostgreSQL session store
- **User Management**: User profiles linked to Discord accounts with avatar and metadata storage

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support
- **Connection Library**: `@neondatabase/serverless` for database connectivity

### UI & Styling
- **Component Library**: Radix UI for accessible, unstyled components
- **Styling Framework**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts integration (Inter, DM Sans, Fira Code, Geist Mono)

### Development Tools
- **Build Tool**: Vite with React plugin and development error overlay
- **Type Checking**: TypeScript with strict mode enabled
- **Code Quality**: ESM modules with modern JavaScript features
- **Development Integration**: Replit-specific plugins for development environment

### Third-Party Integrations
- **Discord API**: Planned integration for server/bot metadata fetching
- **Form Validation**: Zod for runtime type validation and form schemas
- **Date Handling**: date-fns for date manipulation and formatting
- **Carousel Components**: Embla Carousel for interactive UI elements