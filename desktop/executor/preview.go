package executor

import (
	"fmt"
	"net/http"
)

func PreviewUserPrefix(next http.HandlerFunc, userId string) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		userIdFromPath := r.PathValue("id")

		if userIdFromPath != userId {
			http.NotFound(w, r)
			return
		}

		nextHandler := http.StripPrefix(fmt.Sprintf("/preview/%s", userIdFromPath), next)
		nextHandler.ServeHTTP(w, r)
	}
}
