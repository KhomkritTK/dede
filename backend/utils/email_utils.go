package utils

import (
	"fmt"
	"log"
	"net/smtp"
	"strings"
)

// EmailConfig holds email configuration
type EmailConfig struct {
	Host     string
	Port     string
	Username string
	Password string
	From     string
}

// EmailMessage represents an email message
type EmailMessage struct {
	To      []string
	Subject string
	Body    string
	IsHTML  bool
}

// SendEmail sends an email using SMTP
func SendEmail(config EmailConfig, message EmailMessage) error {
	// Create SMTP auth
	auth := smtp.PlainAuth("", config.Username, config.Password, config.Host)

	// Construct the message
	var msg strings.Builder

	// Headers
	msg.WriteString(fmt.Sprintf("From: %s\r\n", config.From))
	msg.WriteString(fmt.Sprintf("To: %s\r\n", strings.Join(message.To, ",")))
	msg.WriteString(fmt.Sprintf("Subject: %s\r\n", message.Subject))

	// Content type
	if message.IsHTML {
		msg.WriteString("MIME-version: 1.0;\r\n")
		msg.WriteString("Content-Type: text/html; charset=\"UTF-8\";\r\n")
	} else {
		msg.WriteString("Content-Type: text/plain; charset=\"UTF-8\"\r\n")
	}

	msg.WriteString("\r\n")

	// Body
	msg.WriteString(message.Body)

	// Send email
	addr := fmt.Sprintf("%s:%s", config.Host, config.Port)
	err := smtp.SendMail(addr, auth, config.From, message.To, []byte(msg.String()))
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

// SendWelcomeEmail sends a welcome email to a new user
func SendWelcomeEmail(config EmailConfig, to, fullName string) error {
	message := EmailMessage{
		To:      []string{to},
		Subject: "ยินดีต้อนรับสู่ระบบ eService กรมโรงงานอุตสาหกรรม",
		Body: fmt.Sprintf(`
		<h2>ยินดีต้อนรับ %s</h2>
		<p>ขอบคุณที่สมัครใช้งานระบบ eService กรมโรงงานอุตสาหกรรม</p>
		<p>คุณสามารถเข้าสู่ระบบได้ที่: <a href="https://eservice.diw.go.th/login">https://eservice.diw.go.th/login</a></p>
		<p>หากมีข้อสงสัย กรุณาติดต่อเราที่ support@diw.go.th</p>
		<br>
		<p>ด้วยความเคารพ,<br>
		ทีมงาน eService กรมโรงงานอุตสาหกรรม</p>
		`, fullName),
		IsHTML: true,
	}

	return SendEmail(config, message)
}

// SendPasswordResetEmail sends a password reset email
func SendPasswordResetEmail(config EmailConfig, to, resetLink string) error {
	message := EmailMessage{
		To:      []string{to},
		Subject: "รีเซ็ตรหัสผ่าน - ระบบ eService กรมโรงงานอุตสาหกรรม",
		Body: fmt.Sprintf(`
		<h2>รีเซ็ตรหัสผ่าน</h2>
		<p>คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
		<p>กรุณาคลิกลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่าน:</p>
		<p><a href="%s">รีเซ็ตรหัสผ่าน</a></p>
		<p>ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง</p>
		<p>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาละเว้นอีเมลนี้</p>
		<br>
		<p>ด้วยความเคารพ,<br>
		ทีมงาน eService กรมโรงงานอุตสาหกรรม</p>
		`, resetLink),
		IsHTML: true,
	}

	return SendEmail(config, message)
}

// SendRequestSubmittedNotification sends notification when a request is submitted
func SendRequestSubmittedNotification(config EmailConfig, to, requestNumber, requestType string) error {
	message := EmailMessage{
		To:      []string{to},
		Subject: fmt.Sprintf("ยืนยันการรับคำขอ %s - ระบบ eService", requestNumber),
		Body: fmt.Sprintf(`
		<h2>ยืนยันการรับคำขอ</h2>
		<p>คำขอของคุณได้รับการบันทึกในระบบเรียบร้อยแล้ว</p>
		<p><strong>เลขที่คำขอ:</strong> %s</p>
		<p><strong>ประเภทคำขอ:</strong> %s</p>
		<p>เจ้าหน้าที่จะดำเนินการตรวจสอบคำขอของคุณภายใน 90 วัน</p>
		<p>คุณสามารถติดตามสถานะคำขอได้ที่: <a href="https://eservice.diw.go.th/requests">https://eservice.diw.go.th/requests</a></p>
		<br>
		<p>ด้วยความเคารับ,<br>
		ทีมงาน eService กรมโรงงานอุตสาหกรรม</p>
		`, requestNumber, requestType),
		IsHTML: true,
	}

	return SendEmail(config, message)
}

// SendRequestAcceptedNotification sends notification when a request is accepted
func SendRequestAcceptedNotification(config EmailConfig, to, requestNumber, inspectorName string) error {
	message := EmailMessage{
		To:      []string{to},
		Subject: fmt.Sprintf("คำขออนุมัติแล้ว - %s", requestNumber),
		Body: fmt.Sprintf(`
		<h2>คำขอได้รับการอนุมัติแล้ว</h2>
		<p>คำขอของคุณได้รับการอนุมัติและมอบหมายให้ผู้ตรวจสอบ</p>
		<p><strong>เลขที่คำขอ:</strong> %s</p>
		<p><strong>ผู้ตรวจสอบ:</strong> %s</p>
		<p>ผู้ตรวจสอบจะติดต่อคุณเพื่อนัดหมายตรวจสอบ</p>
		<p>คุณสามารถติดตามสถานะคำขอได้ที่: <a href="https://eservice.diw.go.th/requests">https://eservice.diw.go.th/requests</a></p>
		<br>
		<p>ด้วยความเคารับ,<br>
		ทีมงาน eService กรมโรงงานอุตสาหกรรม</p>
		`, requestNumber, inspectorName),
		IsHTML: true,
	}

	return SendEmail(config, message)
}

// SendAppointmentNotification sends notification for appointment
func SendAppointmentNotification(config EmailConfig, to, requestNumber, appointmentDate, location string) error {
	message := EmailMessage{
		To:      []string{to},
		Subject: fmt.Sprintf("นัดหมายตรวจสอบ - %s", requestNumber),
		Body: fmt.Sprintf(`
		<h2>นัดหมายตรวจสอบ</h2>
		<p>มีการนัดหมายตรวจสอบสำหรับคำขอของคุณ</p>
		<p><strong>เลขที่คำขอ:</strong> %s</p>
		<p><strong>วันที่:</strong> %s</p>
		<p><strong>สถานที่:</strong> %s</p>
		<p>กรุณาเตรียมเอกสารที่จำเป็นในวันนัดหมาย</p>
		<br>
		<p>ด้วยความเคารับ,<br>
		ทีมงาน eService กรมโรงงานอุตสาหกรรม</p>
		`, requestNumber, appointmentDate, location),
		IsHTML: true,
	}

	return SendEmail(config, message)
}

// SendDeadlineReminderNotification sends deadline reminder
func SendDeadlineReminderNotification(config EmailConfig, to, requestNumber, deadline string) error {
	message := EmailMessage{
		To:      []string{to},
		Subject: fmt.Sprintf("เตือนกำหนดเวลา - %s", requestNumber),
		Body: fmt.Sprintf(`
		<h2>เตือนกำหนดเวลา</h2>
		<p>คำขอของคุณใกล้ถึงกำหนดเวลาแล้ว</p>
		<p><strong>เลขที่คำขอ:</strong> %s</p>
		<p><strong>กำหนดเวลา:</strong> %s</p>
		<p>กรุณาดำเนินการให้เสร็จสิ้นภายในกำหนดเวลา</p>
		<p>คุณสามารถติดตามสถานะคำขอได้ที่: <a href="https://eservice.diw.go.th/requests">https://eservice.diw.go.th/requests</a></p>
		<br>
		<p>ด้วยความเคารับ,<br>
		ทีมงาน eService กรมโรงงานอุตสาหกรรม</p>
		`, requestNumber, deadline),
		IsHTML: true,
	}

	return SendEmail(config, message)
}

// LogEmail logs email for debugging
func LogEmail(message EmailMessage, err error) {
	if err != nil {
		log.Printf("Failed to send email to %s: %v", message.To, err)
	} else {
		log.Printf("Email sent successfully to %s: %s", message.To, message.Subject)
	}
}
