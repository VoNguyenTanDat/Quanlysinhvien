package com.example.quanlysinhvien.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quanlysinhvien.entity.Student;

public interface StudentRepository extends JpaRepository<Student, UUID> {

    // Tim theo ma sinh vien (chinh xac)
    Optional<Student> findByStudentCode(String studentCode);

    // Tim kiem theo tu khoa (khong phan biet hoa/thuong) tren nhieu cot
    List<Student> findByStudentCodeContainingIgnoreCaseOrFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContainingIgnoreCase(
            String studentCode,
            String fullName,
            String email,
            String phone);
}
