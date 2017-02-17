FROM runtime

RUN yes | pacman -Syu php php-sqlite composer && \
    yes | pacman -Sdd php-fpm && \
    yes | pacman -Scc

COPY custom.ini /etc/php/conf.d
COPY www.conf /etc/php/php-fpm.d
