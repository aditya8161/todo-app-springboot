package com.todo.service.impl;

import com.todo.dto.TaskDto;
import com.todo.dto.UserDto;
import com.todo.entity.Task;
import com.todo.entity.TaskStatus;
import com.todo.entity.TaskType;
import com.todo.entity.User;
import com.todo.exception.ResourceNotFoundException;
import com.todo.repository.TaskRepo;
import com.todo.service.TaskService;
import com.todo.service.UserService;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class TaskServiceImpl implements TaskService
{
    private TaskRepo taskRepo;
    private UserService userService;
    private ModelMapper modelMapper;

    public TaskServiceImpl(TaskRepo taskRepo, UserService userService, ModelMapper modelMapper) {
        this.taskRepo = taskRepo;
        this.userService = userService;
        this.modelMapper = modelMapper;
    }

    @Transactional
    public TaskDto createTask(Long userId, TaskDto taskDto) {

        UserDto userDto = userService.getUserById(userId);
        User user = modelMapper.map(userDto, User.class);
        Task task = modelMapper.map(taskDto, Task.class);

        task.setTaskId(UUID.randomUUID().toString());
        task.setStatus(TaskStatus.PENDING);
        task.setUser(user);
        user.getTasks().add(task); //bidirectional - just make up bi-directional consistency

        Task savedTask = taskRepo.save(task);

        return modelMapper.map(savedTask, TaskDto.class);
    }

    @Override
    public TaskDto getTaskById(String taskId) {
        Task task = taskRepo.findById(taskId).orElseThrow(() -> new ResourceNotFoundException("Task Not Found : "+taskId));
        return modelMapper.map(task,TaskDto.class);
    }

    @Override
    public List<TaskDto> getTaskByuserId(Long userId) {

         List<Task> taskList = taskRepo.findTasksByUserId(userId);

         if(!taskList.isEmpty()){
             return taskList
                     .stream()
                     .map(t -> modelMapper.map(t, TaskDto.class))
                     .toList();
         }

         return null;
    }

    @Override
    public List<TaskDto> getAllTask() {
        return taskRepo.findAll()
                .stream()
                .map(task -> modelMapper.map(task, TaskDto.class))
                .toList();
    }

    @Override
    public List<TaskDto> getTaskByUserIdandType(Long userId, TaskType taskType) {

        List<Task> list = taskRepo.findTasksByUserIdAndTaskType(userId, taskType);

        return list.stream()
                .map(task -> modelMapper.map(task, TaskDto.class))
                .toList();
    }

    @Override
    public List<TaskDto> getTaskByIdandDate(Long userId, LocalDate date) {
        List<Task> list = taskRepo.findTasksByUserIdAndDate(userId, date);
        return list.stream()
                .map(task -> modelMapper.map(task, TaskDto.class))
                .toList();
    }

    //get task by status
    public List<TaskDto> getTaskByStatus(Long userId, TaskStatus status) {

        List<Task> tasks = taskRepo.findTasksByStatus(userId, status);

        return tasks.stream()
                .map(task -> modelMapper.map(task,TaskDto.class))
                .toList();
    }

    //remaining
    @Override
    public TaskDto completeTaskById(String taskId) {
        TaskDto taskDto = getTaskById(taskId);

        Task task = modelMapper.map(taskDto, Task.class);

        if (task != null){
            task.setStatus(TaskStatus.COMPLETE);
            Task updated = taskRepo.save(task);
            return modelMapper.map(updated, TaskDto.class);
        }

        return null;
    }

    public TaskDto updateTaskById(String taskId, TaskDto taskDto) {

        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task Not Found : " + taskId));

        // Update title
        if(taskDto.getTitle() != null){
            task.setTitle(taskDto.getTitle());
        }

        // Update description
        if(taskDto.getDescription() != null){
            task.setDescription(taskDto.getDescription());
        }

        // Update task date
        if(taskDto.getTaskDate() != null){
            task.setTaskDate(taskDto.getTaskDate());
        }

        // Update task time
        if(taskDto.getTaskTime() != null){
            task.setTaskTime(taskDto.getTaskTime());
        }

        // Update task type
        if(taskDto.getTaskType() != null){
            task.setTaskType(taskDto.getTaskType());
        }


        // Save updated task
        Task updatedTask = taskRepo.save(task);

        // Convert to DTO and return
        return modelMapper.map(updatedTask, TaskDto.class);
    }

    //delete task by id


    @Override
    public void deleteTaskById(String taskId) {
        Task task = taskRepo.findById(taskId).orElseThrow(() -> new ResourceNotFoundException("Task Not Found : "+taskId));

        if(task != null){
            taskRepo.delete(task);
        }
    }
}
