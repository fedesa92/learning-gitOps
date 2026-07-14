package com.fedesa92.bookstore.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(Model model){
        model.addAttribute("title", "Bookstore Platform");
        model.addAttribute("message", "Backend is running!");

        return "home";
    }
}
