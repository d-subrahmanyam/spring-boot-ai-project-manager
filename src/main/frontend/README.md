# Spring Boot AI Project Manager - Frontend

A modern React frontend application for AI-powered project management with real-time streaming, built with TypeScript, Redux, and Material-UI.

## 🌟 Features

### AI-Powered Project Management
- **Multi-Agent Orchestration** - View tasks assigned to different AI specialists
- **Real-Time Streaming** - Watch AI agents work with live progress updates
- **Buffered Streaming** - Server-side buffering for 50-100x better performance
- **Markdown Rendering** - Beautiful code highlighting and formatting
- **Token Tracking** - Monitor AI usage per task and project

### Modern UI/UX
- **Material-UI Components** - Professional, responsive design
- **Dark/Light Theme** - System preference detection
- **Collapsible Accordions** - Organized project and task views
- **Loading Indicators** - Clear feedback during operations
- **Hero Icons** - Beautiful SVG icons throughout

### State Management
- **Redux** - Centralized state management
- **Redux-Saga** - Side effect handling for async operations
- **TypeScript** - Full type safety
- **Typed Hooks** - useAppDispatch, useAppSelector

## 🛠 Tech Stack

### Core
- **React 18.3.1** - Modern UI library
- **TypeScript 5.6.2** - Type-safe JavaScript
- **Vite 5.4.21** - Lightning-fast build tool and dev server

### State Management
- **Redux 5.0.1** - Predictable state container
- **Redux-Saga 1.3.0** - Side effect management
- **React-Redux 9.2.0** - React bindings for Redux

### UI Framework
- **Material-UI (MUI) 6.3.1** - Comprehensive React component library
  - @mui/material - Core components
  - @mui/icons-material - Material icons
  - @emotion/react & @emotion/styled - Styling solution

### Additional Libraries
- **@heroicons/react 2.2.0** - Beautiful hand-crafted SVG icons
- **react-markdown 9.0.2** - Markdown rendering component
- **remark-gfm 4.0.0** - GitHub Flavored Markdown support
- **Axios 1.7.9** - HTTP client for API calls
- **React Router DOM 7.1.3** - Client-side routing

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/              # Reusable components
│   │   ├── Layout.tsx           # Main layout with navigation
│   │   ├── ContentRenderer.tsx  # Markdown/HTML renderer
│   │   ├── MarkdownEditor.tsx   # Markdown editor component
│   │   └── SampleCard.tsx       # Sample card component
│   ├── pages/                   # Page components
│   │   ├── Dashboard.tsx        # Dashboard with statistics
│   │   ├── AgentProjects.tsx    # AI project management
│   │   └── Notes.tsx            # Notes with markdown editor
│   ├── store/                   # Redux store
│   │   ├── actions/             # Action creators and types
│   │   │   ├── index.ts
│   │   │   ├── agentActions.ts
│   │   │   ├── notesActions.ts
│   │   │   └── projectsActions.ts
│   │   ├── reducers/            # Redux reducers
│   │   │   ├── index.ts
│   │   │   ├── agentReducer.ts
│   │   │   ├── notesReducer.ts
│   │   │   └── projectsReducer.ts
│   │   ├── sagas/               # Redux-Saga effects
│   │   │   ├── index.ts
│   │   │   ├── agentSaga.ts
│   │   │   ├── notesSaga.ts
│   │   │   └── projectsSaga.ts
│   │   ├── api/                 # API clients
│   │   │   ├── index.ts
│   │   │   └── streamingApi.ts  # Server-Sent Events client
│   │   ├── hooks.ts             # Typed Redux hooks
│   │   └── index.ts             # Store configuration
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tsconfig.node.json           # Node TypeScript config
├── vite.config.ts               # Vite configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 20.x or higher**
- **Yarn package manager**

### Installation

1. Navigate to the frontend directory:
```bash
cd src/main/frontend
```

2. Install dependencies:
```bash
yarn install
```

### Development

Start the development server:
```bash
yarn dev
```

The application will be available at `http://localhost:3000` with hot module replacement (HMR).

### Building for Production

Build the application:
```bash
yarn build
```

The built files will be output to `../resources/static` directory, ready to be served by Spring Boot.

Preview the production build:
```bash
yarn preview
```

## 🎯 Key Features Explained

### Agent Projects Page

**Project List**:
- View all AI-powered projects
- See project titles (not IDs!)
- Task count displayed without expanding
- Token usage tracking per project
- Completed vs Assigned task counts

**Task Management**:
- Expandable project accordions
- Nested task accordions
- Task status indicators (ASSIGNED, COMPLETED)
- Execute button for assigned tasks
- Real-time streaming progress

### Real-Time Streaming

When executing a task:

1. **Blue Box** (Streaming in progress):
   - Live progress indicator
   - Content updates in real-time
   - Markdown renders as it streams
   - Smooth, buffered updates

2. **Gray Box** (Completed):
   - Final formatted result
   - Beautifully rendered Markdown
   - Code blocks with syntax highlighting
   - Token count displayed

### Buffered Streaming Benefits

**Performance Improvements**:
- 50-100x fewer UI re-renders
- 50-100x fewer network messages
- Significantly lower CPU usage
- Better battery life on mobile devices

**User Experience**:
- Smooth, steady updates
- No constant flickering
- Complete words/sentences per update
- Responsive UI during streaming

### Markdown Rendering

The `ContentRenderer` component automatically detects and renders:
- **Headers** (H1-H4) with proper sizing
- **Code blocks** with gray background
- **Inline code** with highlighting
- **Lists** (ordered and unordered)
- **Tables** with borders and styling
- **Blockquotes** with left border
- **Bold**, *italic*, and other formatting

## 📚 Available Scripts

```bash
# Development server with HMR
yarn dev

# Production build
yarn build

# Preview production build
yarn preview

# Type checking (if configured)
yarn type-check

# Linting (if configured)
yarn lint
```

## 🔌 API Integration

### REST API Endpoints

**Projects**:
- `GET /api/agent/projects` - Get all projects with summaries
- `POST /api/agent/projects?projectRequest={title}` - Create new project
- `GET /api/agent/projects/{id}` - Get project details
- `GET /api/agent/projects/{id}/tasks` - Get project tasks

**Tasks**:
- `GET /api/agent/tasks/{id}` - Get task details
- `POST /api/agent/tasks/{id}/execute` - Execute task (blocking)
- `GET /api/agent/tasks/{id}/execute-stream-buffered` - Execute with buffered streaming (SSE)

**Notes**:
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note

### Streaming API

The `streamingApi.ts` uses Server-Sent Events (SSE) for real-time updates:

```typescript
import { executeTaskStream } from './store/api/streamingApi';

executeTaskStream(
  taskId,
  (content) => {
    // Handle each chunk
    dispatch(updateStreamingContent(taskId, content));
  },
  () => {
    // Handle completion
    dispatch(streamComplete(taskId));
  },
  (error) => {
    // Handle errors
    dispatch(streamError(taskId, error));
  }
);
```

## ⚙️ Configuration

### Vite Configuration

The `vite.config.ts` is configured for:
- Output to `../resources/static` for Spring Boot integration
- Asset handling and optimization
- Development proxy to backend (optional)

### Environment Variables

Create a `.env` file:
```env
VITE_API_URL=http://localhost:8080
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🎨 Customization

### Adding New Pages

1. Create page in `src/pages/`:
```typescript
// MyNewPage.tsx
export default function MyNewPage() {
  return <div>My New Page</div>;
}
```

2. Add route in `App.tsx`:
```typescript
<Route path="/my-page" element={<MyNewPage />} />
```

3. Add navigation link in `Layout.tsx`

### Adding New Dependencies

```bash
# Add runtime dependency
yarn add package-name

# Add dev dependency
yarn add -D package-name
```

### Styling

Material-UI styling uses the `sx` prop:
```typescript
<Box sx={{ 
  p: 2, 
  bgcolor: 'primary.main', 
  color: 'white' 
}}>
