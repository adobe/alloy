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
EXPOSE 8080

# Run the projects
RUN npm run start