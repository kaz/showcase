FROM alpine:edge
MAINTAINER Kazuki Sawada

RUN echo http://dl-cdn.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories && \
    apk add --update --no-cache mongodb && \
    mkdir -p /var/lib/mongodb

EXPOSE 27017

ENTRYPOINT ["mongod", "--dbpath", "/var/lib/mongodb"]
CMD ["--auth"]
