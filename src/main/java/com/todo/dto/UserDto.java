package com.todo.dto;

import com.todo.entity.Task;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
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
    private LocalDate accountOpenDate;
    private boolean accountStatus;
    private List<Task> tasks =new ArrayList<>();
}
