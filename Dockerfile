FROM apify/actor-node-playwright-chrome

COPY package*.json ./
RUN npm install

COPY . ./

CMD ["npm", "start"]
