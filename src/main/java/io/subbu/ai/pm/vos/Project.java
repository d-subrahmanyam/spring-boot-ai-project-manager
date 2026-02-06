package io.subbu.ai.pm.vos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Value Object for Project
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    private String id;
    private String title;
    private Integer tokensUsed;
    private String createdAt;
    private String updatedAt;
}
