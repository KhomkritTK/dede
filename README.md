# DEDE E-Service System

ระบบบริการอิเล็กทรอนิกส์สำหรับกรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน (DEDE)

## ภาพรวมระบบ

ระบบ DEDE E-Service เป็นแพลตฟอร์มสำหรับจัดการคำขอใบอนุญาต การตรวจสอบ และรายงานตรวจสอบสำหรับกรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน พัฒนาด้วยสถาปัตยกรรมที่ทันสมัยและเทคโนโลยีล่าสุด

## คุณสมบัติหลัก

### สำหรับผู้ขอใบอนุญาต (Power Producers)
- สร้างและจัดการคำขอใบอนุญาต
- ติดตามสถานะคำขอ
- ดูประวัติการตรวจสอบ
- รับการแจ้งเตือน

### สำหรับเจ้าหน้าที่ DEDE
- จัดการคำขอใบอนุญาต
- นัดหมายและดำเนินการตรวจสอบ
- สร้างและจัดการรายงานตรวจสอบ
- อนุมัติ/ปฏิเสธคำขอและรายงาน

### ฟีเจอร์ทั่วไป
- ระบบยืนยันตัวตน (Authentication)
- การแจ้งเตือนแบบ real-time
- รายงานและสถิติ
- การจัดการไฟล์แนบ
- การตอบกลับแบบ responsive

## สถาปัตยกรรมระบบ

### Backend (Go)
- **Framework**: Gin HTTP Web Framework
- **Database**: PostgreSQL กับ GORM ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Architecture**: Clean Architecture

### Frontend (React/Next.js)
- **Framework**: Next.js 14 กับ App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Form Handling**: React Hook Form

## โครงสร้างโปรเจกต์

```
dede-eservice/
├── dede/                           # Backend Go application
│   ├── main.go                     # Entry point
│   ├── config/                     # Configuration files
│   ├── models/                     # Data models
│   ├── repository/                 # Data access layer
│   ├── service/                    # Business logic
│   ├── router/                     # HTTP routes
│   ├── middleware/                 # HTTP middleware
│   ├── utils/                      # Utility functions
│   └── database/                   # Database setup
├── frontend/                       # Frontend Next.js application
│   ├── src/
│   │   ├── app/                    # Next.js app directory
│   │   ├── components/             # React components
│   │   ├── hooks/                  # Custom hooks
│   │   ├── lib/                    # Libraries
│   │   ├── types/                  # TypeScript types
│   │   └── utils/                  # Utility functions
│   ├── package.json
│   └── README.md
├── start-dev.sh                    # Development startup script
└── README.md                       # This file
```

## การติดตั้งและการตั้งค่า

### ข้อกำหนดเบื้องต้น

- Go 1.21+
- Node.js 18+
- PostgreSQL 12+
- npm หรือ yarn

### การติดตั้ง

1. Clone repository:
```bash
git clone <repository-url>
cd dede-eservice
```

2. ติดตั้ง backend dependencies:
```bash
cd dede
go mod tidy
```

3. ติดตั้ง frontend dependencies:
```bash
cd ../frontend
npm install
```

4. ตั้งค่าฐานข้อมูล:
```bash
cd ../dede
# แก้ไขไฟล์ .env ตามความเหมาะสม
cp .env.example .env
```

5. รัน database migrations:
```bash
make migrate
```

6. เริ่มต้นระบบ:
```bash
cd ..
./start-dev.sh
```

### การเริ่มต้นแยกกัน

#### Backend
```bash
cd dede
go run main.go
```

#### Frontend
```bash
cd frontend
npm run dev
```

## การเข้าถึงระบบ

- Frontend: http://localhost:3001 (หรือ http://localhost:3000 ถ้าว่าง)
- Backend API: http://localhost:8080
- API Health Check: http://localhost:8080/health

## API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/login` - เข้าสู่ระบบ
- `POST /api/v1/auth/logout` - ออกจากระบบ
- `GET /api/v1/auth/profile` - ดูข้อมูลส่วนตัว

### License Request Endpoints
- `GET /api/v1/licenses` - ดูรายการคำขอใบอนุญาต
- `POST /api/v1/licenses` - สร้างคำขอใหม่
- `PUT /api/v1/licenses/:id` - แก้ไขคำขอ
- `POST /api/v1/licenses/:id/submit` - ส่งคำขอ

### Inspection Endpoints
- `GET /api/v1/inspections` - ดูรายการการตรวจสอบ
- `POST /api/v1/inspections` - สร้างการตรวจสอบใหม่
- `POST /api/v1/inspections/:id/start` - เริ่มตรวจสอบ
- `POST /api/v1/inspections/:id/complete` - เสร็จสิ้นการตรวจสอบ

### Audit Report Endpoints
- `GET /api/v1/audits` - ดูรายการรายงานตรวจสอบ
- `POST /api/v1/audits` - สร้างรายงานใหม่
- `POST /api/v1/audits/:id/submit` - ส่งรายงาน
- `POST /api/v1/audits/:id/approve` - อนุมัติรายงาน

### Notification Endpoints
- `GET /api/v1/notifications/my` - ดูการแจ้งเตือนของฉัน
- `POST /api/v1/notifications/:id/mark-read` - ทำเครื่องหมายอ่านแล้ว

## การพัฒนา

### Backend
- ใช้ Clean Architecture pattern
- มีการแยกส่วนต่างๆ ออกจากกัน (Models, Repository, Service, Handler)
- มีการใช้ middleware สำหรับ authentication, logging, CORS
- มีการจัดการ error แบบรวมศูนย์

### Frontend
- ใช้ Next.js App Router
- มีการแยก components ตามหน้าที่การใช้งาน
- มีการใช้ TypeScript เพื่อความปลอดภัยของ type
- มีการใช้ React Query สำหรับจัดการ server state
- มีการใช้ Tailwind CSS สำหรับ styling

## การทดสอบ

### Backend Testing
```bash
cd dede
go test ./...
```

### Frontend Testing
```bash
cd frontend
npm test
```

## การ Deploy

### Backend
1. Build binary:
```bash
cd dede
go build -o eservice-server main.go
```

2. Run บน server:
```bash
./eservice-server
```

### Frontend
1. Build for production:
```bash
cd frontend
npm run build
```

2. Start production server:
```bash
npm start
```

## การจัดการ Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=eservice_db
JWT_SECRET=your-secret-key
SERVER_PORT=8080
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=DEDE E-Service
```

## การสนับสนุน

หากพบปัญหาหรือมีคำถาม กรุณาติดต่อทีมพัฒนา

## License

โปรเจกต์นี้อยู่ภายใต้ MIT License