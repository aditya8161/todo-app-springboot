package com.todo.repository;

import com.todo.entity.Task;
import com.todo.entity.TaskStatus;
import com.todo.entity.TaskType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TaskRepo extends JpaRepository<Task,String>
{
    List<Task> findByTaskDate(LocalDate date); //get tasks by date


    List<Task> findByTaskType(TaskType type);

    @Query(value = "SELECT * FROM tasks WHERE user_id = :userId", nativeQuery = true)
    List<Task> findTasksByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT * FROM tasks WHERE user_id = :userId AND task_date = :taskDate",nativeQuery = true)
    List<Task> findTasksByUserIdAndDate(@Param("userId") Long userId,@Param("taskDate") LocalDate taskDate);

    @Query(value = "SELECT * FROM tasks WHERE user_id = :userId AND task_type = :taskType",nativeQuery = true)
    List<Task> findTasksByUserIdAndTaskType(@Param("userId") Long userId,@Param("taskType") TaskType taskType);

    @Query(value = "SELECT * FROM tasks WHERE user_id = :userId AND status = :taskStatus",nativeQuery = true)
    List<Task> findTasksByStatus(@Param("userId") Long userId,@Param("taskStatus") TaskStatus status);//find task by status
}
