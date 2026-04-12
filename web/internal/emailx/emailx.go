package emailx

import (
	"bytes"
	"context"
	"embed"
	"fmt"
	"gurl/web/internal/config"
	"gurl/web/internal/models"
	"html/template"
	"log"
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

type Mailer struct {
	cfg *config.MailConfig
}

func NewMailer(mailCfg *config.MailConfig) *Mailer {

	return &Mailer{
		cfg: mailCfg,
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

	var err error

	if mail.cfg.Delivery == "api" {
		err = mail.sendMailViaAPI(to, subject, plainText, html)
	}

	if mail.cfg.Delivery == "smtp" {
		err = mail.sendMailViaSMTP(to, subject, plainText, html)
	}

	return err
}

func (mail *Mailer) sendMailViaSMTP(to string, subject string, plainText string, html bytes.Buffer) error {
	m := gomail.NewMessage()
	m.SetHeader("From", mail.cfg.FromAddr)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)

	m.SetBody("text/plain", plainText)
	m.AddAlternative("text/html", html.String())

	d := gomail.NewDialer(mail.cfg.SmtpConfig.Host, mail.cfg.SmtpConfig.Port, mail.cfg.SmtpConfig.User, mail.cfg.SmtpConfig.Password)

	// Send the email to Bob, Cora and Dan.
	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}

func (mail *Mailer) sendMailViaAPI(to string, subject string, plainText string, html bytes.Buffer) error {

	mg := mailgun.NewMailgun(mail.cfg.ApiConfig.ApiKey)

	message := mailgun.NewMessage(mail.cfg.ApiConfig.Domain, mail.cfg.FromAddr, subject, plainText, to)

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
