#!/bin/bash

# Clean / Setup
docker rm -f caddy mariadb mongodb
docker network rm trap.show
docker network create trap.show

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
--name caddy \
--hostname caddy \
--volume `pwd`/../data/caddy:/root \
--volume `pwd`/../data/repositories:/srv \
--publish 80:80 \
--publish 443:443 \
--network trap.show \
--restart always \
system/caddy

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
