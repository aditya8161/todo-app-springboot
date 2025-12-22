package com.todo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100, nullable = false)
    private String name;

    @Column(length = 100, nullable = false,unique = true)
    private String email;

    @Column(length = 50, nullable = false)
    private String password;

    @Column(length = 15, nullable = false)
    private String phone;

    @Column(nullable = false,updatable = false)
    private LocalDate accountOpenDate;

    @Column(nullable = false)
    private boolean accountStatus;

    @OneToMany(mappedBy = "user",fetch = FetchType.EAGER, cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Task> tasks =new ArrayList<>();

}
