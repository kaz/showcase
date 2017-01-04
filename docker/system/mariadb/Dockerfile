FROM alpine:edge
MAINTAINER Kazuki Sawada

RUN apk add --update --no-cache mariadb mariadb-client && \
    mkdir -p /run/mysqld && \
    mysql_install_db --user=root

EXPOSE 3306

ENTRYPOINT ["mysqld"]
CMD ["--user=root"]
