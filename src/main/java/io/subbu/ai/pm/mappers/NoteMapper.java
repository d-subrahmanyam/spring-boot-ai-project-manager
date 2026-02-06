package io.subbu.ai.pm.mappers;

import io.subbu.ai.pm.models.NoteEntity;
import io.subbu.ai.pm.vos.Note;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * MapStruct mapper for converting between Note VO and NoteEntity
 */
@Mapper(componentModel = "spring")
public interface NoteMapper {

    DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Convert NoteEntity to Note VO
     *
     * @param entity The entity to convert
     * @return The Note VO
     */
    @Mapping(target = "createdAt", expression = "java(formatDateTime(entity.getCreatedAt()))")
    @Mapping(target = "updatedAt", expression = "java(formatDateTime(entity.getUpdatedAt()))")
    Note toVO(NoteEntity entity);

    /**
     * Convert Note VO to NoteEntity
     *
     * @param vo The VO to convert
     * @return The NoteEntity
     */
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    NoteEntity toEntity(Note vo);

    /**
     * Update existing NoteEntity from Note VO
     *
     * @param vo The VO with updated values
     * @param entity The entity to update
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromVO(Note vo, @MappingTarget NoteEntity entity);

    /**
     * Convert a list of NoteEntity to a list of Note VO
     *
     * @param entities The list of entities
     * @return The list of VOs
     */
    List<Note> toVOList(List<NoteEntity> entities);

    /**
     * Format LocalDateTime to String
     */
    default String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(FORMATTER) : null;
    }
}
