FROM base

RUN pacman -Sy --noconfirm mariadb && \
    pacman -Scc --noconfirm && \
    rm -r /usr/share/man/*

EXPOSE 3306

ENTRYPOINT ["mysqld_safe"]
CMD ["--user=root"]
