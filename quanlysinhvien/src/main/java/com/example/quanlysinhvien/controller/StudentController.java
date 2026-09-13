package com.example.quanlysinhvien.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.quanlysinhvien.entity.Student;
import com.example.quanlysinhvien.service.StudentService;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    // 1. GET /api/students -> lay tat ca sinh vien
    @GetMapping
    public List<Student> listStudents() {
        return studentService.getAll();
    }

    // 2. GET /api/students/{id} -> lay sinh vien theo ID
    @GetMapping("/{id}")
    public Student getStudent(@PathVariable UUID id) {
        return studentService.getById(id);
    }

    // 3. GET /api/students/code/{code} -> tim theo ma sinh vien
    @GetMapping("/code/{code}")
    public Student getStudentByCode(@PathVariable String code) {
        return studentService.getByCode(code);
    }

    // 4. GET /api/students/search?keyword=... -> tim kiem sinh vien
    @GetMapping("/search")
    public List<Student> searchStudents(@RequestParam(required = false) String keyword) {
        return studentService.search(keyword);
    }

    // 5. POST /api/students -> them sinh vien
    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        return studentService.save(student);
    }

    // 6. PUT /api/students/{id} -> cap nhat sinh vien
    @PutMapping("/{id}")
    public Student updateStudent(@PathVariable UUID id, @RequestBody Student student) {
        student.setId(id);
        return studentService.save(student);
    }

    // 7. DELETE /api/students/{id} -> xoa sinh vien
    @DeleteMapping("/{id}")
    public void deleteStudent(@PathVariable UUID id) {
        studentService.delete(id);
    }

    // 8. DELETE /api/students -> xoa tat ca sinh vien
    @DeleteMapping
    public void deleteAllStudents() {
        studentService.deleteAll();
    }
}
