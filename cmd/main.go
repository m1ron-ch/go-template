package main

import (
	"flag"
	"main/internal/app"
)

func main() {
	configFile := flag.String("config", "config", "Path to configuration file")
	flag.Parse()

	app := app.NewApplication()
	app.Run(configFile)
}
