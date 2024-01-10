package server

import (
	"digital-test-vm/be/internal/handler"
	repo "digital-test-vm/be/internal/repository"
	"digital-test-vm/be/internal/usecase"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Server struct {
	Server  *http.Server
	Router  *gin.Engine
	Handler *handler.Handler
	Usecase *usecase.Usecase
	Repo    *repo.Repo
}

func (s *Server) InitHandler() {
	s.Handler = handler.NewHandler(s.Usecase)
}

func (s *Server) InitUsecase() {
	s.Usecase = usecase.NewUsecase(s.Repo)
	/* Implement Cron Job For Update Order */
	s.Usecase.Cron.Run()
}

func (s *Server) InitRepo(db *gorm.DB, redis *redis.Client) {
	s.Repo = repo.NewRepo(db, redis)
}

func (s *Server) Start(db *gorm.DB, redis *redis.Client) {
	s.InitRepo(db, redis)
	s.InitUsecase()
	s.InitHandler()
	s.InitRouter()
	s.Server = &http.Server{
		Addr:    os.Getenv("API_PORT"),
		Handler: s.Router,
	}
	err := s.Server.ListenAndServe()
	if err != nil {
		return
	}
}

func NewServer() *Server {
	return &Server{}
}
