import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AccessToken } from '../models/AccessToken';
import { EncryptionHelper } from '../helpers/EncryptionHelper';
import { environment } from '../../environments/environment';

interface CachedToken extends AccessToken {
  cached_at: number; // Timestamp when token was cached
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private tokenUrl = environment.azureAuthTokenEndpoint;
  private readonly TOKEN_STORAGE_KEY = environment.tokenStorageKey;

  constructor(private http: HttpClient) { }

  /**
   * Get access token - checks session storage first, fetches new token if expired or not found
   * @returns Observable<AccessToken>
   */
  getAccessToken(): Observable<AccessToken> {
    const cachedToken = this.getTokenFromStorage();

    if (cachedToken && this.isTokenValid(cachedToken)) {
      // Return cached token if valid
      return of(cachedToken);
    }

    // Fetch new token from API
    return this.fetchNewToken();
  }

  /**
   * Fetch a new token from the API and cache it
   * @returns Observable<AccessToken>
   */
  private fetchNewToken(): Observable<AccessToken> {
    return this.http.get<AccessToken>(this.tokenUrl).pipe(
      tap(token => {
        this.saveTokenToStorage(token);
      })
    );
  }

  /**
   * Save token to session storage with encryption
   * @param token AccessToken to save
   */
  private saveTokenToStorage(token: AccessToken): void {
    try {
      const cachedToken: CachedToken = {
        ...token,
        cached_at: Date.now()
      };
      const encryptedToken = EncryptionHelper.encrypt(JSON.stringify(cachedToken));
      sessionStorage.setItem(this.TOKEN_STORAGE_KEY, encryptedToken);
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  }

  /**
   * Get token from session storage with decryption
   * @returns CachedToken or null
   */
  private getTokenFromStorage(): CachedToken | null {
    try {
      const encryptedToken = sessionStorage.getItem(this.TOKEN_STORAGE_KEY);
      if (!encryptedToken) {
        return null;
      }

      const decryptedToken = EncryptionHelper.decrypt(encryptedToken);
      return JSON.parse(decryptedToken) as CachedToken;
    } catch (error) {
      console.error('Error retrieving token from storage:', error);
      // Clear corrupted token
      this.clearTokenFromStorage();
      return null;
    }
  }

  /**
   * Check if token is still valid based on expiry time
   * @param cachedToken CachedToken to validate
   * @returns boolean
   */
  private isTokenValid(cachedToken: CachedToken): boolean {
    const now = Date.now();
    const tokenAge = (now - cachedToken.cached_at) / 1000; // Convert to seconds
    
    // Add a 60 second buffer before actual expiry to avoid race conditions
    const effectiveExpiryTime = cachedToken.expires_in - 60;
    
    return tokenAge < effectiveExpiryTime;
  }

  /**
   * Clear token from session storage
   */
  clearTokenFromStorage(): void {
    sessionStorage.removeItem(this.TOKEN_STORAGE_KEY);
  }

  /**
   * Force refresh token (useful for manual token refresh)
   * @returns Observable<AccessToken>
   */
  refreshToken(): Observable<AccessToken> {
    this.clearTokenFromStorage();
    return this.fetchNewToken();
  }
}
