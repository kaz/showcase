FROM base

RUN pacman -Sy --noconfirm mongodb && \
    pacman -Scc --noconfirm && \
    rm -r /usr/share/man/*

EXPOSE 27017

ENTRYPOINT ["mongod", "--dbpath", "/var/lib/mongodb"]
CMD ["--auth"]
