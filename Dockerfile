# Use the official Node.js 20 image as the base
FROM node:20

# Install dependencies required for Puppeteer
# RUN apt-get update && apt-get install -y \
#     wget \
#     ca-certificates \
#     fonts-liberation \
#     libappindicator3-1 \
#     libasound2 \
#     libatk-bridge2.0-0 \
#     libatk1.0-0 \
#     libcups2 \
#     libdbus-1-3 \
#     libgdk-pixbuf2.0-0 \
#     libnspr4 \
#     libnss3 \
#     libxcomposite1 \
#     libxdamage1 \
#     libxrandr2 \
#     xdg-utils \
#     libdrm2 \
#     libgbm1 \
#     --no-install-recommends && \
#     rm -rf /var/lib/apt/lists/*


# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to take advantage of Docker cache
COPY package*.json ./
COPY tsconfig.json ./
COPY babel.config.js ./
COPY swagger-output-004weg24867t345rfubgb56661.json ./

# Install dependencies and Puppeteer
RUN npm install && npm install -g typescript

# Copy the source code to the working directory
COPY src/ ./src/

# Build the TypeScript code
RUN npm run build

# Copy the rest of the application files (if any)
COPY . .

# Set environment variables
ENV APP_NAME=
ENV NODE_ENV=development
ENV PORT=3000
ENV DB_CONNECTION_STRING=
ENV OPEN_AI_API_KEY=
ENV MAKE_WEBHOOK_URL=

# Expose the port the app will run on
EXPOSE ${PORT}

# Start the application
CMD ["sh", "-c", "npm start"]
