# 2D Graph Editor - Warehouse Topology Designer

## Overview

This is a professional 2D graph editor application designed for creating and managing warehouse topology diagrams. The application allows users to create visual node-and-edge graphs with specialized node types for warehouse operations, export configurations to JSON, and apply automatic layouts.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Graph Visualization**: ReactFlow for interactive node-edge graph editing
- **State Management**: Zustand for client-side state management
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server and API routes
- **Development Server**: Custom Vite integration for hot module replacement
- **Module System**: ES modules throughout the application

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via Drizzle but currently using in-memory storage)
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Neon Database serverless connection support

## Key Components

### Graph Editor Core
- **Node Types**: Six specialized warehouse node types (simple, scanner, eject, feed, ptlzone, sblzone)
- **Custom Nodes**: React components for each node type with distinct visual styling
- **Edge System**: Custom edges with support for straight and L-shaped routing
- **Text Boxes**: Editable text annotations with rich formatting options

### User Interface
- **Property Panel**: Dynamic editing of node and edge properties
- **Toolbar**: Tools for adding nodes, switching modes, and layout operations
- **Export/Import**: JSON export/import functionality with DOT format parsing support
- **Layout Engine**: Automatic graph layout using Dagre algorithm

### State Management
- **Graph Store**: Centralized state for nodes, edges, and user interactions
- **History System**: Undo/redo functionality with state snapshots
- **Clipboard**: Copy/paste operations for graph elements
- **Mode Switching**: Toggle between selection and connection modes

### Visual Features
- **Alignment Guides**: Smart alignment assistance during node positioning
- **Grid Background**: Visual grid for precise positioning
- **Minimap**: Overview navigation for large graphs
- **Zoom Controls**: Pan and zoom functionality for graph navigation

## Data Flow

1. **User Interactions**: Mouse events and keyboard shortcuts trigger state updates
2. **State Updates**: Zustand store manages all graph state changes
3. **React Flow Integration**: State changes automatically update the visual graph
4. **Property Editing**: Dynamic forms update node/edge properties in real-time
5. **Export/Import**: JSON serialization preserves complete graph state
6. **Layout Operations**: Dagre algorithm repositions nodes with automatic fitting

## External Dependencies

### Core Libraries
- **ReactFlow**: Graph visualization and interaction library
- **Dagre**: Graph layout algorithm for automatic positioning
- **Drizzle ORM**: Database toolkit and query builder
- **Zod**: Runtime type validation and schema definition

### UI Components
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library with consistent styling

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Static type checking throughout the application
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Replit Integration**: Custom Replit configuration with PostgreSQL module
- **Hot Reload**: Vite development server with instant updates
- **Error Overlay**: Runtime error modal for development debugging

### Production Build
- **Client Build**: Vite builds optimized React application to `dist/public`
- **Server Build**: ESBuild bundles Express server to `dist/index.js`
- **Static Serving**: Production server serves built client assets
- **Autoscale Deployment**: Configured for Replit's autoscale deployment target

### Database Setup
- **Environment Variables**: `DATABASE_URL` required for PostgreSQL connection
- **Schema Migration**: `npm run db:push` applies schema changes
- **Fallback Storage**: In-memory storage implementation for development

## Recent Changes

### June 16, 2025 - Smart Layout System
- **Smart Hierarchical Layout**: Implemented intelligent layout algorithm that groups nodes by type and minimizes edge crossings using Dagre's "tight-tree" ranker
- **Large Topology Optimization**: Added ultra-compact spacing for graphs with 500+ nodes (80px spacing vs 280px for small graphs)
- **Auto-Zoom for Massive Graphs**: Automatic zoom adjustment based on graph size - very large topologies (500+ nodes) zoom to 0.05-0.3x for full visibility
- **Import Layout Enhancement**: JSON import now automatically applies smart layout and optimal zoom level
- **ASRS Node Differentiation**: ASRS-INFEED nodes use purple color, ASRS-EJECT nodes use indigo for better distinction

### Technical Implementation
- **Smart Layout Module**: `client/src/lib/smart-layout.ts` - Dedicated module for advanced layout algorithms
- **Dynamic Node Sizing**: Smaller nodes (60px) for massive topologies, maintaining readability while fitting more on screen  
- **Edge Weight Prioritization**: Scanner connections and default routes receive higher weights to reduce crossings
- **Responsive Spacing**: Adaptive horizontal (80-180px) and rank spacing (120-280px) based on node count

## Changelog

```
Changelog:
- June 15, 2025. Initial setup  
- June 16, 2025. Smart hierarchical layout and zoom optimization for large warehouse topologies
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```