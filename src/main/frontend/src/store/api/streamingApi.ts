import { API_BASE_URL } from './index';

/**
 * Execute a task with BUFFERED streaming response using Server-Sent Events
 * Uses server-side buffering for improved UI rendering performance
 *
 * @param taskId The ID of the task to execute
 * @param onChunk Callback function called for each chunk of data
 * @param onComplete Callback function called when streaming is complete
 * @param onError Callback function called on error
 * @returns EventSource instance (can be used to abort)
 */
export const executeTaskStream = (
  taskId: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): EventSource => {
  const eventSource = new EventSource(
    `${API_BASE_URL}/tasks/${taskId}/execute-stream-buffered`
  );

  eventSource.onmessage = (event) => {
    const chunk = event.data;
    // Server sends accumulated content with buffering
    // No need to accumulate on client side
    onChunk(chunk);
  };

  eventSource.addEventListener('complete', () => {
    eventSource.close();
    onComplete();
  });

  eventSource.onerror = () => {
    eventSource.close();
    onError(new Error('Stream connection error'));
  };

  return eventSource;
};
