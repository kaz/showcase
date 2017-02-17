FROM base

RUN pacman -S --noconfirm php php-sqlite composer && \
    pacman -Sdd --noconfirm php-fpm && \
    pacman -Scc --noconfirm

COPY custom.ini /etc/php/conf.d
COPY www.conf /etc/php/php-fpm.d
