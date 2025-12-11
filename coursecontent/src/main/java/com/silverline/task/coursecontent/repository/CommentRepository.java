package com.silverline.task.coursecontent.repository;

import com.silverline.task.coursecontent.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Finds all comments for a specific content ID and sorts them so newest is first
    List<Comment> findByCourseContentIdOrderByCreatedAtDesc(Long contentId);
}