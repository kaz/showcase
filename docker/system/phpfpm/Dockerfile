FROM alpine:edge
MAINTAINER Kazuki Sawada

RUN apk add --update --no-cache php7-fpm && \
    sed -i s/127\.0\.0\.1:9000/9000/ /etc/php7/php-fpm.d/www.conf 

EXPOSE 9000

ENTRYPOINT ["php-fpm7"]
CMD ["--nodaemonize"]
