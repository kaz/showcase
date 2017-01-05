# Network
docker network create traplus

# Build system
docker build -t system/mariadb system/mariadb
docker build -t system/mongodb system/mongodb
docker build -t system/phpfpm system/phpfpm
docker build -t system/nginx system/nginx

# Run system

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
--name phpfpm \
--volume `pwd`/../data/repositories:/srv \
--network traplus \
--restart always \
system/phpfpm

docker run -dit \
--name nginx \
--volume `pwd`/../data/nginx:/etc/nginx/conf.d \
--volume `pwd`/../data/repositories:/srv \
--publish 8080:80 \
--network traplus \
--restart always \
system/nginx

# Build runtime
docker build -t runtime/node runtime/node


