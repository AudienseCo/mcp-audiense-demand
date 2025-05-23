# 🏆 Audiense Demand MCP Server: User Guide

> 🚨 **Deprecation Notice**
> This repository is no longer actively maintained, and the code may not work as expected.
> We recommend using the [New Audiense Demand MCP Server](https://github.com/AudienseCo/mcp-server-audiense-demand) directly for any integrations.


Welcome to the Audiense Demand User Guide! This guide is designed for business users and non-developers who want to get started quickly with Audiense Demand through Claude or any other MCP-compatible client. We've simplified the technical aspects and focused on what you need to know to:

- Get up and running quickly
- Create and analyze demand reports
- Track entity performance across different channels

No programming experience is required - we'll walk you through each step with clear instructions.

## 📥 1. Installing Node.js

The installation is straightforward and only takes a few minutes. Choose your operating system below and follow the simple steps:

<details>
<summary>MacOS</summary>

1. Download [Node.js official website](https://nodejs.org/).
2. Download the LTS version (18.x or higher).
3. Run the installer package.
4. Follow the installation wizard.
5. Verify the installation. For this, Press `Command + Space` to open Spotlight Search, type "Terminal" and press Enter. Then, run the following commands.

  ```bash
  node --version  # Should show v18.x.x or higher
  ```
  ```bash
  node --version  # Should show v18.x.x or higher
  ```

If you see version numbers for both commands, Node.js is successfully installed!
</details>


<details>
<summary>Windows</summary>


1. Visit [Node.js official website](https://nodejs.org/)
2. Download the LTS version (18.x or higher) Windows Installer (.msi)
3. Run the installer
4. Follow the installation wizard
5. Ensure to check the box that says "Automatically install the necessary tools"
6. Verify the installation. For this, Press `Windows + R` to open the Run dialog, type "cmd" and press Enter. Then, run the following commands.

  ```bash
  node --version  # Should show v18.x.x or higher
  ```
  ```bash
  node --version  # Should show v18.x.x or higher
  ```

If you see version numbers for both commands, Node.js is successfully installed!
</details>

## 📥 2. Installing Claude Desktop

To install Claude Desktop, follow these steps:

1. Download the latest version of Claude Desktop from the [official website](https://claude.ai/download).
2. Run the installer package.
3. Follow the installation wizard.

## 🔧 3. Installing Audiense Demand MCP using Smithery

Smithery is a platform to help developers find and ship language model extensions.

Copy this command and paste it into the terminal to automatically install the MCP server using Smithery with Claude Desktop Client:

```bash
  npx -y @smithery/cli@latest install @AudienseCo/mcp-audiense-demand --client claude
```

## 🔐 4. Start Using the Server

1. Open Claude Desktop.
2. Ask for Demand Report list.
3. Authenticate with your Audiense Demand account following the steps given by the AI Client.

### Troubleshooting Authentication

If you encounter authentication issues:

1. Ensure you've completed the authentication process in your browser
2. Try the operation again after a few seconds
3. If issues persist, restart the authentication flow by trying the operation again

## ❗ Common Issues

### "command not found: node"
- **Solution**: Make sure Node.js is properly installed and added to your PATH
- **Check**: Run `node --version` to verify the installation

For any other issues, please check the logs or [open an issue](https://github.com/AudienseCo/mcp-audiense-demand/issues) in our repository.
