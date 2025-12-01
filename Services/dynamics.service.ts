import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AzureAuthService } from './azure-auth.service';
import { SearchOptions } from '../models/SearchOptions';
import { environment } from '../../environments/environment';

export interface SearchOptionsRequest {
    region: string;
}

export interface DynamicsSearchOptionsResponse {
    '@odata.context': string;
    response_eventsearchoptions: string;
}

@Injectable({
    providedIn: 'root'
})
export class DynamicsService {
    private readonly dynamicsBaseUrl = environment.dynamicsBaseUrl;

    constructor(
        private http: HttpClient,
        private azureAuthService: AzureAuthService
    ) { }/**
     * Gets event search options from Dynamics 365
     * @param region Optional region parameter
     */
    public getEventSearchOptions(region: string = ''): Observable<SearchOptions> {
        return this.azureAuthService.getAccessToken().pipe(
            switchMap(token => {
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                });

                const body: SearchOptionsRequest = {
                    region: region
                };

                const url = `${this.dynamicsBaseUrl}/pro_GetEventSearchOptions`;
                return this.http.post<DynamicsSearchOptionsResponse>(url, body, { headers });
            }),
            map(response => {
                // Parse the JSON string from response_eventsearchoptions
                if (response && response.response_eventsearchoptions) {
                    try {
                        const parsedOptions = JSON.parse(response.response_eventsearchoptions);
                        return parsedOptions as SearchOptions;
                    } catch (error) {
                        console.error('Error parsing search options response:', error);
                        // Return empty search options on parse error
                        return { regions: [], ministries: [], servicelines: [] };
                    }
                } else {
                    console.warn('No search options data in response');
                    return { regions: [], ministries: [], servicelines: [] };
                }
            })
        );
    }

    /**
     * Searches for classes/events in Dynamics 365
     * @param searchParams Search parameters for filtering classes
     */
    public searchClasses(searchParams: {
        pro_region?: string;
        pro_keywords_searchclasses?: string;
        EndDate?: string;
        LocationFilter?: string;
        MinistryFilter?: string;
        Page?: string;
        ServiceFilter?: string;
        StartDate?: string;
    }): Observable<any> {
        return this.azureAuthService.getAccessToken().pipe(
            switchMap(token => {
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                });

                const url = `${this.dynamicsBaseUrl}/pro_searchclasses`;
                return this.http.post<any>(url, searchParams, { headers });
            })
        );
    }
}
