FROM kazsw/arch
MAINTAINER Kazuki Sawada

RUN yes | pacman -Syu php php-sqlite && \
    yes | pacman -Sdd php-fpm && \
    yes | pacman -Scc

COPY custom.ini /etc/php/conf.d
COPY www.conf /etc/php/php-fpm.d

EXPOSE 9000

ENTRYPOINT ["php-fpm"]
CMD ["--nodaemonize"]
