FROM node:25

RUN mkdir -p /usr/src/geoemploi

WORKDIR /usr/src/geoemploi

COPY . .

run npm i

EXPOSE ${PORT:-4242}

CMD ["npm", "run", "start"]
