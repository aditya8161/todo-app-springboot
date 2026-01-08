package com.todo.service;

import com.todo.dto.ChangePasswordRequest;
import com.todo.dto.LoginRequest;
import com.todo.dto.TaskDto;
import com.todo.dto.UserDto;
import java.util.List;

public interface UserService
{
    //register user
    UserDto registerUser(UserDto userDto);

    //login user
    UserDto loginUser(LoginRequest loginRequest);

    //login user for thymeleaf
    UserDto login(LoginRequest loginRequest);

    //get user by id
    UserDto getUserById(Long userId);

    //get user by email
    UserDto getUserByEmail(String email);

    //update user by id
    UserDto updateUserById(Long userId, UserDto userDto);

    //delete user by id
    boolean deleteUserById(Long userId);

    //get user tasks by id
    List<TaskDto> getUserTasksById(Long userId);

    //get all users
    List<UserDto> getAllUsers();

    //change password
    UserDto changePassword(ChangePasswordRequest request);
}
