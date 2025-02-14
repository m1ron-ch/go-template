package utility

import (
	"bytes"
	"context"
	"crypto/sha1"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"time"

	"github.com/jackpal/bencode-go"
	"github.com/trycourier/courier-go/v2"
)

func FormatExpires(expiresStr string) (string, error) {
	// Парсим дату в формате RFC3339
	t, err := time.Parse(time.RFC3339, expiresStr)
	if err != nil {
		return "", fmt.Errorf("failed to parse expires: %w", err)
	}
	// Форматируем в строку для MySQL
	return t.Format("2006-01-02 15:04:05"), nil
}

func CalculateFileHash(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := sha256.New()

	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	return fmt.Sprintf("%x", hash.Sum(nil)), nil
}

func CheckFileIntegrity(filePath string, expectedHash string) bool {
	calculatedHash, err := CalculateFileHash(filePath)
	if err != nil {
		return false
	}

	return calculatedHash == expectedHash
}

func GenerateOTP() (string, error) {
	const otpChars = "1234567890"
	buffer := make([]byte, 6)
	_, err := rand.Read(buffer)
	if err != nil {
		return "", err
	}

	otpCharsLength := len(otpChars)
	for i := 0; i < 6; i++ {
		buffer[i] = otpChars[int(buffer[i])%otpCharsLength]
	}

	return string(buffer), nil
}

func SendEmailMessage(email, shortMsg, fullMsg string) error {
	return nil

	var (
		apiKey     = "pk_prod_DXVA2RAQDB49JKNMKTBQ5TXRW8DM"
		templateID = "B2K1891QZ7MD73G6XXN4WR6BJHHZ"
	)

	client := courier.CreateClient(apiKey, nil)

	_, err := client.SendMessage(
		context.Background(),
		courier.SendMessageRequestBody{
			Message: map[string]interface{}{
				"to": map[string]interface{}{
					"email": email,
				},
				"template": templateID,
				"data": map[string]interface{}{
					"shortMsg": shortMsg,
					"fullMsg":  fullMsg,
					"appName":  "CMS - НИИ ТЗИ",
				},
			},
		})

	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

func GeneratePassword(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	random := rand.New(rand.NewSource(time.Now().UnixNano()))

	password := make([]byte, length)

	for i := range password {
		password[i] = charset[random.Intn(len(charset))]
	}

	return string(password)
}

func GenerateToken() (string, error) {
	tokenLength := 32
	randomBytes := make([]byte, tokenLength)
	_, err := rand.Read(randomBytes)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(randomBytes), nil
}

func HashStringWithGlobalSalt(input string) string {
	hash := sha256.New()

	saltBytes := []byte("niitzi")

	hash.Write(saltBytes)
	hash.Write([]byte(input))

	hashBytes := hash.Sum(nil)

	hashedString := hex.EncodeToString(hashBytes)

	return hashedString
}

func IsSHA256Hash(input string) bool {
	match, _ := regexp.MatchString("^[a-fA-F0-9]{64}$", input)
	return match
}

func GenerateTokenExpirationTime(expirationTime time.Duration) time.Time {
	return time.Now().Add(expirationTime).UTC()
}

func RemoveCookie(w http.ResponseWriter, name string) {
	cookie := &http.Cookie{
		Name:    name,
		Value:   "",
		Path:    "/",
		Expires: time.Unix(0, 0),
	}
	http.SetCookie(w, cookie)
}

func SetCookie(w http.ResponseWriter, name, value string, expiration time.Duration) {
	cookie := &http.Cookie{
		Name:     name,
		Value:    value,
		Expires:  time.Now().Add(expiration),
		Path:     "/",
		SameSite: http.SameSiteNoneMode,
		HttpOnly: true,
		Secure:   true,
	}
	http.SetCookie(w, cookie)
}

func GetCookie(r *http.Request, name string) (string, error) {
	cookie, err := r.Cookie(name)
	if err != nil {
		return "", nil
	}
	return cookie.Value, nil
}

func GetOrDefault(value, defaultValue string) string {
	if value == "" {
		return defaultValue
	}
	return value
}

func IntToBool(a int) bool {
	return a != 0
}

func GetClientIP(r *http.Request) (string, error) {
	if r == nil {
		getInterfaceAddresses := func(interfaceName string) (string, error) {
			iface, err := net.InterfaceByName(interfaceName)
			if err != nil {
				fmt.Println("Ошибка получения интерфейса:", err)
				return "", err
			}

			addrs, err := iface.Addrs()
			if err != nil {
				fmt.Println("Ошибка получения адресов для интерфейса", iface.Name, ":", err)
				return "", err
			}

			var addresses []string
			for _, addr := range addrs {
				addresses = append(addresses, fmt.Sprintf("%s", addr))
			}

			return strings.Join(addresses, ", "), nil
		}

		os := runtime.GOOS
		switch os {
		case "windows":
			return getInterfaceAddresses("Ethernet")
		case "linux":
			result, err := getInterfaceAddresses("ens18")
			if result == "" {
				return getInterfaceAddresses("lo")
			}
			return result, err
		default:
			return "NULL", nil
		}
	}

	forwardedFor := r.Header.Get("X-Forwarded-For")
	if forwardedFor != "" {
		ips := strings.Split(forwardedFor, ",")
		return strings.TrimSpace(ips[0]), nil
	}

	// return r.RemoteAddr, nil
	return strings.Split(r.RemoteAddr, ":")[0], nil
}

func CheckAuthorization(r *http.Request) (string, string, error) {
	token, err := GetCookie(r, "token")
	fmt.Println(token)
	if err != nil || token == "" {
		return "", "", errors.New("unauthorized: missing token")
	}

	userID, err := GetCookie(r, "uid")
	if err != nil || userID == "" {
		return "", "", errors.New("unauthorized: missing user_id")
	}

	return token, userID, nil
}

func FormatDateString(dateString string) (string, error) {
	parsedDate, err := time.Parse("02-01-2006", dateString)
	if err != nil {
		return "", err
	}
	return parsedDate.Format("2006-01-02"), nil
}

func GenerateUniqueFileName(originalFileName string) string {
	extension := filepath.Ext(originalFileName)
	randomStr := GenerateRandomString(8)

	return fmt.Sprintf("%s_%s%s", YearMonthDay("_"), randomStr, extension)
}

func YearMonthDay(pref string) string {
	now := time.Now()
	format := fmt.Sprintf("2006%s01%s02", pref, pref)
	return now.Format(format)
}

func GenerateRandomString(length int) string {
	b := make([]byte, length)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)[:length]
}

func GeneratePeerID() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("-GO0001-%012d", rand.Int63n(1e12))
}

func CalculateInfoHash(info interface{}) []byte {
	var buf bytes.Buffer
	err := bencode.Marshal(&buf, info)
	if err != nil {
		log.Fatal("Failed to encode info:", err)
	}

	hasher := sha1.New()
	hasher.Write(buf.Bytes())
	return hasher.Sum(nil)
}

func GetFreePort() (int, error) {
	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		return 0, err
	}
	defer listener.Close()
	return listener.Addr().(*net.TCPAddr).Port, nil
}
