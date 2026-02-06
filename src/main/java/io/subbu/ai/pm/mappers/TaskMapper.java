package io.subbu.ai.pm.mappers;

import io.subbu.ai.pm.models.ProjectEntity;
import io.subbu.ai.pm.models.TaskEntity;
import io.subbu.ai.pm.vos.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

/**
 * MapStruct mapper for converting between Task VO and TaskEntity
 */
@Mapper(componentModel = "spring")
public interface TaskMapper {

    TaskMapper INSTANCE = Mappers.getMapper(TaskMapper.class);

    /**
     * Convert TaskEntity to Task VO
     *
     * @param entity The entity to convert
     * @return The Task VO
     */
    @Mapping(target = "id", source = "id")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "type", source = "type")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "result", source = "result")
    @Mapping(target = "assignedAgent", source = "assignedAgent")
    @Mapping(target = "tokensUsed", source = "tokensUsed")
    Task toVO(TaskEntity entity);

    /**
     * Convert Task VO to TaskEntity with Project
     *
     * @param vo The VO to convert
     * @param project The project entity
     * @return The TaskEntity
     */
    @Mapping(target = "id", source = "vo.id")
    @Mapping(target = "project", source = "project")
    @Mapping(target = "description", source = "vo.description")
    @Mapping(target = "type", source = "vo.type")
    @Mapping(target = "status", source = "vo.status")
    @Mapping(target = "result", source = "vo.result")
    @Mapping(target = "assignedAgent", source = "vo.assignedAgent")
    @Mapping(target = "tokensUsed", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    TaskEntity toEntity(Task vo, ProjectEntity project);

    /**
     * Update existing TaskEntity from Task VO
     *
     * @param vo The VO with updated values
     * @param entity The entity to update
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromVO(Task vo, @MappingTarget TaskEntity entity);

    /**
     * Convert a list of TaskEntity to a list of Task VO
     *
     * @param entities The list of entities
     * @return The list of VOs
     */
    List<Task> toVOList(List<TaskEntity> entities);
}
