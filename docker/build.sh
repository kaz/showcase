#!/bin/bash

# Prepare for building system
docker run --rm --volume `pwd`/system/nginx:/root base sh /root/build.sh

# Build system
docker build -t system/mariadb system/mariadb
docker build -t system/mongodb system/mongodb
docker build -t system/nginx system/nginx

# Build runtime
docker build -t runtime/go runtime/go
docker build -t runtime/node runtime/node
docker build -t runtime/php runtime/php
docker build -t runtime/rust runtime/rust
