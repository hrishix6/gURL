package executor

import (
	"context"
	"sync"
)

type GurlReqContextStore struct {
	mu sync.Mutex
	m  map[string]context.CancelFunc
}

func NewGurlReqContextStore() *GurlReqContextStore {
	return &GurlReqContextStore{
		m: make(map[string]context.CancelFunc),
	}
}

func (rs *GurlReqContextStore) AddReq(id string, cancelFn context.CancelFunc) {
	rs.mu.Lock()
	defer rs.mu.Unlock()
	rs.m[id] = cancelFn
}

func (rs *GurlReqContextStore) CancelReq(id string) {
	rs.mu.Lock()
	defer rs.mu.Unlock()
	cancelFn, ok := rs.m[id]

	if !ok {
		return
	}

	cancelFn()
	delete(rs.m, id)
}
