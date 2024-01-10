package usecase

import (
	"context"
	repo "digital-test-vm/be/internal/repository"
	"digital-test-vm/be/internal/shared"
	"time"

	"github.com/go-co-op/gocron"
)

type Cron struct {
	orderRepo repo.OrderRepo
}

func New(u repo.OrderRepo) *Cron {
	return &Cron{
		orderRepo: u,
	}
}

func (c *Cron) Run() {
	s := gocron.NewScheduler(time.UTC)
	/*
		Scheduler will run at 00:01 everyday
	*/
	s.Every(1).Day().At("07:01").Do(func() {
		listOrder, err := c.orderRepo.GetAllOrderWithStatusOnDelivery(context.Background())
		if err != nil {
			return
		}
		for _, v := range listOrder {
			c.orderRepo.ChangeOrderStatus(context.Background(), v.OrderId, shared.Delivered.String())
		}
	})
	s.StartAsync()
}
