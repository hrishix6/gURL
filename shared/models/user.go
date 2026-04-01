package models

type CreateUserDTO struct {
	Username     string
	Email        string
	PasswordHash string
}

type UpdateUserDTO struct {
	IsAdmin    *bool `json:"is_admin"`
	IsApproved *bool `json:"is_approved"`
	IsVerified *bool `json:"is_verified"`
}
