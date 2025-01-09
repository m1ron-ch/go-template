package logger

import (
	"io"
	"os"

	"github.com/natefinch/lumberjack"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Logger — обёртка над zap.SugaredLogger (или zap.Logger, если нужна максимальная производительность).
type Logger struct {
	SugaredLogger *zap.SugaredLogger
}

// NewLoggerConsole возвращает логгер, который пишет только в консоль (stdout).
func NewLoggerConsole(level zapcore.Level) (*Logger, error) {
	// Настраиваем энкодер — как будут выглядеть логи
	encoderCfg := zap.NewProductionEncoderConfig()
	encoderCfg.EncodeTime = zapcore.ISO8601TimeEncoder // Время в формате YYYY-MM-DDTHH:MM:SS
	encoderCfg.TimeKey = "ts"                          // Ключ для поля времени

	// Указываем уровень логирования
	atomicLevel := zap.NewAtomicLevelAt(level)

	// Создаём core
	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderCfg), // Формат JSON
		zapcore.Lock(os.Stdout),            // Пишем в stdout
		atomicLevel,
	)

	// Собираем готовый логгер
	logger := zap.New(core, zap.AddCaller()) // AddCaller добавляет информацию о файле и номере строки
	sugared := logger.Sugar()

	return &Logger{
		SugaredLogger: sugared,
	}, nil
}

// NewLoggerWithRotation возвращает логгер, который пишет и в консоль, и в файл с ротацией.
// Для ротации используем lumberjack.
func NewLoggerWithRotation(
	logFilePath string,
	maxSizeMB, maxBackups, maxAgeDays int,
	compress bool,
	level zapcore.Level,
) (*Logger, error) {
	// Настраиваем формат логов (JSON с ISO8601 временем)
	encoderCfg := zap.NewProductionEncoderConfig()
	encoderCfg.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderCfg.TimeKey = "ts"

	// Уровень логирования
	atomicLevel := zap.NewAtomicLevelAt(level)

	// Настраиваем ротацию логов: файл будет «перезаписываться» при достижении maxSizeMB (в МБ).
	// maxBackups — сколько старых файлов хранить, maxAgeDays — сколько дней хранить файлы.
	// compress — сжимать ли файлы (gzip).
	lumberjackWriter := &lumberjack.Logger{
		Filename:   logFilePath,
		MaxSize:    maxSizeMB,  // мегабайты
		MaxBackups: maxBackups, // количество старых файлов
		MaxAge:     maxAgeDays, // дни
		Compress:   compress,   // сжатие
	}

	// Создадим мультивывод: stdout + файл
	multiWriter := io.MultiWriter(os.Stdout, lumberjackWriter)

	// Собираем core
	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderCfg),
		zapcore.Lock(zapcore.AddSync(multiWriter)),
		atomicLevel,
	)

	// Создаём логгер
	logger := zap.New(core, zap.AddCaller())
	sugared := logger.Sugar()

	return &Logger{SugaredLogger: sugared}, nil
}

// -------------------------------
// Методы для удобного использования
// -------------------------------

// Debug — лог на уровне debug
func (l *Logger) Debug(msg string, keysAndValues ...interface{}) {
	l.SugaredLogger.Debugw(msg, keysAndValues...)
}

// Info — лог на уровне info
func (l *Logger) Info(msg string, keysAndValues ...interface{}) {
	l.SugaredLogger.Infow(msg, keysAndValues...)
}

// Warn — лог на уровне warn
func (l *Logger) Warn(msg string, keysAndValues ...interface{}) {
	l.SugaredLogger.Warnw(msg, keysAndValues...)
}

// Error — лог на уровне error
func (l *Logger) Error(msg string, keysAndValues ...interface{}) {
	l.SugaredLogger.Errorw(msg, keysAndValues...)
}

// Fatal — лог на уровне fatal (завершает программу)
func (l *Logger) Fatal(msg string, keysAndValues ...interface{}) {
	l.SugaredLogger.Fatalw(msg, keysAndValues...)
}

// Sync — нужно вызывать при завершении программы,
// чтобы успеть сбросить буфер логов на диск/консоль.
func (l *Logger) Sync() {
	_ = l.SugaredLogger.Sync()
}
