package models

import (
	"encoding/json"
)

type KeyValItem struct {
	Id      string `json:"id"`
	Key     string `json:"key"`
	Val     string `json:"val"`
	Enabled string `json:"enabled"`
}

type MultipartKeyValItem struct {
	Id      string          `json:"id"`
	Key     string          `json:"key"`
	Val     json.RawMessage `json:"val"`
	Enabled string          `json:"enabled"`
}

func (mkv MultipartKeyValItem) ValAsStr() (string, bool) {
	var v string
	if err := json.Unmarshal(mkv.Val, &v); err == nil {
		return v, true
	}

	return "", false
}

func (mkv MultipartKeyValItem) ValAsFileStats() (*FileStats, bool) {

	var o FileStats

	if err := json.Unmarshal(mkv.Val, &o); err == nil {
		return &o, true
	}

	return nil, false
}
