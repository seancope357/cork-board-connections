# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cork Board for Connections is a React-based interactive cork board application for creating conspiracy-theory-style connections between notes and images. Users can create draggable sticky notes and images, connect them with red string lines, and manage metadata.

Original Figma design: https://www.figma.com/design/TgnkC6ztlTZxRQ0l8LwshH/Cork-Board-for-Connections

## Development Commands

```bash
# Install dependencies
npm i

# Start development server (runs on port 3000, auto-opens browser)
npm run dev

# Build for production (outputs to 'build' directory)
npm run build
```

## Tech Stack

- **Build Tool**: Vite 6.3.5 with React SWC plugin
- **Framework**: React 18.3.1 with TypeScript
- **Styling**: Tailwind CSS v4 (custom build)
- **UI Components**: Radix UI primitives + custom components
- **Icons**: Lucide React

## Architecture

### State Management

The application uses React's built-in state management (no external state library). The main state lives in `CorkBoard.tsx`:

- `items` - Array of `BoardItem` objects (notes and images)
- `connections` - Array of `Connection` objects (red string lines between items)
- `connectingFrom` - Tracks which item is being connected
- `editingItem` - Currently open modal item

All state updates flow through callback props passed down to child components.

### Component Hierarchy

```
App.tsx (minimal wrapper)
└── CorkBoard.tsx (main application logic)
    ├── Toolbar (Add Note, Add Image, connection status)
    ├── SVG Layer (z-index: 1)
    │   └── ConnectionLine components
    ├── Items Layer (z-index: 2)
    │   ├── DraggableNote components
    │   └── DraggableImage components
    └── Modals (z-index: 50)
        ├── NoteModal
        └── ImageModal
```

### Key Data Structures

**BoardItem** (`src/components/CorkBoard.tsx:9-28`):
- Used for both notes and images
- Contains position (x, y), size (width, height), content, color, thumbtack color
- Has optional metadata (title, description, tags, date, location) and file attachments

**Connection** (`src/components/CorkBoard.tsx:30-34`):
- Simple structure with id, from (item id), and to (item id)
- Rendered as curved SVG paths in `ConnectionLine.tsx`

### Coordinate System

- The cork board uses absolute positioning within a scrollable container
- Item positions are stored as pixel coordinates (x, y) from the top-left
- Connections are drawn from thumbtack positions (top-center of items)
- Thumbtack offset: item.y - 3px (see `getItemCenter` in `CorkBoard.tsx:152-160`)

### Interaction Patterns

**Drag and Drop**:
- Implemented in `DraggableNote.tsx` and `DraggableImage.tsx`
- Uses mouse events with offset tracking
- Prevents dragging when interacting with buttons or textareas

**Resizing**:
- Items have resize handles at corners and edges
- Resize direction determines which dimensions change
- Implemented with mouse event handlers tracking initial position

**Connecting Items**:
1. Click "Link" button on first item → sets `connectingFrom` state
2. Temporary animated line follows cursor
3. Click second item → creates Connection object
4. Connection renders as curved red string with delete button on hover

**Double-click to Edit**:
- Double-clicking a note or image opens its modal editor
- Modal allows editing content, metadata, and attachments

### Path Alias

The project uses `@` as an alias for the `src` directory (configured in `vite.config.ts:49`):
```typescript
import { Component } from '@/components/Component'
```

### Styling Notes

- Uses Tailwind CSS v4 with custom generated styles in `src/index.css`
- Cork board background: `#a67c52` with radial gradient overlays
- Default note color: yellow with red thumbtacks
- Default image border: white with blue thumbtacks
- Connection lines: red (`#ef4444`, `#dc2626`) with organic curved paths

### UI Component Library

The `src/components/ui/` directory contains Radix UI-based components. These are pre-built, customizable primitives. When adding new UI elements, prefer using these existing components over creating custom implementations.

## Common Tasks

### Adding New Item Types

To add a new draggable item type beyond notes and images:
1. Update `BoardItem` type in `CorkBoard.tsx` to support new type
2. Create new draggable component similar to `DraggableNote.tsx`
3. Add conditional rendering in `CorkBoard.tsx` items layer
4. Create corresponding modal component for editing
5. Add toolbar button to create the new item type

### Modifying Connection Appearance

Connection rendering is centralized in `ConnectionLine.tsx`:
- Path calculation uses quadratic curves with randomized control points
- Hover state shows shadow, pins at endpoints, and delete button
- To change line style, modify the SVG path properties

### Adding Metadata Fields

Metadata is stored in `BoardItem.metadata` as a flexible object:
1. Update TypeScript interface if adding typed fields
2. Modify `NoteModal.tsx` or `ImageModal.tsx` to include input fields
3. Display metadata in `DraggableNote.tsx` or `DraggableImage.tsx` as needed

### Persistence

Currently, all state is ephemeral (lost on page refresh). To add persistence:
- Consider localStorage for simple browser-based storage
- Or implement backend API with fetch/save operations
- State structure is already serializable (no complex objects)
