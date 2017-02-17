FROM kazsw/arch

RUN yes | pacman -Syu nginx-mainline && \
    yes | pacman -Scc

COPY nginx.conf /etc/nginx

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
