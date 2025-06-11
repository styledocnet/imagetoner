FROM node:23

WORKDIR /usr/src/app

COPY package.json  ./

RUN npm install --legacy-peer-deps

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
# CMD ["bash"]
