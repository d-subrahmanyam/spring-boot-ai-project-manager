# LLM Response Truncation & Streaming Investigation

**Date**: February 5, 2026  
**Model**: mistralai/devstral-small-2-2512  
**Issues**: Response truncation, No streaming support  

---

## Issue 1: Truncated Responses

### Current Configuration

**application.yaml**:
```yaml
spring:
  ai:
    openai:
      chat:
        options:
          max-tokens: 2048  # ⚠️ Current limit
```

### Analysis

#### What is max-tokens?

`max-tokens` controls the **maximum number of tokens in the completion** (response), NOT the input. This is a hard limit set by the API configuration.

- **Current setting**: 2048 tokens
- **Typical token-to-word ratio**: ~0.75 (1 token ≈ 0.75 words)
- **Approximate word limit**: ~1500 words
- **Approximate character limit**: ~8000 characters

#### Why Responses Get Truncated

1. **LLM generates longer response than max-tokens**
   - Model wants to provide complete answer
   - Hits 2048 token limit mid-sentence
   - Response is cut off abruptly

2. **Model attempts comprehensive answers**
   - Technical tasks need detailed explanations
   - Code examples, configurations, documentation
   - Easily exceeds 2048 tokens

3. **No graceful stopping mechanism**
   - Model doesn't know it's near limit
   - Doesn't summarize or conclude properly
   - Just stops when limit reached

### Solution: Increase max-tokens

#### Recommended Settings by Task Type

**Option 1: Conservative (Current)**
```yaml
max-tokens: 2048  # ~1500 words - May truncate complex responses
```

**Option 2: Moderate (Recommended)**
```yaml
max-tokens: 4096  # ~3000 words - Good for most tasks
```

**Option 3: Large (For Complex Tasks)**
```yaml
max-tokens: 8192  # ~6000 words - Comprehensive responses
```

**Option 4: Maximum (Devstral-Small)**
```yaml
max-tokens: 16384  # ~12000 words - Full model capacity
```

#### Model-Specific Limits

**Devstral-Small-2-2512**:
- Model name suggests: **2512 tokens context window** (input + output)
- ⚠️ This means your current setting might be TOO HIGH!
- If context is 2512 tokens total:
  - Input (prompt): ~500 tokens
  - Output (response): Should be max **~2000 tokens**

**Actual Devstral Specifications**:
Based on the model name pattern, this appears to be a smaller variant with limited context.

---

## Issue 2: Streaming Responses

### What is Streaming?

**Non-Streaming (Current)**:
```
User clicks "Execute Task"
  ↓
[Wait 30-60 seconds...]
  ↓
Complete response appears all at once
```

**Streaming (Desired)**:
```
User clicks "Execute Task"
  ↓
First words appear immediately
  ↓
Words stream in real-time
  ↓
Complete response built progressively
```

### Model Support for Streaming

#### Devstral-Small-2-2512

Based on the model being served via **LM Studio** (localhost:1234), streaming support depends on:

1. **LM Studio Configuration**
   - LM Studio supports streaming for OpenAI-compatible endpoints
   - Should support Server-Sent Events (SSE)

2. **Model Compatibility**
   - Devstral (Mistral-based) supports streaming
   - LM Studio wraps it with OpenAI API

3. **Current Setting**
```yaml
stream-usage: true  # ✅ Already enabled for usage tracking
```

**However**, this only streams **usage metadata**, not the actual response content!

### Spring AI Streaming Support

#### Current Implementation (Non-Streaming)

```java
// ProjectManagerAgent.java
ChatResponse response = chatClient.prompt(prompt).call().chatResponse();
String content = response.getResult().getOutput().getText();
```

This uses `.call()` which is **blocking** - waits for complete response.

#### Streaming Implementation (Needed)

```java
// Use .stream() instead of .call()
Flux<ChatResponse> streamResponse = chatClient.prompt(prompt).stream().chatResponse();

streamResponse.subscribe(
    chunk -> {
        // Send each chunk to UI via WebSocket or SSE
        String partialContent = chunk.getResult().getOutput().getText();
        sendToUI(partialContent);
    },
    error -> handleError(error),
    () -> handleComplete()
);
```

---

## Recommended Solutions

### Solution 1: Fix Truncation (Immediate)

**Update application.yaml**:

```yaml
spring:
  ai:
    openai:
      chat:
        options:
          temperature: 0.7
          max-tokens: 2000  # ⬇️ Reduced from 2048 (safer for 2512 context)
          model: mistralai/devstral-small-2-2512
          stream-usage: true
```

**Why 2000?**
- Model context: 2512 tokens
- Input prompt: ~300-500 tokens
- Output: 2000 tokens (leaves buffer)
- Prevents context overflow errors

**For longer responses, use a different model with larger context window.**

### Solution 2: Implement Streaming (Advanced)

This requires significant changes to support real-time streaming to the UI.

#### Backend Changes Needed

1. **Change from blocking to reactive**
2. **Add WebSocket or SSE support**
3. **Modify agent methods to return Flux**
4. **Stream chunks to frontend**

#### Frontend Changes Needed

1. **WebSocket or EventSource client**
2. **Progressive UI updates**
3. **Handle partial content**
4. **Loading indicators**

---

## Detailed Implementation for Streaming

### Step 1: Add WebSocket Support

**pom.xml**:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### Step 2: WebSocket Configuration

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(taskStreamHandler(), "/ws/task-stream")
                .setAllowedOrigins("*");
    }
    
    @Bean
    public WebSocketHandler taskStreamHandler() {
        return new TaskStreamHandler();
    }
}
```

### Step 3: Update Agent to Stream

```java
// DevOpsEngineerAgent.java
public Flux<String> executeTaskStream(Task task) {
    Message systemMessage = new SystemPromptTemplate(SYSTEM_PROMPT).createMessage();
    Message userMessage = new UserMessage("...");
    
    Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
    
    // Stream response
    return chatClient.prompt(prompt)
            .stream()
            .chatResponse()
            .map(response -> response.getResult().getOutput().getText());
}
```

### Step 4: WebSocket Handler

```java
public class TaskStreamHandler extends TextWebSocketHandler {
    
    @Autowired
    private DevOpsEngineerAgent devOpsAgent;
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String taskId = message.getPayload();
        
        // Get task and execute
        devOpsAgent.executeTaskStream(task)
            .subscribe(
                chunk -> {
                    try {
                        session.sendMessage(new TextMessage(chunk));
                    } catch (IOException e) {
                        // Handle error
                    }
                },
                error -> {
                    // Handle error
                },
                () -> {
                    try {
                        session.sendMessage(new TextMessage("[DONE]"));
                        session.close();
                    } catch (IOException e) {
                        // Handle error
                    }
                }
            );
    }
}
```

### Step 5: Frontend WebSocket Client

```typescript
// taskStreamingService.ts
export const streamTaskExecution = (taskId: string, onChunk: (text: string) => void) => {
  const ws = new WebSocket('ws://localhost:8080/ws/task-stream');
  
  ws.onopen = () => {
    ws.send(taskId);
  };
  
  ws.onmessage = (event) => {
    if (event.data === '[DONE]') {
      ws.close();
    } else {
      onChunk(event.data);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return ws;
};
```

### Step 6: Update UI Component

```typescript
// AgentProjects.tsx
const [streamingContent, setStreamingContent] = useState<Record<string, string>>({});

const handleExecuteTaskWithStream = (taskId: string) => {
  setStreamingContent(prev => ({ ...prev, [taskId]: '' }));
  
  streamTaskExecution(taskId, (chunk) => {
    setStreamingContent(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || '') + chunk
    }));
  });
};
```

---

## Comparison: Current vs Streaming

### Current (Blocking)

**Pros**:
- ✅ Simple implementation
- ✅ Easy to test
- ✅ Atomic transactions
- ✅ Complete response guaranteed

**Cons**:
- ❌ Long wait times (30-60 seconds)
- ❌ No progress indication
- ❌ Poor user experience
- ❌ Appears frozen/stuck

### Streaming (Reactive)

**Pros**:
- ✅ Immediate feedback
- ✅ Progressive content
- ✅ Better UX
- ✅ Visible progress

**Cons**:
- ❌ Complex implementation
- ❌ Error handling harder
- ❌ Requires WebSocket/SSE
- ❌ Partial content handling

---

## Immediate Action Items

### Priority 1: Fix Truncation (Easy)

**Action**: Update `max-tokens` in application.yaml

```yaml
max-tokens: 2000  # Down from 2048
```

**Impact**:
- Prevents context overflow
- More reliable responses
- Still allows detailed answers

**Effort**: 1 minute  
**Risk**: Low

### Priority 2: Investigate Model Limits

**Action**: Check actual Devstral-Small-2-2512 specifications

1. Check LM Studio model details
2. Verify actual context window
3. Test with different max-tokens values

**Effort**: 15 minutes  
**Risk**: Low

### Priority 3: Test with Larger Model (Optional)

If Devstral-Small is too limited:

**Alternative Models** (via LM Studio):
- `mistralai/Mistral-7B-Instruct-v0.2` (8192 context)
- `mistralai/Mixtral-8x7B-Instruct-v0.1` (32768 context)
- `meta-llama/Llama-3-8B-Instruct` (8192 context)

### Priority 4: Implement Streaming (Future)

**Phases**:
1. PoC with single agent (2-3 days)
2. Full implementation (1 week)
3. Testing & refinement (3-5 days)

**Total Effort**: 2-3 weeks  
**Risk**: Medium

---

## Testing Plan

### Test 1: Verify Current Truncation

```bash
# Execute a task and check if response is truncated
curl -X POST http://localhost:8080/api/agent/tasks/{taskId}/execute

# Check response length
# Look for incomplete sentences at the end
```

### Test 2: max-tokens Impact

```yaml
# Test 1: max-tokens: 1000
# Test 2: max-tokens: 2000
# Test 3: max-tokens: 4000

# Compare:
# - Response completeness
# - Token usage
# - Any errors
```

### Test 3: Streaming PoC

```java
// Simple test endpoint
@GetMapping("/test-stream")
public Flux<String> testStream() {
    return chatClient.prompt("Tell me a long story")
            .stream()
            .chatResponse()
            .map(r -> r.getResult().getOutput().getText());
}
```

---

## Recommendations

### Immediate (Today)

1. **Change max-tokens to 2000**
   - Safer for 2512 context window
   - Prevents overflow errors
   - Still allows detailed responses

2. **Monitor LM Studio logs**
   - Check for truncation warnings
   - Verify actual context usage

### Short-term (This Week)

1. **Test different max-tokens values**
   - 1500, 2000, 2500
   - Find optimal setting

2. **Document model limitations**
   - Actual context window
   - Performance characteristics

### Long-term (Next Sprint)

1. **Implement streaming**
   - Better user experience
   - Real-time feedback
   - Progressive content loading

2. **Add model selection**
   - Let users choose model
   - Different models for different tasks
   - Balance speed vs quality

---

## Configuration Changes

### Recommended Update

```yaml
spring:
  ai:
    openai:
      base-url: http://localhost:1234
      api-key: lm-studio
      chat:
        options:
          temperature: 0.7
          max-tokens: 2000  # ⬇️ Reduced from 2048
          model: mistralai/devstral-small-2-2512
          stream-usage: true
          # Future: enable content streaming
          # stream: true
```

### For Streaming (Future)

```yaml
spring:
  ai:
    openai:
      chat:
        options:
          stream: true  # Enable response streaming
```

---

## Summary

### Truncation Issue

**Cause**: max-tokens (2048) may exceed model's context window (2512)  
**Solution**: Reduce to 2000 tokens  
**Impact**: More reliable, complete responses

### Streaming Support

**Status**: Model supports streaming via LM Studio  
**Current**: Not implemented (blocking calls)  
**Effort**: 2-3 weeks for full implementation  
**Priority**: Medium (UX improvement, not critical)

---

**Next Steps**:
1. Update max-tokens to 2000
2. Test and verify responses are complete
3. Plan streaming implementation for future sprint
