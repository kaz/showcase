#!/bin/bash

# prepare
mkdir -p /work/build

# build token verifier
cd /work
export GOPATH=/tmp/go
go get github.com/dgrijalva/jwt-go
go build -o /work/build/verify

# patch makepkg to run as root
sed -i "s/EUID == 0/EUID == 1/g" /usr/bin/makepkg

# get PKGBUILD
cd /tmp
curl https://aur.archlinux.org/cgit/aur.git/snapshot/openresty.tar.gz | tar zxvf -
curl https://aur.archlinux.org/cgit/aur.git/snapshot/openresty_luarocks.tar.gz | tar zxvf -

# make OpenResty
cd /tmp/openresty
makepkg --noconfirm --syncdeps --skippgpcheck
pacman -U --noconfirm *.pkg.tar.xz
mv *.pkg.tar.xz /work/build

# make LuaRocks for OpenResty
cd /tmp/openresty_luarocks
makepkg --noconfirm --syncdeps --skippgpcheck
pacman -U --noconfirm *.pkg.tar.xz
mv *.pkg.tar.xz /work/build
