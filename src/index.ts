import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch, { RequestInit } from 'node-fetch';

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const API_BASE_URL = process.env.API_BASE_URL;

interface TokenCache {
    access_token: string;
    refresh_token?: string;
    expires_at: number;
}

let tokenCache: TokenCache | null = null;

// MCP Server instance
const server = new McpServer({
    name: "audiense-demand",
    version: "1.0.0",
});

/**
 * Get a new access token using the refresh token
 */
async function refreshAccessToken(refresh_token: string): Promise<TokenCache> {
    try {
        const response = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'refresh_token',
                client_id: AUTH0_CLIENT_ID,
                refresh_token: refresh_token
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Auth0 token refresh failed: ${error}`);
        }

        const data = await response.json() as {
            access_token: string;
            refresh_token: string;
            expires_in: number;
        };

        return {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Date.now() + (data.expires_in * 1000) - 60000 // Subtract 1 minute for safety
        };
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
}

/**
 * Get an access token, refreshing if necessary
 */
async function getAccessToken(): Promise<string> {
    if (tokenCache && tokenCache.expires_at > Date.now()) {
        return tokenCache.access_token;
    }

    try {
        tokenCache = await refreshAccessToken(tokenCache?.refresh_token || process.env.INITIAL_REFRESH_TOKEN || '');
        return tokenCache.access_token;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        tokenCache = null;
    }

    throw new Error('No valid token available');
}

/**
 * Helper function to make authenticated requests to the API
 */
async function makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}) {
    const token = await getAccessToken();

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        return response.json();
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error(`Error making request to ${endpoint}:`, errorMessage);
        throw error;
    }
}

/**
 * MCP Tool: Create a demand report
 */
server.tool(
    "create-demand-report",
    "Create a new demand report",
    {
        title: z.string().describe("Title of the demand report"),
        entitiesReferences: z.array(z.string()).describe("Array of entity names for the report"),
        userEmail: z.string().email().describe("Email of the user creating the report")
    },
    async ({ title, entitiesReferences, userEmail }) => {
        try {
            const data = await makeAuthenticatedRequest('/demand-report', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    entitiesReferences,
                    userEmail
                })
            });

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2)
                    },
                ],
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to create demand report: ${errorMessage}`,
                    },
                ],
            };
        }
    }
);

/**
 * MCP Tool: Get user reports
 */
server.tool(
    "get-reports",
    "Get reports for the authorized user",
    {
        paginationStart: z.number().optional().describe("Pagination start index"),
        paginationEnd: z.number().optional().describe("Pagination end index")
    },
    async ({ paginationStart, paginationEnd }) => {
        try {
            const queryParams = new URLSearchParams({
                ...(paginationStart !== undefined && { paginationStart: paginationStart.toString() }),
                ...(paginationEnd !== undefined && { paginationEnd: paginationEnd.toString() })
            });

            const endpoint = queryParams.toString() ? `/reports?${queryParams.toString()}` : '/reports';
            const data = await makeAuthenticatedRequest(endpoint, {
                method: 'GET'
            });

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2)
                    },
                ],
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to get user reports: ${errorMessage}`,
                    },
                ],
            };
        }
    }
);

/**
 * MCP Tool: Get report info
 */
server.tool(
    "get-report-info",
    "Get detailed information about a specific report",
    {
        reportId: z.string().describe("The ID of the report to get information for"),
    },
    async ({ reportId }) => {
        try {
            const data = await makeAuthenticatedRequest(`/report?id=${reportId}`, {
                method: 'GET'
            });

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2)
                    },
                ],
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to get report info: ${errorMessage}`,
                    },
                ],
            };
        }
    }
);

/**
 * MCP Tool: Get report summary by channels
 */
server.tool(
    "get-report-summary-by-channels",
    "Get a summary of the report broken down by channels",
    {
        reportId: z.string().describe("The ID of the report to get the summary for"),
        country: z.string().default("Weighted-Total").describe("The country to filter by (defaults to Weighted-Total)"),
        offset: z.number().default(0).describe("Pagination offset"),
    },
    async ({ reportId, country, offset }) => {
        try {
            const data = await makeAuthenticatedRequest(
                `/reports/summary-by-channels?reportId=${reportId}&country=${country}&offset=${offset}`,
                { method: 'GET' }
            );

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2)
                    },
                ],
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to get report summary by channels: ${errorMessage}`,
                    },
                ],
            };
        }
    }
);

/**
 * MCP Tool: Get report summary by countries
 */
server.tool(
    "get-report-summary-by-countries",
    "Get a summary of the report broken down by countries",
    {
        reportId: z.string().describe("The ID of the report to get the summary for"),
        platform: z.string().describe("Platform name to analyze"),
        countries: z.array(z.string()).describe("Array of country codes to analyze"),
        entityNames: z.array(z.string()).optional().describe("Optional array of entity names to filter by"),
        offset: z.number().optional().describe("Pagination offset")
    },
    async ({ reportId, platform, countries, entityNames, offset }) => {
        try {
            const queryParams = new URLSearchParams({
                reportId,
                platform,
                countries: JSON.stringify(countries),
                ...(entityNames && { entityNames: JSON.stringify(entityNames) }),
                ...(offset !== undefined && { offset: offset.toString() })
            });

            const data = await makeAuthenticatedRequest(
                `/reports/summary-by-countries?${queryParams.toString()}`,
                { method: 'GET' }
            );

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2)
                    },
                ],
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to get report summary by countries: ${errorMessage}`,
                    },
                ],
            };
        }
    }
);

/**
 * MCP Tool: Get YouTube search volume summary
 */
server.tool(
    "get-youtube-search-volume-summary",
    "Get YouTube search volume summary for entities in a report",
    {
        reportId: z.string().describe("The ID of the report to get the summary for"),
        country: z.string().describe("Country code to analyze"),
        entityNames: z.array(z.string()).optional().describe("Optional array of entity names to filter by")
    },
    async ({ reportId, country, entityNames }) => {
        try {
            const queryParams = new URLSearchParams({
                reportId,
                country,
                ...(entityNames && { entityNames: JSON.stringify(entityNames) })
            });

            const data = await makeAuthenticatedRequest(
                `/reports/youtube-search-volume-summary?${queryParams.toString()}`,
                { method: 'GET' }
            );

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2)
                    },
                ],
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to get YouTube search volume summary: ${errorMessage}`,
                    },
                ],
            };
        }
    }
);

/**
 * MCP Tool: Check entity status
 */
server.tool(
    "check-entity-status",
    "Check if entities exist and get their details",
    {
        entities: z.array(z.string()).describe("Array of entity names to check")
    },
    async ({ entities }) => {
        try {
            const data = await makeAuthenticatedRequest('/entity/check', {
                method: 'POST',
                body: JSON.stringify({ entities })
            });

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2)
                    },
                ],
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to check entity status: ${errorMessage}`,
                    },
                ],
            };
        }
    }
);

/**
 * MCP Tool: Get entities by name or reference
 */
server.tool(
    "get-entities",
    "Search for entities by name or reference",
    {
        nameOrReference: z.string().describe("Name or reference to search for")
    },
    async ({ nameOrReference }) => {
        try {
            const data = await makeAuthenticatedRequest(`/entity?nameOrReference=${encodeURIComponent(nameOrReference)}`, {
                method: 'GET'
            });

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2)
                    },
                ],
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to get entities: ${errorMessage}`,
                    },
                ],
            };
        }
    }
);

/**
 * Starts the MCP server and listens for incoming requests.
 */
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Demand Public API MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
