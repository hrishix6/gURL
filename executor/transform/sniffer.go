package transform

type SniffBuffer struct {
	buf   []byte
	limit int
}

func (snb *SniffBuffer) Write(p []byte) (int, error) {
	remaining := snb.limit - len(snb.buf)
	if remaining > 0 {
		if len(p) > remaining {
			snb.buf = append(snb.buf, p[:remaining]...)
		} else {
			snb.buf = append(snb.buf, p...)
		}
	}
	return len(p), nil
}

func NewSniffBuffer(sniffSize int) *SniffBuffer {
	return &SniffBuffer{
		buf:   make([]byte, sniffSize),
		limit: sniffSize,
	}
}
