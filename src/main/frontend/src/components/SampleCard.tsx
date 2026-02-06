import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import {
  DocumentTextIcon,
  CodeBracketIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import MDEditor from '@uiw/react-md-editor';

const sampleContent = `## Welcome to the Project Manager! 🚀

### Quick Start Guide

This application demonstrates a full-stack project with:
- **React** + **TypeScript** for the frontend
- **Redux** + **Redux-Saga** for state management
- **Material-UI** for beautiful components
- **Heroicons** for icons
- **Markdown Editor** for rich text editing

### Code Example

\`\`\`typescript
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}
\`\`\`

### Features
- ✅ Full TypeScript support
- ✅ Redux state management
- ✅ Material-UI components
- ✅ Markdown editing
- ✅ Responsive design

> **Tip**: Try editing notes in the Notes section to see the markdown editor in action!
`;

const SampleCard: React.FC = () => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DocumentTextIcon style={{ width: 32, height: 32, marginRight: 12 }} />
          <Typography variant="h5">
            Sample Component with Markdown
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<CodeBracketIcon style={{ width: 16, height: 16 }} />}
            label="TypeScript"
            color="primary"
            size="small"
            sx={{ mr: 1 }}
          />
          <Chip
            icon={<CheckCircleIcon style={{ width: 16, height: 16 }} />}
            label="Redux-Saga"
            color="success"
            size="small"
            sx={{ mr: 1 }}
          />
          <Chip
            icon={<DocumentTextIcon style={{ width: 16, height: 16 }} />}
            label="Markdown"
            color="secondary"
            size="small"
          />
        </Box>

        <MDEditor.Markdown source={sampleContent} />
      </CardContent>
    </Card>
  );
};

export default SampleCard;
