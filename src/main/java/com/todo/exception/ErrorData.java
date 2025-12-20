package com.todo.exception;

import lombok.Data;
import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Data
public class ErrorData
{
    private String message;
    private String errorPath;
    private HttpStatus status;
    private LocalDateTime errorTime;


}
