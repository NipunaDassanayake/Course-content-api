package com.silverline.task.coursecontent.repository;

import com.silverline.task.coursecontent.model.CourseContent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseContentRepository extends JpaRepository<CourseContent, Long> {
    // ✅ Find all content uploaded by a specific user email
    List<CourseContent> findAllByUserEmail(String email);
}