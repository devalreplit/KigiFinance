# KIGI Frontend - Sistema Financeiro Familiar

## Overview

KIGI é um sistema financeiro familiar desenvolvido em React + TypeScript, focado no controle de entradas, saídas e parcelamentos. O sistema permite múltiplos usuários familiares (pai, mãe, filhos) gerenciarem suas finanças de forma consolidada, com integração a um webservice externo para persistência de dados.

## System Architecture

### Frontend Stack
- **Framework**: React 18 com TypeScript
- **Styling**: TailwindCSS + shadcn/ui components
- **Routing**: Wouter (lightweight React router)
- **Charts**: Recharts para visualizações
- **HTTP Client**: Axios para comunicação com API
- **Build Tool**: Vite
- **Icons**: Lucide React

### Design System
- **Theme**: Green-based color scheme with CSS variables
- **Components**: shadcn/ui design system with custom adaptations
- **Responsive**: Mobile-first approach with sidebar navigation
- **Language**: Complete Portuguese interface

## Key Components

### Authentication System
- Token-based authentication with localStorage persistence
- Protected route wrapper for authenticated access
- Auto-logout on token expiration
- Mock authentication service for development

### API Integration
- Configurable mock/real API switching via environment variables
- Axios interceptors for automatic token injection
- Centralized error handling
- Service layer abstraction for all API operations

### Data Management
- Mock data persistence using localStorage
- Real-time data synchronization
- Type-safe interfaces for all data entities
- CRUD operations for all main entities

### User Interface
- Mobile-responsive sidebar navigation
- Card-based layout design
- Form validation and error handling
- Loading states and skeleton screens
- Toast notifications for user feedback

## Data Flow

### Authentication Flow
1. User enters credentials on login page
2. AuthService validates against API/mock service
3. Token stored in localStorage
4. User redirected to dashboard
5. Protected routes check authentication status

### CRUD Operations
1. User action triggers service call
2. Loading state activated
3. API/mock service processes request
4. Success/error handling with toast notifications
5. Data refresh and UI update

### Mock Data Persistence
- localStorage used for development data persistence
- Initial seed data loaded on first run
- All CRUD operations update localStorage
- Data survives browser refresh

## External Dependencies

### API Integration
- **Base URL**: Configurable via `VITE_API_URL` environment variable
- **Mock Mode**: Toggle via `VITE_USE_MOCK` environment variable
- **Authentication**: Bearer token in Authorization header
- **Timeout**: 10 second request timeout

### Core Libraries
- React ecosystem (react, react-dom)
- TypeScript for type safety
- TailwindCSS for styling
- Radix UI primitives for accessibility
- Axios for HTTP requests
- Wouter for routing
- Recharts for data visualization

## Deployment Strategy

### Development
- Vite dev server on port 5000
- Hot reload enabled
- Mock data mode by default
- All hosts allowed for Replit compatibility

### Production Build
- Static asset generation via `npm run build`
- Assets optimized and minified
- Environment variables injected at build time
- Served from `/dist` directory

### Replit Configuration
- Node.js 20 runtime
- Automatic deployment to autoscale
- Port forwarding from 5000 to 80
- Hidden files and directories configured

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- January 22, 2025: Successfully migrated project from Replit Agent to standard Replit environment
- January 22, 2025: Verified all dependencies are installed and working correctly  
- January 22, 2025: Confirmed application runs without errors on Vite development server
- January 22, 2025: Validated authentication system and mock data persistence working properly

## Changelog

Changelog:
- January 22, 2025: Project migration completed - all systems operational
- June 21, 2025: Initial setup