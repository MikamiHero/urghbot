# Dockerfile

FROM node:14.15-stretch-slim
RUN mkdir -p /app
WORKDIR /app
COPY . /app/
RUN ["chmod", "+x", "/app/entrypoint.sh"]
ENTRYPOINT ["sh", "/app/entrypoint.sh"]

CMD ["npm", "run", "start"]