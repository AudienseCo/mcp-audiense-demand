import { z } from 'zod';
import {
  checkEntities,
  createDemandReport,
  getGoogleSearchVolumeSummary,
  getReport,
  getReportSummaryByChannels,
  getReportSummaryByCountries,
  getReports,
  getYoutubeSearchVolumeSummary,
  requestEntities,
} from './AudienseDemandClient/DemandClient.js';
import { AuthClient } from './auth/AuthClient.js';
import { VALID_COUNTRIES_SCHEME, VALID_PLATFORMS_SCHEME, VALID_SEARCH_VOLUME_COUNTRIES_SCHEME } from './schemes.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerTools(server: McpServer) {
  /**
   * MCP Tool: Initiate Device Authorization Flow
   */
  server.tool(
    'initiate-device-auth',
    'Start the device authorization flow to get a device code for authentication',
    {},
    async () => {
      try {
        const authClient = AuthClient.getInstance();
        const deviceCodeResponse = await authClient.requestDeviceCode();

        return {
          content: [
            {
              type: 'text',
              text: 'Device Authorization Flow initiated. Please follow these steps:',
            },
            {
              type: 'text',
              text: `1. Visit: ${deviceCodeResponse.verification_uri_complete}`,
            },
            {
              type: 'text',
              text: `2. Verify the code in the browser matches this one: ${deviceCodeResponse.user_code}`,
            },
            {
              type: 'text',
              text: `3. The code will expire in ${deviceCodeResponse.expires_in} seconds`,
            },
            {
              type: 'text',
              text: `4. After completing the authentication in the browser, the user should write the request again.`,
            },
            {
              type: 'text',
              text: JSON.stringify(deviceCodeResponse, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Failed to initiate device authorization: ${errorMessage}`,
            },
          ],
        };
      }
    },
  );

  /**
   * MCP Tool: Create a demand report
   */
  server.tool(
    'create-demand-report',
    'Create a new demand report',
    {
      title: z.string().describe('Title of the demand report'),
      entitiesReferences: z.array(z.string()).describe('Array of entity names for the report'),
      userEmail: z.string().email().describe('Email of the user creating the report'),
    },
    async ({ title, entitiesReferences, userEmail }) => {
      try {
        const data = await createDemandReport(title, entitiesReferences, userEmail);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Failed to create demand report: ${errorMessage}`,
            },
          ],
        };
      }
    },
  );

  /**
   * MCP Tool: Get demand reports
   */
  server.tool(
    'get-demand-reports',
    'Get demand reports for the authorized user',
    {
      paginationStart: z.number().optional().describe('Pagination start index'),
      paginationEnd: z.number().optional().describe('Pagination end index'),
    },
    async ({ paginationStart, paginationEnd }) => {
      try {
        const data = await getReports(paginationStart, paginationEnd);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Failed to get user reports: ${errorMessage}`,
            },
          ],
        };
      }
    },
  );

  /**
   * MCP Tool: Get demand report info
   */
  server.tool(
    'get-demand-report-info',
    'Get detailed information about a specific demand report',
    {
      reportId: z.string().describe('The ID of the report to get information for'),
    },
    async ({ reportId }) => {
      try {
        const data = await getReport(reportId);

        return {
          content: [
            {
              type: 'text' as const,
              text: 'Report Information:',
            },
            {
              type: 'text' as const,
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Failed to get report info: ${errorMessage}`,
            },
          ],
        };
      }
    },
  );

  /**
   * MCP Tool: Request entities
   */
  server.tool(
    'request-entities',
    'Request not found entities',
    {
      entityNames: z.array(z.string()).describe('Array of entity names to request'),
      userEmail: z.string().email().describe('Email of the user requesting the entities'),
    },
    async ({ entityNames, userEmail }) => {
      try {
        const checkResult = await checkEntities(entityNames);
        const nonExistentEntities = checkResult.filter(entity => !entity.valid).map(entity => entity.q);

        if (nonExistentEntities.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'All entities already exist in the system. No need to request them.',
              },
            ],
          };
        }

        const data = await requestEntities(nonExistentEntities, userEmail);
        const url = data.templateCopyFileUrl;

        return {
          content: [
            {
              type: 'text' as const,
              text: `Requesting ${nonExistentEntities.length} entities that don't exist in the system.`,
            },
            {
              type: 'text' as const,
              text: 'We will email you a confirmation when they are ready.',
            },
            {
              type: 'text' as const,
              text: `You can complete your request with additional information that will help us deliver your results faster by visiting this url: ${url}`,
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Failed to request entities: ${errorMessage}`,
            },
          ],
        };
      }
    },
  );

  /**
   * MCP Tool: Check entities
   */
  server.tool(
    'check-entities',
    'Check if entities exist',
    {
      entities: z.array(z.string()).describe('Array of entity names to check'),
    },
    async ({ entities }) => {
      try {
        const data = await checkEntities(entities);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Failed to check entity status: ${errorMessage}`,
            },
          ],
        };
      }
    },
  );

  /**
   * MCP Tool: Get report summary by channels
   */
  server.tool(
    'get-demand-report-summary-by-channels',
    'Get a summary of the demand report broken down by channels',
    {
      reportId: z.string().describe('The ID of the report to get the summary for'),
      country: VALID_COUNTRIES_SCHEME.default('Weighted-Total').describe('The country to filter by.'),
      offset: z.number().default(0).describe('Pagination offset'),
      entityNames: z.array(z.string()).optional().describe('Optional array of entity names to filter by'),
    },
    async ({ reportId, country, offset, entityNames }) => {
      try {
        const data = await getReportSummaryByChannels(reportId, country, offset, entityNames);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Failed to get report summary by channels: ${errorMessage}`,
            },
          ],
        };
      }
    },
  );

  /**
   * MCP Tool: Get report summary by countries
   */
  server.tool(
    'get-demand-report-summary-by-countries',
    'Get a summary of the demand report broken down by countries',
    {
      reportId: z.string().describe('The ID of the report to get the summary for'),
      platform: VALID_PLATFORMS_SCHEME.default('all_platforms').describe('Platform name to analyze.'),
      countries: z.array(VALID_COUNTRIES_SCHEME).describe('Array of country codes to analyze.'),
      offset: z.number().optional().describe('Pagination offset'),
      entityNames: z.array(z.string()).optional().describe('Optional array of entity names to filter by'),
    },
    async ({ reportId, platform, countries, offset, entityNames }) => {
      try {
        const data = await getReportSummaryByCountries(reportId, platform, countries, offset, entityNames);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Failed to get report summary by countries: ${errorMessage}`,
            },
          ],
        };
      }
    },
  );

  /**
   * MCP Tool: Get YouTube search volume summary
   */
  server.tool(
    'get-youtube-search-volume-summary',
    'Get YouTube search volume summary for entities in a demand report',
    {
      reportId: z.string().describe('The ID of the report to get the summary for'),
      country: VALID_SEARCH_VOLUME_COUNTRIES_SCHEME.default('Global').describe('Country code to analyze'),
      entityNames: z.array(z.string()).optional().describe('Optional array of entity names to filter by'),
    },
    async ({ reportId, country, entityNames }) => {
      try {
        const data = await getYoutubeSearchVolumeSummary(reportId, country, entityNames);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Failed to get YouTube search volume summary: ${errorMessage}`,
            },
          ],
        };
      }
    },
  );

  /**
   * MCP Tool: Get Google search volume summary
   */
  server.tool(
    'get-google-search-volume-summary',
    'Get Google search volume summary for entities in a demand report',
    {
      reportId: z.string().describe('The ID of the report to get the summary for'),
      country: VALID_SEARCH_VOLUME_COUNTRIES_SCHEME.default('Global').describe('Country code to analyze'),
      entityNames: z.array(z.string()).optional().describe('Optional array of entity names to filter by'),
    },
    async ({ reportId, country, entityNames }) => {
      try {
        const data = await getGoogleSearchVolumeSummary(reportId, country, entityNames);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Failed to get Google search volume summary: ${errorMessage}`,
            },
          ],
        };
      }
    },
  );
}