FROM base

COPY caddy /usr/bin
COPY Caddyfile /

EXPOSE 80
EXPOSE 443

WORKDIR /
ENTRYPOINT ["caddy"]
