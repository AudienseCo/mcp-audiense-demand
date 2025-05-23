# 🏆 Audiense Demand MCP Server: Developer Guide

> 🚨 **Deprecation Notice**
> This repository is no longer actively maintained, and the code may not work as expected.
> We recommend using the [New Audiense Demand MCP Server](https://github.com/AudienseCo/mcp-server-audiense-demand) directly for any integrations.

Welcome to the technical documentation for the Audiense Demand MCP Server. This guide is designed for developers, system administrators, and technical users who want to:

- Understand the technical architecture
- Set up and run the server in your local environment
- Customize the server configuration
- Contribute to the codebase
- Debug and troubleshoot issues

This guide assumes familiarity with Node.js, TypeScript, and general software development concepts. We'll cover everything from local development setup to production deployment considerations.

## 📑 Table of Contents

- [Prerequisites](#-prerequisites)
  - [Installing Node.js](#-1-installing-nodejs)
  - [Project Setup](#-2-project-setup)
  - [Configuring the MCP Client](#️-3-configuring-the-mcp-compatible-client-example-with-claude-desktop)
  - [Authentication](#-authentication)
- [Troubleshooting](#️-troubleshooting)
- [Viewing Logs](#-viewing-logs)
- [Development](#-development)
- [Common Issues](#-common-issues)

## 🚀 Prerequisites

Before using this server, ensure you have:

- **Node.js** (v18 or higher)
- **Audiense Demand Account** authorized to use the Demand product.
- **An MCP compatible client such as Claude Desktop App**

### 📥 1. Installing Node.js

#### MacOS Installation

1. **Using Homebrew**:

   ```bash
   1. Install Homebrew if you have not already
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

   2. Install Node.js using the proper command:
   # For Intel based Mac systems you will need to execute the command this way

   brew install node@22

   # For Apple Silicon Mac systems (M1, M2, ...) you will need to execute the command this way
   arch -arm64 brew install node@22

   3. Add Node.js to your PATH
   # Choose the appropriate command for your shell:
   # Note: If you are not sure which shell you are using, run:
   echo $SHELL

   # For zsh (default in newer MacOS):
   echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc

   # For bash:
   echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.bash_profile
   source ~/.bash_profile

   # For fish:
   fish_add_path /opt/homebrew/opt/node@22/bin

   ```

2. **Using the Official Installer**:
   - Visit [Node.js official website](https://nodejs.org/)
   - Download the LTS version (18.x or higher)
   - Run the installer package
   - Follow the installation wizard

#### Windows Installation

1. **Using the Official Installer (Recommended)**:
   - Visit [Node.js official website](https://nodejs.org/)
   - Download the LTS version (18.x or higher) Windows Installer (.msi)
   - Run the installer
   - Follow the installation wizard
   - Ensure to check the box that says "Automatically install the necessary tools"

#### Verify Installation

After installation, verify Node.js is properly installed by running:

```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show the npm version
```

If you see version numbers for both commands, Node.js is successfully installed!

### 🔧 2. Project Setup

Before configuring Claude Desktop, you need to set up the project:

1. Clone the repository

   ```bash
   git clone https://github.com/AudienseCo/mcp-audiense-demand.git
   cd mcp-audiense-demand
   ```

2. Install project dependencies

   ```bash
   npm install
   ```

3. Build the project

   ```bash
   npm run build
   ```

   This will create the necessary files in the `build` directory that Claude Desktop needs to run the MCP server.

### ⚙️ 3. Configuring the MCP Compatible Client (example with Claude Desktop)

1. Open the configuration file for Claude Desktop:

   - **MacOS:**
     ```bash
     code ~/Library/Application\ Support/Claude/claude_desktop_config.json
     ```
   - **Windows:**
     ```bash
     code %AppData%\Claude\claude_desktop_config.json
     ```

2. Add or update the following configuration:

   If Node.js is in your PATH (recommended):

   ```json
   "mcpServers": {
     "audiense-demand": {
       "command": "node",
       "args": [
         "/ABSOLUTE/PATH/TO/YOUR/build/index.js"
       ],
       "env": {}
     }
   }
   ```

   If you prefer to test de _SSE_ Server you need to start the server by running the following command `node build/index.js sse` and then configuring the clients this way:

   For Cursor:

   ```json
   {
     "mcpServers": {
       "audiense-demand": {
         "url": "http://localhost:3001/sse"
       }
     }
   }
   ```

   For Claude Desktop (which still do not support SSE Servers):

   ```json
   {
     "mcpServers": {
       "audiense-demand": {
         "command": "npx",
         "args": ["-y", "mcp-remote", "http://localhost:3001/sse"]
       }
     }
   }
   ```

   If Node.js is not in your PATH, you'll need to use the full path to node. To find it:

- **MacOS:**

```bash
# Find Node.js path
which node
# Example output: /opt/homebrew/bin/node
```

- **Windows:**

```powershell
# Find Node.js path
where node
# Example output: C:\Program Files\nodejs\node.exe
```

Then use the full path in your configuration:

```json
"mcpServers": {
  "audiense-demand": {
    "command": "/opt/homebrew/bin/node",  // MacOS example
    // or "C:\\Program Files\\nodejs\\node.exe" for Windows
    "args": [
      "/ABSOLUTE/PATH/TO/YOUR/build/index.js"
    ],
    "env": {}
  }
}
```

3. Replace `/ABSOLUTE/PATH/TO/YOUR/build/index.js` with the actual path to your index.js file:

- **MacOS:**

```bash
# Navigate to your project directory
cd /path/to/mcp-audiense-demand

# Get the absolute path to index.js
echo "$(pwd)/build/index.js"
```

- **Windows:**

```powershell
# Navigate to your project directory
cd C:\path\to\mcp-audiense-demand

# Get the absolute path to index.js
$pwd.Path + "\build\index.js"
```

Copy the output path and use it in your configuration.

4. Save the file and restart Claude Desktop.

### 🔐 4. Authentication

The server uses the Device Authorization Flow for authentication, which provides a secure way to authenticate without directly handling credentials. Here's how it works:

1. When you first try to access any tool that requires authentication, the server will initiate the Device Authorization Flow.
2. You'll receive:
   - A verification URL (e.g., https://auth.audiense.com/activate).
   - A user code to enter on that page.
3. Visit the verification URL and enter the provided code.
4. Complete the authentication process in your browser.
5. The server will automatically handle the token management after successful authentication.
6. You can continue using the MCP.

This flow is more secure because:

- No need to handle or store credentials directly
- Tokens are managed automatically
- The authentication process happens in your browser
- The user code expires after 15 minutes for security

#### Token Management

- Access tokens are automatically refreshed when needed
- No manual token management required
- Secure token storage handled by the server

#### Troubleshooting Authentication

If you encounter authentication issues:

1. Ensure you've completed the authentication process in your browser
2. Try the operation again after a few seconds
3. If issues persist, restart the authentication flow by trying the operation again

## 🛠️ Troubleshooting

### Tools Not Appearing in Claude

1. Check Claude Desktop logs:

```
tail -f ~/Library/Logs/Claude/mcp*.log
```

2. Verify environment variables are set correctly.
3. Ensure the absolute path to index.js is correct.

### Authentication Issues

- Double-check OAuth credentials.
- Ensure the access and refresh token is still valid.
- Verify that the required API scopes are enabled.

## 📜 Viewing Logs

To check server logs:

### For MacOS/Linux:

```
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
```

### For Windows:

```
Get-Content -Path "$env:AppData\Claude\Logs\mcp*.log" -Wait -Tail 20
```

## ❗ Common Issues

### "command not found: node"

- **Solution**: Make sure Node.js is properly installed and added to your PATH
- **Check**: Run `node --version` to verify the installation

### "Error: Cannot find module"

- **Solution**: Make sure you've built the project and the path to index.js is correct
- **Check**: Verify the build directory exists and contains index.js

### "EACCES: permission denied"

- **Solution**: Check file permissions or run with elevated privileges
- **Check**: Ensure you have read/write permissions in the project directory

### "Invalid configuration"

- **Solution**: Verify your claude_desktop_config.json syntax
- **Check**: Make sure all paths use correct separators for your OS (/ for MacOS/Linux, \\ for Windows)

### Authentication Loop

- **Solution**: Clear any cached tokens and restart the authentication process
- **Check**: Verify your Audiense Demand account has the correct permissions

For any other issues, please check the logs or [open an issue](https://github.com/AudienseCo/mcp-audiense-demand/issues) in our repository.
