import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Typography } from '@mui/material';

interface ContentRendererProps {
  content: string;
}

/**
 * Detects if content is HTML or Markdown and renders appropriately
 */
const ContentRenderer: React.FC<ContentRendererProps> = ({ content }) => {
  if (!content) return null;

  // Check if content contains HTML tags
  const isHTML = /<\/?[a-z][\s\S]*>/i.test(content);

  if (isHTML) {
    // Render as HTML
    return (
      <Box
        dangerouslySetInnerHTML={{ __html: content }}
        sx={{
          '& pre': {
            backgroundColor: '#f5f5f5',
            padding: 2,
            borderRadius: 1,
            overflow: 'auto',
          },
          '& code': {
            backgroundColor: '#f5f5f5',
            padding: '2px 4px',
            borderRadius: '4px',
            fontFamily: 'monospace',
          },
          '& h1, & h2, & h3, & h4': {
            marginTop: 2,
            marginBottom: 1,
          },
          '& ul, & ol': {
            paddingLeft: 3,
          },
        }}
      />
    );
  }

  // Render as Markdown
  return (
    <Box
      sx={{
        '& h1': {
          fontSize: '2rem',
          fontWeight: 'bold',
          marginTop: 2,
          marginBottom: 1,
        },
        '& h2': {
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginTop: 2,
          marginBottom: 1,
        },
        '& h3': {
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginTop: 1.5,
          marginBottom: 0.75,
        },
        '& h4': {
          fontSize: '1.1rem',
          fontWeight: 'bold',
          marginTop: 1.5,
          marginBottom: 0.75,
        },
        '& pre': {
          backgroundColor: '#f5f5f5',
          padding: 2,
          borderRadius: 1,
          overflow: 'auto',
          fontFamily: 'monospace',
        },
        '& code': {
          backgroundColor: '#f5f5f5',
          padding: '2px 4px',
          borderRadius: '4px',
          fontFamily: 'monospace',
        },
        '& pre code': {
          backgroundColor: 'transparent',
          padding: 0,
        },
        '& ul, & ol': {
          paddingLeft: 3,
          marginTop: 1,
          marginBottom: 1,
        },
        '& li': {
          marginBottom: 0.5,
        },
        '& p': {
          marginTop: 1,
          marginBottom: 1,
        },
        '& table': {
          borderCollapse: 'collapse',
          width: '100%',
          marginTop: 1,
          marginBottom: 1,
        },
        '& th, & td': {
          border: '1px solid #ddd',
          padding: 1,
          textAlign: 'left',
        },
        '& th': {
          backgroundColor: '#f5f5f5',
          fontWeight: 'bold',
        },
        '& blockquote': {
          borderLeft: '4px solid #ddd',
          paddingLeft: 2,
          marginLeft: 0,
          color: '#666',
        },
        '& hr': {
          border: 'none',
          borderTop: '1px solid #ddd',
          marginTop: 2,
          marginBottom: 2,
        },
        '& strong': {
          fontWeight: 'bold',
        },
        '& em': {
          fontStyle: 'italic',
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Ensure proper paragraph rendering
          p: ({ children }) => (
            <Typography variant="body1" component="p" paragraph>
              {children}
            </Typography>
          ),
          // Ensure proper heading rendering
          h1: ({ children }) => (
            <Typography variant="h4" component="h1" gutterBottom>
              {children}
            </Typography>
          ),
          h2: ({ children }) => (
            <Typography variant="h5" component="h2" gutterBottom>
              {children}
            </Typography>
          ),
          h3: ({ children }) => (
            <Typography variant="h6" component="h3" gutterBottom>
              {children}
            </Typography>
          ),
          h4: ({ children }) => (
            <Typography variant="subtitle1" component="h4" gutterBottom>
              {children}
            </Typography>
          ),
          h5: ({ children }) => (
            <Typography variant="subtitle2" component="h5" gutterBottom>
              {children}
            </Typography>
          ),
          h6: ({ children }) => (
            <Typography variant="body1" component="h6" gutterBottom>
              {children}
            </Typography>
          ),
          div: ({ children }) => <Box>{children}</Box>,
          span: ({ children }) => <Box component="span">{children}</Box>,
          pre: ({ children }) => (
            <Box
              component="pre"
              sx={{
                backgroundColor: '#f5f5f5',
                padding: 2,
                borderRadius: 1,
                overflow: 'auto',
                fontFamily: 'monospace',
              }}
            >
              {children}
            </Box>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default ContentRenderer;
