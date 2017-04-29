#!/bin/bash

# prepare
mkdir -p /work/build

# build token verifier
cd /work
export GOPATH=/tmp/go
go get github.com/dgrijalva/jwt-go
go build -o /work/build/verify

# patch makepkg to run as root
sed -i "s/EUID == 0/0/g" /usr/bin/makepkg

# get PKGBUILD
cd /tmp
git clone https://aur.archlinux.org/openresty.git
git clone https://aur.archlinux.org/openresty_luarocks.git

# make OpenResty
cd /tmp/openresty
cp -f /work/PKGBUILD .
makepkg --noconfirm --syncdeps --install
mv *.pkg.tar.xz /work/build

# make LuaRocks for OpenResty
cd /tmp/openresty_luarocks
makepkg --noconfirm --syncdeps --install
mv *.pkg.tar.xz /work/build
