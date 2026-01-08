package com.todo.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.todo.entity.Task;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class UserDto
{
    private Long id;
    private String name;
    private String email;
    private String password;
    private String phone;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime accountOpenDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedDateTime;

    private boolean accountStatus;

    private List<Task> tasks =new ArrayList<>();
}
