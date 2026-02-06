package io.subbu.ai.pm.vos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Wrapper class for task execution results including token usage
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskExecutionResult {
    private String result;
    private Integer tokensUsed;
}
