import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { downloadAndExtractReportFiles } from './downloadAndExtractReportFiles.js';
import { CSV_STRUCTURE } from './schemas/demand-data.js';
import { checkEntities, createDemandReport, getReport, getReports } from './DemandClient.js';


// MCP Server instance
const server = new McpServer({
    name: "audiense-demand",
    version: "1.0.0",
});

/**
 * Starts the MCP server and listens for incoming requests.
 */
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Demand Public API MCP Server running on stdio");
}

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
            const data = await createDemandReport(title, entitiesReferences, userEmail);

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
            const data = await getReports(paginationStart, paginationEnd);

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
            const data = await getReport(reportId);

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
 * MCP Tool: Check entities
 */
server.tool(
    "check-entities",
    "Check if entities exist",
    {
        entities: z.array(z.string()).describe("Array of entity names to check")
    },
    async ({ entities }) => {
        try {
            const data = await checkEntities(entities)

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


runServer().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
