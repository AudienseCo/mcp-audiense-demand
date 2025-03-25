# 🏆 Audiense Demand MCP Server
[![smithery badge](https://smithery.ai/badge/@AudienseCo/mcp-audiense-demand)](https://smithery.ai/server/@AudienseCo/mcp-audiense-demand)

This server, based on the [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol), allows **Claude** or any other MCP-compatible client to interact with your [Audiense Demand](https://www.audiense.com/products/demand-intelligence) account. It provides tools to create and analyze demand reports, track entity performance, and gain insights across different channels and countries.

## 📑 Table of Contents
- [Disclaimer](#️-disclaimer)
- [Prerequisites](#-prerequisites)
- [Install Node.js](#-install-nodejs)
- [Install Claude Desktop](#-install-claude-desktop)
- [Install MCP Server (Smithery)](#-install-mcp-server-smithery)
- [Authentication](#-authentication)
- [Available Tools](#️-available-tools)
- [Common Issues](#-common-issues)
- [License](#-license)

This MCP server is designed to work with the Audiense Demand API and requires valid authentication credentials. Please note:

## ⚠️ Disclaimer

- This is a Work In Progress project, so the configuration might vary in the short term, as well as the project's own existence.
- This server is intended for use with official Audiense Demand accounts only.

---

## 🚀 Prerequisites

Before using this server, ensure you have:

- **Node.js** (v18 or higher).
- **Claude Desktop** or any other MCP-compatible client.
- **Audiense Demand Account** authorized to use the Demand product.

---

## 📥 Install Node.js

### MacOS

- Download [Node.js official website](https://nodejs.org/)
- Download the LTS version (18.x or higher)
- Run the installer package
- Follow the installation wizard

### Windows

- Visit [Node.js official website](https://nodejs.org/)
- Download the LTS version (18.x or higher) Windows Installer (.msi)
- Run the installer
- Follow the installation wizard
- Ensure to check the box that says "Automatically install the necessary tools"

### Verify Installation

To verify Node.js is installed, we need to open a terminal (console):

#### MacOS

1. Press Command + Space to open Spotlight Search.
2. Type Terminal and press Enter.

#### Windows

1. Press Windows + R to open the Run dialog.
2. Type cmd and press Enter.


Then, you can verify Node.js is properly installed by running:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show the npm version
```

If you see version numbers for both commands, Node.js is successfully installed!

---

## 📥 Install Claude Desktop

To install Claude Desktop, follow these steps:

1. Download the latest version of Claude Desktop from the [official website](https://claude.ai/download).
2. Run the installer package.
3. Follow the installation wizard.
4. Open Claude Desktop and log in with tech@audiense.com

---

## 🔧 Install MCP Server (Smithery)

Smithery is a platform to help developers find and ship language model extensions.

Paste this command to automatically install the MCP server using Smithery with Claude Desktop Client:

```bash
  npx -y @smithery/cli@latest install @AudienseCo/mcp-audiense-demand --client claude
```

---

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

### Troubleshooting Authentication
If you encounter authentication issues:
1. Ensure you've completed the authentication process in your browser
2. Try the operation again after a few seconds
3. If issues persist, restart the authentication flow by trying the operation again

---

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

## ❗ Common Issues

### "command not found: node"
- **Solution**: Make sure Node.js is properly installed and added to your PATH
- **Check**: Run `node --version` to verify the installation

For any other issues, please check the logs or [open an issue](https://github.com/AudienseCo/mcp-audiense-demand/issues) in our repository.

## 📄 License

This project is licensed under the Apache 2.0 License. See the LICENSE file for more details.
