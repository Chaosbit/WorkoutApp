FROM mcr.microsoft.com/devcontainers/javascript-node:18

# Note: .NET 8 SDK is installed via devcontainer features

# Install additional tools for PWA development
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        curl \
        wget \
        vim \
        nano \
        sqlite3 \
        python3 \
        python3-pip \
    && apt-get autoremove -y && apt-get clean -y

# Install Playwright dependencies for e2e testing
RUN npx playwright install-deps

# Install global npm packages for development
RUN npm install -g \
    serve \
    http-server \
    jest \
    cypress

# Create workspace directory
WORKDIR /workspace

# Set up environment variables
ENV NODE_ENV=development
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1

# Expose ports for development servers
EXPOSE 3000 5000 8000 8080 9229

# Default command
CMD ["sleep", "infinity"]