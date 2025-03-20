export type CreateDemandReportResponse = {
  availableReports: number;
  availableEntities: number;
}


type Report = {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  entitiesFilesUrl: string;
  demandScoreFilesUrl: string;
  status: string;
  userEmail: string;
  entityNames: string[];
}
type ListedReport = Omit<Report, 'entityNames'>;

export type GetReportsResponse = {
  reports: ListedReport[];
}

export type ReportSummaryByChannelsResponse = {
  entitiesSummary: {
    entity: string;
    countryRanking: number;
    instagram: {
      rank: number;
      absolute: number;
    };
    x: {
      rank: number;
      absolute: number;
    };
    tiktok: {
      rank: number;
      absolute: number;
    };
    url: {
      rank: number;
      absolute: number;
    };
    google: {
      rank: number;
      absolute: number;
    };
    googleGrowth: {
      rank: number;
      absolute: number;
    };
    youtubeChannel: {
      rank: number;
      absolute: number;
    };
    youtubeSearch: {
      rank: number;
      absolute: number;
    };
  }[];
}

export type CheckEntitiesResponse = Array<{
  q: string;
  valid: boolean;
  name: string;
  reference: string;
}>;
