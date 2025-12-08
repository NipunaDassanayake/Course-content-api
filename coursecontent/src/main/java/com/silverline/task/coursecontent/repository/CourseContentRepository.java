package com.silverline.task.coursecontent.repository;

import com.silverline.task.coursecontent.model.CourseContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseContentRepository extends JpaRepository<CourseContent , Long> {
}
