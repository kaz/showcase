docker network create traplus

docker build -t system/mariadb system/mariadb
docker build -t system/mongodb system/mongodb
docker build -t system/phpfpm system/phpfpm
docker build -t system/nginx system/nginx

docker run -dit \
--name mariadb \
--volume `pwd`/../data/mariadb:/var/lib/mysql \
--network traplus \
system/mariadb

docker run -dit \
--name mongodb \
--volume `pwd`/../data/mongodb:/var/lib/mongodb \
--network traplus \
system/mongodb

docker run -dit \
--name phpfpm \
--volume `pwd`/../data/repositories:/srv \
--network traplus \
system/phpfpm

docker run -dit \
--name nginx \
--volume `pwd`/../data/nginx:/etc/nginx/conf.d \
--volume `pwd`/../data/repositories:/srv \
--network traplus \
--publish 8080:80 \
system/nginx

docker rm -f nginx phpfpm mariadb mongodb
