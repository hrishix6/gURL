package models

import "time"

type LoginRequestDTO struct {
	Email string `json:"email"`
}

type RegisterDTO struct {
	Email string `json:"email"`
}

type ReqMetadata struct {
	Timestamp time.Time `json:"timestamp,omitempty"`
	RequestId string    `json:"request_id,omitempty"`
}

type RequestError struct {
	Message string `json:"message"`
	Details any    `json:"details"`
}

type ApiSuccessResponse struct {
	Success  bool        `json:"success"`
	Data     any         `json:"data,omitempty"`
	MetaData ReqMetadata `json:"metadata"`
}

type ApiErrorResponse struct {
	Success  bool         `json:"success"`
	MetaData ReqMetadata  `json:"metadata"`
	Error    RequestError `json:"error"`
}

type UserInfo struct {
	Email   string `json:"email"`
	IsAdmin bool   `json:"isAdmin"`
}
