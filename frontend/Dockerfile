FROM node:25 AS constructor

WORKDIR /app

COPY package*.json .

COPY . .

RUN npm install

run npm run build

FROM nginx

WORKDIR /usr/share/nginx

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=constructor /app/dist ./html

EXPOSE ${PORT:-5173}

