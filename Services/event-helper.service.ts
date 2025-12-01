import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AzureFunctionsService } from './azure-functions.service';
import { EventService } from './event.service';

/**
 * Helper service to manage event-related operations that require eventId
 * This service provides reusable methods to fetch data that depends on eventId
 */
@Injectable({
    providedIn: 'root'
})
export class EventHelperService {

    constructor(
        private azureFunctionsService: AzureFunctionsService,
        private eventService: EventService
    ) { }

    /**
     * Fetch event ID from readableEventId
     * Reusable method to get eventId when only readableEventId is available
     */
    private getEventId(readableEventId: string): Observable<string> {
        return this.eventService.getEvent(readableEventId).pipe(
            switchMap(event => {
                if (!event.eventId) {
                    throw new Error(`Event ID not found for ${readableEventId}`);
                }
                return of(event.eventId);
            }),
            catchError(error => {
                console.error('[EventHelperService.getEventId] Error:', error);
                throw error;
            })
        );
    }

    /**
     * Get passes with automatic eventId resolution
     */
    public getPasses(readableEventId: string, eventId?: string): Observable<any> {
        if (eventId) {
            console.log('[EventHelperService.getPasses] Using provided eventId:', eventId);
            return this.azureFunctionsService.getEventPasses(eventId);
        }

        return this.getEventId(readableEventId).pipe(
            switchMap(resolvedEventId => 
                this.azureFunctionsService.getEventPasses(resolvedEventId)
            )
        );
    }

    /**
     * Get session tracks with automatic eventId resolution
     */
    public getSessionTracks(readableEventId: string, eventId?: string): Observable<any> {
        if (eventId) {
            return this.azureFunctionsService.getSessionTracks(eventId);
        }

        return this.getEventId(readableEventId).pipe(
            switchMap(resolvedEventId => 
                this.azureFunctionsService.getSessionTracks(resolvedEventId)
            )
        );
    }

    /**
     * Get speakers with automatic eventId resolution
     */
    public getSpeakers(readableEventId: string, eventId?: string): Observable<any> {
        if (eventId) {
            return this.azureFunctionsService.getEventSpeakers(eventId);
        }

        return this.getEventId(readableEventId).pipe(
            switchMap(resolvedEventId => 
                this.azureFunctionsService.getEventSpeakers(resolvedEventId)
            )
        );
    }

    /**
     * Get sponsors with automatic eventId resolution
     */
    public getSponsors(readableEventId: string, eventId?: string): Observable<any> {
        if (eventId) {
            return this.azureFunctionsService.getEventSponsorships(eventId);
        }

        return this.getEventId(readableEventId).pipe(
            switchMap(resolvedEventId => 
                this.azureFunctionsService.getEventSponsorships(resolvedEventId)
            )
        );
    }

    /**
     * Batch fetch multiple event-related data
     * Useful when you need multiple pieces of data that all require eventId
     */
    public getBatchEventData(
        readableEventId: string, 
        options: {
            fetchPasses?: boolean;
            fetchTracks?: boolean;
            fetchSpeakers?: boolean;
            fetchSponsors?: boolean;
        } = {}
    ): Observable<{
        eventId: string;
        passes?: any;
        tracks?: any;
        speakers?: any;
        sponsors?: any;
    }> {
        return this.getEventId(readableEventId).pipe(
            switchMap(eventId => {
                const result: any = { eventId };
                const requests: Observable<any>[] = [];

                if (options.fetchPasses) {
                    requests.push(
                        this.azureFunctionsService.getEventPasses(eventId).pipe(
                            switchMap(passes => {
                                result.passes = passes;
                                return of(result);
                            })
                        )
                    );
                }

                if (options.fetchTracks) {
                    requests.push(
                        this.azureFunctionsService.getSessionTracks(eventId).pipe(
                            switchMap(tracks => {
                                result.tracks = tracks;
                                return of(result);
                            })
                        )
                    );
                }

                if (options.fetchSpeakers) {
                    requests.push(
                        this.azureFunctionsService.getEventSpeakers(eventId).pipe(
                            switchMap(speakers => {
                                result.speakers = speakers;
                                return of(result);
                            })
                        )
                    );
                }

                if (options.fetchSponsors) {
                    requests.push(
                        this.azureFunctionsService.getEventSponsorships(eventId).pipe(
                            switchMap(sponsors => {
                                result.sponsors = sponsors;
                                return of(result);
                            })
                        )
                    );
                }

                if (requests.length === 0) {
                    return of(result);
                }

                // Execute all requests
                return of(result);
            })
        );
    }
}