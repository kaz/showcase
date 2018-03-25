#!/bin/bash

# Setup data

docker run --rm -it \
--hostname mariadb-setup \
--volume `pwd`/../data/mariadb:/var/lib/mysql \
--entrypoint bash \
system/mariadb

docker run --rm -it \
--hostname mongodb-setup \
--volume `pwd`/../data/mongodb:/var/lib/mongodb \
--entrypoint bash \
system/mongodb

# Clean / Setup

docker rm -f mariadb mongodb nginx
docker network rm trap.show
docker network create trap.show

# Run systems

docker run -dit \
--name mariadb \
--hostname mariadb \
--volume `pwd`/../data/mariadb:/var/lib/mysql \
--publish 3306:3306 \
--network trap.show \
--restart always \
system/mariadb

docker run -dit \
--name mongodb \
--hostname mongodb \
--volume `pwd`/../data/mongodb:/var/lib/mongodb \
--publish 27017:27017 \
--network trap.show \
--restart always \
system/mongodb

docker run -dit \
--name nginx \
--hostname nginx \
--volume `pwd`/../data/repositories:/srv \
--volume `pwd`/../data/nginx/ssl:/etc/nginx/ssl \
--volume `pwd`/../data/nginx/conf.d:/etc/nginx/conf.d \
--publish 80:80 \
--publish 443:443 \
--network trap.show \
--restart always \
system/nginx
