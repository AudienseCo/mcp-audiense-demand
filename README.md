# 🏆 Audiense Demand MCP Server
[![smithery badge](https://smithery.ai/badge/@AudienseCo/mcp-audiense-demand)](https://smithery.ai/server/@AudienseCo/mcp-audiense-demand)

This server, based on the [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol), allows **Claude** or any other MCP-compatible client to interact with your [Audiense Demand](https://www.audiense.com/products/demand-intelligence) account. It provides tools to create and analyze demand reports, track entity performance, and gain insights across different channels and countries.

## 📑 Table of Contents
- [Disclaimer](#️-disclaimer)
- [Prerequisites](#-prerequisites)
- [Installing Node.js](#-1-installing-nodejs)
- [Project Setup](#-2-project-setup)
- [Configuring the MCP Client](#️-3-configuring-the-mcp-compatible-client-example-with-claude-desktop)
- [Available Tools](#️-available-tools)
- [Troubleshooting](#️-troubleshooting)
- [Viewing Logs](#-viewing-logs)
- [Authentication](#-authentication)
- [Development](#-development)
- [Version Compatibility](#-version-compatibility)
- [Common Issues](#-common-issues)
- [License](#-license)

This MCP server is designed to work with the Audiense Demand API and requires valid authentication credentials. Please note:

## ⚠️ Disclaimer

- This is a Work In Progress project, so the configuration might vary in the short term, as well as the project's own existence.
- This server is intended for use with official Audiense Demand accounts only

---

## 🚀 Prerequisites

Before using this server, ensure you have:

- **Node.js** (v18 or higher)
- **Audiense Demand Account** authorized to use the Demand product.
- **An MCP compatible client such as Claude Desktop App**

---

## 📥 1. Installing Node.js

### MacOS Installation

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

### Windows Installation

1. **Using the Official Installer (Recommended)**:
   - Visit [Node.js official website](https://nodejs.org/)
   - Download the LTS version (18.x or higher) Windows Installer (.msi)
   - Run the installer
   - Follow the installation wizard
   - Ensure to check the box that says "Automatically install the necessary tools"

### Verify Installation

After installation, verify Node.js is properly installed by running:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show the npm version
```

If you see version numbers for both commands, Node.js is successfully installed!

---

## 🔧 2. Project Setup

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

---

## ⚙️ 3. Configuring the MCP Compatible Client (example with Claude Desktop)

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

## 🛠️ Available Tools

### 📌 `create-demand-report`
**Description**: Creates a new demand report for specified entities.

- **Parameters**:
  - `title` _(string)_: Title of the demand report
  - `entitiesReferences` _(array of strings)_: Array of entity names for the report
  - `userEmail` _(string)_: Email of the user creating the report

- **Response**:
  - Report creation details in JSON format

---

### 📌 `get-reports`
**Description**: Retrieves the list of demand reports owned by the authenticated user.

- **Parameters**:
  - `paginationStart` _(number, optional)_: Pagination start index
  - `paginationEnd` _(number, optional)_: Pagination end index

- **Response**:
  - List of reports in JSON format

---

### 📌 `get-report-info`
**Description**: Fetches detailed information about a specific demand report.

- **Parameters**:
  - `reportId` _(string)_: The ID of the report to get information for

- **Response**:
  - Full report details in JSON format

---

### 📌 `get-report-summary-by-channels`
**Description**: Gets a summary of the report broken down by channels.

- **Parameters**:
  - `reportId` _(string)_: The ID of the report to get the summary for
  - `country` _(string, default: "Weighted-Total")_: The country to filter by
  - `offset` _(number, default: 0)_: Pagination offset

- **Response**:
  - Channel-wise summary data in JSON format

---

### 📌 `get-report-summary-by-countries`
**Description**: Gets a summary of the report broken down by countries.

- **Parameters**:
  - `reportId` _(string)_: The ID of the report to get the summary for
  - `platform` _(string)_: Platform name to analyze
  - `countries` _(array of strings)_: Array of country codes to analyze
  - `entityNames` _(array of strings, optional)_: Optional array of entity names to filter by
  - `offset` _(number, optional)_: Pagination offset

- **Response**:
  - Country-wise summary data in JSON format

---

### 📌 `get-youtube-search-volume-summary`
**Description**: Gets YouTube search volume summary for entities in a report.

- **Parameters**:
  - `reportId` _(string)_: The ID of the report to get the summary for
  - `country` _(string)_: Country code to analyze
  - `entityNames` _(array of strings, optional)_: Optional array of entity names to filter by

- **Response**:
  - YouTube search volume data in JSON format

---

### 📌 `check-entities`
**Description**: Checks if entities exist and gets their details.

- **Parameters**:
  - `entities` _(array of strings)_: Array of entity names to check

- **Response**:
  - Entity status information in JSON format

---

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

## 📄 License

This project is licensed under the Apache 2.0 License. See the LICENSE file for more details.

## 🔐 Authentication

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

### Token Management
- Access tokens are automatically refreshed when needed
- No manual token management required
- Secure token storage handled by the server

### Troubleshooting Authentication
If you encounter authentication issues:
1. Ensure you've completed the authentication process in your browser
2. Try the operation again after a few seconds
3. If issues persist, restart the authentication flow by trying the operation again

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
