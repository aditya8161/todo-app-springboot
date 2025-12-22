package com.todo.controller;

import com.todo.dto.LoginRequest;
import com.todo.dto.UserDto;
import com.todo.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class PageController
{
    @Autowired
    private UserService userService;

    @GetMapping("/home")
    public String openHomePage(){
        System.out.println("Open index.html page");
        return "index";
    }

    @GetMapping("/loginpage")
    public String openLoginPage(Model model){
        model.addAttribute("loginreq",new LoginRequest());
        return "loginPage";
    }

    @PostMapping("/login")
    public String handleLoginUser(@ModelAttribute("loginreq") LoginRequest loginReq, Model model, HttpSession session){
        UserDto userDto = userService.login(loginReq);

        if(userDto != null){
            model.addAttribute("successMsg","Login Successful for : "+loginReq.getEmail());
            session.setAttribute("user",userDto);
            return "redirect:/home";
        }

        model.addAttribute("errorMsg", "Invalid credentials.");
        return "loginpage";
    }

    //-------------register page start ---------------------
    @GetMapping("/regpage")
    public String openRegisterPage(Model model){

        model.addAttribute("regUser",new UserDto());
        return "registerpage";
    }

    //----------open profile page --------------
    @GetMapping("/profile")
    public String openProfilePage(HttpSession session){
        System.out.println("Open profile page...!");

        Object user = session.getAttribute("user");

        if(user != null){
            return "profile";
        }

        return "redirect:/loginpage";
    }

    //---------open dashboard page ----------------
    @GetMapping("/dashboard")
    public String openDashboardPage(HttpSession session){
        System.out.println("Open dashboard page...!");

        return "dashboard";
    }

    //----------LOGOUT------------
    //logout
    @GetMapping("/logout")
    public String logoutStudent(HttpSession session, RedirectAttributes redirectAttributes){
        session.invalidate();
        redirectAttributes.addFlashAttribute("logoutMsg","Logout User Successfully");
        return "redirect:/loginpage";
    }


}
