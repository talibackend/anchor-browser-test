# Use the official Node.js 20 image as the base
FROM node:20

# Install dependencies required for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libdrm2 \
    libgbm1 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*


# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy everything
COPY . .

# Set Puppeteer's executable path environment variable to system-installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install dependencies
RUN npm install

# Expose port
EXPOSE ${PORT}

# Start the application
CMD ["sh", "-c", "npm run dev"]
