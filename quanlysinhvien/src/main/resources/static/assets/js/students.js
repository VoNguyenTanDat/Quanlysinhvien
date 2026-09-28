const API_URL = "/api/students";

let requestId = 0;        // bỏ qua kết quả cũ nếu người dùng gõ tìm kiếm nhanh
let searchTimer = null;
let toastTimer = null;
let currentKeyword = "";  // từ khóa đang tìm, để tải lại đúng danh sách sau khi sửa/xóa
let editingId = null;     // id sinh viên đang mở trong form (null khi thêm mới)
let formMode = "edit";    // "view" | "edit" | "create"
let deletingId = null;    // id sinh viên đang chờ xác nhận xóa
const studentsById = new Map();

const $ = (id) => document.getElementById(id);


document.addEventListener("DOMContentLoaded", () => {
    loadStudents();

    // Tìm kiếm
    $("searchInput").addEventListener("input", (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => loadStudents(e.target.value.trim()), 250);
    });

    // Nút Thêm sinh viên
    $("addBtn").addEventListener("click", () => openForm({}, "create"));

    // Bấm nút Xem / Sửa / Xóa trong bảng
    $("studentTableBody").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;
        const student = studentsById.get(btn.dataset.id);
        if (!student) return;

        if (btn.dataset.action === "delete") {
            openDeleteDialog(student);
        } else {
            openForm(student, btn.dataset.action);   // "view" hoặc "edit"
        }
    });

    // Lưu chỉnh sửa
    $("studentForm").addEventListener("submit", saveStudent);

    // Xác nhận xóa
    $("confirmDeleteBtn").addEventListener("click", deleteStudent);

    // Nút Hủy / Đóng, và bấm ra ngoài hộp thoại để đóng
    document.querySelectorAll("dialog").forEach((dialog) => {
        dialog.querySelectorAll("[data-close]").forEach((btn) =>
            btn.addEventListener("click", () => dialog.close()));
        dialog.addEventListener("click", (e) => {
            if (e.target === dialog) dialog.close();
        });
    });
});


/* ================= Tải và hiển thị danh sách ================= */

async function loadStudents(keyword = "") {
    currentKeyword = keyword;
    const current = ++requestId;
    const url = keyword ? `${API_URL}?keyword=${encodeURIComponent(keyword)}` : API_URL;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }
        const students = await response.json();
        if (current !== requestId) return;
        renderStudents(students, keyword);
    } catch (error) {
        if (current !== requestId) return;
        console.error("Không tải được danh sách sinh viên:", error);
        renderMessage("Không tải được dữ liệu",
            "Kiểm tra ứng dụng Spring Boot và kết nối SQL Server, rồi tải lại trang.", true);
        $("studentCount").textContent = "";
    }
}


function renderStudents(students, keyword = "") {
    const tbody = $("studentTableBody");
    const count = $("studentCount");

    studentsById.clear();
    students.forEach((s) => studentsById.set(String(s.id), s));

    if (students.length === 0) {
        renderMessage(
            keyword ? "Không tìm thấy sinh viên nào" : "Chưa có sinh viên nào",
            keyword ? `Không có kết quả cho "${keyword}". Thử từ khóa khác.` : "Danh sách đang trống.",
            false
        );
        count.innerHTML = "<strong>0</strong> sinh viên";
        return;
    }

    students.sort((a, b) => String(a.studentCode).localeCompare(String(b.studentCode), "vi", { numeric: true }));

    tbody.innerHTML = students.map(student => `
        <tr>
            <td class="sv-code">${esc(student.studentCode)}</td>
            <td>
                <div class="sv-name">
                    <span class="sv-avatar sv-tone-${tone(student.fullName)}">${esc(initials(student.fullName))}</span>
                    <span>${esc(student.fullName)}</span>
                </div>
            </td>
            <td class="sv-muted">${esc(student.email)}</td>
            <td class="sv-num">${esc(student.phone)}</td>
            <td>${student.className ? `<span class="sv-pill sv-tone-${tone(student.className)}">${esc(student.className)}</span>` : ""}</td>
            <td class="text-end">
                <div class="sv-actions">
                    <button type="button" class="sv-btn" data-action="view" data-id="${esc(student.id)}" title="Xem" aria-label="Xem ${esc(student.fullName)}">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button type="button" class="sv-btn sv-btn-edit" data-action="edit" data-id="${esc(student.id)}" title="Sửa" aria-label="Sửa ${esc(student.fullName)}">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button type="button" class="sv-btn sv-btn-delete" data-action="delete" data-id="${esc(student.id)}" title="Xóa" aria-label="Xóa ${esc(student.fullName)}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");

    count.innerHTML = `<strong>${students.length}</strong> sinh viên`;
}


function renderMessage(title, detail, isError) {
    $("studentTableBody").innerHTML = `
        <tr>
            <td colspan="6" class="sv-state${isError ? " sv-error" : ""}">
                <strong>${esc(title)}</strong>${esc(detail)}
            </td>
        </tr>`;
}


/* ================= Xem / Sửa / Thêm ================= */

function openForm(student, mode) {
    const form = $("studentForm");
    const readOnly = mode === "view";
    formMode = mode;
    editingId = mode === "create" ? null : student.id;

    form.elements.studentCode.value = student.studentCode ?? "";
    form.elements.fullName.value = student.fullName ?? "";
    form.elements.email.value = student.email ?? "";
    form.elements.phone.value = student.phone ?? "";
    form.elements.className.value = student.className ?? "";
    Array.from(form.elements).forEach((el) => {
        if (el.tagName === "INPUT") el.readOnly = readOnly;
    });

    $("dialogTitle").textContent = {
        view: "Thông tin sinh viên",
        edit: "Chỉnh sửa sinh viên",
        create: "Thêm sinh viên",
    }[mode];
    $("saveBtn").textContent = saveLabel();
    $("saveBtn").hidden = readOnly;
    $("cancelBtn").textContent = readOnly ? "Đóng" : "Hủy";
    $("formError").hidden = true;

    $("studentDialog").showModal();
}


async function saveStudent(event) {
    event.preventDefault();          // form đã qua kiểm tra (bắt buộc, đúng định dạng email)
    const form = $("studentForm");
    const saveBtn = $("saveBtn");

    // Gửi đủ mọi trường (khi sửa, Controller ghi đè cả bản ghi)
    const body = {
        studentCode: form.elements.studentCode.value.trim(),
        fullName: form.elements.fullName.value.trim(),
        email: form.elements.email.value.trim(),
        phone: form.elements.phone.value.trim() || null,
        className: form.elements.className.value.trim() || null,
    };

    saveBtn.disabled = true;
    saveBtn.textContent = "Đang lưu...";
    $("formError").hidden = true;

    const creating = formMode === "create";

    try {
        const response = await fetch(creating ? API_URL : `${API_URL}/${encodeURIComponent(editingId)}`, {
            method: creating ? "POST" : "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("HTTP " + response.status);

        $("studentDialog").close();
        showToast(creating ? "Đã thêm sinh viên" : "Đã lưu thay đổi");

        if (creating) {
            // Xóa ô tìm kiếm để sinh viên mới luôn hiện trong danh sách
            $("searchInput").value = "";
            loadStudents("");
        } else {
            loadStudents(currentKeyword);
        }
    } catch (error) {
        console.error("Không lưu được sinh viên:", error);
        $("formError").textContent = creating
            ? "Không thêm được sinh viên. Kiểm tra ứng dụng đang chạy rồi thử lại."
            : "Không lưu được thay đổi. Kiểm tra ứng dụng đang chạy rồi thử lại.";
        $("formError").hidden = false;
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = saveLabel();
    }
}


function saveLabel() {
    return formMode === "create" ? "Thêm sinh viên" : "Lưu thay đổi";
}


/* ================= Xóa ================= */

function openDeleteDialog(student) {
    deletingId = student.id;
    $("deleteText").textContent =
        `Bạn sắp xóa ${student.fullName} (${student.studentCode}). Thao tác này không thể hoàn tác.`;
    $("deleteError").hidden = true;
    $("deleteDialog").showModal();
}


async function deleteStudent() {
    const btn = $("confirmDeleteBtn");
    btn.disabled = true;
    btn.textContent = "Đang xóa...";
    $("deleteError").hidden = true;

    try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(deletingId)}`, { method: "DELETE" });
        if (!response.ok) throw new Error("HTTP " + response.status);

        $("deleteDialog").close();
        showToast("Đã xóa sinh viên");
        loadStudents(currentKeyword);
    } catch (error) {
        console.error("Không xóa được sinh viên:", error);
        $("deleteError").textContent = "Không xóa được sinh viên. Kiểm tra ứng dụng đang chạy rồi thử lại.";
        $("deleteError").hidden = false;
    } finally {
        btn.disabled = false;
        btn.textContent = "Xóa sinh viên";
    }
}


/* ================= Hàm phụ ================= */

function showToast(message, isError = false) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.toggle("sv-toast-error", isError);
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
}

// Chống chèn HTML từ dữ liệu
function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

// "Đặng Nhật Anh" -> "ĐA"
function initials(name) {
    const words = String(name ?? "").trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "?";
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// Chọn 1 trong 4 tông màu, cùng chuỗi thì luôn ra cùng màu
function tone(text) {
    let hash = 0;
    for (const ch of String(text ?? "")) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return hash % 4;
}