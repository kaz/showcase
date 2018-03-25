FROM runtime

RUN pacman -Sy --noconfirm mariadb && \
    rm -rf \
        /usr/share/man/* \
        /var/cache/pacman/pkg/* \
        /var/lib/pacman/sync/*

EXPOSE 3306

ENTRYPOINT ["mysqld_safe"]
CMD ["--user=root"]
