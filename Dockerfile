FROM node:latest
COPY server/index.js /app/index.js
CMD ["node", "/app/index.js"]
ENV key=value