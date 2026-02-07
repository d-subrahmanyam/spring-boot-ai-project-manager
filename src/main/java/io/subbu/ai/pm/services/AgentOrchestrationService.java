package io.subbu.ai.pm.services;

import io.subbu.ai.pm.agents.DevOpsEngineerAgent;
import io.subbu.ai.pm.agents.ProjectManagerAgent;
import io.subbu.ai.pm.agents.SoftwareEngineerAgent;
import io.subbu.ai.pm.agents.TechnicalLeadAgent;
import io.subbu.ai.pm.mappers.ProjectMapper;
import io.subbu.ai.pm.mappers.TaskMapper;
import io.subbu.ai.pm.models.ProjectEntity;
import io.subbu.ai.pm.models.TaskEntity;
import io.subbu.ai.pm.repos.ProjectRepository;
import io.subbu.ai.pm.repos.TaskRepository;
import io.subbu.ai.pm.vos.Project;
import io.subbu.ai.pm.vos.Task;
import io.subbu.ai.pm.vos.TaskExecutionResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Service that orchestrates the multi-agent system
 * Now uses JPA repository for persistent storage with Project entity
 */
@Slf4j
@Service
@Transactional
public class AgentOrchestrationService {

    private final ProjectManagerAgent projectManagerAgent;
    private final DevOpsEngineerAgent devOpsEngineerAgent;
    private final TechnicalLeadAgent technicalLeadAgent;
    private final SoftwareEngineerAgent softwareEngineerAgent;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ProjectMapper projectMapper;
    private final TaskMapper taskMapper;

    @Value("${app.streaming.buffer-size:50}")
    private int streamBufferSize;

    @Value("${app.streaming.buffer-timeout-ms:500}")
    private long streamBufferTimeoutMs;

    public AgentOrchestrationService(
            ProjectManagerAgent projectManagerAgent,
            DevOpsEngineerAgent devOpsEngineerAgent,
            TechnicalLeadAgent technicalLeadAgent,
            SoftwareEngineerAgent softwareEngineerAgent,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            ProjectMapper projectMapper,
            TaskMapper taskMapper) {
        this.projectManagerAgent = projectManagerAgent;
        this.devOpsEngineerAgent = devOpsEngineerAgent;
        this.technicalLeadAgent = technicalLeadAgent;
        this.softwareEngineerAgent = softwareEngineerAgent;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.projectMapper = projectMapper;
        this.taskMapper = taskMapper;
    }

    /**
     * Process a project request through the multi-agent system
     * Creates a new project and associated tasks
     *
     * @param projectTitle The title/description of the project
     * @return A map containing project info and tasks
     */
    public Map<String, Object> processProjectRequest(String projectTitle) {
        // Step 1: Create and save the project
        ProjectEntity projectEntity = ProjectEntity.builder()
                .title(projectTitle)
                .build();
        projectEntity = projectRepository.save(projectEntity);

        // Step 2: Project Manager analyzes the request and breaks it down into tasks
        Map<String, Object> analysisResult = projectManagerAgent.analyzeProjectRequest(projectTitle);
        @SuppressWarnings("unchecked")
        List<String> taskDescriptions = (List<String>) analysisResult.get("tasks");
        Integer tokensUsed = (Integer) analysisResult.get("tokensUsed");

        // Store token usage in project
        projectEntity.setTokensUsed(tokensUsed);
        projectEntity = projectRepository.save(projectEntity);

        // Step 3: Create task objects and save them to the database
        List<Task> projectTaskList = new ArrayList<>();
        for (String description : taskDescriptions) {
            String taskId = UUID.randomUUID().toString();
            Task task = new Task(taskId, description, "UNKNOWN");

            // Convert to entity and save with project relationship
            TaskEntity entity = taskMapper.toEntity(task, projectEntity);
            entity = taskRepository.save(entity);

            // Convert back to VO and add to list
            Task savedTask = taskMapper.toVO(entity);
            projectTaskList.add(savedTask);
        }

        // Step 4: Project Manager delegates each task to the appropriate specialist
        for (Task task : projectTaskList) {
            String specialist = projectManagerAgent.delegateTask(task);
            task.setAssignedAgent(specialist);
            task.setStatus("ASSIGNED");

            // Update in database
            TaskEntity entity = taskRepository.findById(task.getId())
                    .orElseThrow(() -> new IllegalStateException("Task not found after save: " + task.getId()));
            taskMapper.updateEntityFromVO(task, entity);
            taskRepository.save(entity);
        }
        
        // Return project info and tasks
        Project project = projectMapper.toVO(projectEntity);
        return Map.of(
                "project", project,
                "tasks", projectTaskList
        );
    }
    
    /**
     * Execute a specific task
     * 
     * @param taskId The ID of the task to execute
     * @return The result of the task execution
     */
    public String executeTask(String taskId) {
        // Load task from database
        TaskEntity entity = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        Task task = taskMapper.toVO(entity);

        if (!"ASSIGNED".equals(task.getStatus())) {
            throw new IllegalStateException("Task is not in ASSIGNED state: " + taskId);
        }
        
        TaskExecutionResult executionResult = switch (task.getAssignedAgent()) {
            case "DevOps Engineer" -> devOpsEngineerAgent.executeTask(task);
            case "Technical Lead" -> technicalLeadAgent.executeTask(task);
            case "Software Engineer" -> softwareEngineerAgent.executeTask(task);
            default -> throw new IllegalStateException("Unknown agent type: " + task.getAssignedAgent());
        };

        task.setResult(executionResult.getResult());
        task.setTokensUsed(executionResult.getTokensUsed());
        task.setStatus("COMPLETED");
        
        // Update in database
        taskMapper.updateEntityFromVO(task, entity);
        entity.setTokensUsed(executionResult.getTokensUsed());
        taskRepository.save(entity);

        return executionResult.getResult();
    }
    
    /**
     * Execute a specific task with streaming response
     *
     * @param taskId The ID of the task to execute
     * @return Flux of response chunks
     */
    public Flux<String> executeTaskStream(String taskId) {
        // Load task from database
        TaskEntity entity = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        Task task = taskMapper.toVO(entity);

        if (!"ASSIGNED".equals(task.getStatus())) {
            return Flux.error(new IllegalStateException("Task is not in ASSIGNED state: " + taskId));
        }

        // Get the streaming response from the appropriate agent
        Flux<String> contentStream = switch (task.getAssignedAgent()) {
            case "DevOps Engineer" -> devOpsEngineerAgent.executeTaskStream(task);
            case "Technical Lead" -> technicalLeadAgent.executeTaskStream(task);
            case "Software Engineer" -> softwareEngineerAgent.executeTaskStream(task);
            default -> Flux.error(new IllegalStateException("Unknown agent type: " + task.getAssignedAgent()));
        };

        // Accumulate the full result and save to database when complete
        AtomicReference<String> fullResult = new AtomicReference<>("");

        return contentStream
                .doOnNext(chunk -> fullResult.updateAndGet(current -> current + chunk))
                .doOnComplete(() -> {
                    // Save the complete result to database
                    task.setResult(fullResult.get());
                    task.setStatus("COMPLETED");

                    // Update in database
                    TaskEntity updatedEntity = taskRepository.findById(taskId)
                            .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));
                    taskMapper.updateEntityFromVO(task, updatedEntity);
                    taskRepository.save(updatedEntity);
                });
    }

    /**
     * Execute a specific task with BUFFERED streaming response
     * This experimental method buffers LLM response chunks on the server before streaming to UI
     * to improve rendering performance by sending larger, more meaningful chunks.
     *
     * Benefits:
     * - Reduces network overhead by sending fewer, larger chunks
     * - Improves UI rendering by providing complete words/sentences
     * - Configurable buffer size and timeout via application.yaml
     *
     * Configuration:
     * - app.streaming.buffer-size: Number of chunks to buffer (default: 50)
     * - app.streaming.buffer-timeout-ms: Max time to wait before flushing (default: 500ms)
     *
     * @param taskId The ID of the task to execute
     * @return Flux of buffered response chunks
     */
    public Flux<String> executeTaskStreamBuffered(String taskId) {
        // Load task from database
        TaskEntity entity = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        Task task = taskMapper.toVO(entity);

        if (!"ASSIGNED".equals(task.getStatus())) {
            return Flux.error(new IllegalStateException("Task is not in ASSIGNED state: " + taskId));
        }

        // Get the streaming response from the appropriate agent
        Flux<String> contentStream = switch (task.getAssignedAgent()) {
            case "DevOps Engineer" -> devOpsEngineerAgent.executeTaskStream(task);
            case "Technical Lead" -> technicalLeadAgent.executeTaskStream(task);
            case "Software Engineer" -> softwareEngineerAgent.executeTaskStream(task);
            default -> Flux.error(new IllegalStateException("Unknown agent type: " + task.getAssignedAgent()));
        };

        // Accumulate the full result for database storage
        AtomicReference<String> fullResult = new AtomicReference<>("");

        // Buffer chunks and emit accumulated content periodically
        // Add backpressure handling to prevent overflow errors
        return contentStream
                .doOnNext(chunk -> fullResult.updateAndGet(current -> current + chunk))
                .bufferTimeout(streamBufferSize, Duration.ofMillis(streamBufferTimeoutMs))
                .onBackpressureBuffer(1000, // Maximum number of buffered items
                        dropped -> log.warn("Dropped {} buffered chunk(s) due to backpressure", dropped))
                .map(chunks -> String.join("", chunks))
                .scan("", (accumulated, newChunk) -> accumulated + newChunk)
                .skip(1) // Skip the first empty accumulated value
                .doOnComplete(() -> {
                    // Save the complete result to database
                    task.setResult(fullResult.get());
                    task.setStatus("COMPLETED");

                    // Update in database
                    TaskEntity updatedEntity = taskRepository.findById(taskId)
                            .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));
                    taskMapper.updateEntityFromVO(task, updatedEntity);
                    taskRepository.save(updatedEntity);
                });
    }

    /**
     * Execute all tasks for a project
     * 
     * @param projectId The ID of the project
     * @return A map of task IDs to execution results
     */
    public Map<String, String> executeAllProjectTasks(String projectId) {
        // Load tasks from database
        List<TaskEntity> entities = taskRepository.findByProjectId(projectId);
        if (entities.isEmpty()) {
            throw new IllegalArgumentException("No tasks found for project: " + projectId);
        }

        List<Task> projectTaskList = taskMapper.toVOList(entities);

        Map<String, String> results = new HashMap<>();
        for (Task task : projectTaskList) {
            String result = executeTask(task.getId());
            results.put(task.getId(), result);
        }
        
        return results;
    }
    
    /**
     * Get all tasks for a project
     * 
     * @param projectId The ID of the project
     * @return A list of tasks for the project
     */
    public List<Task> getProjectTasks(String projectId) {
        List<TaskEntity> entities = taskRepository.findByProjectId(projectId);
        if (entities.isEmpty()) {
            throw new IllegalArgumentException("No tasks found for project: " + projectId);
        }
        
        return taskMapper.toVOList(entities);
    }
    
    /**
     * Get a specific task
     * 
     * @param taskId The ID of the task
     * @return The task
     */
    public Task getTask(String taskId) {
        TaskEntity entity = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        return taskMapper.toVO(entity);
    }

    /**
     * Get all projects
     *
     * @return List of all projects
     */
    public List<Project> getAllProjects() {
        List<ProjectEntity> entities = projectRepository.findAllByOrderByCreatedAtDesc();
        return projectMapper.toVOList(entities);
    }

    /**
     * Get a specific project
     *
     * @param projectId The ID of the project
     * @return The project
     */
    public Project getProject(String projectId) {
        ProjectEntity entity = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
        return projectMapper.toVO(entity);
    }
}
