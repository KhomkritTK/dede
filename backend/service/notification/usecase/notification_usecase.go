package usecase

import (
	"errors"

	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/notification/dto"
)

type NotificationUsecase interface {
	CreateNotification(req dto.CreateNotificationRequest) (*dto.NotificationResponse, error)
	GetNotificationByID(id uint) (*dto.NotificationResponse, error)
	GetNotifications(page, limit int, recipientID uint, recipientRole string) (*dto.NotificationListResponse, error)
	GetUnreadNotifications(recipientID uint) (*dto.NotificationListResponse, error)
	MarkAsRead(id uint) error
	MarkAllAsRead(recipientID uint) error
	DeleteNotification(id uint) error
	GetNotificationCount(recipientID uint) (*dto.NotificationCountResponse, error)
	GetNotificationTypes() []dto.NotificationTypeResponse
	GetNotificationPriorities() []dto.NotificationPriorityResponse
	SendUnsentNotifications() error
}

type notificationUsecase struct {
	notificationRepo repository.NotificationRepository
	userRepo         repository.UserRepository
}

func NewNotificationUsecase(
	notificationRepo repository.NotificationRepository,
	userRepo repository.UserRepository,
) NotificationUsecase {
	return &notificationUsecase{
		notificationRepo: notificationRepo,
		userRepo:         userRepo,
	}
}

func (u *notificationUsecase) CreateNotification(req dto.CreateNotificationRequest) (*dto.NotificationResponse, error) {
	// Validate notification type
	if !u.isValidNotificationType(req.Type) {
		return nil, errors.New("invalid notification type")
	}

	// Validate notification priority
	if !u.isValidNotificationPriority(req.Priority) {
		return nil, errors.New("invalid notification priority")
	}

	// Create notification
	recipientRole := models.UserRole(req.RecipientRole)
	notification := &models.Notification{
		RecipientID:   req.RecipientID,
		RecipientRole: &recipientRole,
		Type:          models.NotificationType(req.Type),
		Title:         req.Title,
		Message:       req.Message,
		Priority:      models.NotificationPriority(req.Priority),
		EntityType:    req.EntityType,
		EntityID:      req.EntityID,
		ActionURL:     req.ActionURL,
		IsEmailSent:   req.IsEmailSent,
	}

	if err := u.notificationRepo.Create(notification); err != nil {
		return nil, errors.New("failed to create notification")
	}

	return u.convertToNotificationResponse(notification)
}

func (u *notificationUsecase) GetNotificationByID(id uint) (*dto.NotificationResponse, error) {
	notification, err := u.notificationRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	return u.convertToNotificationResponse(notification)
}

func (u *notificationUsecase) GetNotifications(page, limit int, recipientID uint, recipientRole string) (*dto.NotificationListResponse, error) {
	var notifications []models.Notification
	var total int64
	var err error

	if recipientID > 0 {
		notifications, err = u.notificationRepo.GetByRecipientID(recipientID)
	} else if recipientRole != "" {
		notifications, err = u.notificationRepo.GetByRecipientRole(models.UserRole(recipientRole))
	} else {
		notifications, err = u.notificationRepo.GetAll()
	}

	if err != nil {
		return nil, err
	}

	// Apply pagination
	total = int64(len(notifications))
	start := (page - 1) * limit
	end := start + limit

	if start > int(total) {
		start = int(total)
	}
	if end > int(total) {
		end = int(total)
	}

	paginatedNotifications := notifications[start:end]

	// Convert to response format
	var responses []dto.NotificationResponse
	for _, notification := range paginatedNotifications {
		response, err := u.convertToNotificationResponse(&notification)
		if err != nil {
			continue
		}
		responses = append(responses, *response)
	}

	return &dto.NotificationListResponse{
		Notifications: responses,
		Pagination: dto.PaginationResponse{
			Page:  page,
			Limit: limit,
			Total: total,
		},
	}, nil
}

func (u *notificationUsecase) GetUnreadNotifications(recipientID uint) (*dto.NotificationListResponse, error) {
	notifications, err := u.notificationRepo.GetUnreadByRecipientID(recipientID)
	if err != nil {
		return nil, err
	}

	// Convert to response format
	var responses []dto.NotificationResponse
	for _, notification := range notifications {
		response, err := u.convertToNotificationResponse(&notification)
		if err != nil {
			continue
		}
		responses = append(responses, *response)
	}

	return &dto.NotificationListResponse{
		Notifications: responses,
		Pagination: dto.PaginationResponse{
			Page:  1,
			Limit: len(responses),
			Total: int64(len(responses)),
		},
	}, nil
}

func (u *notificationUsecase) MarkAsRead(id uint) error {
	return u.notificationRepo.MarkAsRead(id)
}

func (u *notificationUsecase) MarkAllAsRead(recipientID uint) error {
	return u.notificationRepo.MarkAllAsReadByRecipientID(recipientID)
}

func (u *notificationUsecase) DeleteNotification(id uint) error {
	return u.notificationRepo.Delete(id)
}

func (u *notificationUsecase) GetNotificationCount(recipientID uint) (*dto.NotificationCountResponse, error) {
	total, err := u.notificationRepo.GetCountByRecipientID(recipientID)
	if err != nil {
		return nil, err
	}

	unread, err := u.notificationRepo.GetUnreadCountByRecipientID(recipientID)
	if err != nil {
		return nil, err
	}

	return &dto.NotificationCountResponse{
		Total:  total,
		Unread: unread,
	}, nil
}

func (u *notificationUsecase) GetNotificationTypes() []dto.NotificationTypeResponse {
	return []dto.NotificationTypeResponse{
		{Value: "request", Label: "คำขอ"},
		{Value: "inspection", Label: "การตรวจสอบ"},
		{Value: "report", Label: "รายงาน"},
		{Value: "approval", Label: "การอนุมัติ"},
		{Value: "rejection", Label: "การปฏิเสธ"},
		{Value: "deadline", Label: "กำหนดเวลา"},
		{Value: "system", Label: "ระบบ"},
	}
}

func (u *notificationUsecase) GetNotificationPriorities() []dto.NotificationPriorityResponse {
	return []dto.NotificationPriorityResponse{
		{Value: string(models.PriorityLow), Label: "ต่ำ"},
		{Value: "medium", Label: "ปานกลาง"},
		{Value: string(models.PriorityHigh), Label: "สูง"},
	}
}

func (u *notificationUsecase) SendUnsentNotifications() error {
	// Get unsent notifications
	notifications, err := u.notificationRepo.GetUnsentNotifications()
	if err != nil {
		return err
	}

	// Mark notifications as sent
	for _, notification := range notifications {
		if err := u.notificationRepo.MarkAsSent(notification.ID); err != nil {
			continue
		}
	}

	return nil
}

func (u *notificationUsecase) isValidNotificationType(notificationType string) bool {
	validTypes := []string{
		"request",
		"inspection",
		"report",
		"approval",
		"rejection",
		"deadline",
		"system",
	}

	for _, validType := range validTypes {
		if notificationType == validType {
			return true
		}
	}

	return false
}

func (u *notificationUsecase) isValidNotificationPriority(priority string) bool {
	validPriorities := []string{
		string(models.PriorityLow),
		"medium",
		string(models.PriorityHigh),
	}

	for _, validPriority := range validPriorities {
		if priority == validPriority {
			return true
		}
	}

	return false
}

func (u *notificationUsecase) convertToNotificationResponse(notification *models.Notification) (*dto.NotificationResponse, error) {
	recipientRole := ""
	if notification.RecipientRole != nil {
		recipientRole = string(*notification.RecipientRole)
	}

	return &dto.NotificationResponse{
		ID:            notification.ID,
		RecipientID:   notification.RecipientID,
		RecipientRole: recipientRole,
		Type:          string(notification.Type),
		Title:         notification.Title,
		Message:       notification.Message,
		Priority:      string(notification.Priority),
		EntityType:    notification.EntityType,
		EntityID:      notification.EntityID,
		ActionURL:     notification.ActionURL,
		IsRead:        notification.IsRead,
		IsSent:        notification.IsSent,
		IsEmailSent:   notification.IsEmailSent,
		ReadAt:        notification.ReadAt,
		SentAt:        notification.SentAt,
		EmailSentAt:   notification.EmailSentAt,
		CreatedAt:     notification.CreatedAt,
		UpdatedAt:     notification.UpdatedAt,
	}, nil
}
