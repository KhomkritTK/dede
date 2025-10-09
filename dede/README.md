# eService Backend System

ระบบ eService Backend สำหรับการจัดการใบอนุญาตของกรมโรงงานอุตสาหกรรม พัฒนาด้วยภาษา Go และสถาปัตยกรรม Clean Architecture

## โครงสร้างโปรเจกต์

```
eservice-backend/
│
├── main.go                         # Entry point ของระบบ
│
├── config/
│   ├── app_config.go               # ค่าคอนฟิกระบบ
│   ├── database.go                 # การเชื่อมต่อฐานข้อมูล
│   └── logger.go                   # ระบบ logging
│
├── server/
│   ├── server.go                   # Gin server setup
│   └── middleware.go               # Global middleware
│
├── router/
│   ├── api.go                      # REST API routes รวมทั้งหมด
│   ├── user_routes.go              # Routes สำหรับฝั่ง User
│   ├── admin_routes.go             # Routes สำหรับฝั่ง Admin
│   ├── license_routes.go           # Routes สำหรับคำขอใบอนุญาต
│   ├── inspection_routes.go        # Routes สำหรับการตรวจสอบ
│   ├── audit_routes.go             # Routes สำหรับรายงานตรวจสอบ
│   └── notification_routes.go      # Routes สำหรับการแจ้งเตือน
│
├── models/
│   ├── user.go                     # ข้อมูลผู้ใช้งาน
│   ├── license_request.go          # คำขอใบอนุญาต
│   ├── inspection.go               # การตรวจสอบ
│   ├── audit_report.go             # รายงานตรวจสอบ
│   ├── attachment.go               # ไฟล์แนบ
│   └── notification.go             # การแจ้งเตือน
│
├── database/
│   ├── connection.go               # DB connection wrapper
│   ├── migrations/
│   │   └── migrations.go           # Database migrations
│   └── seed.go                     # Seed ข้อมูลตั้งต้น
│
├── middleware/
│   ├── auth_middleware.go          # JWT authentication
│   ├── cors_middleware.go          # CORS handling
│   ├── logging_middleware.go       # Request logging
│   └── recovery_middleware.go      # Panic recovery
│
├── utils/
│   ├── response_utils.go           # Response formatting
│   ├── jwt_utils.go                # JWT token handling
│   ├── time_utils.go               # Time utilities
│   ├── file_utils.go               # File handling
│   └── email_utils.go              # Email utilities
│
├── service/                        # Business logic layer
│   ├── user/
│   ├── auth/
│   ├── license/
│   ├── inspection/
│   ├── audit/
│   └── notification/
│
└── docs/
    ├── api_spec.yaml               # OpenAPI spec (Swagger)
    ├── architecture.md             # อธิบายสถาปัตยกรรมระบบ
    └── usecase_flows.md            # เอกสาร flow การทำงาน
```

## การติดตั้งและรันโปรเจกต์

### ข้อกำหนดเบื้องต้น

- Go 1.21 หรือสูงกว่า
- PostgreSQL 12 หรือสูงกว่า

### ขั้นตอนการติดตั้ง

1. Clone repository:
```bash
git clone <repository-url>
cd eservice-backend
```

2. ติดตั้ง dependencies:
```bash
go mod tidy
```

3. สร้างไฟล์ `.env` จาก `.env.example`:
```bash
cp .env.example .env
```

4. แก้ไขค่าในไฟล์ `.env` ตามความเหมาะสม:
- ตั้งค่าฐานข้อมูล
- ตั้งค่า JWT secret
- ตั้งค่า email (ถ้าต้องการใช้ระบบแจ้งเตือนทางอีเมล)

5. รันโปรเจกต์:
```bash
go run main.go
```

หรือสำหรับการพัฒนา:
```bash
go run main.go
```

## API Documentation

### Authentication

- `POST /api/v1/auth/login` - เข้าสู่ระบบ
- `POST /api/v1/auth/logout` - ออกจากระบบ
- `POST /api/v1/auth/refresh` - refresh token

### Users

- `GET /api/v1/users/profile` - ดูข้อมูลส่วนตัว
- `PUT /api/v1/users/profile` - แก้ไขข้อมูลส่วนตัว
- `PUT /api/v1/users/password` - เปลี่ยนรหัสผ่าน

### License Requests

- `GET /api/v1/licenses` - ดูรายการคำขอใบอนุญาต
- `GET /api/v1/licenses/:id` - ดูรายละเอียดคำขอ
- `POST /api/v1/licenses` - สร้างคำขอใหม่
- `PUT /api/v1/licenses/:id` - แก้ไขคำขอ
- `POST /api/v1/licenses/:id/submit` - ส่งคำขอ
- `POST /api/v1/licenses/:id/accept` - รับคำขอ (Admin)
- `POST /api/v1/licenses/:id/reject` - ปฏิเสธคำขอ (Admin)

### Inspections

- `GET /api/v1/inspections` - ดูรายการตรวจสอบ
- `POST /api/v1/inspections` - สร้างการตรวจสอบใหม่
- `POST /api/v1/inspections/:id/start` - เริ่มตรวจสอบ
- `POST /api/v1/inspections/:id/complete` - ตรวจสอบเสร็จสิ้น
- `POST /api/v1/inspections/:id/schedule` - นัดหมายตรวจสอบ

### Audit Reports

- `GET /api/v1/audit-reports` - ดูรายงานตรวจสอบ
- `POST /api/v1/audit-reports` - สร้างรายงานใหม่
- `POST /api/v1/audit-reports/:id/submit` - ส่งรายงาน
- `POST /api/v1/audit-reports/:id/approve` - อนุมัติรายงาน (Admin)

### Notifications

- `GET /api/v1/notifications/my` - ดูการแจ้งเตือนของฉัน
- `POST /api/v1/notifications/:id/mark-read` - ทำเครื่องหมายอ่านแล้ว

## Flow การทำงาน

### Power Producer (ผู้ขอใบอนุญาต)
1. สร้างคำขอใหม่ผ่าน Power Producer Application
2. เลือกประเภทใบอนุญาต (ขอรับ/ต่ออายุ/ขอแก้ไข/ขอเลิก)
3. กรอกแบบฟอร์มคำขอ (พค.1) สถานะ: ร่าง
4. เลือก Inspector (Auditor หรือ DEDE)
5. ส่งคำขอ status: คำร้องใหม่

### DEDE Admin
1. ตรวจสอบคำขอใน Power Producer Request List (statusคำร้องใหม่)
2. พิจารณาคำขอ (Accepted?)
   - ถ้าไม่รับ: แจ้งผู้ขอให้แก้ไขเอกสาร
   - ถ้ารับ: ส่งต่อ DEDE Head

### DEDE Head 
1. ตรวจสอบคำขอใน Request List และมอบหมายงานตรวจสอบ
2. ระบบแจ้งเตือนการดำเนินการภายใน 90 วัน
3. มอบหมายงานให้ DEDE Consult หรือ DEDE Auditors

### DEDE Consults/DEDE Staff 
1. ได้รับงานใหม่ในระบบ (New Task on List / Audit Task)
2. นัดหมายตรวจสอบ (Appointment)
3. เตรียมเอกสารและนัดหมายกับผู้ขอ
4. สร้างรายงานตรวจสอบ (Create Audit Report)
5. ตรวจสอบหน้างาน (Site Inspection)
6. ส่งรายงานตรวจสอบ (Submit Audit Report)

### DEDE Staff/Head 
1. ตรวจสอบรายงาน (Review Audit Report)
2. ถ้าต้องแก้ไข: Edit Audit Report หรือ Reject
3. ถ้าแก้ไขไม่ทันกำหนด: Overdue (เกินกำหนด 14 วัน)
4. หากรายงานผ่าน: Approved Audit Report
5. ส่งต่อขั้นตอนอนุมัติใบอนุญาต

## การพัฒนาต่อ

### การเพิ่ม Service ใหม่

1. สร้าง folder ใน `service/` ตามชื่อ service
2. สร้าง `handler/`, `usecase/`, และ `dto/` ภายใน folder
3. Implement business logic ใน usecase
4. Implement HTTP handlers ใน handler
5. เพิ่ม routes ใน `router/` folder

### การเพิ่ม Model ใหม่

1. สร้าง Go struct ใน `models/` folder
2. เพิ่ม model ใน migrations
3. สร้าง repository และ service ตามต้องการ

## License

This project is licensed under the MIT License.