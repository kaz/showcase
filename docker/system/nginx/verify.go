package main

import (
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"os"
)

var PUBLIC_KEY = []byte(`-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEs5hiXIs6lDhdNzRRGKBY1gyU+bTz
c9ZsIvPn2CcPj8j9z0jbXtpqRJjhX8EIo+bL1bzPnOEGXcOsk2a/bmwEzA==
-----END PUBLIC KEY-----`)

func main() {
	if len(os.Args) < 2 {
		os.Exit(-1)
	}

	tokenString := os.Args[1]
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodECDSA); !ok {
			os.Exit(-1)
		}

		pubKey, err := jwt.ParseECPublicKeyFromPEM(PUBLIC_KEY)
		return pubKey, err
	})

	if err != nil || !token.Valid {
		os.Exit(-1)
	}

	data := token.Claims.(jwt.MapClaims)

	if _, ok := data["name"]; !ok {
		os.Exit(-1)
	}

	fmt.Print(data["name"])
}
