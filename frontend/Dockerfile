FROM node:24 AS constructor

WORKDIR /app

COPY package*.json .

COPY .dsfr.yml ./

RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build

FROM nginx

WORKDIR /usr/share/nginx

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=constructor /app/dist ./html

EXPOSE ${PORT:-5173}

