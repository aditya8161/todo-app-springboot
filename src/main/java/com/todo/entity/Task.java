package com.todo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "tasks")
@Getter
@Setter
public class Task
{
    @Id
    private String taskId;

    @Column(length = 100,nullable = false)
    private String title;

    @Column(length = 200,nullable = false)
    private String description;

    private LocalDate taskDate;

    private LocalTime taskTime;

    @Enumerated(EnumType.STRING)
    private TaskStatus status; //complate[.] , pending[]

    @Enumerated(EnumType.STRING)
    private TaskType taskType;

    @ManyToOne
    @JoinColumn(name = "user_id" ,nullable = false)
    @JsonIgnore
    private User user;


}
