from node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=4000 MORGAN=dev ENV=dev MONGO=mongodb+srv://user:4DROSP1KVNHsXdzE@cluster0.zwhxfno.mongodb.net/raz-tingz-prod

EXPOSE 4000

CMD ["mkdir", "audio", "&&", "tsc", "&&", "npm", "run", "start:prod" ]