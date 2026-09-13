package com.example.quanlysinhvien.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.quanlysinhvien.entity.Student;
import com.example.quanlysinhvien.repository.StudentRepository;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // Lay tat ca sinh vien
    public List<Student> getAll() {
        return studentRepository.findAll();
    }

    // Tim kiem sinh vien theo tu khoa
    public List<Student> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return studentRepository.findAll();
        }
        String value = keyword.trim();
        return studentRepository.findByStudentCodeContainingIgnoreCaseOrFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContainingIgnoreCase(
                value, value, value, value);
    }

    // Lay sinh vien theo ID
    public Student getById(UUID id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay sinh vien voi id: " + id));
    }

    // Tim theo ma sinh vien
    public Student getByCode(String code) {
        return studentRepository.findByStudentCode(code)
                .orElseThrow(() -> new RuntimeException("Khong tim thay sinh vien voi ma: " + code));
    }

    // Them / Cap nhat sinh vien
    public Student save(Student student) {
        return studentRepository.save(student);
    }

    // Xoa 1 sinh vien theo id
    public void delete(UUID id) {
        studentRepository.deleteById(id);
    }

    // Xoa tat ca sinh vien
    public void deleteAll() {
        studentRepository.deleteAll();
    }
}
