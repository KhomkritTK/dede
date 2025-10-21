package cron

import (
	"eservice-backend/service/workflow/service"
	"log"
	"time"
)

type OverdueCronJob struct {
	overdueService service.OverdueService
	dailyTicker    *time.Ticker
	hourlyTicker   *time.Ticker
	stopChan       chan bool
	running        bool
}

func NewOverdueCronJob(overdueService service.OverdueService) *OverdueCronJob {
	return &OverdueCronJob{
		overdueService: overdueService,
		stopChan:       make(chan bool),
		running:        false,
	}
}

// Start starts the ticker jobs for checking overdue requests
func (j *OverdueCronJob) Start() {
	if j.running {
		log.Println("Overdue check jobs are already running")
		return
	}

	log.Println("Starting overdue check jobs...")
	j.running = true

	// Start daily ticker (24 hours)
	j.dailyTicker = time.NewTicker(24 * time.Hour)
	go func() {
		for {
			select {
			case <-j.dailyTicker.C:
				if !j.running {
					return
				}
				log.Println("Running daily overdue check...")
				if err := j.overdueService.CheckOverdueRequests(); err != nil {
					log.Printf("Error checking overdue requests: %v", err)
				}
			case <-j.stopChan:
				return
			}
		}
	}()

	// Start hourly ticker
	j.hourlyTicker = time.NewTicker(1 * time.Hour)
	go func() {
		for {
			select {
			case <-j.hourlyTicker.C:
				if !j.running {
					return
				}
				log.Println("Sending overdue notifications...")
				if err := j.overdueService.SendOverdueNotifications(); err != nil {
					log.Printf("Error sending overdue notifications: %v", err)
				}
			case <-j.stopChan:
				return
			}
		}
	}()

	log.Println("Overdue check jobs started successfully")
}

// Stop stops the ticker jobs
func (j *OverdueCronJob) Stop() {
	if !j.running {
		log.Println("Overdue check jobs are not running")
		return
	}

	log.Println("Stopping overdue check jobs...")
	j.running = false

	if j.dailyTicker != nil {
		j.dailyTicker.Stop()
	}

	if j.hourlyTicker != nil {
		j.hourlyTicker.Stop()
	}

	// Signal stop to goroutines
	close(j.stopChan)
	j.stopChan = make(chan bool)

	log.Println("Overdue check jobs stopped")
}

// RunOnce runs the overdue check once immediately
func (j *OverdueCronJob) RunOnce() {
	log.Println("Running overdue check once...")
	if err := j.overdueService.CheckOverdueRequests(); err != nil {
		log.Printf("Error checking overdue requests: %v", err)
	}

	if err := j.overdueService.SendOverdueNotifications(); err != nil {
		log.Printf("Error sending overdue notifications: %v", err)
	}

	log.Println("Overdue check completed")
}

// GetStatistics returns overdue statistics
func (j *OverdueCronJob) GetStatistics() (map[string]interface{}, error) {
	return j.overdueService.GetOverdueStatistics()
}

// RunTest runs a test of the overdue service with a specific request
func (j *OverdueCronJob) RunTest(requestID uint, licenseType string) error {
	log.Printf("Running overdue test for request %d (%s)...", requestID, licenseType)
	return j.overdueService.ProcessOverdueRequest(requestID, licenseType)
}

// ScheduleNextRun schedules the next run of the overdue check
func (j *OverdueCronJob) ScheduleNextRun(delay time.Duration) {
	log.Printf("Scheduling next overdue check in %v...", delay)
	time.AfterFunc(delay, func() {
		j.RunOnce()
	})
}
