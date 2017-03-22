#!/bin/bash

go get github.com/dgrijalva/jwt-go
go get github.com/mholt/caddy/caddy
go clean all

cd $GOPATH/src/github.com/mholt/caddy
mkdir -p caddy/vendor/trapauth
cp /work/trapauth.go caddy/vendor/trapauth/trapauth.go
patch -p1 < /work/trapauth.patch
patch -p1 < /work/trapfix.patch

cd caddy
./build.bash /work/caddy
