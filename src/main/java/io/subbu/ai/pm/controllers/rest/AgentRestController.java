package io.subbu.ai.pm.controllers.rest;

import io.subbu.ai.pm.vos.Project;
import io.subbu.ai.pm.vos.Task;
import io.subbu.ai.pm.services.AgentOrchestrationService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller for the Multi-agent Pattern API
 */
@RestController
@RequestMapping("/api/agent")
public class AgentRestController {

    private final AgentOrchestrationService agentOrchestrationService;

    public AgentRestController(AgentOrchestrationService agentOrchestrationService) {
        this.agentOrchestrationService = agentOrchestrationService;
    }

    /**
     * Process a project request through the multi-agent system
     * Creates a new project with tasks
     *
     * @param projectRequest The project request/title to process
     * @return Project info and list of tasks created
     */
    @PostMapping("/projects")
    public ResponseEntity<Map<String, Object>> createProject(@RequestParam String projectRequest) {
        Map<String, Object> result = agentOrchestrationService.processProjectRequest(projectRequest);
        return ResponseEntity.ok(result);
    }

    /**
     * Get all projects with summary information
     *
     * @return A list of all projects with title and task count
     */
    @GetMapping("/projects")
    public ResponseEntity<List<Map<String, Object>>> getAllProjects() {
        List<Project> projects = agentOrchestrationService.getAllProjects();

        List<Map<String, Object>> projectSummaries = projects.stream()
            .map(project -> {
                List<Task> tasks = agentOrchestrationService.getProjectTasks(project.getId());

                Map<String, Object> summary = new HashMap<>();
                summary.put("projectId", project.getId());
                summary.put("title", project.getTitle());
                summary.put("taskCount", tasks.size());
                summary.put("tokensUsed", project.getTokensUsed());
                summary.put("createdAt", project.getCreatedAt());
                summary.put("updatedAt", project.getUpdatedAt());

                // Calculate task statistics
                long completedCount = tasks.stream()
                    .filter(t -> "COMPLETED".equals(t.getStatus()))
                    .count();
                long assignedCount = tasks.stream()
                    .filter(t -> "ASSIGNED".equals(t.getStatus()))
                    .count();

                summary.put("completedCount", completedCount);
                summary.put("assignedCount", assignedCount);

                return summary;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(projectSummaries);
    }

    /**
     * Get project info by ID
     *
     * @param projectId The ID of the project
     * @return Project information
     */
    @GetMapping("/projects/{projectId}")
    public ResponseEntity<Project> getProject(@PathVariable String projectId) {
        Project project = agentOrchestrationService.getProject(projectId);
        return ResponseEntity.ok(project);
    }

    /**
     * Get project info including title and task count
     *
     * @param projectId The ID of the project
     * @return Project information with task statistics
     */
    @GetMapping("/projects/{projectId}/info")
    public ResponseEntity<Map<String, Object>> getProjectInfo(@PathVariable String projectId) {
        Project project = agentOrchestrationService.getProject(projectId);
        List<Task> tasks = agentOrchestrationService.getProjectTasks(projectId);

        Map<String, Object> info = new HashMap<>();
        info.put("projectId", project.getId());
        info.put("title", project.getTitle());
        info.put("description", tasks.size() + " tasks");
        info.put("taskCount", tasks.size());
        info.put("createdAt", project.getCreatedAt());
        info.put("updatedAt", project.getUpdatedAt());

        if (project.getTokensUsed() != null) {
            info.put("tokensUsed", project.getTokensUsed());
        }

        return ResponseEntity.ok(info);
    }

    /**
     * Get all tasks for a project
     * 
     * @param projectId The ID of the project
     * @return A list of tasks for the project
     */
    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<List<Task>> getProjectTasks(@PathVariable String projectId) {
        List<Task> tasks = agentOrchestrationService.getProjectTasks(projectId);
        return ResponseEntity.ok(tasks);
    }
    
    /**
     * Execute a specific task
     * 
     * @param taskId The ID of the task to execute
     * @return The result of the task execution
     */
    @PostMapping("/tasks/{taskId}/execute")
    public ResponseEntity<Map<String, Object>> executeTask(@PathVariable String taskId) {
        String result = agentOrchestrationService.executeTask(taskId);
        Task task = agentOrchestrationService.getTask(taskId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("taskId", taskId);
        response.put("description", task.getDescription());
        response.put("assignedAgent", task.getAssignedAgent());
        response.put("status", task.getStatus());
        response.put("result", result);

        if (task.getTokensUsed() != null) {
            response.put("tokensUsed", task.getTokensUsed());
        }

        return ResponseEntity.ok(response);
    }
    
    /**
     * Execute a specific task with streaming response
     *
     * @param taskId The ID of the task to execute
     * @return Server-Sent Events stream of response chunks
     */
    @GetMapping(value = "/tasks/{taskId}/execute-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> executeTaskStream(@PathVariable String taskId) {
        return agentOrchestrationService.executeTaskStream(taskId)
                .map(chunk -> ServerSentEvent.<String>builder()
                        .data(chunk)
                        .build())
                .concatWith(Flux.just(ServerSentEvent.<String>builder()
                        .event("complete")
                        .data("DONE")
                        .build()));
    }

    /**
     * Execute a specific task with BUFFERED streaming response (EXPERIMENTAL)
     * This endpoint buffers chunks on the server before streaming to improve UI rendering
     *
     * @param taskId The ID of the task to execute
     * @return Server-Sent Events stream of buffered response chunks
     */
    @GetMapping(value = "/tasks/{taskId}/execute-stream-buffered", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> executeTaskStreamBuffered(@PathVariable String taskId) {
        return agentOrchestrationService.executeTaskStreamBuffered(taskId)
                .map(chunk -> ServerSentEvent.<String>builder()
                        .data(chunk)
                        .build())
                .concatWith(Flux.just(ServerSentEvent.<String>builder()
                        .event("complete")
                        .data("DONE")
                        .build()));
    }

    /**
     * Execute all tasks for a project
     * 
     * @param projectId The ID of the project
     * @return A map of task IDs to execution results
     */
    @PostMapping("/projects/{projectId}/execute-all")
    public ResponseEntity<Map<String, Object>> executeAllProjectTasks(@PathVariable String projectId) {
        Map<String, String> results = agentOrchestrationService.executeAllProjectTasks(projectId);
        List<Task> tasks = agentOrchestrationService.getProjectTasks(projectId);
        
        return ResponseEntity.ok(Map.of(
            "projectId", projectId,
            "tasks", tasks,
            "results", results
        ));
    }
    
    /**
     * Get a specific task
     * 
     * @param taskId The ID of the task
     * @return The task
     */
    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<Task> getTask(@PathVariable String taskId) {
        Task task = agentOrchestrationService.getTask(taskId);
        return ResponseEntity.ok(task);
    }
}
