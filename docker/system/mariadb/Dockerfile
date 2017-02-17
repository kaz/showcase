FROM alpine:edge

RUN apk add --update --no-cache mariadb mariadb-client && \
    mkdir -p /run/mysqld

EXPOSE 3306

ENTRYPOINT ["mysqld_safe"]
CMD ["--user=root"]
