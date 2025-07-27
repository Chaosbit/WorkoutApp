# Dev Container Setup

This repository includes a VS Code Dev Container configuration that provides a consistent development environment for the Workout Timer PWA project.

## What's Included

### Development Environment
- **Node.js 18**: For frontend development and testing
- **.NET 8 SDK**: For backend API development
- **Git & GitHub CLI**: For version control operations
- **Terraform**: For infrastructure as code management
- **Azure CLI**: For Azure cloud deployments
- **Python 3**: For development scripts and utilities
- **SQLite**: For local database development

### VS Code Extensions
- **C# Dev Kit**: For .NET backend development
- **ESLint & Prettier**: For code linting and formatting
- **Jest Test Explorer**: For running and debugging unit tests
- **Playwright**: For end-to-end testing
- **Tailwind CSS**: For CSS IntelliSense
- **Terraform**: For infrastructure as code support
- **Azure CLI**: For Azure cloud integration
- **Azure Resource Groups**: For Azure resource management

### Development Tools
- **Jest**: For unit testing (globally installed)
- **Cypress**: For e2e testing
- **Serve & HTTP-Server**: For local development servers
- **Playwright**: Browser automation for testing

## Getting Started

### Prerequisites
- **Docker**: Make sure Docker Desktop is installed and running
- **VS Code**: With the Dev Containers extension installed

### Using the Dev Container

1. **Open the Repository**
   ```bash
   git clone https://github.com/Chaosbit/WorkoutApp
   cd WorkoutApp
   ```

2. **Start Dev Container**
   - Open VS Code in the repository folder
   - Press `Ctrl/Cmd + Shift + P` to open command palette
   - Type "Dev Containers: Reopen in Container"
   - Select the command and wait for container to build

3. **Verify Setup**
   ```bash
   # Check Node.js
   node --version
   
   # Check .NET
   dotnet --version
   
   # Check Terraform
   terraform --version
   
   # Check Azure CLI
   az --version
   
   # Install dependencies
   npm install
   cd backend && dotnet restore && cd ..
   ```

## Development Workflow

### Frontend Development
```bash
# Run development server
python -m http.server 8000

# Run unit tests
npm run test:unit

# Run e2e tests
npm run test:e2e

# Run all tests
npm run test:all
```

### Backend Development
```bash
# Navigate to backend
cd backend

# Run the API
dotnet run

# Run backend tests
dotnet test
```

### Infrastructure Management
```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Plan infrastructure changes
terraform plan

# Apply infrastructure changes
terraform apply

# Check Azure resources
az account show
az group list
```

## Port Forwarding

The container automatically forwards these ports:
- **8000**: PWA Development Server
- **5000**: .NET Backend API  
- **3000**: Alternative Dev Server

## Container Features

### Post-Create Setup
The container automatically runs:
```bash
bash .devcontainer/post-create.sh
```

This script:
- Installs additional development tools (sqlite3, python3, global npm packages)
- Installs Playwright dependencies
- Runs `npm install` and `dotnet restore`
- Sets up proper file permissions

### Environment Variables
- `NODE_ENV=development`
- `DOTNET_CLI_TELEMETRY_OPTOUT=1`
- `DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1`

## Troubleshooting

### Container Build Issues
If the container fails to build:
1. Check Docker Desktop is running
2. Try rebuilding: `Dev Containers: Rebuild Container`
3. Clear Docker cache if needed
4. If you see Microsoft repository errors, ensure you're using the latest devcontainer features

**Common Error Fix**: If you encounter user permission errors like:
```
Status 500: {"cause":"no matching entries in passwd file","message":"unable to find user vscode: no matching entries in passwd file","response":500}
```
This has been resolved by using the proper devcontainer features configuration with `common-utils` feature that ensures the vscode user is created correctly.

### Permission Issues
If you encounter permission issues:
```bash
# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
```

### Port Conflicts
If ports are already in use:
1. Modify port numbers in `.devcontainer/devcontainer.json`
2. Rebuild the container

## Manual Setup (Alternative)

If you prefer not to use Dev Containers:

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install .NET 8
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update && sudo apt-get install -y dotnet-sdk-8.0

# Install Terraform
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Install dependencies
npm install
cd backend && dotnet restore
```