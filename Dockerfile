FROM node:24-bookworm-slim

WORKDIR /app

# Copy only package.json and package-lock.json first to leverage Docker caching
COPY package.json ./

# Install dependencies
# RUN npm ci
# RUN npm install -D vite @vitejs/plugin-react

RUN npm install

# Copy the rest of your application code into the container
COPY . .

# Expose the port
EXPOSE 3000

# Command to run Vite development server
CMD ["npm", "run", "dev", "--", "--port", "3000", "--host"]

