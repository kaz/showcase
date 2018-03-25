FROM archimg/base-devel

COPY pacman/pacman.conf /etc
COPY pacman/mirrorlist /etc/pacman.d

RUN pacman -Sy --noconfirm --needed \
        ghc stack \
        go dep \
        jdk9-openjdk maven gradle \
        nodejs npm yarn gulp \
        php php-fpm php-sqlite composer \
        python python2 python-pip python2-pip \
        ruby \
        rust cargo \
        git zip wget nano vim && \
    rm -rf \
        /usr/share/man/* \
        /var/cache/pacman/pkg/* \
        /var/lib/pacman/sync/*

COPY php/custom.ini /etc/php/conf.d
COPY php/www.conf /etc/php/php-fpm.d

ENV GOPATH /root/go
ENV PATH $GOPATH/bin:$PATH
