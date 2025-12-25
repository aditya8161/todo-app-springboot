package com.todo.controller;

import com.todo.dto.TaskDto;
import com.todo.entity.TaskStatus;
import com.todo.entity.TaskType;
import com.todo.service.TaskService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/tasks")
@CrossOrigin
public class TaskController
{
    //get remaing , complete task and delete task remaing

    private TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<TaskDto> handleCreateTask(@PathVariable Long userId, @RequestBody TaskDto taskDto){
        TaskDto task = taskService.createTask(userId, taskDto);

        if(task != null){
            return new ResponseEntity<>(task, HttpStatus.CREATED);
        }

        return ResponseEntity.badRequest().build();
    }

    //get task by taskID
    @GetMapping("/{taskId}")
    public ResponseEntity<TaskDto> handleGetTaskById(@PathVariable String taskId){
        TaskDto taskDto = taskService.getTaskById(taskId);

        return new ResponseEntity<>(taskDto, HttpStatus.OK);
    }

    //get tasks by userId
    @GetMapping
    public ResponseEntity<List<TaskDto>> getTasksByUserId(@RequestParam Long userId){
        List<TaskDto> tasksList = taskService.getTaskByuserId(userId);
        System.out.println(tasksList);
        if(tasksList == null){
            return new ResponseEntity<>(tasksList,HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(tasksList,HttpStatus.OK);
    }

    //get task by filter
    @GetMapping("/filter")
    public ResponseEntity<List<TaskDto>> getTasks(
            @RequestParam Long userId,
            @RequestParam(required = false) TaskType taskType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) TaskStatus status) {

        List<TaskDto> tasksList;

        if (taskType != null) {
            tasksList = taskService.getTaskByUserIdandType(userId, taskType);
        } else if (date != null) {
            tasksList = taskService.getTaskByIdandDate(userId, date);
        } else if (status != null) {
            tasksList = taskService.getTaskByStatus(userId, status);
        } else {
            // Optional: Return all tasks for the user if no filter is provided
            // tasksList = taskService.getAllTasksByUserId(userId);
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(tasksList);
    }

    //get task by userId and task type
    @GetMapping("/byType")
    public ResponseEntity<List<TaskDto>> getTaskUserIdandType(@RequestParam Long userId, @RequestParam TaskType taskType){
        List<TaskDto> tasksList = taskService.getTaskByUserIdandType(userId, taskType);

        return ResponseEntity.ok(tasksList);
    }

    //get task by userId and date
    @GetMapping("/byDate")
    public ResponseEntity<List<TaskDto>> getByUserIdandDate(@RequestParam Long userId,@RequestParam LocalDate date){
        List<TaskDto> tasksList = taskService.getTaskByIdandDate(userId, date);

        return ResponseEntity.ok(tasksList);
    }

    //update task by taskId
    @PatchMapping("/{taskId}")
    public ResponseEntity<TaskDto> updateTaskById(@PathVariable String taskId, @RequestBody TaskDto taskDto){
        TaskDto taskDto1 = taskService.updateTaskById(taskId, taskDto);

        if(taskDto1 != null){
            return ResponseEntity.ok(taskDto1);
        }
        return ResponseEntity.badRequest().build();
    }

    //complete task by ID
    @PatchMapping("/complete")
    public ResponseEntity<?> completeTaskById(@RequestParam String taskId){
        TaskDto taskDto = taskService.completeTaskById(taskId);

        if(taskDto != null){
            return ResponseEntity.ok(taskDto);
        }
        return ResponseEntity.badRequest().build();
    }

    @PatchMapping("/pending")
    public ResponseEntity<TaskDto> pendingMarkTaskById(@RequestParam String taskId){
        TaskDto taskDto = taskService.pendingStatusById(taskId);
        if(taskDto.getStatus().equals(TaskStatus.PENDING)){
            return ResponseEntity.ok(taskDto);
        }

        return ResponseEntity.badRequest().build();
    }

    //delete task by taskId
    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTaskById(@PathVariable String taskId){
        boolean status = taskService.deleteTaskById(taskId);

        if(status){
            System.out.println("task is deleted");
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    //get all task
    @GetMapping("/all")
    public List<TaskDto> getallTasks(){
        List<TaskDto> allTask = taskService.getAllTask();

        return allTask;
    }
}
