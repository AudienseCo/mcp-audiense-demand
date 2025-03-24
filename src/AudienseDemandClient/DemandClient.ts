import { AuthClient } from '../auth/AuthClient.js';
import { CheckEntitiesResponse, CreateDemandReportResponse, GetReportsResponse } from './types.js';

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
  const response = await makeAuthenticatedRequest<Report>(`/report?id=${id}`, {
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

/**
 * Helper function to make authenticated requests to the API
 */
async function makeAuthenticatedRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await AuthClient.getInstance().getAccessToken();

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
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