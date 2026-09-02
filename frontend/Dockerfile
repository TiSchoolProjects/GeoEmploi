FROM node:25

WORKDIR /app

COPY package*.json .

COPY . .

RUN npm install


EXPOSE ${PORT:-5173}

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
