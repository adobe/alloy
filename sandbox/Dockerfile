FROM node:carbon

RUN mkdir -p ./sandbox
WORKDIR ./sandbox

# Install dependencies
COPY package*.json ./
RUN npm install

# For production
# RUN npm install --production

# Copy project files
COPY . .

# Expose running port
EXPOSE ${PORT}

# Run the projects
CMD ["node", "server.js"]