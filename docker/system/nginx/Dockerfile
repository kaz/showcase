FROM alpine:edge

RUN apk add --update --no-cache nginx nginx-mod-http-lua && \
    mkdir -p /run/nginx

COPY nginx.conf /etc/nginx
COPY showcase.lua /etc/nginx
COPY verifier /etc/nginx

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
