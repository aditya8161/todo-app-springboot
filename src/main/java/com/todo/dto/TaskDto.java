package com.todo.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.todo.entity.TaskStatus;
import com.todo.entity.TaskType;
import com.todo.entity.User;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class TaskDto
{
    private String taskId;
    private String title;
    private String description;
    private LocalDate taskDate;
    private LocalTime taskTime;
    private TaskStatus status; //complate[.] , pending[]
    private TaskType taskType;//WORK,PERSONAL,GOAL

    @JsonIgnore
    private User user;
}
