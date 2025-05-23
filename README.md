# 🏆 Audiense Demand MCP Server
[![smithery badge](https://smithery.ai/badge/@AudienseCo/mcp-audiense-demand)](https://smithery.ai/server/@AudienseCo/mcp-audiense-demand)

> 🚨 **Deprecation Notice**
> This repository is no longer actively maintained, and the code may not work as expected.
> We recommend using the [New Audiense Demand MCP Server](https://github.com/AudienseCo/mcp-server-audiense-demand) directly for any integrations.

This server, based on the [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol), allows **Claude** or any other MCP-compatible client to interact with your [Audiense Demand](https://www.audiense.com/products/demand-intelligence) account. It provides tools to create and analyze demand reports, track entity performance, and gain insights across different channels and countries.

This MCP server is designed to work with the Audiense Demand API and requires an Audiense account authorized to use Audiense Demand.

We provide two different guides based on your background and needs:

### 🌟 For Business Users and Non-Developers
If you're primarily interested in using the Audiense Demand tools with Claude or another "MCP compatible" tool and don't need to understand the technical details, follow our [User Guide](./README_USER.md). This guide will help you:
- Install the necessary software quickly
- Set up Claude Desktop
- Start creating and analyzing demand reports
- Troubleshoot common issues

### 🛠️ For Developers and Technical Users
If you're a developer, want to contribute, or need to understand the technical implementation, follow our [Developer Guide](./README_DEVELOPER.md). This guide covers:
- Detailed installation steps
- Project architecture
- Development setup
- Advanced configuration
- API documentation
- Contributing guidelines

## 🛠️ Available Tools

### 📌 `create-demand-report`
**Description**: Creates a new demand report for specified entities.

- **Parameters**:
  - `title` _(string)_: Title of the demand report
  - `entitiesReferences` _(array of strings)_: Array of entity names for the report
  - `userEmail` _(string)_: Email of the user creating the report

- **Response**:
  - Report creation details in JSON format

### 📌 `get-demand-reports`
**Description**: Retrieves the list of demand reports owned by the authenticated user.

- **Parameters**:
  - `paginationStart` _(number, optional)_: Pagination start index
  - `paginationEnd` _(number, optional)_: Pagination end index

- **Response**:
  - List of reports in JSON format

### 📌 `get-demand-report-info`
**Description**: Fetches detailed information about a specific demand report.

- **Parameters**:
  - `reportId` _(string)_: The ID of the report to get information for

- **Response**:
  - Full report details in JSON format

### 📌 `get-demand-report-summary-by-channels`
**Description**: Gets a summary of the report broken down by channels.

- **Parameters**:
  - `reportId` _(string)_: The ID of the report to get the summary for
  - `country` _(string, default: "Weighted-Total")_: The country to filter by
  - `offset` _(number, default: 0)_: Pagination offset
  - `entityNames` _(array of strings, optional)_: Optional array of entity names to filter by

- **Response**:
  - Channel-wise summary data in JSON format

### 📌 `get-demand-report-summary-by-countries`
**Description**: Gets a summary of the report broken down by countries.

- **Parameters**:
  - `reportId` _(string)_: The ID of the report to get the summary for
  - `platform` _(string, default: "all_platforms")_: Platform name to analyze
  - `countries` _(array of strings)_: Array of country codes to analyze
  - `offset` _(number, optional)_: Pagination offset
  - `entityNames` _(array of strings, optional)_: Optional array of entity names to filter by

- **Response**:
  - Country-wise summary data in JSON format

### 📌 `get-youtube-search-volume-summary`
**Description**: Gets YouTube search volume summary for entities in a report.

- **Parameters**:
  - `reportId` _(string)_: The ID of the report to get the summary for
  - `country` _(string, default: "Global")_: Country code to analyze
  - `entityNames` _(array of strings, optional)_: Optional array of entity names to filter by

- **Response**:
  - YouTube search volume data in JSON format

### 📌 `get-google-search-volume-summary`
**Description**: Gets Google search volume summary for entities in a report.

- **Parameters**:
  - `reportId` _(string)_: The ID of the report to get the summary for
  - `country` _(string, default: "Global")_: Country code to analyze
  - `entityNames` _(array of strings, optional)_: Optional array of entity names to filter by

- **Response**:
  - Google search volume data in JSON format

### 📌 `check-entities`
**Description**: Checks if entities exist and gets their details.

- **Parameters**:
  - `entities` _(array of strings)_: Array of entity names to check

- **Response**:
  - Entity status information in JSON format

## 📄 License

This project is licensed under the Apache 2.0 License. See the LICENSE file for more details.
