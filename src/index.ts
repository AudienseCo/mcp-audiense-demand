import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch, { RequestInit } from 'node-fetch';
import AdmZip from 'adm-zip';
import { CSV_STRUCTURE } from './schemas/demand-data.js';
import { AuthClient } from './AuthClient.js';

const API_BASE_URL = process.env.API_BASE_URL;

// MCP Server instance
const server = new McpServer({
    name: "audiense-demand",
    version: "1.0.0",
});

// Add mock CSV files as resources
server.resource(
    "entities",
    "mock://audiense-demand/mockReportId/entities/All_Entities.csv",
    {
        description: "Entity information including social media handles and metadata (e.g. name, entity type, place of birth, birth date, primary language, gender, age, etc.)",
        mimeType: "text/csv"
    },
    async () => {
        const fs = await import('fs/promises');
        const path = await import('path');
        const { fileURLToPath } = await import('url');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const content = await fs.readFile(path.join(__dirname, 'mock-data/mockReportId/entities/All_Entities.csv'), 'utf-8');
        return {
            contents: [{
                uri: "mock://audiense-demand/mockReportId/entities/All_Entities.csv",
                text: content,
                mimeType: "text/csv"
            }]
        };
    }
);

server.resource(
    "demand-scores",
    "mock://audiense-demand/mockReportId/demand_score",
    {
        description: "Demand score data across different platforms and metrics",
        mimeType: "text/csv"
    },
    async () => {
        const fs = await import('fs/promises');
        const path = await import('path');
        const { fileURLToPath } = await import('url');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const files = [
            'all_platforms_demand_score.csv',
            'google_demand_score.csv',
            'google_growth_demand_score.csv',
            'instagram_demand_score.csv',
            'tiktok_demand_score.csv',
            'twitter_demand_score.csv',
            'url_demand_score.csv',
            'youtube_demand_score.csv',
            'youtube_search_term_demand_score.csv'
        ];

        const contents = await Promise.all(files.map(async (file) => {
            const content = await fs.readFile(path.join(__dirname, 'mock-data/mockReportId/demand_score', file), 'utf-8');
            return {
                uri: `mock://audiense-demand/mockReportId/demand_score/${file}`,
                text: content,
                mimeType: "text/csv"
            };
        }));

        return { contents };
    }
);

server.resource(
    "demand-data",
    "mock://audiense-demand/mockReportId/demand_data",
    {
        description: `Raw demand data for each platform including followers, engagement rate, gender distribution, age distribution, gender-age distribution, etc.

CSV Structure:
${JSON.stringify(CSV_STRUCTURE, null, 2)}`,
        mimeType: "application/json"
    },
    async () => {
        const fs = await import('fs/promises');
        const path = await import('path');
        const { fileURLToPath } = await import('url');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const platforms = [
            'google',
            'instagram',
            'tiktok',
            'twitter',
            'url',
            'youtube',
            'youtube_search_term'
        ];

        const contents = await Promise.all(platforms.map(async (platform) => {
            const platformPath = path.join(__dirname, 'mock-data/mockReportId/demand_data', platform);
            const files = await fs.readdir(platformPath);
            const platformContents = await Promise.all(files.map(async (file) => {
                const content = await fs.readFile(path.join(platformPath, file), 'utf-8');
                return {
                    uri: `mock://audiense-demand/mockReportId/demand_data/${platform}/${file}`,
                    text: content,
                    mimeType: file.endsWith('.json') ? 'application/json' : 'text/csv'
                };
            }));
            return platformContents;
        }));

        return { contents: contents.flat() };
    }
);

/**
 * Helper function to make authenticated requests to the API
 */
async function makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}) {
    const token = await AuthClient.getInstance().getAccessToken();

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

// Function to download and extract report files
async function downloadAndExtractReportFiles(
    reportId: string,
    entitiesFilesUrl: string,
    demandScoreFilesUrl: string
): Promise<{
    entitiesFiles: { path: string; files: string[] };
    demandScoreFiles: { path: string; files: string[] };
}> {
    // Download files
    const entitiesFile = await fetch(entitiesFilesUrl, { method: 'GET' });
    const demandScoreFile = await fetch(demandScoreFilesUrl, { method: 'GET' });

    // Create temp directory
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    const tempDir = path.join(os.tmpdir(), 'mcp-audiense-demand');
    await fs.mkdir(tempDir, { recursive: true });

    // Extract files
    const reportTempDir = path.join(tempDir, reportId);
    await fs.mkdir(reportTempDir, { recursive: true });

    const entitiesFilesZip = new AdmZip(Buffer.from(await entitiesFile.arrayBuffer()));
    const demandScoreFilesZip = new AdmZip(Buffer.from(await demandScoreFile.arrayBuffer()));

    entitiesFilesZip.extractAllTo(reportTempDir, true);
    demandScoreFilesZip.extractAllTo(reportTempDir, true);

    // Get file lists
    const entitiesFilesList = entitiesFilesZip.getEntries().map(entry => entry.entryName);
    const demandScoreFilesList = demandScoreFilesZip.getEntries().map(entry => entry.entryName);

    return {
        entitiesFiles: {
            path: reportTempDir,
            files: entitiesFilesList
        },
        demandScoreFiles: {
            path: reportTempDir,
            files: demandScoreFilesList
        }
    };
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
                        type: "text" as const,
                        text: "Report Information:"
                    },
                    {
                        type: "text" as const,
                        text: JSON.stringify(data, null, 2)
                    }
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
    "Get a summary of the report broken down by channels. This summary includes the number of followers and the demand scores for each channel at a country-level.",
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
    "Get a summary of the report broken down by countries. This summary includes the number of followers and the demand scores for each country on a per-platform basis.",
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
 * MCP Tool: Download report files
 */
server.tool(
    "download-report-files",
    "Download and extract files for a specific report. The files include the entities metadata, the demand scores and the demad data for the entities audiences across different platforms. This data includes the number of followers, engagement rate, gender distribution, age distribution, gender-age distribution, etc.",
    {
        reportId: z.string().describe("The ID of the report to download files for"),
        entitiesFilesUrl: z.string().url().describe("URL to download entities files from"),
        demandScoreFilesUrl: z.string().url().describe("URL to download demand score files from")
    },
    async ({ reportId, entitiesFilesUrl, demandScoreFilesUrl }) => {
        try {
            const { entitiesFiles, demandScoreFiles } = await downloadAndExtractReportFiles(
                reportId,
                entitiesFilesUrl,
                demandScoreFilesUrl
            );

            return {
                content: [
                    {
                        type: "text" as const,
                        text: "Files have been downloaded successfully:"
                    },
                    {
                        type: "text" as const,
                        text: `\nEntities Files Directory: ${entitiesFiles.path}`
                    },
                    {
                        type: "text" as const,
                        text: "Files:"
                    },
                    ...entitiesFiles.files.map(file => ({
                        type: "text" as const,
                        text: `- ${file}`
                    })),
                    {
                        type: "text" as const,
                        text: `\nDemand Score Files Directory: ${demandScoreFiles.path}`
                    },
                    {
                        type: "text" as const,
                        text: "Files:"
                    },
                    ...demandScoreFiles.files.map(file => ({
                        type: "text" as const,
                        text: `- ${file}`
                    }))
                ],
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to download report files: ${errorMessage}`,
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
