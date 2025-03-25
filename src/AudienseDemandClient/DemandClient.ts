import { AuthClient } from '../auth/AuthClient.js';
import { CheckEntitiesResponse, CreateDemandReportResponse, GetReportsResponse, GetReportSummaryByChannelsResponse, GetReportSummaryByCountriesResponse, GetYoutubeSearchVolumeSummaryResponse, DemandReport, GetGoogleSearchVolumeSummaryResponse, RequestEntitiesResponse } from './types.js';

export async function createDemandReport(title: string, entitiesReferences: string[], userEmail: string) {
  const response = await makeAuthenticatedRequest<CreateDemandReportResponse>('/demand-report', {
    method: 'POST',
    body: JSON.stringify({ title, entitiesReferences, userEmail }),
  });

  return response;
}

export async function getReports(paginationStart?: number, paginationEnd?: number) {
  const queryParams = new URLSearchParams({
    ...(paginationStart !== undefined && { paginationStart: paginationStart.toString() }),
    ...(paginationEnd !== undefined && { paginationEnd: paginationEnd.toString() })
  });
  const endpoint = queryParams.toString() ? `/reports?${queryParams.toString()}` : '/reports';

  const response = await makeAuthenticatedRequest<GetReportsResponse>(endpoint, {
    method: 'GET',
  });

  return response;
}

export async function getReport(id: string) {
  const response = await makeAuthenticatedRequest<DemandReport>(`/report?id=${id}`, {
    method: 'GET',
  });

  return response;
}

export async function checkEntities(entities: string[]) {
  const response = await makeAuthenticatedRequest<CheckEntitiesResponse>('/entity/check', {
    method: 'POST',
    body: JSON.stringify({ entities })
  });

  return response;
}

export async function getYoutubeSearchVolumeSummary(reportId: string, country: string, entityNames?: string[]) {
  const queryParams = new URLSearchParams({
    reportId,
    country,
    ...(entityNames !== undefined && { entityNames: JSON.stringify(entityNames) })
  });

  const response = await makeAuthenticatedRequest<GetYoutubeSearchVolumeSummaryResponse>(`/reports/youtube-search-volume-summary?${queryParams.toString()}`, {
    method: 'GET',
  });

  return response;
}

export async function getGoogleSearchVolumeSummary(reportId: string, country: string, entityNames?: string[]) {
  const queryParams = new URLSearchParams({
    reportId,
    country,
    ...(entityNames !== undefined && { entityNames: JSON.stringify(entityNames) })
  });

  const response = await makeAuthenticatedRequest<GetGoogleSearchVolumeSummaryResponse>(`/reports/search-volume-summary?${queryParams.toString()}`, {
    method: 'GET',
  });

  return response;
}

export async function getReportSummaryByCountries(reportId: string, platform: string, countries: string[], offset?: number, entityNames?: string[]) {
  const queryParams = new URLSearchParams({
    reportId,
    platform,
    countries: JSON.stringify(countries),
    ...(offset !== undefined && { offset: offset.toString() }),
    ...(entityNames !== undefined && { entityNames: JSON.stringify(entityNames) })
  });

  const response = await makeAuthenticatedRequest<GetReportSummaryByCountriesResponse>(`/reports/summary-by-countries?${queryParams.toString()}`, {
    method: 'GET',
  });

  return response;
}

export async function getReportSummaryByChannels(reportId: string, country: string, offset?: number, entityNames?: string[]) {
  const queryParams = new URLSearchParams({
    reportId,
    country,
    ...(offset !== undefined && { offset: offset.toString() }),
    ...(entityNames !== undefined && { entityNames: JSON.stringify(entityNames) })
  });

  const response = await makeAuthenticatedRequest<GetReportSummaryByChannelsResponse>(`/reports/summary-by-channels?${queryParams.toString()}`, {
    method: 'GET',
  });

  return response;
}

export async function requestEntities(entityNames: string[], userEmail: string) {
  const response = await makeAuthenticatedRequest<RequestEntitiesResponse>('/entity/request', {
    method: 'POST',
    body: JSON.stringify({ entityNames, userEmail })
  });

  return response;
}

/**
 * Helper function to make authenticated requests to the API
 */
async function makeAuthenticatedRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await AuthClient.getInstance().getAccessToken();

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Audiense MCP Server',
  };

  const url = `https://demandpublicapi.socialbro.me${endpoint}`;

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