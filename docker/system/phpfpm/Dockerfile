FROM kazsw/arch
MAINTAINER Kazuki Sawada

RUN yes | pacman -S php-fpm php-sqlite && \
    yes | pacman -Scc && \
    sed -i "s/listen = .*/listen = 9000/" /etc/php/php-fpm.d/www.conf 

COPY custom.ini /etc/php/conf.d

EXPOSE 9000

ENTRYPOINT ["php-fpm"]
CMD ["--nodaemonize"]
