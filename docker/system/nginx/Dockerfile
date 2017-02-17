FROM base

COPY *.pkg.tar.xz /tmp

RUN pacman -U --noconfirm /tmp/*.pkg.tar.xz && \
    pacman -Scc --noconfirm && \
    ln -s /opt/openresty/bin/openresty /usr/bin/nginx && \
    ln -s /opt/openresty/nginx/logs /var/log/nginx && \
    ln -s /opt/openresty/nginx/conf /etc/nginx  

COPY nginx.conf /etc/nginx
COPY verify.lua /etc/nginx
COPY verifier /etc/nginx

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
