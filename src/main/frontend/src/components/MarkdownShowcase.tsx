import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import MDEditor from '@uiw/react-md-editor';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`markdown-tabpanel-${index}`}
      aria-labelledby={`markdown-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const MarkdownShowcase: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [simpleMarkdown, setSimpleMarkdown] = useState(`# Simple Markdown Editor

This is a **simple** markdown editor with basic formatting.

## Features
- **Bold** and *italic* text
- Lists and checkboxes
- Code blocks
- And more!

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`
`);

  const [documentationMarkdown, setDocumentationMarkdown] = useState(`# Project Documentation

## Overview
This project uses **Spring Boot** for the backend and **React** for the frontend.

## Architecture

### Backend
- Spring Boot 4.0.2
- PostgreSQL Database
- Spring AI Integration

### Frontend
- React 18 with TypeScript
- Redux for state management
- Redux-Saga for side effects
- Material-UI for components
- Vite as build tool

## API Endpoints

### Projects
- \`GET /api/projects\` - Fetch all projects
- \`POST /api/projects\` - Create a new project
- \`PUT /api/projects/{id}\` - Update a project
- \`DELETE /api/projects/{id}\` - Delete a project

### Notes
- \`GET /api/notes\` - Fetch all notes
- \`POST /api/notes\` - Create a new note
- \`PUT /api/notes/{id}\` - Update a note
- \`DELETE /api/notes/{id}\` - Delete a note

## Getting Started

1. Install dependencies
\`\`\`bash
# Backend
mvn clean install

# Frontend
cd src/main/frontend
yarn install
\`\`\`

2. Run the application
\`\`\`bash
# Backend
mvn spring-boot:run

# Frontend (development)
yarn dev
\`\`\`

## Notes
> This is a sample documentation using the markdown editor. You can customize it to fit your project needs.
`);

  const [taskListMarkdown, setTaskListMarkdown] = useState(`# Task List

## Today's Tasks
- [x] Setup React frontend with Vite
- [x] Configure Redux and Redux-Saga
- [x] Implement Material-UI components
- [ ] Add authentication
- [ ] Implement real-time updates
- [ ] Write unit tests

## Backend Tasks
- [x] Setup Spring Boot project
- [x] Configure PostgreSQL
- [ ] Implement REST API
- [ ] Add Spring Security
- [ ] Setup CI/CD pipeline

## Documentation
- [x] Create README
- [ ] API documentation
- [ ] User guide
- [ ] Deployment guide

---

**Priority**: High
**Due Date**: End of Sprint
`);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Markdown Editor Showcase
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          This component demonstrates different use cases of the markdown editor
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Simple Editor" />
            <Tab label="Documentation" />
            <Tab label="Task List" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <MDEditor
            value={simpleMarkdown}
            onChange={(val) => setSimpleMarkdown(val || '')}
            height={500}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <MDEditor
            value={documentationMarkdown}
            onChange={(val) => setDocumentationMarkdown(val || '')}
            height={500}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <MDEditor
            value={taskListMarkdown}
            onChange={(val) => setTaskListMarkdown(val || '')}
            height={500}
          />
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default MarkdownShowcase;
