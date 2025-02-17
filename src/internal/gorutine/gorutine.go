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
	now := time.Now().UTC()

	leakedList, err := leakedService.GetAll()
	if err != nil {
		log.Println("Failed to retrieve scheduled leaked:", err)
		return
	}

	for i := range leakedList {
		l := &leakedList[i]

		// Сначала проверяем, что l.Expires не nil
		if l.Expires == nil {
			// Если нет даты, можно пропустить или обработать по-другому
			continue
		}

		// Теперь можно безопасно вызывать l.Expires.UTC()
		before := l.Expires.UTC().Before(now)
		equal := l.Expires.UTC().Equal(now)

		if before || equal {
			l.Status = 1
			l.Publish = 1
			l.ExpiresStr = ""
			err := leakedService.Update(l)
			if err != nil {
				log.Println("Failed to publish leaked ID:", l.ID, "Error:", err)
			}
		}
	}
}
