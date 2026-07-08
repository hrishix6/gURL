package interpolator

import (
	"encoding/json"
	"fmt"
	"gurl/shared/models"
	"regexp"
	"strings"
	"text/template"
)

var envVarRegex = regexp.MustCompile(`{{(.*?)}}`)

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

func Interpolate(text string, env map[string]string) string {

	t, err := template.New("g").Parse(text)

	if err != nil {
		return ""
	}

	var result strings.Builder

	err = t.Execute(&result, env)

	if err != nil {
		return ""
	}

	o := result.String()

	return o
}

func PreprocessEnvData(env string) (map[string]string, error) {

	m := make(map[string]string)

	if env == "" {
		return m, nil
	}

	var data []models.UIEnvironmentItem

	err := json.Unmarshal([]byte(env), &data)

	if err != nil {
		return nil, err
	}

	for _, item := range data {
		m[item.Key] = item.Value
	}

	return m, nil
}
