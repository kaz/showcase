FROM runtime

COPY verify.go $GOPATH/src/verify/

RUN pacman -Sy --noconfirm openresty openresty_luarocks openssl-1.0 && \
    ln -s /opt/openresty/bin/openresty /usr/bin/nginx && \
    ln -s /opt/openresty/nginx/logs /var/log/nginx && \
    ln -s /opt/openresty/nginx/conf /etc/nginx && \
    /opt/openresty/luajit/bin/luarocks install lua-resty-auto-ssl && \
    sed -i "2a shopt -s expand_aliases\nalias openssl=openssl-1.0\n" /opt/openresty/luajit/bin/resty-auto-ssl/dehydrated && \
    cd $GOPATH/src/verify && \
    go get -v github.com/dgrijalva/jwt-go && \
    go build -o /etc/nginx/verify && \
    rm -rf \
        $GOPATH \
        $HOME/.cache \
        /usr/share/man/* \
        /var/cache/pacman/pkg/* \
        /var/lib/pacman/sync/*

COPY *.lua /etc/nginx/
COPY *.conf /etc/nginx/
COPY ssl/*.pem /etc/nginx/ssl/
COPY index.html /opt/openresty/nginx/html

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
