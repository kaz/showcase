#!/bin/bash

export GOPATH=/tmp/go

apk add --update go git musl-dev
go get github.com/dgrijalva/jwt-go
go build -o verifier
