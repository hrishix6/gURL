package models

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/url"
	"os"
	"path/filepath"
	"strings"
)

type GurlReq struct {
	Id             string                    `json:"id"`
	Method         string                    `json:"method"`
	Url            string                    `json:"url"`
	BodyType       string                    `json:"bodyType"`
	Headers        []GurlKeyValItem          `json:"headers"`
	UrlEncodedForm []GurlKeyValItem          `json:"urlencoded"`
	MultiPartForm  []GurlKeyValMultiPartItem `json:"multipart"`
	TextBody       string                    `json:"plaintext"`
	BinaryFile     string                    `json:"binary"`
}

func (gr *GurlReq) ToUrlEncodedForm() (io.Reader, error) {

	f := url.Values{}

	for _, item := range gr.UrlEncodedForm {
		f.Add(item.Key, item.Value)
	}

	return strings.NewReader(f.Encode()), nil
}

func (gr *GurlReq) ToMultipartFormData() (io.Reader, string, error) {

	var buf bytes.Buffer

	writer := multipart.NewWriter(&buf)

	for _, item := range gr.MultiPartForm {

		if item.IsFile {

			f, err := os.Open(item.Value)

			if err != nil {
				return nil, "", err
			}

			fWriter, err := writer.CreateFormFile(item.Key, filepath.Base(item.Value))

			if err != nil {
				return nil, "", err
			}

			_, err = io.Copy(fWriter, f)

			if err != nil {
				return nil, "", err
			}

			f.Close()

		} else {

			writer.WriteField(item.Key, item.Value)
		}

	}

	writer.Close()

	return &buf, writer.FormDataContentType(), nil
}

func (gr *GurlReq) ToRawFileUpload() (io.Reader, error) {

	f, err := os.Open(gr.BinaryFile)

	if err != nil {
		return nil, err
	}

	return f, nil
}

func (gr *GurlReq) ToTextBody() (io.Reader, error) {
	return strings.NewReader(gr.TextBody), nil
}
