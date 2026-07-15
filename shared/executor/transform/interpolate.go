package transform

import (
	"gurl/shared/internal/interpolator"
	"gurl/shared/models"
)

func InterpolateReq(r *models.GurlReq, envData string) (*models.GurlReq, error) {

	envMap, err := interpolator.PreprocessEnvData(envData)

	if err != nil {
		return nil, err
	}

	if len(envMap) == 0 {
		return r, nil
	}

	interpolated := &models.GurlReq{
		Id:             r.Id,
		Method:         r.Method,
		BodyType:       r.BodyType,
		Url:            "",
		Query:          []models.GurlKeyValItem{},
		Headers:        []models.GurlKeyValItem{},
		Cookies:        []models.GurlKeyValItem{},
		UrlEncodedForm: []models.GurlKeyValItem{},
		MultiPartForm:  []models.GurlKeyValMultiPartItem{},
		TextBody:       "",
		BinaryFile:     "",
	}

	// url
	interpolated.Url = interpolator.Interpolate(interpolator.Preprocess(r.Url, envMap), envMap)

	//headers
	for _, h := range r.Headers {

		if h.Enabled == "on" {
			h.Key = interpolator.Interpolate(interpolator.Preprocess(h.Key, envMap), envMap)
			h.Value = interpolator.Interpolate(interpolator.Preprocess(h.Value, envMap), envMap)
			interpolated.Headers = append(interpolated.Headers, h)
		}

	}

	// query params
	for _, q := range r.Query {
		if q.Enabled == "on" {
			q.Key = interpolator.Interpolate(interpolator.Preprocess(q.Key, envMap), envMap)
			q.Value = interpolator.Interpolate(interpolator.Preprocess(q.Value, envMap), envMap)
			interpolated.Query = append(interpolated.Query, q)
		}

	}

	// cookies
	for _, c := range r.Cookies {
		if c.Enabled == "on" {
			c.Key = interpolator.Interpolate(interpolator.Preprocess(c.Key, envMap), envMap)
			c.Value = interpolator.Interpolate(interpolator.Preprocess(c.Value, envMap), envMap)
			interpolated.Cookies = append(interpolated.Cookies, c)
		}
	}

	if r.BodyType != "none" {

		// URL encoded form data
		for _, u := range r.UrlEncodedForm {
			if u.Enabled == "on" {
				u.Key = interpolator.Interpolate(interpolator.Preprocess(u.Key, envMap), envMap)
				u.Value = interpolator.Interpolate(interpolator.Preprocess(u.Value, envMap), envMap)
				interpolated.UrlEncodedForm = append(interpolated.UrlEncodedForm, u)
			}
		}

		//json,xml,text
		interpolated.TextBody = interpolator.Interpolate(interpolator.Preprocess(r.TextBody, envMap), envMap)

		// Multipart form data
		for _, m := range r.MultiPartForm {

			if m.Enabled == "on" {
				m.Key = interpolator.Interpolate(interpolator.Preprocess(m.Key, envMap), envMap)

				if !m.IsFile {
					m.Value = interpolator.Interpolate(interpolator.Preprocess(m.Value, envMap), envMap)
				}

				interpolated.MultiPartForm = append(interpolated.MultiPartForm, m)
			}
		}

	}

	interpolated.Auth = interpolateAuth(r, envMap)

	return interpolated, nil
}

func interpolateAuth(r *models.GurlReq, envMap map[string]string) models.GurlAuth {
	return models.GurlAuth{
		AuthEnabled: r.Auth.AuthEnabled,
		AuthType:    r.Auth.AuthType,
		BasicAuth: models.BasicAuth{
			Username: interpolator.Interpolate(interpolator.Preprocess(r.Auth.BasicAuth.Username, envMap), envMap),
			Password: interpolator.Interpolate(interpolator.Preprocess(r.Auth.BasicAuth.Password, envMap), envMap),
		},
		ApiKeyAuth: models.ApiKeyAuth{
			Location: r.Auth.ApiKeyAuth.Location,
			Key:      interpolator.Interpolate(interpolator.Preprocess(r.Auth.ApiKeyAuth.Key, envMap), envMap),
			Value:    interpolator.Interpolate(interpolator.Preprocess(r.Auth.ApiKeyAuth.Value, envMap), envMap),
		},
		TokenAuth: models.TokenAuth{
			Type:  r.Auth.TokenAuth.Type,
			Token: interpolator.Interpolate(interpolator.Preprocess(r.Auth.TokenAuth.Token, envMap), envMap),
		},
	}
}
