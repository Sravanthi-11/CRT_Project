import { Injectable } from '@angular/core';

/**
 * Configuration service to manage environment variables and API keys
 * This centralizes all configuration values that should come from .env
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  // API Endpoints
  public readonly AZURE_AUTH_TOKEN_ENDPOINT: string;
  public readonly DYNAMICS_BASE_URL: string;

  // API Routes
  public readonly EVENTS_ENDPOINT: string;
  public readonly TRACKS_ENDPOINT: string;
  public readonly USERS_ENDPOINT: string;
  public readonly PAYMENT_ENDPOINT: string;
  public readonly LABELS_ENDPOINT: string;

  // Storage Keys
  public readonly TOKEN_STORAGE_KEY: string;
  public readonly CAPTCHA_STORAGE_KEY: string;
  public readonly PURCHASE_ID_STORAGE_KEY: string;

  // Encryption
  public readonly SECRET_KEY: string;

  constructor() {
    // API Endpoints
    this.AZURE_AUTH_TOKEN_ENDPOINT = this.getEnvVar('AZURE_AUTH_TOKEN_ENDPOINT', 'https://crtdevauth.azurewebsites.net/api/GetAccessToken');
    this.DYNAMICS_BASE_URL = this.getEnvVar('DYNAMICS_BASE_URL', 'https://classreg.crm.dynamics.com/api/data/v9.1');

    // API Routes
    this.EVENTS_ENDPOINT = this.getEnvVar('EVENTS_ENDPOINT', 'api/events');
    this.TRACKS_ENDPOINT = this.getEnvVar('TRACKS_ENDPOINT', 'api/tracks');
    this.USERS_ENDPOINT = this.getEnvVar('USERS_ENDPOINT', 'api/users');
    this.PAYMENT_ENDPOINT = this.getEnvVar('PAYMENT_ENDPOINT', 'api/payment');
    this.LABELS_ENDPOINT = this.getEnvVar('LABELS_ENDPOINT', 'api/labels');

    // Storage Keys
    this.TOKEN_STORAGE_KEY = this.getEnvVar('TOKEN_STORAGE_KEY', 'crt_access_token');
    this.CAPTCHA_STORAGE_KEY = this.getEnvVar('CAPTCHA_STORAGE_KEY', 'captcha');
    this.PURCHASE_ID_STORAGE_KEY = this.getEnvVar('PURCHASE_ID_STORAGE_KEY', 'purchase-id');

    // Encryption
    this.SECRET_KEY = this.getEnvVar('SECRET_KEY', 'CRT_PORTAL_SECRET_KEY_2025');
  }

  /**
   * Get environment variable with fallback
   * In production, these would come from process.env or environment configuration
   */
  private getEnvVar(key: string, defaultValue: string): string {
    // For Angular, we'll use the environment files which can be populated from .env
    // The actual .env values would be injected during build time via environment.ts
    return (window as any)['env']?.[key] || defaultValue;
  }
}
