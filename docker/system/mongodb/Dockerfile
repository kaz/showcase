FROM kazsw/arch
MAINTAINER Kazuki Sawada

RUN yes | pacman -Syu mongodb && \
    yes | pacman -Scc

EXPOSE 27017

ENTRYPOINT ["mongod", "--dbpath", "/var/lib/mongodb"]
CMD ["--auth"]
