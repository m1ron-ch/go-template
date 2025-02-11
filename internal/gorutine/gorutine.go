package gorutine

import (
	"log"
	"main/internal/domain/leaked"
	"time"
)

func StartNewsPublisher(leakedService leaked.Service) {
	ticker := time.NewTicker(1 * time.Second)
	go func() {
		for range ticker.C {
			PublishScheduledLeaked(leakedService)
		}
	}()
}

func PublishScheduledLeaked(leakedService leaked.Service) {
	now := time.Now()
	leakedList, err := leakedService.GetAll()
	if err != nil {
		log.Println("Failed to retrieve scheduled leaked:", err)
		return
	}

	for i := range leakedList {
		l := &leakedList[i]
		if l.Expires != nil && (l.Expires.Before(now) || l.Expires.Equal(now)) {
			l.Status = 1
			err := leakedService.Update(l)
			if err != nil {
				log.Println("Failed to publish leaked ID:", l.ID, "Error:", err)
			}
		}
	}
}
