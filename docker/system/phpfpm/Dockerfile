FROM kazsw/arch
MAINTAINER Kazuki Sawada

RUN yes | pacman -S php-fpm php-sqlite && \
    yes | pacman -Scc && \
    sed -E -i "s/^;(zend_)?extension/\1extension/" /etc/php/php.ini && \
    sed -i "s/listen = .*/listen = 9000/" /etc/php/php-fpm.d/www.conf 

EXPOSE 9000

ENTRYPOINT ["php-fpm"]
CMD ["--nodaemonize"]
