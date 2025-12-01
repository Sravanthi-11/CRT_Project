import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AzureTokenResponse {
    token_type: string;
    expires_in: number;
    ext_expires_in: number;
    access_token: string;
}

@Injectable({
    providedIn: 'root'
})
export class AzureAuthService {
    private readonly tokenEndpoint = environment.azureAuthTokenEndpoint;
    private cachedToken: string | null = null;
    private tokenExpiry: number | null = null;

    constructor(private http: HttpClient) { }

    /**
     * Gets the access token from Azure, using cached token if still valid
     */
    public getAccessToken(): Observable<string> {
        // Check if we have a valid cached token
        if (this.cachedToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return of(this.cachedToken);
        }

        return this.http.get<AzureTokenResponse>(this.tokenEndpoint).pipe(
            tap(response => {
                // Cache the token and calculate expiry time (subtract 60 seconds for safety)
                this.cachedToken = response.access_token;
                this.tokenExpiry = Date.now() + ((response.expires_in - 60) * 1000);
            }),
            map(response => response.access_token),
            catchError(error => {
                console.error('Error getting access token:', error);
                this.clearToken();
                throw error;
            })
        );
    }

    /**
     * Clears the cached token
     */
    public clearToken(): void {
        this.cachedToken = null;
        this.tokenExpiry = null;
    }
}
