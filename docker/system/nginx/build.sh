#!/bin/bash

pacman -S --noconfirm base-devel go git

cd /tmp
curl https://aur.archlinux.org/cgit/aur.git/snapshot/openresty.tar.gz | tar zxvf -
cd openresty
sed -i "s/EUID == 0/EUID == 1/g" /usr/bin/makepkg
makepkg --syncdeps --skippgpcheck
mv *.pkg.tar.xz /root

cd /root
export GOPATH=/tmp/go
go get github.com/dgrijalva/jwt-go
go build -o verifier
