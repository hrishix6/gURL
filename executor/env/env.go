package env

import (
	"fmt"
	"regexp"
	"strings"
	"text/template"
)

var envVarRegex = regexp.MustCompile(`{{\s*([\w.-]+)\s*}}`)
var envVarTemplate = template.New("gURL")

func Preprocess(text string, env map[string]string) string {
	return envVarRegex.ReplaceAllStringFunc(text, func(m string) string {
		key := envVarRegex.FindStringSubmatch(m)[1]
		_, ok := env[key]

		if !ok {
			return ""
		}
		return fmt.Sprintf("{{.%s}}", strings.TrimSpace(key))
	})
}

func Interpolate(text string, env map[string]string) (string, error) {

	t, err := envVarTemplate.Parse(text)

	if err != nil {
		return "", err
	}

	var result strings.Builder

	err = t.Execute(&result, env)

	if err != nil {
		return "", err
	}

	return result.String(), nil
}
