package com.todo.controller;

import com.todo.dto.LoginRequest;
import com.todo.dto.TaskDto;
import com.todo.dto.UserDto;
import com.todo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController
{
    @Autowired
    private UserService userService;

    //register user
    @PostMapping
    public ResponseEntity<UserDto> registerUser(@RequestBody UserDto userDto){
        UserDto userDto1 = userService.registerUser(userDto);

        return new ResponseEntity<>(userDto1, HttpStatus.CREATED);
     }

    //login user
    @PostMapping("/login")
    public ResponseEntity<UserDto> loginUser(@RequestBody LoginRequest loginRequest){
        UserDto userDto = userService.loginUser(loginRequest);

        return ResponseEntity.ok(userDto);
    }

    //get user by id
    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long userId){
        UserDto userDto = userService.getUserById(userId);

        return new ResponseEntity<>(userDto,HttpStatus.OK);
    }

    //get user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String email){
        UserDto userDto = userService.getUserByEmail(email);

        if(userDto != null){
            return new ResponseEntity<>(userDto, HttpStatus.OK);
        }

        return ResponseEntity.badRequest().build();
    }

    //update user by id
    @PatchMapping("/{userId}")
    public ResponseEntity<UserDto> updateUserById(@PathVariable Long userId, @RequestBody UserDto userDto){
        UserDto userDto1 = userService.updateUserById(userId, userDto);

        if(userDto1 != null){
            return new ResponseEntity<>(userDto1, HttpStatus.OK);
        }

        return ResponseEntity.badRequest().build();
    }

    //delete user by id
    @DeleteMapping("/{userId}")
    public ResponseEntity<Boolean> deleteUserById(@PathVariable Long userId){
        boolean status = userService.deleteUserById(userId);

        if(status){
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }

    //get user tasks by id
    @GetMapping("/{userId}/tasks")
    public ResponseEntity<List<TaskDto>> getUserTaskById(@PathVariable Long userId){
        List<TaskDto> taskDtoList = userService.getUserTasksById(userId);

        if(taskDtoList.isEmpty()){
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(taskDtoList);
    }

    //get all users
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers(){
        List<UserDto> usersList = userService.getAllUsers();

        if(!usersList.isEmpty()){
            return new ResponseEntity<>(usersList,HttpStatus.OK);
        }
        return ResponseEntity.noContent().build();
    }

}
