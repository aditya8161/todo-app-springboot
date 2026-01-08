package com.todo.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler
{


    @ExceptionHandler(IllegalAccessException.class)
    public ResponseEntity<ErrorData> handleIllegalAccessException(IllegalAccessException ex, WebRequest request){
        String path = request.getDescription(false).replace("uri=",""); //request path

        ErrorData error = new ErrorData();
        error.setMessage(ex.getMessage());
        error.setErrorPath(path);
        error.setErrorTime(LocalDateTime.now());
        error.setStatus(HttpStatus.BAD_REQUEST);

        log.error("Exception {}",error);

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorData> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request){

        String path = request.getDescription(false).replace("uri=",""); //request path

        ErrorData error = new ErrorData();
        error.setMessage(ex.getMessage());
        error.setErrorPath(path);
        error.setErrorTime(LocalDateTime.now());
        error.setStatus(HttpStatus.NOT_FOUND);

        log.error("Exception {}",error);

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorData> handleRuntimeException(RuntimeException ex,WebRequest request){
        String path = request.getDescription(false).replace("uri=",""); //request path

        ErrorData error = new ErrorData();
        error.setMessage(ex.getMessage());
        error.setErrorPath(path);
        error.setErrorTime(LocalDateTime.now());
        error.setStatus(HttpStatus.BAD_REQUEST);

        log.error("Exception {}",error);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(LoginFailedException.class)
    public ResponseEntity<ErrorData> handleLoginRequestException(LoginFailedException ex, WebRequest request){
        String path = request.getDescription(false).replace("uri=",""); //request path

        ErrorData error = new ErrorData();
        error.setMessage(ex.getMessage());
        error.setErrorPath(path);
        error.setErrorTime(LocalDateTime.now());
        error.setStatus(HttpStatus.UNAUTHORIZED);

        log.error("Exception {}",error);

        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

}
