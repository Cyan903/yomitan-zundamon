FROM node:lts

# Install
WORKDIR /app
COPY package.json .
RUN npm i

# Build
COPY . .
CMD ["npm", "start"]

