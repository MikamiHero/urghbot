# Dockerfile

FROM node:14.15-stretch-slim
RUN mkdir -p /opt/app
WORKDIR /opt/app
RUN useradd app
COPY . .
RUN npm install
RUN chown -R app:app /opt/app
USER app
CMD [ "npm", "run", "startProd" ]