# Quản lý Sinh viên — Spring Boot + SQL Server

Ứng dụng web quản lý sinh viên (CRUD) sử dụng Spring Boot, JPA/Hibernate, SQL Server và giao diện AdminLTE.

## Yêu cầu

| Phần mềm | Phiên bản tối thiểu |
|-----------|---------------------|
| JDK | 21 |
| SQL Server | 2019+ (bất kỳ edition) |
| SQL Server Management Studio (SSMS) | khuyến nghị để chạy script SQL |

> **Lưu ý:** Không cần cài Maven — project đã có sẵn Maven Wrapper (`mvnw`).

---

## Hướng dẫn cài đặt

### Bước 1: Tạo database trên SQL Server

Mở SSMS (hoặc `sqlcmd`) và chạy lần lượt:

```sql
CREATE DATABASE quanlysinhvien;
GO
USE quanlysinhvien;
GO
```

Sau đó chạy nội dung file **`sql/init_students.sql`** để tạo bảng `students` và dữ liệu mẫu (10 sinh viên).

### Bước 2: Cấu hình kết nối

Mở file `src/main/resources/application.properties` và sửa lại **3 thông số** cho đúng với máy bạn:

```properties
# Đổi tên instance SQL Server (ví dụ: SQLEXPRESS, MSSQLSERVER, SQL2025...)
spring.datasource.url=jdbc:sqlserver://localhost\\<TEN_INSTANCE>;databaseName=quanlysinhvien;encrypt=true;trustServerCertificate=true

# Tài khoản SQL Server
spring.datasource.username=sa
spring.datasource.password=<MAT_KHAU_CUA_BAN>
```

**Ví dụ** nếu bạn dùng SQL Server Express với mật khẩu `abc123`:
```properties
spring.datasource.url=jdbc:sqlserver://localhost\\SQLEXPRESS;databaseName=quanlysinhvien;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=abc123
```

### Bước 3: Chạy ứng dụng

```bash
# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

### Bước 4: Truy cập

Mở trình duyệt và vào:

- **Trang quản lý:** [http://localhost:8080](http://localhost:8080) (tự động chuyển đến trang sinh viên)
- **Swagger API docs:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## Các API endpoint

| Method | URL | Mô tả |
|--------|-----|-------|
| `GET` | `/api/students` | Lấy danh sách tất cả sinh viên |
| `GET` | `/api/students?keyword=abc` | Tìm kiếm theo mã SV, tên, email, SĐT |
| `GET` | `/api/students/{id}` | Lấy thông tin 1 sinh viên |
| `POST` | `/api/students` | Thêm sinh viên mới |
| `PUT` | `/api/students/{id}` | Cập nhật sinh viên |
| `DELETE` | `/api/students/{id}` | Xóa sinh viên |

---

## Cấu trúc project

```
src/main/java/com/example/quanlysinhvien/
├── QuanlysinhvienApplication.java    # Main class
├── config/
│   └── WebConfig.java                # Redirect "/" → "/student.html"
├── controller/
│   └── StudentController.java        # REST API
├── entity/
│   └── Student.java                  # JPA Entity
├── repository/
│   └── StudentRepository.java        # Spring Data JPA
└── service/
    └── StudentService.java           # Business logic

src/main/resources/
├── application.properties            # Cấu hình DB + server
└── static/
    ├── student.html                  # Giao diện chính
    └── assets/
        ├── css/students.css
        └── js/students.js

sql/
└── init_students.sql                 # Script tạo bảng + dữ liệu mẫu
```
