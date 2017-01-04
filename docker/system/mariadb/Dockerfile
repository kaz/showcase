FROM kazsw/arch
MAINTAINER Kazuki Sawada

RUN yes | pacman -S mariadb && \
    yes | pacman -Scc && \
    mysql_install_db --user=root --basedir=/usr --datadir=/var/lib/mysql

EXPOSE 3306

ENTRYPOINT ["mysqld_safe"]
CMD ["--user=root"]
