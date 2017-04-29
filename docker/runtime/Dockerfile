FROM base

RUN pacman -Sy --noconfirm \
		ghc stack \
		go godep \
		jdk8-openjdk maven gradle \
		nodejs npm yarn gulp \
		php php-sqlite composer \
		python python2 python-pip python2-pip \
		ruby \
		rust cargo \
		&& \
	pacman -Sdd --noconfirm php-fpm && \
    pacman -Scc --noconfirm && \
    rm -r /usr/share/man/*

COPY php/custom.ini /etc/php/conf.d
COPY php/www.conf /etc/php/php-fpm.d

ENV GOPATH /root/go
