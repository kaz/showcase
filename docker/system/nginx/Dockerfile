FROM kazsw/arch
MAINTAINER Kazuki Sawada

RUN yes | pacman -Syu nginx && \
    yes | pacman -Scc

COPY nginx.conf /etc/nginx

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
