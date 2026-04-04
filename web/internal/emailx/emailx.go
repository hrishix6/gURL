package emailx

import (
	"bytes"
	"embed"
	"fmt"
	"gurl/web/internal/models"
	"html/template"
	"log"
	"os"
	"strconv"

	"gopkg.in/gomail.v2"
)

//go:embed templates
var templatesFS embed.FS

var mailTemplates *template.Template

func init() {
	mailTemplates = template.Must(template.ParseFS(templatesFS, "templates/*.html"))
}

type MailConfig struct {
	Host        string
	Port        int
	User        string
	Password    string
	FromAddress string
}

type Mailer struct {
	config *MailConfig
}

func ReadMailConfig() (*MailConfig, error) {

	config := &MailConfig{}

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

	if from, ok := os.LookupEnv("SMTP_FROM_EMAIL"); !ok || from == "" {
		return nil, fmt.Errorf("smtp from address is missing or invalid")
	} else {
		config.FromAddress = from
	}

	return config, nil
}

func NewMailer(config *MailConfig) *Mailer {
	return &Mailer{
		config: config,
	}
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

	m := gomail.NewMessage()
	m.SetHeader("From", mail.config.FromAddress)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)

	m.SetBody("text/plain", plainText)
	m.AddAlternative("text/html", html.String())

	d := gomail.NewDialer(mail.config.Host, mail.config.Port, mail.config.User, mail.config.Password)

	// Send the email to Bob, Cora and Dan.
	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil

}
