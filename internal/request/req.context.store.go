package request

import (
	"context"
	"sync"
)

type GurlReqContextStore struct {
	sync.Mutex
	m map[string]context.CancelFunc
}

func NewGurlReqContextStore() *GurlReqContextStore {
	return &GurlReqContextStore{
		m: make(map[string]context.CancelFunc),
	}
}

func (rs *GurlReqContextStore) AddReq(id string, cancelFn context.CancelFunc) {
	rs.Lock()
	defer rs.Unlock()
	rs.m[id] = cancelFn
}

func (rs *GurlReqContextStore) CancelReq(id string) {
	cancelFn, ok := rs.m[id]

	if !ok {
		return
	}

	cancelFn()
	delete(rs.m, id)
}
