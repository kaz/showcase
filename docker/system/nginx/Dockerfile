FROM base

COPY build/*.pkg.tar.xz /tmp/

RUN pacman -U --noconfirm /tmp/*.pkg.tar.xz && \
    pacman -Scc --noconfirm && \
    rm /tmp/*.pkg.tar.xz && \
    ln -s /opt/openresty/bin/openresty /usr/bin/nginx && \
    ln -s /opt/openresty/nginx/logs /var/log/nginx && \
    ln -s /opt/openresty/nginx/conf /etc/nginx && \
    /opt/openresty/luajit/bin/luarocks install lua-resty-auto-ssl && \
    openssl req -new -newkey rsa:2048 -days 3650 -nodes -x509 -keyout /etc/nginx/fallback.key -out /etc/nginx/fallback.crt -subj "/CN=Showcase/C=JP/O=traP TokyoTech/OU=System administrators/"

COPY *.conf /etc/nginx/
COPY verify.lua /etc/nginx/
COPY build/verify /etc/nginx/

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
