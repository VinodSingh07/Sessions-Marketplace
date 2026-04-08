FROM node:20-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application
COPY . .

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Command to run the application in dev mode for development, 
# can be changed to 'npm run build && npm start' for production
CMD ["npm", "run", "dev"]
