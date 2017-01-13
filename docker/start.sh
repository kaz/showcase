#!/bin/bash

# Clean / Setup
docker rm -f mariadb mongodb nginx
docker network rm tra.plus
docker network create tra.plus

# Setup data

docker run --rm -it \
--volume `pwd`/../data/mariadb:/var/lib/mysql \
--entrypoint bash \
system/mariadb

docker run --rm -it \
--volume `pwd`/../data/mongodb:/var/lib/mongodb \
--entrypoint bash \
system/mongodb

# Run systems

docker run -dit \
--name mariadb \
--hostname mariadb \
--volume `pwd`/../data/mariadb:/var/lib/mysql \
--publish 3306:3306 \
--network tra.plus \
--restart always \
system/mariadb

docker run -dit \
--name mongodb \
--hostname mongodb \
--volume `pwd`/../data/mongodb:/var/lib/mongodb \
--publish 27017:27017 \
--network tra.plus \
--restart always \
system/mongodb

docker run -dit \
--name nginx \
--hostname nginx \
--volume `pwd`/../data/nginx:/etc/nginx/conf.d \
--volume `pwd`/../data/repositories:/srv \
--publish 80:80 \
--publish 443:443 \
--network tra.plus \
--restart always \
system/nginx
