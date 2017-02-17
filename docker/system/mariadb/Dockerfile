FROM kazsw/arch

RUN yes | pacman -Syu mariadb && \
    yes | pacman -Scc

EXPOSE 3306

ENTRYPOINT ["mysqld_safe"]
CMD ["--user=root"]
