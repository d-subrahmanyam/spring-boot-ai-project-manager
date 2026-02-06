package io.subbu.ai.pm.agents;

import io.subbu.ai.pm.vos.Task;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.metadata.Usage;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;

/**
 * Project Manager agent responsible for task delegation and coordination
 */
@Component
public class ProjectManagerAgent {

    private final ChatClient chatClient;
    private static final String SYSTEM_PROMPT = """
            You are an experienced Project Manager AI agent.
            Your responsibilities include:
            1. Understanding project requirements
            2. Breaking down projects into tasks
            3. Delegating tasks to appropriate specialists
            4. Coordinating work between team members
            5. Ensuring project completion
            
            When delegating tasks, consider the following specialist roles:
            - DevOps Engineer: For infrastructure, deployment, and operations tasks
            - Technical Lead: For architecture, technical decisions, and code reviews
            - Software Engineer: For implementation and development tasks
            
            Provide clear, concise delegation instructions with appropriate context.
            """;

    public ProjectManagerAgent(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    /**
     * Analyze a project request and break it down into tasks
     * 
     * @param projectRequest The project request to analyze
     * @return A map containing task list and tokens used
     */
    public Map<String, Object> analyzeProjectRequest(String projectRequest) {
        Message systemMessage = new SystemPromptTemplate(SYSTEM_PROMPT).createMessage();
        Message userMessage = new UserMessage(
            "Please analyze the following project request and break it down into specific tasks that can be delegated to specialists:\n\n" + 
            projectRequest + 
            "\n\nFormat your response as a numbered list of tasks only, with no additional text."
        );
        
        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
        ChatResponse response = chatClient.prompt(prompt).call().chatResponse();
        
        String content = Objects.requireNonNull(response).getResult().getOutput().getText();
        List<String> tasks = parseTaskList(content);

        // Extract token usage
        Integer tokensUsed = extractTokenUsage(response);

        Map<String, Object> result = new HashMap<>();
        result.put("tasks", tasks);
        result.put("tokensUsed", tokensUsed);

        return result;
    }
    
    /**
     * Delegate a task to the appropriate specialist
     * 
     * @param task The task to delegate
     * @return The specialist role that should handle this task
     */
    public String delegateTask(Task task) {
        Message systemMessage = new SystemPromptTemplate(SYSTEM_PROMPT).createMessage();
        Message userMessage = new UserMessage(
            "Please determine which specialist should handle the following task:\n\n" + 
            "Task: " + task.getDescription() + 
            "\n\nRespond with only one of these roles: DevOps Engineer, Technical Lead, or Software Engineer."
        );

        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
        ChatResponse response = chatClient.prompt(prompt).call().chatResponse();

        String specialist = Objects.requireNonNull(Objects.requireNonNull(response).getResult()).getOutput().getText();

        // Normalize the response to one of the three roles
        if (specialist.contains("DevOps")) {
            return "DevOps Engineer";
        } else if (specialist.contains("Technical Lead")) {
            return "Technical Lead";
        } else {
            return "Software Engineer";
        }
    }
    
    /**
     * Parse a numbered list of tasks from the LLM response
     * 
     * @param content The raw content from the LLM
     * @return A list of task descriptions
     */
    private List<String> parseTaskList(String content) {
        return Stream.of(content.split("\n"))
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .map(line -> {
                    // Remove the number prefix (e.g., "1. ", "2. ")
                    if (line.matches("^\\d+\\.\\s.*$")) {
                        return line.replaceFirst("^\\d+\\.\\s+", "");
                    }
                    return line;
                })
                .toList();
    }

    /**
     * Extract token usage from ChatResponse metadata
     *
     * @param response The ChatResponse from the LLM
     * @return Total tokens used (prompt + completion)
     */
    private Integer extractTokenUsage(ChatResponse response) {
        if (response == null || response.getMetadata() == null) {
            return null;
        }

        Usage usage = response.getMetadata().getUsage();
        if (usage == null) {
            return null;
        }

        Integer totalTokens = usage.getTotalTokens();
        return totalTokens;
    }
}
