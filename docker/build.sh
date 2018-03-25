#!/bin/bash

# Build runtime
docker build -t runtime runtime

# Build system
docker build -t system/mariadb system/mariadb
docker build -t system/mongodb system/mongodb
docker build -t system/nginx system/nginx
