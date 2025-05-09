export type CreateDemandReportResponse = {
  availableReports: number;
  availableEntities: number;
};

export type DemandReport = {
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
};

type ListedReport = Omit<DemandReport, 'entityNames'>;

export type GetReportsResponse = {
  reports: ListedReport[];
};

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
};

export type CheckEntitiesResponse = Array<{
  q: string;
  valid: boolean;
  name: string;
  reference: string;
}>;

export type GetYoutubeSearchVolumeSummaryResponse = {
  initialDate: {
    year: number;
    month: number;
  };
  entities: {
    name: string;
    volumes: number[];
  }[];
};

export type GetGoogleSearchVolumeSummaryResponse = {
  initialDate: {
    year: number;
    month: number;
  };
  entities: {
    name: string;
    volumes: number[];
  }[];
};

export type GetReportSummaryByCountriesResponse = {
  entitiesSummary: {
    entity: string;
    generalRanking: number;
    platformRanking: number;
    countriesSummary: {
      country: string;
      rank: number;
      absolute: number;
    }[];
  }[];
};

export type GetReportSummaryByChannelsResponse = {
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
};

export type RequestEntitiesResponse = {
  templateCopyFileUrl: string;
};
