#!/bin/bash

# Build system
docker build -t system/mariadb system/mariadb
docker build -t system/mongodb system/mongodb
docker build -t system/nginx system/nginx

# Prepare for building runtime
docker run --rm --volume `pwd`/runtime/base:/root --workdir /root kazsw/arch sh build.sh
docker build -t runtime runtime/base

# Build runtime
docker build -t runtime/go runtime/go
docker build -t runtime/node runtime/node
docker build -t runtime/php runtime/php
docker build -t runtime/rust runtime/rust
