import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Response interfaces
export interface SearchClassesResponse {
    pro_response: string; // JSON string containing Event2[]
}

export interface EventDetailsResponse {
    '@odata.context'?: string;
    response: string; // JSON string containing event details
}

export interface EventSearchOptionsResponse {
    '@odata.context'?: string;
    response_eventsearchoptions: string; // JSON string
}

export interface PendingRegResponse {
    response?: string; // JSON string
}

export interface EventPassesResponse {
    response?: string; // JSON string containing passes array
}

export interface EventRegistrationCountResponse {
    response?: string; // JSON string or number
}

export interface EventSpeakersResponse {
    response?: string; // JSON string containing speakers array
}

export interface SessionTracksResponse {
    response?: string; // JSON string containing tracks array
}

export interface EventSponsorshipsResponse {
    response?: string; // JSON string containing sponsorships array
}

export interface PECContactResponse {
    response?: string; // JSON string containing contact info
}

export interface EventLocationMapResponse {
    response?: string; // JSON string containing location map data
}

export interface ZipCityStateResponse {
    response?: string; // JSON string containing zip/city/state data
}

export interface UserRegRouteResponse {
    response?: string; // JSON string containing registration details
}

export interface EventSessionsResponse {
    response?: string; // JSON string containing sessions array
}

export interface ReserveRegistrationResponse {
    response?: string; // JSON string containing reservation result
}

@Injectable({
    providedIn: 'root'
})
export class AzureFunctionsService {
    private readonly baseUrl = 'https://crtdevauth.azurewebsites.net/api';
    private readonly headers = new HttpHeaders({
        'Content-Type': 'application/json'
    });

    constructor(private http: HttpClient) { }

    /**
     * Search for classes/events
     * Replaces: /pro_searchclasses
     */
    searchClasses(params: {
        pro_region?: string;
        pro_keywords_searchclasses?: string;
        EndDate?: string;
        LocationFilter?: string;
        MinistryFilter?: string;
        Page?: string;
        ServiceFilter?: string;
        StartDate?: string;
    }): Observable<any> {
        const url = `${this.baseUrl}/SearchClasses`;
        return this.http.post<SearchClassesResponse>(url, params, { headers: this.headers }).pipe(
            map(response => {
                if (response && response.pro_response) {
                    try {
                        const events = JSON.parse(response.pro_response);
                        return { items: events };
                    } catch (error) {
                        console.error('[AzureFunctionsService.searchClasses] Error parsing response:', error);
                        return { items: [] };
                    }
                }
                return { items: [] };
            })
        );
    }

    /**
     * Get event details
     * Replaces: /pro_eventdetails
     */
    getEventDetails(readableEventId: string): Observable<any> {
        const url = `${this.baseUrl}/GetEventDetails`;
        const body = { ReadableEventId: readableEventId };
        return this.http.post<EventDetailsResponse>(url, body, { headers: this.headers }).pipe(
            map(response => {
                if (response && response.response) {
                    try {
                        return JSON.parse(response.response);
                    } catch (error) {
                        console.error('[AzureFunctionsService.getEventDetails] Error parsing response:', error);
                        return {};
                    }
                }
                return {};
            })
        );
    }

    /**
     * Get event search options
     * Replaces: /pro_GetEventSearchOptions
     */
    getEventSearchOptions(region: string = ''): Observable<any> {
        const url = `${this.baseUrl}/SearchFormOptions`;
        
        const body = JSON.stringify({ Region: region || ' ' });

        const textHeaders = new HttpHeaders({
            'Content-Type': 'text/plain'
        });
        
        return this.http.post<EventSearchOptionsResponse>(url, body, { headers: textHeaders }).pipe(
            map(response => {
                if (response && response.response_eventsearchoptions) {
                    try {
                        return JSON.parse(response.response_eventsearchoptions);
                    } catch (error) {
                        console.error('[AzureFunctionsService.getEventSearchOptions] Error parsing response:', error);
                        return { regions: [], ministries: [], servicelines: [] };
                    }
                }
                return { regions: [], ministries: [], servicelines: [] };
            })
        );
    }

    /**
     * Get addon products
     * Replaces: /addonproducts
     */
    getAddOnProducts(payload: string): Observable<any> {
        const url = `${this.baseUrl}/GetAddOnProducts`;
        const body = { readableventid: payload };
        return this.http.post<any>(url, body, { headers: this.headers });
    }

    /**
     * Get event session time strings
     * Replaces: /eventtimestrings
     */
    getEventSessionTimeStrings(readableEventId: string): Observable<any> {
        const url = `${this.baseUrl}/GetEventSessionTimeStrings`;
        const body = { ReadableEventId: readableEventId };
        return this.http.post<any>(url, body, { headers: this.headers });
    }

    /**
     * Get event time strings
     * Replaces: /sessiontimestrings
     */
    getEventTimeStrings(readableEventId: string): Observable<any> {
        const url = `${this.baseUrl}/GetEventTimeStrings`;
        const body = { ReadableEventId: readableEventId };
        return this.http.post<any>(url, body, { headers: this.headers });
    }

    /**
     * Release event reservation
     * Replaces: /releasereservation
     */
    releaseEventReservation(purchaseId: string): Observable<any> {
        const url = `${this.baseUrl}/ReleaseEventReservation`;
        const body = { purchaseId: purchaseId };
        return this.http.post<any>(url, body, { headers: this.headers });
    }

    /**
     * Get event discount codes
     * Replaces: /discountcodes
     */
    getEventDiscountCodes(readableEventId: string): Observable<any> {
        const url = `${this.baseUrl}/GetEventDiscountCodes`;
        const body = { ReadableEventId: readableEventId };
        return this.http.post<any>(url, body, { headers: this.headers });
    }

    /**
     * Finalize event registration
     * Replaces: /finalizeregistration
     */
    eventRegFinalize(payload: any): Observable<any> {
        const url = `${this.baseUrl}/EventRegFinalize`;
        return this.http.post<any>(url, payload, { headers: this.headers });
    }

    /**
     * Get pending registrations
     * Replaces: /pro_pendingreg
     */
    getPendingReg(payload: string): Observable<any> {
        const url = `${this.baseUrl}/GetPendingReg`;
        const body = { readableEventId: payload };
        return this.http.post<PendingRegResponse>(url, body, { headers: this.headers }).pipe(
            map(response => {
                let pendingRegData: any = {};
                
                try {
                    if (response.response) {
                        pendingRegData = JSON.parse(response.response);
                    } else if (Array.isArray(response)) {
                        pendingRegData = { items: response };
                    } else {
                        pendingRegData = response;
                    }
                    
                    if (!pendingRegData.items) {
                        if (Array.isArray(pendingRegData)) {
                            pendingRegData = { items: pendingRegData };
                        } else {
                            pendingRegData = { items: [] };
                        }
                    }
                } catch (error) {
                    console.error('[AzureFunctionsService.getPendingReg] Error parsing response:', error);
                    pendingRegData = { items: [] };
                }
                
                return pendingRegData;
            })
        );
    }

    /**
     * Cancel user registration
     * Replaces: /cancelregistration
     */
    cancelUserReg(eventRegistrationId: string): Observable<any> {
        const url = `${this.baseUrl}/CancelUserReg`;
        const body = { eventregistrationid: eventRegistrationId };
        return this.http.post<any>(url, body, { headers: this.headers });
    }

    /**
     * Get custom registration fields
     * Replaces: /customregistrationsfields
     */
    getEventCustomRegistrationFields(readableEventId: string): Observable<any> {
        const url = `${this.baseUrl}/eventcustomregistrationfields/${readableEventId}`;
        return this.http.get<any>(url, { headers: this.headers });
    }

    /**
     * Get event passes
     * Replaces: /passes
     */
    getEventPasses(eventId: string): Observable<any> {
        const url = `${this.baseUrl}/GetEventPasses`;
        const body = { msevtmgt_eventid_value: eventId };
        return this.http.post<EventPassesResponse>(url, body, { headers: this.headers }).pipe(
            map(response => {
                if (response && response.response) {
                    try {
                        console.log('[AzureFunctionsService.getEventPasses] Response received:', response);
                        return JSON.parse(response.response);
                    } catch (error) {
                        console.error('[AzureFunctionsService.getEventPasses] Error parsing response:', error);
                        return [];
                    }
                }
                return [];
            })
        );
    }

    /**
     * Get event registration count
     * Replaces: /registrationcount
     */
    getEventRegistrationCount(readableEventId: string): Observable<number> {
        const url = `${this.baseUrl}/GetEventRegistrationCount`;
        const body = { msevtmgt_readableeventid: readableEventId };
        return this.http.post<EventRegistrationCountResponse>(url, body, { headers: this.headers }).pipe(
            map(response => {
                if (response && response.response) {
                    try {
                        const parsed = typeof response.response === 'string' 
                            ? JSON.parse(response.response) 
                            : response.response;
                        return typeof parsed === 'number' ? parsed : 0;
                    } catch (error) {
                        console.error('[AzureFunctionsService.getEventRegistrationCount] Error parsing response:', error);
                        return 0;
                    }
                }
                return 0;
            })
        );
    }

    /**
     * Get event speakers
     * Replaces: /speakers
     */
    getEventSpeakers(eventId: string): Observable<any> {
        const url = `${this.baseUrl}/GetEventSpeakers`;
        const body = { msevtmgt_event_value: eventId };
        return this.http.post<EventSpeakersResponse>(url, body, { headers: this.headers }).pipe(
            map(response => {
                if (response && response.response) {
                    try {
                        return JSON.parse(response.response);
                    } catch (error) {
                        console.error('[AzureFunctionsService.getEventSpeakers] Error parsing response:', error);
                        return [];
                    }
                }
                return [];
            })
        );
    }

    /**
     * Get session tracks
     * Replaces: /tracks
     */
    getSessionTracks(eventId: string): Observable<any> {
        const url = `${this.baseUrl}/GetSessionTracks`;
        const body = { msevtmgt_eventid_value: eventId };
        return this.http.post<SessionTracksResponse>(url, body, { headers: this.headers }).pipe(
            map(response => {
                if (response && response.response) {
                    try {
                        return JSON.parse(response.response);
                    } catch (error) {
                        console.error('[AzureFunctionsService.getSessionTracks] Error parsing response:', error);
                        return [];
                    }
                }
                return [];
            })
        );
    }

    /**
     * Get event sponsorships
     * Replaces: /sponsors
     */
    getEventSponsorships(eventId: string): Observable<any> {
        const url = `${this.baseUrl}/GetEventSponsorships`;
        const body = { msevtmgt_event_value: eventId };
        return this.http.post<EventSponsorshipsResponse>(url, body, { headers: this.headers }).pipe(
            map(response => {
                if (response && response.response) {
                    try {
                        return JSON.parse(response.response);
                    } catch (error) {
                        console.error('[AzureFunctionsService.getEventSponsorships] Error parsing response:', error);
                        return [];
                    }
                }
                return [];
            })
        );
    }

    /**
     * Get PEC contact information
     * Replaces: /getinfo/
     */
    getPECContact(contactId: string): Observable<any> {
        const url = `${this.baseUrl}/GetPECContact`;
        const body = { ContactId: contactId };
        return this.http.post<PECContactResponse>(url, body, { headers: this.headers }).pipe(
            map(response => {
                if (response && response.response) {
                    try {
                        return JSON.parse(response.response);
                    } catch (error) {
                        console.error('[AzureFunctionsService.getPECContact] Error parsing response:', error);
                        return {};
                    }
                }
                return {};
            })
        );
    }

    /**
     * Get event location map
     * Replaces: /locationmap
     */
    getEventLocationMap(readableEventId: string): Observable<any> {
        const url = `${this.baseUrl}/GetEventLocationMap`;
        const body = { ReadableEventId: readableEventId };
        return this.http.post<EventLocationMapResponse>(url, body, { headers: this.headers }).pipe(
            map(response => {
                if (response && response.response) {
                    try {
                        return JSON.parse(response.response);
                    } catch (error) {
                        console.error('[AzureFunctionsService.getEventLocationMap] Error parsing response:', error);
                        return {};
                    }
                }
                return {};
            })
        );
    }

    /**
     * Get ZIP/City/State information
     * NEW: Replaces /zipcityandstate
     */
    getEventZipCityState(zip: string): Observable<any> {
        const url = `${this.baseUrl}/GetEventZipCityState`;
        const body = { zipParam: zip };
        return this.http.post<ZipCityStateResponse>(url, body, { headers: this.headers }).pipe(
            map(response => {
                if (response && response.response) {
                    try {
                        return JSON.parse(response.response);
                    } catch (error) {
                        console.error('[AzureFunctionsService.getEventZipCityState] Error parsing response:', error);
                        return {};
                    }
                }
                return {};
            })
        );
    }

    /**
     * Get user registration route
     * NEW: Replaces /pro_userregroute
     */
    getUserRegRoute(confirmationCode: string): Observable<any> {
        const url = `${this.baseUrl}/GetUserRegRoute`;
        const body = { confirmationcode: confirmationCode };
        return this.http.post<UserRegRouteResponse>(url, body, { headers: this.headers }).pipe(
            map(response => {
                if (response && response.response) {
                    try {
                        return JSON.parse(response.response);
                    } catch (error) {
                        console.error('[AzureFunctionsService.getUserRegRoute] Error parsing response:', error);
                        return {};
                    }
                }
                return {};
            })
        );
    }

    /**
     * Get event sessions
     * NEW: Replaces /sessions
     */
    getEventSessions(readableEventId: string): Observable<any> {
        const url = `${this.baseUrl}/eventsessions/mapped/${readableEventId}`;
        return this.http.get<EventSessionsResponse>(url, { headers: this.headers }).pipe(
            map(response => {
                if (response && response.response) {
                    try {
                        return JSON.parse(response.response);
                    } catch (error) {
                        console.error('[AzureFunctionsService.getEventSessions] Error parsing response:', error);
                        return [];
                    }
                }
                return [];
            })
        );
    }

    /**
     * Reserve registration
     * NEW: Replaces /reserveregistration
     */
    reserveRegistration(payload: {
        passId: string;
        firstName: string;
        lastName: string;
        purchaseId: string;
        ReadableEventID: string;
    }): Observable<any> {
        const url = `${this.baseUrl}/ReserveEvent`;
        return this.http.post<ReserveRegistrationResponse>(url, payload, { headers: this.headers }).pipe(
            map(response => {
                if (response && response.response) {
                    try {
                        return JSON.parse(response.response);
                    } catch (error) {
                        console.error('[AzureFunctionsService.reserveRegistration] Error parsing response:', error);
                        return {};
                    }
                }
                return response;
            })
        );
    }
}