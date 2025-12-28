
FROM node:18-alpine3.16 as build
WORKDIR /app
COPY . /app
ARG WORDLE_BACKEND_HOST
ENV REACT_APP_WORDLE_BACKEND_HOST $WORDLE_BACKEND_HOST
RUN npm ci
RUN npm run build
FROM nginx
EXPOSE 80
COPY ./nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]