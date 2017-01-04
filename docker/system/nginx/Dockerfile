FROM alpine:edge
MAINTAINER Kazuki Sawada

RUN apk add --update --no-cache nginx && \
    mkdir -p /run/nginx

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
