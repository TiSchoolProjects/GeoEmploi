FROM node:25

RUN mkdir -p /usr/src/geoemploi

WORKDIR /usr/src/geoemploi

COPY package*.json .

RUN npm i

COPY . .

EXPOSE ${PORT:-4242}

CMD ["npm", "run", "start"]
