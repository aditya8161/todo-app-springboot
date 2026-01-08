package com.todo.service.impl;

import com.todo.dto.ChangePasswordRequest;
import com.todo.dto.LoginRequest;
import com.todo.dto.TaskDto;
import com.todo.dto.UserDto;
import com.todo.entity.Task;
import com.todo.entity.User;
import com.todo.exception.LoginFailedException;
import com.todo.exception.ResourceNotFoundException;
import com.todo.repository.TaskRepo;
import com.todo.repository.UserRepository;
import com.todo.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService
{

    private UserRepository userRepo;
    private TaskRepo taskRepo;
    private ModelMapper modelMapper;

    public UserServiceImpl(UserRepository userRepo, TaskRepo taskRepo, ModelMapper modelMapper) {
        this.userRepo = userRepo;
        this.taskRepo = taskRepo;
        this.modelMapper = modelMapper;
    }

    @Override
    public UserDto registerUser(UserDto userDto) {
        Optional<User> existUser = userRepo.findByEmail(userDto.getEmail());

        if(!existUser.isEmpty()) throw new IllegalArgumentException("User already exists...!");

        User user = modelMapper.map(userDto, User.class);
        user.setAccountStatus(true);
        User savedUser = userRepo.save(user);
        return modelMapper.map(savedUser, UserDto.class);
    }

    @Override
    public UserDto loginUser(LoginRequest req) {

        User existUser = userRepo.findByEmailAndPassword(req.getEmail(), req.getPassword()).orElseThrow(() -> new LoginFailedException("Invalid Email or Password...!"));

        if(!existUser.getPassword().equals(req.getPassword())){
            throw new LoginFailedException("Wrong Password..!");
        }

        return modelMapper.map(existUser, UserDto.class);
    }

    //login user for thyemelef
    public UserDto login(LoginRequest loginRequest) {

        User user = userRepo.findByEmailAndPassword(loginRequest.getEmail(),loginRequest.getPassword()).orElse(null);

        if(user != null && user.getPassword().equals(loginRequest.getPassword()))
        {
            return modelMapper.map(user, UserDto.class);
        }

        return null;
    }

    @Override
    public UserDto getUserById(Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found..."));
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    public UserDto getUserByEmail(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found..."));
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    public UserDto updateUserById(Long userId, UserDto userDto) {
        User existUser = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found..."));


        if(userDto.getName() != null){
            existUser.setName(userDto.getName());
        }

        if(userDto.getPhone() != null){
            existUser.setPhone(userDto.getPhone());
        }

        userRepo.save(existUser);

        return modelMapper.map(existUser, UserDto.class);
    }

    @Override
    public boolean deleteUserById(Long userId) {

        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found..."));

        if(user != null){
            userRepo.deleteById(user.getId());
            return true;
        }
        return false;
    }

    @Override
    public List<TaskDto> getUserTasksById(Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found..."));

        List<Task> tasks = taskRepo.findTasksByUserId(userId);

        return tasks
                .stream()
                .map(task -> modelMapper.map(task, TaskDto.class))
                .toList();

    }


    //get all users for testing

    @Override
    public List<UserDto> getAllUsers() {

        List<User> allUsers = userRepo.findAll();

        return allUsers.stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .toList();
    }

    //change password
    public UserDto changePassword(ChangePasswordRequest request) {
        User user = userRepo.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User Not Found : " + request.getUserId()));

        if(!user.getPassword().equals(request.getCurrentPassword())){
            throw new IllegalArgumentException("Current Password is wrong..!");
        }

        if(request.getNewPassword() == null || request.getNewPassword().isBlank()){
            throw new IllegalArgumentException("New Password cannot be null or blank");
        }

        user.setPassword(request.getNewPassword());
        User updatedUser = userRepo.save(user);

        return modelMapper.map(updatedUser, UserDto.class);
    }
}
