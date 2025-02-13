package httpserver

import (
	"context"
	"fmt"
	"log"
	"main/internal/config"
	"net/http"
	"os"
	"os/signal"
	"regexp"
	"time"

	"github.com/gorilla/mux"
)

func Start(router *mux.Router, cfg config.ServerConfig) error {
	srv := &http.Server{
		Addr:         fmt.Sprintf("%s:%s", cfg.Address, cfg.Port),
		Handler:      router,
		WriteTimeout: cfg.Timeout,
		ReadTimeout:  cfg.Timeout,
		IdleTimeout:  cfg.IdleTimeout,
	}

	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt)

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("Error starting the server: %v\n", err)
		}
	}()

	printPathRouter(router)

	log.Printf("Server is listening on %s:%s", cfg.Address, cfg.Port)

	<-stopChan
	log.Println("Stopping the server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Error stopping the server: %v\n", err)
		return err
	}

	log.Println("Server stopped")
	return nil
}

const (
	Reset         = "\033[0m"
	Red           = "\033[31m"
	Green         = "\033[32m"
	Yellow        = "\033[33m"
	Blue          = "\033[34m"
	Purple        = "\033[35m"
	Cyan          = "\033[36m"
	White         = "\033[37m"
	Bold          = "\033[1m"
	ArgumentColor = "\033[36m"
)

func getColorByMethod(method string) string {
	switch method {
	case "GET":
		return Green
	case "POST":
		return Blue
	case "PUT":
		return Yellow
	case "DELETE":
		return Red
	case "PATCH":
		return Purple
	default:
		return White
	}
}

func highlightArguments(path string) string {
	re := regexp.MustCompile(`\{[^\}]+\}`)
	return re.ReplaceAllStringFunc(path, func(arg string) string {
		return ArgumentColor + arg + Reset
	})
}

func printPathRouter(router *mux.Router) {
	fmt.Println(Bold + "List of registered routes:" + Reset)

	routesByMethod := make(map[string][]string)

	err := router.Walk(func(route *mux.Route, router *mux.Router, ancestors []*mux.Route) error {
		template, err := route.GetPathTemplate()
		if err != nil {
			return nil
		}

		methods, err := route.GetMethods()
		if err != nil {
			methods = []string{"ANY"}
		}

		for _, method := range methods {
			routesByMethod[method] = append(routesByMethod[method], template)
		}

		return nil
	})

	if err != nil {
		fmt.Println("Error walking routes:", err)
		return
	}

	for method, paths := range routesByMethod {
		color := getColorByMethod(method)
		fmt.Printf("\n%sMethod: %s%s\n", color, method, Reset)

		for _, path := range paths {
			highlightedPath := highlightArguments(path)
			fmt.Printf("  %sPath:%s %s\n", Bold, Reset, highlightedPath)
		}
	}

	fmt.Printf("\n")
}
