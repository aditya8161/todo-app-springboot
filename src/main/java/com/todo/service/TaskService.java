package com.todo.service;

import com.todo.dto.TaskDto;
import com.todo.entity.TaskStatus;
import com.todo.entity.TaskType;

import java.time.LocalDate;
import java.util.List;

public interface TaskService
{
    //create task
    TaskDto createTask(Long userId,TaskDto taskDto);

    //get task by taskId
    TaskDto getTaskById(String taskId);

    //get task by user id
    List<TaskDto> getTaskByuserId(Long userId);

    //get all task by userId
    List<TaskDto> getAllTask();

    //get task by task type
    List<TaskDto> getTaskByUserIdandType(Long userId, TaskType taskType);

    //getTask by id with date
    List<TaskDto> getTaskByIdandDate(Long userId, LocalDate date);

    //getTask by status - complete or pending
    List<TaskDto> getTaskByStatus(Long userId, TaskStatus status);

    //complete task by id and delete task
    TaskDto completeTaskById(String taskId);

    //delete task
    void deleteTaskById(String taskId);

    //edit task by id
    TaskDto updateTaskById(String taskId, TaskDto taskDto);



}
