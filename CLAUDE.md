# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Fuse**, an Angular admin template and starter project built with Angular 14 and Material Design. It uses a modular architecture with custom design system components, multiple layout options, and comprehensive theming support.

## Essential Commands

### Development
- `npm start` or `ng serve` - Start development server at http://localhost:4200/
- `ng build` - Build project for production (outputs to `dist/fuse/`)
- `ng build --watch --configuration development` - Build with watch mode for development

### Testing & Quality
- `ng test` - Run unit tests with Karma
- `ng lint` - Run ESLint for code quality checks

### Code Generation
- `ng generate component component-name` - Generate new component
- `ng generate directive|pipe|service|class|guard|interface|enum|module` - Generate other Angular artifacts

## Architecture Overview

### Module Structure
- **@fuse/** - Custom design system and utilities library containing:
  - Components (Alert, Card, Drawer, Navigation, etc.)
  - Services (Config, Confirmation, Loading, MediaWatcher, etc.)
  - Directives, Pipes, Validators, and Animations
- **app/core/** - Singleton services and app-wide functionality (Auth, Icons, Transloco)
- **app/layout/** - Layout components with multiple pre-built variants:
  - Horizontal: Centered, Enterprise, Material, Modern
  - Vertical: Classic, Classy, Compact, Dense, Futuristic, Thin
- **app/modules/** - Feature modules (Auth, Admin, Landing)
- **app/mock-api/** - Mock API services for development

### Key Patterns
- **Lazy Loading**: Routes use `loadChildren` for code splitting
- **Guards**: AuthGuard/NoAuthGuard control access to authenticated/guest routes
- **Theming**: Custom Tailwind-based theming system with CSS custom properties
- **Modular Design**: Each @fuse component is self-contained with its own module

### Technology Stack
- Angular 14 with Angular Material
- TailwindCSS with custom utilities and theming plugins
- Transloco for internationalization
- ApexCharts for data visualization
- Quill editor for rich text
- Mock API system for development

### Styling System
- **TailwindCSS** with custom configuration and plugins
- **SCSS** for component-specific styles
- **Custom theming system** supporting multiple color schemes (default, brand, teal, rose, purple, amber)
- **Responsive breakpoints**: sm(600px), md(960px), lg(1280px), xl(1440px)

### Important Files
- `src/@fuse/fuse.module.ts` - Core Fuse module (import only in AppModule)
- `src/app/core/core.module.ts` - App core module (singleton services)
- `src/app/app.routing.ts` - Main routing configuration
- `tailwind.config.js` - Custom Tailwind configuration with theming
- `src/@fuse/styles/` - Core styling system

## Development Notes

### Authentication Flow
Routes are protected by guards with specific layouts:
- Guest routes (NoAuthGuard) use empty layout
- Authenticated routes (AuthGuard) resolve initial data and use configured layouts
- Default redirect is to `/example` page

### Layout System
Dynamic layout switching based on route data. Layout component (`app/layout/layout.component.ts`) determines which layout variant to render based on route configuration.

### Mock API
Development uses comprehensive mock API system (`app/mock-api/`) with interceptors. Real API integration requires replacing mock services and updating API endpoints.