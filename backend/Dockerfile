
# Use a Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and other necessary files
COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json ./tsconfig.json
COPY .eslintrc.js ./.eslintrc.js
COPY .prettierrc.json ./.prettierrc.json
COPY jest.config.js ./jest.config.js
COPY tests ./tests

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
