package utils

import (
	"encoding/json"
	"math/rand"
	"strings"
	"time"

	gomail "gopkg.in/mail.v2"
)

const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
const (
	letterIdxBits = 6                    // 6 bits to represent a letter index
	letterIdxMask = 1<<letterIdxBits - 1 // All 1-bits, as many as letterIdxBits
)

var src = rand.NewSource(time.Now().UnixNano())

func GenerateVerificationCode(n int) string {
	sb := strings.Builder{}
	sb.Grow(n)

	for i, cache, remain := n-1, src.Int63(), letterIdxMask; i >= 0; {
		if remain == 0 {
			cache, remain = src.Int63(), letterIdxMask
		}
		if idx := int(cache & letterIdxMask); idx < len(letterBytes) {
			sb.WriteByte(letterBytes[idx])
			i--
		}
		cache >>= letterIdxBits
		remain--
	}

	return sb.String()
}

const CONFIG_SMTP_HOST = "smtp.gmail.com"
const CONFIG_SMTP_PORT = 587
const CONFIG_SENDER_NAME = "Platypus Marketplace <platypus.marketplace@gmail.com>"
const CONFIG_AUTH_EMAIL = "platypus.marketplace@gmail.com"
const CONFIG_AUTH_PASSWORD = "scguuipuesuvlsin"

func GenerateAndSendEmail(email string, message string) error {
	mailer := gomail.NewMessage()
	mailer.SetHeader("From", CONFIG_SENDER_NAME)
	mailer.SetHeader("To", "platypus.marketplace@gmail.com")
	mailer.SetHeader("Subject", "Change Password Verification")
	mailer.SetBody("text/html", message)

	dialer := gomail.NewDialer(
		CONFIG_SMTP_HOST,
		CONFIG_SMTP_PORT,
		CONFIG_AUTH_EMAIL,
		CONFIG_AUTH_PASSWORD,
	)

	err := dialer.DialAndSend(mailer)
	if err != nil {
		return err
	}
	return nil
}

func PrettyPrint(i interface{}) string {
	s, _ := json.MarshalIndent(i, "", "\t")
	return string(s)
}
