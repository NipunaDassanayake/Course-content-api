package com.silverline.task.coursecontent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class CoursecontentApplication {

	public static void main(String[] args) {
		SpringApplication.run(CoursecontentApplication.class, args);
	}

}
