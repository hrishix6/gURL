package models

import "time"

type LoginRequestDTO struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type RegisterDTO struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type ReqMetadata struct {
	Timestamp time.Time `json:"timestamp,omitempty"`
	RequestId string    `json:"request_id,omitempty"`
}

type RequestError struct {
	Message string `json:"message"`
	Details any    `json:"details"`
}

type ApiResponse struct {
	Data     any           `json:"data,omitempty"`
	MetaData *ReqMetadata  `json:"metadata"`
	Error    *RequestError `json:"error,omitempty"`
}
