#!/bin/bash

# Clean
docker rm -f mariadb mongodb nginx
docker network rm traplus

# Setup Network
docker network create traplus

# Run systems

docker run -dit \
--name mariadb \
--hostname mariadb \
--volume `pwd`/../data/mariadb:/var/lib/mysql \
--publish 3306:3306 \
--network traplus \
--restart always \
system/mariadb

docker run -dit \
--name mongodb \
--hostname mongodb \
--volume `pwd`/../data/mongodb:/var/lib/mongodb \
--publish 27017:27017 \
--network traplus \
--restart always \
system/mongodb

docker run -dit \
--name nginx \
--hostname nginx \
--volume `pwd`/../data/nginx:/etc/nginx/conf.d \
--volume `pwd`/../data/repositories:/srv \
--publish 8080:80 \
--publish 443:443 \
--network traplus \
--restart always \
system/nginx
