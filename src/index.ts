import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { downloadAndExtractReportFiles } from './utils/downloadAndExtractReportFiles.js';
import { checkEntities, createDemandReport, getReport, getReports } from './AudienseDemandClient/DemandClient.js';
import { AuthClient } from './auth/AuthClient.js';

// MCP Server instance
const server = new McpServer({
    name: "audiense-demand",
    version: "1.0.0",
    description: "Audiense Demand API MCP Server"
});

/**
 * Starts the MCP server and listens for incoming requests.
 */
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Demand Public API MCP Server running on stdio");
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
    `Download and extract files for a specific report. The files include:

1. Entities Metadata (All_Entities.csv):
   - Basic info: name, reference, age, gender, birthdate
   - Social media handles for each platform
   - Categories and entity type
   - Geographic info: place of birth, primarylanguage

2. Platform-specific Audience Data (demand_data/):
   Each platform's CSV file has the following columns:
   - id: Entity ID
   - name: Entity name
   - reference: Reference identifier
   - term: Search term or username
   - platform: Platform name
   - segment: Geographic segment (Global, US, GB, etc.)
   - variable: Metric type (e.g., "Followers", "Male Followers", "Female Followers", "Engagement Rate")
   - value: Value indicates what the absolute column represents (Number, Age Group Range, Year and Month, etc.)
   - absolute: The actual value of the metric.
   - weight: Weight that it represents in relation to the global value.
   - timestamp: Data collection timestamp

   Available platforms and their metrics:
   - Instagram:
     * variable="Followers" for total followers
     * variable="Male Followers" for male follower count
     * variable="Female Followers" for female follower count
     * variable="Engagement Rate" for engagement rate
     * variable="Followers Age" for followers age distribution. Age range is specified in the value column.
     * variable="Male Followers Age" for male followers age distribution. Age range is specified in the value column.
     * variable="Female Followers Age" for female followers age distribution. Age range is specified in the value column.
   - YouTube:
     * variable="Followers" for total subscribers
     * variable="Male Followers" for male follower count
     * variable="Female Followers" for female follower count
     * variable="Engagement Rate" for engagement rate
     * variable="Followers Age" for followers age distribution. Age range is specified in the value column.
     * variable="Male Followers Age" for male followers age distribution. Age range is specified in the value column.
     * variable="Female Followers Age" for female followers age distribution. Age range is specified in the value column.
   - TikTok:
     * variable="Followers" for total followers
     * variable="Male Followers" for male follower count
     * variable="Female Followers" for female follower count
     * variable="Followers Age" for followers age distribution. Age range is specified in the value column.
     * variable="Male Followers Age" for male followers age distribution. Age range is specified in the value column.
     * variable="Female Followers Age" for female followers age distribution. Age range is specified in the value column.
   - Twitter:
     * variable="Followers" for total followers
     * variable="Male Followers" for male follower count
     * variable="Female Followers" for female follower count
     * variable="Followers Age" for followers age distribution. Age range is specified in the value column.
     * variable="Interest Followers" for followers interested in a specific topic. Topic is specified in the value column.
   - Google (36 months):
     * variable="Search Volume" for search volume
     * variable="Avg Search Variance YoY" for year-over-year change. Range of months is specified in the value column.
     * variable="Avg Search Volume L12M" for average search volume in a range of 12 months. Range of months is specified in the value column.
   - URL:
     * variable="Traffic" for website traffic
   - Youtube Search Terms (12 months):
     * variable="Search Volume" for search volume
     * variable="Avg Search Volume L12M" for average search volume in a range of 12 months. Range of months is specified in the value column.

3. Demand Scores (demand_score/):
   Each demand score CSV file has similar structure with:
   - id: Entity ID
   - name: Entity name
   - reference: Reference identifier
   - platform: Platform name
   - segment: Geographic segment
   - variable: Metric type
   - value: Value indicates what the absolute column represents, in this case the demand score.
   - absolute: The demand score value.
   - weight: Not relevant for demand scores.
   - timestamp: Data collection timestamp
`,
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

/**
 * MCP Tool: Initiate Device Authorization Flow
 */
server.tool(
    "initiate-device-auth",
    "Start the device authorization flow to get a device code for authentication",
    {},
    async () => {
        try {
            const authClient = AuthClient.getInstance();
            const deviceCodeResponse = await authClient.requestDeviceCode();

            return {
                content: [
                    {
                        type: "text",
                        text: "Device Authorization Flow initiated. Please follow these steps:"
                    },
                    {
                        type: "text",
                        text: `1. Visit: ${deviceCodeResponse.verification_uri_complete}`
                    },
                    {
                        type: "text",
                        text: `2. Verify the code in the browser matches this one: ${deviceCodeResponse.user_code}`
                    },
                    {
                        type: "text",
                        text: `3. The code will expire in ${deviceCodeResponse.expires_in} seconds`
                    },
                    {
                        type: "text",
                        text: `4. After completing the authentication in the browser, the user should write the request again.`
                    },
                    {
                        type: "text",
                        text: JSON.stringify(deviceCodeResponse, null, 2)
                    }
                ],
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to initiate device authorization: ${errorMessage}`,
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
