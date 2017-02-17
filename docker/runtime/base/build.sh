#!/bin/bash

export GOPATH=/tmp/go

yes | pacman -S go git
cd token-verifier
go get github.com/dgrijalva/jwt-go
go build
