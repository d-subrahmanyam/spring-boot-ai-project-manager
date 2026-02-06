package io.subbu.ai.pm.vos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Value Object for Note
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Note {
    private String id;
    private String title;
    private String content;
    private String projectId;
    private String createdAt;
    private String updatedAt;
}
