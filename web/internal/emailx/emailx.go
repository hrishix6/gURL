package emailx

import (
	"bytes"
	"context"
	"embed"
	"fmt"
	"gurl/web/internal/models"
	"html/template"
	"log"
	"os"
	"slices"
	"strconv"
	"time"

	"github.com/mailgun/mailgun-go/v5"
	"gopkg.in/gomail.v2"
)

//go:embed templates
var templatesFS embed.FS

var mailTemplates *template.Template

func init() {
	mailTemplates = template.Must(template.ParseFS(templatesFS, "templates/*.html"))
}

type MailApiConfig struct {
	Domain string
	ApiKey string
}

type MailSmtpConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Domain   string
}

type Mailer struct {
	delivery    string
	FromAddress string
	apiConfig   *MailApiConfig
	smtpConfig  *MailSmtpConfig
}

func SetMailConfig(mailer *Mailer) error {

	mailDelivery, ok := os.LookupEnv("MAIL_DELIVERY")

	if !ok || !slices.Contains([]string{"api", "smtp"}, mailDelivery) {
		return fmt.Errorf("MAIL_DELIVERY not configured or incorrect, valid values - 'api' or 'smtp'")
	}

	mailer.delivery = mailDelivery

	fromAddress, ok := os.LookupEnv("MAIL_FROM_EMAIL")

	if !ok || fromAddress == "" {
		return fmt.Errorf("MAIL_FROM_EMAIL not configured or incorrect")
	}

	mailer.FromAddress = fromAddress

	if mailDelivery == "api" {
		apiCfg, err := ReadApiMailConfig()

		if err != nil {
			return err
		}

		mailer.apiConfig = apiCfg
	}

	if mailDelivery == "smtp" {
		smtpCfg, err := ReadSmtpMailConfig()

		if err != nil {
			return err
		}

		mailer.smtpConfig = smtpCfg
	}

	return nil
}

func ReadApiMailConfig() (*MailApiConfig, error) {

	config := &MailApiConfig{}

	if domain, ok := os.LookupEnv("MAIL_DOMAIN"); !ok || domain == "" {
		return nil, fmt.Errorf("MAIL_DOMAIN is required ")
	} else {
		config.Domain = domain
	}

	if apiKey, ok := os.LookupEnv("MAIL_API_KEY"); !ok || apiKey == "" {
		return nil, fmt.Errorf("MAIL_API_KEY is required ")
	} else {
		config.ApiKey = apiKey
	}

	return config, nil
}

func ReadSmtpMailConfig() (*MailSmtpConfig, error) {

	config := &MailSmtpConfig{}

	if host, ok := os.LookupEnv("SMTP_HOST"); !ok || host == "" {
		return nil, fmt.Errorf("smtp host is missing or invalid")
	} else {
		config.Host = host
	}

	if portStr, ok := os.LookupEnv("SMTP_PORT"); !ok {
		return nil, fmt.Errorf("smtp port is missing")
	} else {
		if portNum, err := strconv.Atoi(portStr); err != nil {
			return nil, fmt.Errorf("smtp port is invalid")
		} else {
			config.Port = portNum
		}
	}

	if user, ok := os.LookupEnv("SMTP_USERNAME"); !ok || user == "" {
		return nil, fmt.Errorf("smtp user is missing or invalid")
	} else {
		config.User = user
	}

	if pass, ok := os.LookupEnv("SMTP_PASSWORD"); !ok || pass == "" {
		return nil, fmt.Errorf("smtp password is missing or invalid")
	} else {
		config.Password = pass
	}

	return config, nil
}

func NewMailer() *Mailer {
	mailer := &Mailer{}

	err := SetMailConfig(mailer)

	if err != nil {
		log.Fatalf("email configuration failed: %v\n", err)
	}

	return mailer
}

func (mail *Mailer) SendInviteLink(to string, link string) {

	var body bytes.Buffer

	err := mailTemplates.ExecuteTemplate(&body, "invite.html", models.MagicLink{
		Link: link,
	})

	if err != nil {
		log.Println(err)
		return
	}

	err = mail.sendMail(to, "You got an invite", fmt.Sprintf("click here to sign in: %s", link), body)

	if err != nil {
		log.Println(err)
	}
}

func (mail *Mailer) SendMagicLink(to string, link string) {

	var body bytes.Buffer

	err := mailTemplates.ExecuteTemplate(&body, "magic-link.html", models.MagicLink{
		Link: link,
	})

	if err != nil {
		log.Println(err)
		return
	}

	err = mail.sendMail(to, "Sign-in to your account", fmt.Sprintf("click here to sign in: %s", link), body)

	if err != nil {
		log.Println(err)
	}
}

func (mail *Mailer) sendMail(to string, subject string, plainText string, html bytes.Buffer) error {

	var err error

	if mail.delivery == "api" {
		err = mail.sendMailViaAPI(to, subject, plainText, html)
	}

	if mail.delivery == "smtp" {
		err = mail.sendMailViaSMTP(to, subject, plainText, html)
	}

	return err
}

func (mail *Mailer) sendMailViaSMTP(to string, subject string, plainText string, html bytes.Buffer) error {
	m := gomail.NewMessage()
	m.SetHeader("From", mail.FromAddress)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)

	m.SetBody("text/plain", plainText)
	m.AddAlternative("text/html", html.String())

	d := gomail.NewDialer(mail.smtpConfig.Host, mail.smtpConfig.Port, mail.smtpConfig.User, mail.smtpConfig.Password)

	// Send the email to Bob, Cora and Dan.
	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}

func (mail *Mailer) sendMailViaAPI(to string, subject string, plainText string, html bytes.Buffer) error {

	mg := mailgun.NewMailgun(mail.apiConfig.ApiKey)

	message := mailgun.NewMessage(mail.apiConfig.Domain, mail.FromAddress, subject, plainText, to)

	message.SetHTML(html.String())

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

	defer cancel()

	resp, err := mg.Send(ctx, message)

	if err != nil {
		return err
	}

	log.Printf("Mail sent to %s via Mailgun api, ID: %s, resp: %s\n", to, resp.ID, resp.Message)

	return nil
}
