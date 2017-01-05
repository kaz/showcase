#!/bin/bash

# Build system
docker build -t system/mariadb system/mariadb
docker build -t system/mongodb system/mongodb
docker build -t system/nginx system/nginx

# Build runtime
docker build -t runtime/php runtime/php
docker build -t runtime/node runtime/node
