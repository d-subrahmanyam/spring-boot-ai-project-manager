package io.subbu.ai.pm.mappers;

import io.subbu.ai.pm.models.ProjectEntity;
import io.subbu.ai.pm.vos.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * MapStruct mapper for converting between Project VO and ProjectEntity
 */
@Mapper(componentModel = "spring")
public interface ProjectMapper {

    DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Convert ProjectEntity to Project VO
     *
     * @param entity The entity to convert
     * @return The Project VO
     */
    @Mapping(target = "createdAt", expression = "java(formatDateTime(entity.getCreatedAt()))")
    @Mapping(target = "updatedAt", expression = "java(formatDateTime(entity.getUpdatedAt()))")
    Project toVO(ProjectEntity entity);

    /**
     * Convert Project VO to ProjectEntity
     *
     * @param vo The VO to convert
     * @return The ProjectEntity
     */
    @Mapping(target = "tasks", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ProjectEntity toEntity(Project vo);

    /**
     * Convert a list of ProjectEntity to a list of Project VO
     *
     * @param entities The list of entities
     * @return The list of VOs
     */
    List<Project> toVOList(List<ProjectEntity> entities);

    /**
     * Format LocalDateTime to String
     */
    default String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(FORMATTER) : null;
    }
}
