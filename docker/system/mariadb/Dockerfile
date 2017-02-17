FROM base

RUN pacman -S --noconfirm mariadb && \
    pacman -Scc --noconfirm

EXPOSE 3306

ENTRYPOINT ["mysqld_safe"]
CMD ["--user=root"]
