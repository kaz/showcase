package main

import (
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"os"
)

var PUBLIC_KEY = []byte(`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAraewUw7V1hiuSgUvkly9
X+tcIh0e/KKqeFnAo8WR3ez2tA0fGwM+P8sYKHIDQFX7ER0c+ecTiKpo/Zt/a6AO
gB/zHb8L4TWMr2G4q79S1gNw465/SEaGKR8hRkdnxJ6LXdDEhgrH2ZwIPzE0EVO1
eFrDms1jS3/QEyZCJ72oYbAErI85qJDF/y/iRgl04XBK6GLIW11gpf8KRRAh4vuh
g5/YhsWUdcX+uDVthEEEGOikSacKZMFGZNi8X8YVnRyWLf24QTJnTHEv+0EStNrH
HnxCPX0m79p7tBfFC2ha2OYfOtA+94ZfpZXUi2r6gJZ+dq9FWYyA0DkiYPUq9QMb
OQIDAQAB
-----END PUBLIC KEY-----`)

func main() {
	defer func() {
		if err := recover(); err != nil {
			fmt.Print("-")
			os.Exit(-1)
		}
	}()

	if len(os.Args) < 2 {
		panic("not enough arguments")
	}

	tokenString := os.Args[1]
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			panic("invalid sigining method")
		}

		pubKey, err := jwt.ParseRSAPublicKeyFromPEM(PUBLIC_KEY)
		return pubKey, err
	})

	if err != nil {
		panic(err)
	}
	if !token.Valid {
		panic("invalid token")
	}

	data := token.Claims.(jwt.MapClaims)

	if _, ok := data["name"]; !ok {
		panic("name not found")
	}

	fmt.Print(data["name"])
}
