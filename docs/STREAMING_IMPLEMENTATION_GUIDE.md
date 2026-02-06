# Streaming Implementation Guide - Quick Start

**Date**: February 5, 2026  
**Status**: Ready to implement when needed  

---

## Quick Implementation (Minimum Viable Streaming)

This guide shows the **simplest** way to add streaming to your application.

---

## Option 1: Server-Sent Events (SSE) - Recommended

SSE is simpler than WebSocket and perfect for one-way streaming.

### Step 1: Add Streaming Endpoint

Create new REST endpoint for streaming:

```java
// AgentRestController.java

@GetMapping(value = "/tasks/{taskId}/execute-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<String>> executeTaskStream(@PathVariable String taskId) {
    TaskEntity entity = taskRepository.findById(taskId)
            .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));
    
    Task task = taskMapper.toVO(entity);
    
    if (!"ASSIGNED".equals(task.getStatus())) {
        return Flux.error(new IllegalStateException("Task is not in ASSIGNED state"));
    }
    
    // Get streaming response from agent
    Flux<String> contentStream = switch (task.getAssignedAgent()) {
        case "DevOps Engineer" -> devOpsEngineerAgent.executeTaskStream(task);
        case "Technical Lead" -> technicalLeadAgent.executeTaskStream(task);
        case "Software Engineer" -> softwareEngineerAgent.executeTaskStream(task);
        default -> Flux.error(new IllegalStateException("Unknown agent type"));
    };
    
    return contentStream
            .map(chunk -> ServerSentEvent.<String>builder()
                    .data(chunk)
                    .build());
}
```

### Step 2: Update Agent to Support Streaming

```java
// DevOpsEngineerAgent.java

/**
 * Execute task with streaming response
 */
public Flux<String> executeTaskStream(Task task) {
    Message systemMessage = new SystemPromptTemplate(SYSTEM_PROMPT).createMessage();
    Message userMessage = new UserMessage(
        "Please execute the following DevOps task:\n\n" + 
        "Task: " + task.getDescription() + 
        "\n\nProvide a detailed solution with specific steps, tools, and configurations."
    );
    
    Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
    
    // Stream the response
    return chatClient.prompt(prompt)
            .stream()
            .chatResponse()
            .map(response -> {
                if (response.getResult() != null && 
                    response.getResult().getOutput() != null) {
                    return response.getResult().getOutput().getText();
                }
                return "";
            })
            .filter(text -> !text.isEmpty());
}
```

### Step 3: Frontend EventSource Client

```typescript
// src/store/sagas/agentSaga.ts

function* executeTaskStream(action: { type: string; payload: string }) {
  const taskId = action.payload;
  
  try {
    const eventSource = new EventSource(
      `${API_BASE_URL}/tasks/${taskId}/execute-stream`
    );
    
    let fullContent = '';
    
    eventSource.onmessage = (event) => {
      fullContent += event.data;
      
      // Update Redux state with progressive content
      yield put({
        type: 'UPDATE_TASK_STREAM_CONTENT',
        payload: {
          taskId,
          content: fullContent
        }
      });
    };
    
    eventSource.onerror = () => {
      eventSource.close();
      yield put(executeTaskSuccess({
        taskId,
        status: 'COMPLETED',
        result: fullContent
      }));
    };
    
  } catch (error: any) {
    yield put(executeTaskFailure(error.message));
  }
}
```

### Step 4: Update React Component

```typescript
// AgentProjects.tsx

const [streamingContent, setStreamingContent] = useState<Record<string, string>>({});
const [isStreaming, setIsStreaming] = useState<Record<string, boolean>>({});

const handleExecuteTask = (taskId: string) => {
  setIsStreaming(prev => ({ ...prev, [taskId]: true }));
  setStreamingContent(prev => ({ ...prev, [taskId]: '' }));
  
  const eventSource = new EventSource(
    `http://localhost:8080/api/agent/tasks/${taskId}/execute-stream`
  );
  
  eventSource.onmessage = (event) => {
    setStreamingContent(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || '') + event.data
    }));
  };
  
  eventSource.onerror = () => {
    eventSource.close();
    setIsStreaming(prev => ({ ...prev, [taskId]: false }));
    // Trigger final update
    dispatch(executeTaskSuccess({
      taskId,
      status: 'COMPLETED',
      result: streamingContent[taskId]
    }));
  };
};

// In the render:
{isStreaming[task.id] ? (
  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
    <Typography variant="caption" color="textSecondary">
      Streaming response...
    </Typography>
    <ContentRenderer content={streamingContent[task.id] || ''} />
  </Box>
) : task.result && (
  <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
    <ContentRenderer content={task.result} />
  </Box>
)}
```

---

## Option 2: Simple Polling (Easiest - No Streaming)

If streaming is too complex, use simple polling:

### Backend: Store Progressive Updates

```java
// Cache partial results
private final Map<String, String> taskProgressCache = new ConcurrentHashMap<>();

@GetMapping("/tasks/{taskId}/progress")
public ResponseEntity<Map<String, Object>> getTaskProgress(@PathVariable String taskId) {
    String progress = taskProgressCache.getOrDefault(taskId, "");
    return ResponseEntity.ok(Map.of("content", progress));
}
```

### Frontend: Poll Every Second

```typescript
const pollTaskProgress = async (taskId: string) => {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/agent/tasks/${taskId}/progress`);
    const data = await response.json();
    
    setStreamingContent(prev => ({
      ...prev,
      [taskId]: data.content
    }));
    
    if (data.completed) {
      clearInterval(interval);
    }
  }, 1000);
};
```

---

## Configuration for Streaming

### Enable Streaming in application.yaml

```yaml
spring:
  ai:
    openai:
      chat:
        options:
          stream: true  # Enable streaming responses
```

### CORS Configuration (if needed)

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .exposedHeaders("*");
    }
}
```

---

## Testing Streaming

### Test Endpoint (Simple)

```java
@GetMapping(value = "/test/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<String>> testStream() {
    return Flux.interval(Duration.ofSeconds(1))
            .take(10)
            .map(i -> ServerSentEvent.<String>builder()
                    .data("Message " + i)
                    .build());
}
```

### Test in Browser

```javascript
// Open browser console
const es = new EventSource('http://localhost:8080/api/test/stream');
es.onmessage = (e) => console.log(e.data);
```

---

## Effort Estimation

### SSE Implementation
- Backend: 4 hours
- Frontend: 3 hours
- Testing: 2 hours
- **Total**: 1 day

### WebSocket Implementation
- Backend: 8 hours
- Frontend: 6 hours
- Testing: 4 hours
- **Total**: 2-3 days

### Polling Implementation
- Backend: 2 hours
- Frontend: 2 hours
- Testing: 1 hour
- **Total**: 0.5 day

---

## Recommendation

**Phase 1** (Now): Fix max-tokens (DONE ✅)

**Phase 2** (Next week): Implement SSE streaming
- Better UX
- Real-time feedback
- Not too complex

**Phase 3** (Future): Add token counting for streaming
- Track tokens in real-time
- Show progressive cost

---

**Ready to implement when you need it!** 🚀
