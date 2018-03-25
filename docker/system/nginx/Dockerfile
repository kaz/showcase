FROM runtime

COPY verify.go $GOPATH/src/verify/

RUN pacman -Sy --noconfirm openresty openresty_luarocks openssl-1.0 && \
    ln -s /opt/openresty/bin/openresty /usr/bin/nginx && \
    ln -s /opt/openresty/nginx/logs /var/log/nginx && \
    ln -s /opt/openresty/nginx/conf /etc/nginx && \
    /opt/openresty/luajit/bin/luarocks install lua-resty-auto-ssl && \
    sed -i "2a shopt -s expand_aliases\nalias openssl=openssl-1.0\n" /opt/openresty/luajit/bin/resty-auto-ssl/dehydrated && \
    openssl req -new -newkey rsa:2048 -days 3650 -nodes -x509 -keyout /etc/nginx/fallback.key -out /etc/nginx/fallback.crt -subj "/CN=Showcase/C=JP/O=traP TokyoTech/OU=System administrators/" && \
    go get github.com/dgrijalva/jwt-go && \
    cd $GOPATH/src/verify && \
    go build -o /etc/nginx/verify && \
    rm -rf \
        $GOPATH \
        $HOME/.cache \
        /usr/share/man/* \
        /var/cache/pacman/pkg/* \
        /var/lib/pacman/sync/*

COPY *.conf /etc/nginx/
COPY verify.lua /etc/nginx/

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
