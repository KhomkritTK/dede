package utils

import (
	"time"
)

// GetCurrentTime returns the current time in Bangkok timezone
func GetCurrentTime() time.Time {
	loc, _ := time.LoadLocation("Asia/Bangkok")
	return time.Now().In(loc)
}

// FormatTime formats time to a standard format
func FormatTime(t time.Time) string {
	return t.Format("2006-01-02 15:04:05")
}

// FormatDate formats time to date only
func FormatDate(t time.Time) string {
	return t.Format("2006-01-02")
}

// ParseTime parses a string to time
func ParseTime(timeStr string) (time.Time, error) {
	return time.Parse("2006-01-02 15:04:05", timeStr)
}

// ParseDate parses a date string to time
func ParseDate(dateStr string) (time.Time, error) {
	return time.Parse("2006-01-02", dateStr)
}

// AddDays adds days to a time
func AddDays(t time.Time, days int) time.Time {
	return t.AddDate(0, 0, days)
}

// AddBusinessDays adds business days to a time (excluding weekends)
func AddBusinessDays(t time.Time, days int) time.Time {
	current := t
	added := 0

	for added < days {
		current = current.AddDate(0, 0, 1)

		// Skip weekends (Saturday=6, Sunday=0)
		if current.Weekday() != time.Saturday && current.Weekday() != time.Sunday {
			added++
		}
	}

	return current
}

// GetDeadline returns the deadline (90 days from now)
func GetDeadline() time.Time {
	return AddDays(GetCurrentTime(), 90)
}

// GetOverdueDeadline returns the overdue deadline (14 days from a given date)
func GetOverdueDeadline(from time.Time) time.Time {
	return AddDays(from, 14)
}

// IsOverdue checks if a deadline is overdue
func IsOverdue(deadline time.Time) bool {
	return GetCurrentTime().After(deadline)
}

// DaysUntil calculates days until a specific date
func DaysUntil(target time.Time) int {
	now := GetCurrentTime()
	duration := target.Sub(now)
	return int(duration.Hours() / 24)
}

// IsWeekend checks if a date is weekend
func IsWeekend(t time.Time) bool {
	weekday := t.Weekday()
	return weekday == time.Saturday || weekday == time.Sunday
}

// IsHoliday checks if a date is a holiday (simplified version)
// In a real implementation, you would have a list of holidays
func IsHoliday(t time.Time) bool {
	// This is a placeholder - in a real system you would check against a holiday calendar
	return false
}

// IsBusinessDay checks if a date is a business day
func IsBusinessDay(t time.Time) bool {
	return !IsWeekend(t) && !IsHoliday(t)
}

// GetNextBusinessDay returns the next business day
func GetNextBusinessDay(t time.Time) time.Time {
	next := t.AddDate(0, 0, 1)

	for !IsBusinessDay(next) {
		next = next.AddDate(0, 0, 1)
	}

	return next
}

// GetBusinessDaysBetween calculates business days between two dates
func GetBusinessDaysBetween(start, end time.Time) int {
	if start.After(end) {
		start, end = end, start
	}

	days := 0
	current := start

	for current.Before(end) || current.Equal(end) {
		if IsBusinessDay(current) {
			days++
		}
		current = current.AddDate(0, 0, 1)
	}

	return days
}
