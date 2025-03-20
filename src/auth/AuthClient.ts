interface TokenCache {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}


export class AuthClient {
  private static instance: AuthClient | null = null;
  private tokenCache: TokenCache;

  private constructor() {
    this.tokenCache = {
      access_token: process.env.INITIAL_ACCESS_TOKEN || '',
      refresh_token: process.env.INITIAL_REFRESH_TOKEN || '',
      expires_at: 0
    };
  }

  public static getInstance(): AuthClient {
    if (!AuthClient.instance) {
      AuthClient.instance = new AuthClient();
    }
    return AuthClient.instance;
  }

  async getAccessToken(): Promise<string> {
    if (this.tokenHasExpired()) {
      await this.refreshTokenCache();
    }

    return this.getAccessTokenFromCache();
  }


  private initializeTokenCache() {
    this.tokenCache = {
      access_token: process.env.INITIAL_ACCESS_TOKEN || '',
      refresh_token: process.env.INITIAL_REFRESH_TOKEN || '',
      expires_at: 0
    };
  }

  private async refreshTokenCache(): Promise<void> {
    const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
    const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;

    try {
      const response = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: AUTH0_CLIENT_ID,
          refresh_token: this.getRefreshTokenFromCache()
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

      this.tokenCache = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (data.expires_in * 1000) - 60000 // Subtract 1 minute for safety
      };
    } catch (error) {
      console.error(`[AuthClient] Error refreshing token:`, error);
      this.initializeTokenCache();
    }
  }

  private getAccessTokenFromCache(): string {
    if (!this.tokenCache) {
      throw new Error('No token cache available');
    }
    return this.tokenCache.access_token;
  }

  private getRefreshTokenFromCache(): string {
    if (!this.tokenCache) {
      throw new Error('No token cache available');
    }
    return this.tokenCache.refresh_token;
  }

  private tokenHasExpired(): boolean {
    return this.tokenCache.expires_at < Date.now();
  }
}