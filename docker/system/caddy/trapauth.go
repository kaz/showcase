package trapauth

import (
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/mholt/caddy"
	"github.com/mholt/caddy/caddyhttp/httpserver"
	"net/http"
)

type TrapAuthHandler struct {
	Deny bool
	Next httpserver.Handler
}

func init() {
	caddy.RegisterPlugin("trapauth", caddy.Plugin{
		ServerType: "http",
		Action:     Action,
	})
}

func Action(c *caddy.Controller) error {
	var deny bool

	for c.Next() {
		args := c.RemainingArgs()

		if len(args) != 1 {
			return fmt.Errorf("'trapauth' must have just 1 argument")
		}

		switch args[0] {
		case "soft":
			deny = false
		case "hard":
			deny = true
		case "off":
			return nil
		default:
			return c.ArgErr()
		}
	}

	c.OnStartup(func() error {
		fmt.Println("traP authentication plugin is ready!")
		return nil
	})

	httpserver.GetConfig(c).AddMiddleware(func(next httpserver.Handler) httpserver.Handler {
		return TrapAuthHandler{
			Deny: deny,
			Next: next,
		}
	})

	return nil
}

func (h TrapAuthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) (int, error) {
	fmt.Printf("OK start \n")

	r.Header.Del("X-Showcase-User")
	r.Header.Set("X-Showcase-User", "-")

	token, err := r.Cookie("traP_ext_token")
	if err != nil {
		return h.finalize(err, w, r)
	}

	user, err := validate(token.Value)
	if err != nil {
		return h.finalize(err, w, r)
	}

	r.Header.Del("X-Showcase-User")
	r.Header.Set("X-Showcase-User", user)

	return h.finalize(nil, w, r)
}
func (h TrapAuthHandler) finalize(err error, w http.ResponseWriter, r *http.Request) (int, error) {
	if err != nil {
		fmt.Printf("[trapauth] %s %s from %s - %#v \n", r.Method, r.URL, r.RemoteAddr, err)

		if h.Deny {
			return http.StatusUnauthorized, nil
		}
	}
	return h.Next.ServeHTTP(w, r)
}

func validate(rawToken string) (string, error) {
	token, err := jwt.Parse(rawToken, keyFn)

	if err != nil || !token.Valid {
		return "", err
	}

	data := token.Claims.(jwt.MapClaims)

	if _, ok := data["name"]; !ok {
		return "", fmt.Errorf("Invalid token")
	}

	return data["name"].(string), nil
}

func keyFn(token *jwt.Token) (interface{}, error) {
	if _, ok := token.Method.(*jwt.SigningMethodECDSA); !ok {
		return nil, fmt.Errorf("Invalid token")
	}
	return jwt.ParseECPublicKeyFromPEM(PUBLIC_KEY)
}

var PUBLIC_KEY = []byte(`-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEs5hiXIs6lDhdNzRRGKBY1gyU+bTz
c9ZsIvPn2CcPj8j9z0jbXtpqRJjhX8EIo+bL1bzPnOEGXcOsk2a/bmwEzA==
-----END PUBLIC KEY-----`)
