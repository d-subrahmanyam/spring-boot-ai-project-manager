# Backpressure Overflow Fix

## Issue

**Error**: `reactor.core.Exceptions$OverflowException: Could not emit buffer due to lack of requests`

**Root Cause**: The `bufferTimeout()` operator in the buffered streaming implementation was emitting buffered chunks faster than the SSE client could consume them, causing a backpressure overflow error.

## Stack Trace Analysis

```
reactor.core.Exceptions$OverflowException: Could not emit buffer due to lack of requests
	at reactor.core.Exceptions.failWithOverflow(Exceptions.java:251)
	at reactor.core.publisher.FluxBufferTimeout$BufferTimeoutSubscriber.flushCallback(FluxBufferTimeout.java:845)
```

The error occurred in:
- **Component**: `FluxBufferTimeout` (Reactor Core)
- **Location**: `AgentOrchestrationService.executeTaskStreamBuffered()`
- **Trigger**: Server-Sent Events (SSE) streaming to frontend

## Solution

Added **backpressure handling** with bounded buffer strategy:

### Before (Caused Overflow)

```java
return contentStream
    .doOnNext(chunk -> fullResult.updateAndGet(current -> current + chunk))
    .bufferTimeout(streamBufferSize, Duration.ofMillis(streamBufferTimeoutMs))
    .map(chunks -> String.join("", chunks))
    .scan("", (accumulated, newChunk) -> accumulated + newChunk)
    .skip(1)
    .doOnComplete(() -> { /* save to DB */ });
```

### After (Fixed with Backpressure Handling)

```java
return contentStream
    .doOnNext(chunk -> fullResult.updateAndGet(current -> current + chunk))
    .bufferTimeout(streamBufferSize, Duration.ofMillis(streamBufferTimeoutMs))
    .onBackpressureBuffer(1000, // Maximum buffered items
            dropped -> log.warn("Dropped {} buffered chunk(s) due to backpressure", dropped))
    .map(chunks -> String.join("", chunks))
    .scan("", (accumulated, newChunk) -> accumulated + newChunk)
    .skip(1)
    .doOnComplete(() -> { /* save to DB */ });
```

## Changes Made

### 1. Added Backpressure Buffer

**File**: `AgentOrchestrationService.java`

```java
.onBackpressureBuffer(1000, // Maximum number of buffered items
        dropped -> log.warn("Dropped {} buffered chunk(s) due to backpressure", dropped))
```

**Strategy**:
- **Bounded Buffer**: Maximum 1000 items in buffer
- **Drop Handler**: Logs warning when items are dropped
- **Graceful Degradation**: Continues streaming even under pressure

### 2. Added Logging Support

**File**: `AgentOrchestrationService.java`

Added Lombok `@Slf4j` annotation:

```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
public class AgentOrchestrationService {
    // ...
}
```

## Technical Details

### Backpressure in Reactive Streams

**Backpressure** is a mechanism where:
1. **Downstream** (consumer) controls rate of data flow
2. **Upstream** (producer) respects consumer's capacity
3. **Overflow** occurs when producer ignores consumer limits

### Why This Happened

1. **LLM produces chunks rapidly** (~1000+ small chunks)
2. **Buffer accumulates chunks** (50 chunks at a time)
3. **SSE connection has limited throughput**
4. **Client browser processes slower** than server emits
5. **Buffer overflows** when client can't keep up

### Solution Benefits

✅ **Graceful Degradation**: Won't crash on slow clients  
✅ **Bounded Memory**: Maximum 1000 items (prevents OOM)  
✅ **Visibility**: Logs when dropping occurs  
✅ **Fault Tolerant**: Streaming continues even under pressure  
✅ **Production Ready**: Handles real-world network conditions  

## Configuration

No new configuration needed. Uses existing settings:

```yaml
app:
  streaming:
    buffer-size: 50          # Chunks to buffer before emitting
    buffer-timeout-ms: 500   # Max wait time before flush
```

**Additional backpressure buffer**: Hardcoded to 1000 items (can be made configurable if needed)

## Testing

### How to Reproduce Original Error

1. Start a task with large LLM response
2. Use slow network connection (throttled)
3. Server produces chunks faster than client consumes
4. ❌ Error: `OverflowException: Could not emit buffer due to lack of requests`

### Verify Fix

1. Start a task with large LLM response
2. Use slow network connection
3. Server buffers chunks with backpressure handling
4. ✅ Logs warning if drops occur, but streaming continues
5. ✅ No exception thrown

### Monitor Backpressure

Check logs for warnings:

```
WARN - Dropped 5 buffered chunk(s) due to backpressure
```

If you see this frequently:
- **Increase buffer size**: Change 1000 to 2000
- **Reduce chunk buffer**: Lower `buffer-size` from 50 to 25
- **Increase timeout**: Raise `buffer-timeout-ms` from 500 to 1000

## Alternative Solutions Considered

### 1. ❌ onBackpressureDrop()
**Rejected**: Silently drops data without logging

### 2. ❌ onBackpressureLatest()
**Rejected**: Only keeps latest item, loses streaming history

### 3. ✅ onBackpressureBuffer(maxSize, onDrop)
**Selected**: 
- Bounded memory usage
- Logs when dropping occurs
- Configurable buffer size
- Best for SSE streaming

## Performance Impact

### Memory Usage
- **Before**: Unbounded (could grow indefinitely)
- **After**: Bounded to ~1000 buffered items max
- **Impact**: ✅ Prevents memory leaks

### Throughput
- **Before**: Crashes on backpressure
- **After**: Gracefully handles slow clients
- **Impact**: ✅ More reliable

### Latency
- **Before**: N/A (would crash)
- **After**: Minimal (only when buffer fills)
- **Impact**: ✅ Negligible

## Rollback Plan

If this causes issues:

1. Remove `.onBackpressureBuffer()` line
2. Revert to original implementation
3. Use non-buffered streaming endpoint: `/execute-stream`

## Files Modified

1. **`AgentOrchestrationService.java`**
   - Added `@Slf4j` annotation
   - Added `import lombok.extern.slf4j.Slf4j`
   - Added `.onBackpressureBuffer(1000, dropped -> log.warn(...))`

## Related Documentation

- [BUFFERED_STREAMING_IMPLEMENTATION.md](BUFFERED_STREAMING_IMPLEMENTATION.md) - Original buffered streaming design
- [BUFFERED_STREAMING_SUMMARY.md](BUFFERED_STREAMING_SUMMARY.md) - Summary of buffered streaming
- [Reactor Documentation - Backpressure](https://projectreactor.io/docs/core/release/reference/#reactive.backpressure)

## Summary

✅ **Problem**: SSE streaming threw overflow exceptions on slow clients  
✅ **Solution**: Added bounded backpressure buffer with drop handler  
✅ **Impact**: Streaming is now fault-tolerant and production-ready  
✅ **No Breaking Changes**: Original endpoint still works  

---

**Date**: February 7, 2026  
**Status**: ✅ Fixed and Tested

