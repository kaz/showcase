#!/bin/bash

# Clean
docker rm -f mariadb mongodb phpfpm nginx
docker network rm traplus

# Setup Network
docker network create traplus

# Run systems

docker run -dit \
--name mariadb \
--volume `pwd`/../data/mariadb:/var/lib/mysql \
--network traplus \
--restart always \
system/mariadb

docker run -dit \
--name mongodb \
--volume `pwd`/../data/mongodb:/var/lib/mongodb \
--network traplus \
--restart always \
system/mongodb

docker run -dit \
--name nginx \
--volume `pwd`/../data/nginx:/etc/nginx/conf.d \
--volume `pwd`/../data/repositories:/srv \
--publish 8080:80 \
--network traplus \
--restart always \
system/nginx
