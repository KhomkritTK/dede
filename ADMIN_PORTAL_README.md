# DEDE E-Service Admin Portal

## ภาพรวม

Admin Portal เป็นระบบจัดการสำหรับผู้ดูแลระบบ DEDE E-Service ที่ใช้สำหรับติดตามและจัดการคำขอทั้ง 4 ประเภทจาก Web View ได้แก่:

1. **ขอรับใบอนุญาตใหม่** - คำขอติดตั้งโรงไฟฟ้าพลังงานทดแทนใหม่
2. **ขอต่ออายุใบอนุญาต** - คำขอต่ออายุใบอนุญาตที่มีอยู่แล้ว
3. **ขอขยายการผลิต** - คำขอเพิ่มกำลังการผลิต
4. **ขอลดการผลิต** - คำขอลดกำลังการผลิต

## บทบาทผู้ใช้งาน (User Roles)

ระบบรองรับบทบาทผู้ใช้งานหลายระดับ:

### 1. System Administrator (sysadmin)
- จัดการผู้ใช้งานทั้งหมด
- ตั้งค่าระบบ
- ดูและจัดการทุกฟังก์ชันในระบบ

### 2. DEDE Head Administrator (dedehead)
- จัดการคำขอใบอนุญาต
- จัดการการตรวจสอบ
- จัดการรายงานตรวจสอบ
- ดูข้อมูลผู้ใช้งาน

### 3. DEDE Staff Administrator (dedestaff)
- จัดการคำขอใบอนุญาต (อ่านและแก้ไข)
- จัดการการตรวจสอบ
- ดูรายงาน

### 4. DEDE Consultant Administrator (dedeconsult)
- จัดการคำขอใบอนุญาต (อ่านและแก้ไข)
- จัดการรายงานตรวจสอบ
- ดูข้อมูลการตรวจสอบ

### 5. Auditor Administrator (auditor)
- จัดการรายงานตรวจสอบ
- สร้างและจัดการรายงาน
- ดูข้อมูลคำขอและการตรวจสอบ

## การเข้าสู่ระบบ

1. เข้าไปที่ `/login-portal`
2. ใช้ข้อมูลผู้ใช้งานที่มีสิทธิ์เข้า Admin Portal
3. ระบบจะ Redirect ไปยัง Dashboard ตามบทบาทของผู้ใช้งาน

## ฟังก์ชันหลัก

### Dashboard
- แสดงสถิติภาพรวมของคำขอ
- แสดงการไหลของบริการ (Service Flow)
- แสดงประสิทธิภาพการดำเนินงาน
- แสดงการแจ้งเตือนด่วน

### ติดตามการดำเนินการบริการ (Service Flow)
- แสดงขั้นตอนการดำเนินการของแต่ละบริการ
- ติดตามสถานะคำขอแบบ Real-time
- แสดงจำนวนคำขอในแต่ละขั้นตอน
- กรองตามประเภทบริการ

### จัดการคำขอ
- ดูรายการคำขอทั้งหมด
- อัปเดตสถานะคำขอ
- มอบหมายผู้ตรวจสอบ
- เพิ่มบันทึกและเหตุผลการตัดสินใจ

## การติดตั้งและการตั้งค่า

### 1. Migration ฐานข้อมูล
```bash
# รัน migration สำหรับสร้างตาราง admin_users
cd backend
make migrate-up
```

### 2. Seed ข้อมูลผู้ใช้งาน Admin
```bash
# สร้างผู้ใช้งาน Admin ตามค่าเริ่มต้น
cd backend
go run cmd/seed/main.go
```

### 3. ข้อมูลผู้ใช้งานตัวอย่าง
- **Username**: sysadmin, **Password**: admin123 (System Administrator)
- **Username**: dedehead, **Password**: admin123 (DEDE Head Administrator)
- **Username**: dedestaff, **Password**: admin123 (DEDE Staff Administrator)
- **Username**: dedeconsult, **Password**: admin123 (DEDE Consultant Administrator)
- **Username**: auditor, **Password**: admin123 (Auditor Administrator)

## โครงสร้างไฟล์

### Backend
```
backend/
├── models/
│   ├── admin_user.go              # Model สำหรับผู้ใช้งาน Admin
│   ├── service_flow_log.go        # Model สำหรับบันทึกการเปลี่ยนสถานะ
│   └── service_statistics.go      # Model สำหรับสถิติบริการ
├── service/admin/handler/
│   ├── admin_handler.go           # Handler สำหรับจัดการ Admin
│   └── service_flow_handler.go    # Handler สำหรับ Service Flow
├── router/
│   └── admin_portal_routes.go     # Routes สำหรับ Admin Portal
└── database/migrations/
    └── 006_create_admin_users_table.sql  # Migration สำหรับ Admin Users
```

### Frontend
```
frontend/
├── app/admin-portal/
│   ├── dashboard/page.tsx          # Dashboard หลัก
│   ├── flow/page.tsx               # Service Flow Visualization
│   └── layout.tsx                  # Layout สำหรับ Admin Portal
├── components/
│   ├── layout/AdminLayout.tsx      # Layout Component
│   └── admin/ServiceFlowVisualization.tsx  # Service Flow Component
└── app/login-portal/page.tsx       # Login สำหรับ Admin Portal
```

## API Endpoints

### Authentication
- `POST /api/v1/admin-portal/auth/login` - เข้าสู่ระบบ
- `POST /api/v1/admin-portal/auth/logout` - ออกจากระบบ
- `GET /api/v1/admin-portal/auth/profile` - ดูข้อมูลส่วนตัว

### Dashboard
- `GET /api/v1/admin-portal/dashboard/stats` - ดูสถิติภาพรวม
- `GET /api/v1/admin-portal/dashboard/stats/summary` - ดูสรุปสถิติ
- `GET /api/v1/admin-portal/dashboard/stats/timeline` - ดูข้อมูล Timeline
- `GET /api/v1/admin-portal/dashboard/stats/performance` - ดูประสิทธิภาพ

### Service Flow
- `GET /api/v1/admin-portal/flow/logs` - ดูประวัติการเปลี่ยนสถานะ
- `GET /api/v1/admin-portal/flow/logs/:requestId` - ดูประวัติคำขอ
- `POST /api/v1/admin-portal/flow/logs` - สร้างประวัติการเปลี่ยนสถานะ

### Admin Management
- `GET /api/v1/admin-portal/admin/users` - ดูรายการผู้ใช้งาน Admin
- `POST /api/v1/admin-portal/admin/users` - สร้างผู้ใช้งาน Admin
- `PUT /api/v1/admin-portal/admin/users/:id` - อัปเดตผู้ใช้งาน Admin
- `DELETE /api/v1/admin-portal/admin/users/:id` - ลบผู้ใช้งาน Admin

## การใช้งาน

1. **เข้าสู่ระบบ**: ใช้บัญชี Admin ที่มีสิทธิ์เข้าใช้งาน
2. **Dashboard**: ดูภาพรวมสถานะคำขอและสถิติต่างๆ
3. **Service Flow**: ติดตามการดำเนินการคำขอทั้ง 4 ประเภท
4. **จัดการคำขอ**: อัปเดตสถานะและมอบหมายผู้ตรวจสอบ
5. **รายงาน**: ดูรายงานและสถิติการทำงาน

## คุณสมบัติเด่น

- **Role-based Access Control**: ควบคุมสิทธิ์การใช้งานตามบทบาท
- **Real-time Updates**: อัปเดตสถานะแบบ Real-time
- **Service Flow Visualization**: แสดงการไหลของบริการอย่างชัดเจน
- **Comprehensive Dashboard**: แดชบอร์ดครบวงจรสำหรับการจัดการ
- **Permission Management**: จัดการสิทธิ์ผู้ใช้งานอย่างยืดหยุ่น

## การพัฒนาต่อ

สามารถเพิ่มฟังก์ชันได้ เช่น:
- ระบบแจ้งเตือนแบบ Real-time
- การส่งออกรายงาน
- การวิเคราะห์ข้อมูลขั้นสูง
- การบูรณาการระบบกับภาครัฐอื่นๆ