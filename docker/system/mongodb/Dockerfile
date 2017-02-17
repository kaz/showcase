FROM base

RUN pacman -S --noconfirm mongodb && \
    pacman -Scc --noconfirm

EXPOSE 27017

ENTRYPOINT ["mongod", "--dbpath", "/var/lib/mongodb"]
CMD ["--auth"]
