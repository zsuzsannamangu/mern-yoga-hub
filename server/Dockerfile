FROM node:18

WORKDIR /app

# First copy only the package files
COPY package.json package-lock.json ./

# Then install dependencies (dotenv will be installed here)
RUN npm install

# Now copy everything else (e.g. your .js files)
COPY . .

EXPOSE 5001

CMD ["node", "server.js"]
