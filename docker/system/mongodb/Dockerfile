FROM runtime

RUN pacman -Sy --noconfirm mongodb && \
    rm -rf \
        /usr/share/man/* \
        /var/cache/pacman/pkg/* \
        /var/lib/pacman/sync/*

EXPOSE 27017

ENTRYPOINT ["mongod", "--dbpath", "/var/lib/mongodb", "--bind_ip_all"]
CMD ["--auth"]
