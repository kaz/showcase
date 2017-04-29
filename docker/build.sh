#!/bin/bash

# Build runtime
docker build -t runtime runtime

# Prepare for building system
docker run --rm --volume `pwd`/system/nginx:/work runtime bash /work/build.sh

# Build system
docker build -t system/mariadb system/mariadb
docker build -t system/mongodb system/mongodb
docker build -t system/nginx system/nginx
