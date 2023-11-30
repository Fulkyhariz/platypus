package logger

import "github.com/sirupsen/logrus"

// Log is a package level variable, every program should access logging function through "Log"
var Log Logger

// Logger represent common interface for logging function
type Logger interface {
	Error(args map[string]interface{})
	Errorf(format string, args ...interface{})
	Fatalf(format string, args ...interface{})
	Fatal(args ...interface{})
	Infof(format string, args ...interface{})
	Info(args map[string]interface{})
	Warnf(format string, args ...interface{})
	Debugf(format string, args ...interface{})
	Debug(args ...interface{})
}

type loggerWrapper struct {
	lw *logrus.Logger
}

func (logger *loggerWrapper) Debug(args ...interface{}) {
	logger.lw.Debug(args...)
}

func (logger *loggerWrapper) Error(args map[string]interface{}) {
	logger.lw.WithFields(args).Error("got error")
}

func (logger *loggerWrapper) Errorf(format string, args ...interface{}) {
	logger.lw.Errorf(format, args...)
}
func (logger *loggerWrapper) Fatalf(format string, args ...interface{}) {
	logger.lw.Fatalf(format, args...)
}
func (logger *loggerWrapper) Fatal(args ...interface{}) {
	logger.lw.Fatal(args...)
}
func (logger *loggerWrapper) Infof(format string, args ...interface{}) {
	logger.lw.Infof(format, args...)
}
func (logger *loggerWrapper) Info(args map[string]interface{}) {
	logger.lw.WithFields(args).Info("incoming request")
}

func (logger *loggerWrapper) Warnf(format string, args ...interface{}) {
	logger.lw.Warnf(format, args...)
}
func (logger *loggerWrapper) Debugf(format string, args ...interface{}) {
	logger.lw.Debugf(format, args...)
}
func (logger *loggerWrapper) Printf(format string, args ...interface{}) {
	logger.lw.Infof(format, args...)
}
func (logger *loggerWrapper) Println(args ...interface{}) {
	logger.lw.Info(args, "\n")
}

func NewLogger() Logger {
	logrus.SetFormatter(&logrus.JSONFormatter{})
	return &loggerWrapper{
		lw: logrus.New(),
	}
}
