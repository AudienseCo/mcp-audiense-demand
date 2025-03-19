# 🏆 Audiense Demand MCP Server
[![smithery badge](https://smithery.ai/badge/@AudienseCo/mcp-audiense-demand)](https://smithery.ai/server/@AudienseCo/mcp-audiense-demand)

This server, based on the [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol), allows **Claude** or any other MCP-compatible client to interact with your [Audiense Demand](https://www.audiense.com/) account. It provides tools to create and analyze demand reports, track entity performance, and gain insights across different channels and countries.

<a href="https://glama.ai/mcp/servers/xz11vmv38c">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/xz11vmv38c/badge" /></a>

---

## 🚀 Prerequisites

Before using this server, ensure you have:

- **Node.js** (v18 or higher)
- **Claude Desktop App**
- **Audiense Demand Account** with API credentials
- **Auth0 Access and Refresh Tokens**

---

## Installing via Smithery

To install Audiense Demand Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@AudienseCo/mcp-audiense-demand):

```bash
npx -y @smithery/cli@latest install @AudienseCo/mcp-audiense-demand --client claude
```

## ⚙️ Configuring Claude Desktop

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

   ```json
   "mcpServers": {
     "demand-public-api": {
       "command": "/opt/homebrew/bin/node",
       "args": [
         "/ABSOLUTE/PATH/TO/YOUR/build/index.js"
       ],
       "env": {
         "AUTH0_DOMAIN": "auth.audiense.com",
         "AUTH0_CLIENT_ID": "your-client-id",
         "API_BASE_URL": "https://demandpublicapi.socialbro.me",
         "INITIAL_ACCESS_TOKEN": "your.initial.access.token",
         "INITIAL_REFRESH_TOKEN": "your.initial.refresh.token"
       }
     }
   }
   ```

   Replace the placeholders with your actual credentials:
   - `AUTH0_DOMAIN`: Your Auth0 tenant domain (e.g., "auth.audiense.com")
   - `AUTH0_CLIENT_ID`: Your Auth0 application client ID (currently only Demand App Frontend ClientID is authorized on Demand Public API)
   - `API_BASE_URL`: The base URL for the Audiense Demand API (usually "https://demandpublicapi.socialbro.me")
   - `INITIAL_ACCESS_TOKEN`: Your initial Auth0 access token
   - `INITIAL_REFRESH_TOKEN`: Your initial Auth0 refresh token

3. Save the file and restart Claude Desktop.

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

### 📌 `check-entity-status`
**Description**: Checks if entities exist and gets their details.

- **Parameters**:
  - `entities` _(array of strings)_: Array of entity names to check

- **Response**:
  - Entity status information in JSON format

---

### 📌 `get-entities`
**Description**: Searches for entities by name or reference.

- **Parameters**:
  - `nameOrReference` _(string)_: Name or reference to search for

- **Response**:
  - Matching entities in JSON format

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
- Ensure the refresh token is still valid.
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

## 🔐 Security Considerations

- Keep API credentials secure – never expose them in public repositories.
- Use environment variables to manage sensitive data.

## 📄 License

This project is licensed under the Apache 2.0 License. See the LICENSE file for more details.

## 🔐 Authentication

The server supports two authentication methods:

1. **Simple Token Authentication**
   ```json
   "env": {
     "API_TOKEN": "your.jwt.token"
   }
   ```
   The server will automatically parse the token's expiration and handle it appropriately.

2. **Auto-refresh Authentication**
   ```json
   "env": {
     "AUTH0_DOMAIN": "auth.audiense.com",
     "AUTH0_CLIENT_ID": "your-client-id",
     "API_TOKEN": "your.initial.token"
   }
   ```
   This method will:
   - Use the initial token from API_TOKEN
   - Automatically parse token expiration
   - Attempt to refresh tokens before they expire
   - Fall back to environment token if refresh fails

The server will:
1. Use cached token if valid
2. Try to refresh token if expired
3. Fall back to environment token if refresh fails
4. Parse JWT expiration for proper token lifecycle management
