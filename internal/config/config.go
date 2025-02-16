package config

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"time"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Env          string       `yaml:"env" env-default:"local"`
	ServerConfig ServerConfig `yaml:"server"`
	DBConfig     DBConfig     `yaml:"database"`
	JWTSecret    string       `yaml:"jwt_secret"`
	URL1         string       `yaml:"url_1"`
	URL2         string       `yaml:"url_2"`
}

type ServerConfig struct {
	Address     string        `yaml:"address"`
	Port        string        `yaml:"port"`
	Timeout     time.Duration `yaml:"timeout"`
	IdleTimeout time.Duration `yaml:"idle_timeout"`
}

type DBConfig struct {
	DBName   string `yaml:"db_name"`
	Hostname string `yaml:"hostname"`
	Port     string `yaml:"port"`
	Username string `yaml:"user"`
	Password string `yaml:"password"`
}

func MustLoad(fileConfig string) (*Config, error) {
	_, b, _, _ := runtime.Caller(0)
	basePath := filepath.Dir(filepath.Dir(filepath.Dir(filepath.Dir(b))))
	configPath := filepath.Join(basePath, "mnt", "web", "configs", fileConfig+".yaml")

	cfg := NewConfig()

	file, err := os.Open(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open config file '%s': %w", fileConfig, err)
	}
	defer file.Close()

	decoder := yaml.NewDecoder(file)
	if err := decoder.Decode(cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config file '%s': %w", fileConfig, err)
	}

	return cfg, nil
}

func NewConfig() *Config {
	return &Config{
		ServerConfig: NewServerConfig(),
		DBConfig:     NewDBConfig(),
	}
}

func NewServerConfig() ServerConfig {
	return ServerConfig{
		Address:     "0.0.0.0",
		Port:        "8080",
		Timeout:     30 * time.Second,
		IdleTimeout: 60 * time.Second,
	}
}

func NewDBConfig() DBConfig {
	return DBConfig{
		Hostname: "127.0.0.1",
		Username: "root",
		Password: "password",
		DBName:   "mydatabase",
	}
}
