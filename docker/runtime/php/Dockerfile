FROM kazsw/arch
MAINTAINER Kazuki Sawada

RUN yes | pacman -S php-fpm php-sqlite && \
    yes | pacman -Scc

COPY custom.ini /etc/php/conf.d
COPY www.conf /etc/php/php-fpm.d

EXPOSE 9000

ENTRYPOINT ["php-fpm"]
CMD ["--nodaemonize"]
