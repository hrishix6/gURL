package interpolator

import (
	"encoding/json"
	"gurl/shared/models"
	"testing"
)

func TestPreprocessEnvData(t *testing.T) {

	envData := []models.UIEnvironmentItem{
		{
			Id:          "1",
			Key:         "base_url",
			Value:       "https://example.com",
			IsSecret:    false,
			Description: "",
		},
		{
			Id:          "2",
			Key:         "username",
			Value:       "abc123",
			IsSecret:    false,
			Description: "",
		},
	}

	b, err := json.Marshal(&envData)

	if err != nil {
		t.Error(err)
	}

	got, err := PreprocessEnvData(string(b))

	if err != nil {
		t.Error(err)
	}

	username := got["username"]

	if username != "abc123" {
		t.Errorf("expected username to be %s, got %s", "abc123", username)
	}

}

func TestPreprocess(t *testing.T) {

	sampleEnvMap := make(map[string]string)

	sampleEnvMap["username"] = "abc123"

	sampleText := "{{username}}"

	gotText := Preprocess(sampleText, sampleEnvMap)

	wantText := "{{.username}}"

	if gotText != wantText {
		t.Errorf("expected %s got %s", wantText, gotText)
	}

}

func TestInterpolate(t *testing.T) {

	sampleEnvMap := make(map[string]string)

	sampleEnvMap["username"] = "abc123"

	sampleText := "{{username}}"

	processed := Preprocess(sampleText, sampleEnvMap)
	gotText := Interpolate(processed, sampleEnvMap)

	wantText := "abc123"

	if gotText != wantText {
		t.Errorf("expected %s got %s", wantText, gotText)
	}
}

func TestInterpolateMultiTokens(t *testing.T) {

	sampleEnvMap := make(map[string]string)

	sampleEnvMap["url"] = "https://example.com"
	sampleEnvMap["path"] = "pdf"

	sampleText := "{{url}}/{{path}}"

	processed := Preprocess(sampleText, sampleEnvMap)
	gotText := Interpolate(processed, sampleEnvMap)

	wantText := "https://example.com/pdf"

	if gotText != wantText {
		t.Errorf("expected %s got %s", wantText, gotText)
	}
}

func TestInterpolateNoTokens(t *testing.T) {
	sampleEnvMap := make(map[string]string)

	sampleEnvMap["url"] = "https://example.com"
	sampleEnvMap["path"] = "pdf"

	sampleText := "no_tokens_here"

	processed := Preprocess(sampleText, sampleEnvMap)
	gotText := Interpolate(processed, sampleEnvMap)

	wantText := "no_tokens_here"

	if gotText != wantText {
		t.Errorf("expected %s got %s", wantText, gotText)
	}
}
