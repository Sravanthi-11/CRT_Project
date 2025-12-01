import { environment } from './../../environments/environment';
import { FinalizeRegistrationRequest } from './../models/FinalizeRegistrationRequest';
import { RegistrationResult } from '../models/RegistrationResult';
import { Captcha } from '../models/Captcha';
import { Sponsorship } from '../models/Sponsorship';
import { Speaker } from '../models/Speaker';
import { SessionTrack } from '../models/SessionTrack';
import { SessionTimeStrings } from '../models/SessionTimeStrings';
import { Session } from '../models/Session';
import { Pass } from '../models/Pass';
import { HttpHelper } from '../helpers/HttpHelper';
import { Injectable } from '@angular/core';
import { Event } from '../models/Event';
import { PendingRegistrations } from '../models/PendingRegistrations';
import { Events } from '../models/Events';
import { Observable } from 'rxjs';
import { RegistrationData } from '../models/RegistrationData';
import { ReservationData } from '../models/ReservationData';
import * as CustomRegistrationFieldModel from '../models/CustomRegistrationField';
import { AddOn } from '../models/AddOn';
import { ZIPCityState } from '../models/ZIPCityState';
import { SearchOptions } from '../models/SearchOptions';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Event2 } from '../models/Event2';
import { throwError } from 'rxjs';
import { AzureFunctionsService } from './azure-functions.service';

@Injectable()
export class EventService {

    private static readonly eventsEndpoint: string = environment.eventsEndpoint;
    private static readonly tracksEndpoint: string = environment.tracksEndpoint;
    
    varAddress_ZipCodeMandatory: boolean;
    varAddress_ZipCodeOptional: boolean;
    varAddressOptional_ZipCodeMandatory: boolean;
    
    constructor(
        private http: HttpHelper,
        private httpClient: HttpClient,
        private azureFunctionsService: AzureFunctionsService
    ) {
    }

    public getPublishedEvents(): Observable<Event[]> {
        return this.http.get<Event[]>(`${environment.baseUrl}${EventService.eventsEndpoint}/published/`);
    }
    
    /**
     * Get event time strings
     * UPDATED: Now uses Azure Functions API
     */
    public getEventTimeStrings(readableEventId: string): Observable<any> {
        console.log('[EventService.getEventTimeStrings] Fetching time strings for:', readableEventId);
        return this.azureFunctionsService.getEventTimeStrings(readableEventId);
    }
    
    /**
     * Get event details
     * UPDATED: Now uses Azure Functions API
     */
    public getEvent(readableEventId: string): Observable<Event> {
        console.log('[EventService.getEvent] Fetching event details for:', readableEventId);
        
        return this.azureFunctionsService.getEventDetails(readableEventId).pipe(
            map((eventData: any) => {
                console.log('[EventService.getEvent] Event data received');
                console.log('[EventService.getEvent] Event data structure:', {
                    hasCustomFields: !!eventData.customFields,
                    hasBuilding: !!eventData.building,
                    hasRoom: !!eventData.room,
                    eventName: eventData.eventName,
                    buildingId: eventData.building?.id,
                    buildingName: eventData.building?.name
                });

                // Extract building data from customFields if not in main response
                const buildingData = eventData.building && eventData.building.id 
                    ? eventData.building 
                    : {
                        id: eventData.customFields?.msevtmgt_building?.Id || '',
                        name: eventData.customFields?.msevtmgt_building?.Name || '',
                        addressLine1: '',
                        city: '',
                        stateProvince: '',
                        postalCode: ''
                    };

                // Extract room data
                const roomData = eventData.room && eventData.room.id
                    ? eventData.room
                    : {
                        id: eventData.customFields?.msevtmgt_room?.Id || '',
                        name: eventData.customFields?.msevtmgt_room?.Name || '',
                        description: '',
                        disabledAccess: false
                    };

                // Extract image data
                const imageData = eventData.image 
                    ? eventData.image 
                    : (eventData.customFields?.adx_portalimage?.Id 
                        ? eventData.customFields.adx_portalimage.Id 
                        : null);

                // Extract description
                const description = eventData.description || eventData.customFields?.msevtmgt_description || '';

                // Extract public event URL
                const publicEventUrl = eventData.publicEventUrl || eventData.customFields?.msevtmgt_publiceventurl || '';

                // Map the response to the Event model
                const event: Event = {
                    customFields: eventData.customFields,
                    autoregisterWaitlistItems: eventData.autoregisterWaitlistItems ?? eventData.customFields?.msevtmgt_autoregisterwaitlistitems ?? false,
                    building: {
                        id: buildingData.id,
                        name: buildingData.name,
                        addressLine1: buildingData.addressLine1,
                        city: buildingData.city,
                        stateprovince: buildingData.stateProvince,
                        postalCode: buildingData.postalCode,
                        accessibleToilets: false,
                        additionalFacilities: '',
                        addressComposite: '',
                        addressLine2: '',
                        addressLine3: '',
                        country: '',
                        description: '',
                        disabledAccess: false,
                        disabledParking: false,
                        email: '',
                        publicTelephoneAvailable: false,
                        telephone1: '',
                        telephone2: '',
                        telephone3: '',
                        website: '',
                        wifiAvailable: false,
                        wifiPassword: '',
                        wifiSSID: ''
                    },
                    description: description,
                    endDate: eventData.endDate ? new Date(eventData.endDate) : (eventData.customFields?.msevtmgt_eventenddate ? new Date(eventData.customFields.msevtmgt_eventenddate) : new Date()),
                    endDateString: eventData.endDate || eventData.customFields?.msevtmgt_eventenddate || '',
                    eventFormat: eventData.eventFormat ?? eventData.customFields?.msevtmgt_eventformat?.Value ?? 0,
                    eventId: eventData.eventId || eventData.customFields?.msevtmgt_eventid || '',
                    eventLanguage: 0,
                    eventName: eventData.eventName || eventData.customFields?.msevtmgt_name || '',
                    eventType: eventData.eventType ?? 0,
                    image: imageData ? { 
                        image: imageData
                    } : null,
                    maxCapacity: eventData.maxCapacity || eventData.customFields?.msevtmgt_maximumeventcapacity || 0,
                    publicEventUrl: publicEventUrl,
                    readableEventId: eventData.readableEventId || eventData.customFields?.msevtmgt_readableeventid || readableEventId,
                    room: {
                        id: roomData.id,
                        name: roomData.name,
                        description: roomData.description,
                        disabledAccess: roomData.disabledAccess
                    },
                    showAutomaticRegistrationCheckbox: eventData.showAutomaticRegistrationCheckbox ?? eventData.customFields?.msevtmgt_showautomaticregistrationcheckbox ?? false,
                    showWaitlist: eventData.showWaitlist ?? eventData.customFields?.msevtmgt_showwaitlist ?? false,
                    startDate: eventData.startDate ? new Date(eventData.startDate) : (eventData.customFields?.msevtmgt_eventstartdate ? new Date(eventData.customFields.msevtmgt_eventstartdate) : new Date()),
                    startDateString: eventData.startDate || eventData.customFields?.msevtmgt_eventstartdate || '',
                    timeZone: eventData.timeZone ?? eventData.customFields?.msevtmgt_eventtimezone ?? 0,
                    timeZoneName: eventData.timeZoneName || eventData.customFields?.msevtmgt_eventtimezonename || '',
                    optionforAddress_Zipcode: eventData.customFields?.psjh_addresszipcoderequirementoption?.Value ?? 0,
                    redirectclass: eventData.customFields?.pro_redirectclass ?? false,
                    redirecturl: (typeof eventData.customFields?.msevtmgt_customeventurl === 'string' ? eventData.customFields.msevtmgt_customeventurl : '') || ''
                };

                console.log('[EventService.getEvent] Event mapped successfully:', {
                    eventName: event.eventName,
                    eventId: event.eventId,
                    buildingName: event.building.name,
                    roomName: event.room.name
                });
                
                return event;
            }),
            catchError(error => {
                console.error('[EventService.getEvent] API call failed:', error);
                return throwError(() => error);
            })
        );
    }
    
    /**
     * Get event location map
     * UPDATED: Now uses Azure Functions API
     */
    public getEventLocationMap(readableEventId: string): Observable<any> {
        console.log('[EventService.getEventLocationMap] Fetching location map for:', readableEventId);
        return this.azureFunctionsService.getEventLocationMap(readableEventId);
    }

    /**
     * Get pending registrations
     * UPDATED: Now uses Azure Functions API
     */
    public getPendingRegistrations(readableEventId: string): Observable<any> {
        console.log('[EventService.getPendingRegistrations] Fetching pending registrations for:', readableEventId);
        return this.azureFunctionsService.getPendingReg(readableEventId).pipe(
            tap(result => {
                console.log('[EventService.getPendingRegistrations] Processed response:', result);
                console.log('[EventService.getPendingRegistrations] Items count:', result.items?.length || 0);
            }),
            catchError(error => {
                console.error('[EventService.getPendingRegistrations] API call failed:', error);
                return throwError(() => error);
            })
        );
    }

    public getZIPCityState(zip: string): Observable<ZIPCityState> {
        return this.http.get<ZIPCityState>(
            `${environment.baseUrl}${EventService.eventsEndpoint}/zipcityandstate/?zip=${zip}`
        );
    }

    /**
     * Get passes
     * UPDATED: Now uses Azure Functions API with proper Observable chaining
     */
    public getPasses(eventId?: string): Observable<Pass[]> {
        console.log('[EventService.getPasses] Fetching passes for:', eventId);
        return this.azureFunctionsService.getEventPasses(eventId);
        
        // If eventId is provided, use it directly
        // if (eventId) {
        //     return this.azureFunctionsService.getEventPasses(eventId);
        // }
        
        // Otherwise, fetch event details to get eventId, then get passes
        // return this.getEvent(readableEventId).pipe(
        //     switchMap(event => {
        //         if (!event.eventId) {
        //             console.error('[EventService.getPasses] Event ID not found in event data');
        //             throw new Error('Event ID not found');
        //         }
        //         console.log('[EventService.getPasses] Using eventId:', event.eventId);
        //         return this.azureFunctionsService.getEventPasses(event.eventId);
        //     }),
        //     catchError(error => {
        //         console.error('[EventService.getPasses] Error fetching passes:', error);
        //         return throwError(() => error);
        //     })
        // );
    }

    /**
     * Get discounts
     * UPDATED: Now uses Azure Functions API
     */
    public getDiscounts(readableEventId: string): Observable<any> {
        console.log('[EventService.getDiscounts] Fetching discounts for:', readableEventId);
        return this.azureFunctionsService.getEventDiscountCodes(readableEventId);
    }

    /**
     * Get sessions
     * UPDATED: Now uses Azure Functions API
     */
    public getSessions(readableEventId: string): Observable<Session[]> {
        console.log('[EventService.getSessions] Fetching sessions for:', readableEventId);
        return this.azureFunctionsService.getEventSessions(readableEventId).pipe(
            catchError(error => {
                console.error('[EventService.getSessions] Error fetching sessions:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get session time strings
     * UPDATED: Now uses Azure Functions API
     */
    public getSessionTimeStrings(readableEventId: string): Observable<any> {
        console.log('[EventService.getSessionTimeStrings] Fetching session time strings for:', readableEventId);
        return this.azureFunctionsService.getEventSessionTimeStrings(readableEventId);
    }

    /**
     * Get session tracks
     * UPDATED: Now uses Azure Functions API with proper Observable chaining
     */
    public getSessionTracks(readableEventId: string, eventId?: string): Observable<SessionTrack[]> {
        console.log('[EventService.getSessionTracks] Fetching session tracks for:', readableEventId);
        
        // If eventId is provided, use it directly
        if (eventId) {
            return this.azureFunctionsService.getSessionTracks(eventId);
        }
        
        // Otherwise, fetch event details to get eventId first
        return this.getEvent(readableEventId).pipe(
            switchMap(event => {
                if (!event.eventId) {
                    console.warn('[EventService.getSessionTracks] Event ID not found');
                    throw new Error('Event ID not found');
                }
                console.log('[EventService.getSessionTracks] Using eventId:', event.eventId);
                return this.azureFunctionsService.getSessionTracks(event.eventId);
            }),
            catchError(error => {
                console.error('[EventService.getSessionTracks] Error fetching session tracks:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get speakers
     * UPDATED: Now uses Azure Functions API with proper Observable chaining
     */
    public getSpeakers(readableEventId: string, eventId?: string): Observable<Speaker[]> {
        console.log('[EventService.getSpeakers] Fetching speakers for:', readableEventId);
        
        // If eventId is provided, use it directly
        if (eventId) {
            return this.azureFunctionsService.getEventSpeakers(eventId);
        }
        
        // Otherwise, fetch event details to get eventId first
        return this.getEvent(readableEventId).pipe(
            switchMap(event => {
                if (!event.eventId) {
                    console.warn('[EventService.getSpeakers] Event ID not found');
                    throw new Error('Event ID not found');
                }
                console.log('[EventService.getSpeakers] Using eventId:', event.eventId);
                return this.azureFunctionsService.getEventSpeakers(event.eventId);
            }),
            catchError(error => {
                console.error('[EventService.getSpeakers] Error fetching speakers:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get sponsors
     * UPDATED: Now uses Azure Functions API with proper Observable chaining
     */
    public getSponsors(readableEventId: string, eventId?: string): Observable<Sponsorship[]> {
        console.log('[EventService.getSponsors] Fetching sponsors for:', readableEventId);
        
        // If eventId is provided, use it directly
        if (eventId) {
            return this.azureFunctionsService.getEventSponsorships(eventId);
        }
        
        // Otherwise, fetch event details to get eventId first
        return this.getEvent(readableEventId).pipe(
            switchMap(event => {
                if (!event.eventId) {
                    console.warn('[EventService.getSponsors] Event ID not found');
                    throw new Error('Event ID not found');
                }
                console.log('[EventService.getSponsors] Using eventId:', event.eventId);
                return this.azureFunctionsService.getEventSponsorships(event.eventId);
            }),
            catchError(error => {
                console.error('[EventService.getSponsors] Error fetching sponsors:', error);
                return throwError(() => error);
            })
        );
    }

    public getCaptcha(): Observable<Captcha> {
        return this.http.get<Captcha>(`${environment.baseUrl}${EventService.eventsEndpoint}/captcha/`);
    }

    /**
     * Get addons
     * UPDATED: Now uses Azure Functions API
     */
    public getAddons(readableEventId: string): Observable<any> {
        console.log('[EventService.getAddons] Fetching addons for:', readableEventId);
        return this.azureFunctionsService.getAddOnProducts(readableEventId);
    }

    /**
     * Get custom registration fields
     * UPDATED: Now uses Azure Functions API
     */
    public getCustomRegistrationFields(readableEventId: string): Observable<CustomRegistrationFieldModel.CustomRegistrationField[]> {
        console.log('[EventService.getCustomRegistrationFields] Fetching custom fields for:', readableEventId);
        return this.azureFunctionsService.getEventCustomRegistrationFields(readableEventId);
    }

    /**
     * Get event registration count
     * UPDATED: Now uses Azure Functions API
     */
    public getEventRegistrationCount(readableEventId: string): Observable<number> {
        console.log('[EventService.getEventRegistrationCount] Fetching registration count for:', readableEventId);
        return this.azureFunctionsService.getEventRegistrationCount(readableEventId);
    }

    public registerToEvent(readableEventId: string, registrationData: RegistrationData): Observable<RegistrationResult> {
        const url = `${environment.baseUrl}${EventService.eventsEndpoint}/register/?readableEventId=${readableEventId}`;
        return this.http.post<RegistrationResult>(url, registrationData);
    }

    public reserveEventRegistration(readableEventId: string, reservationData: ReservationData): Observable<RegistrationResult> {
        const url = `${environment.baseUrl}${EventService.eventsEndpoint}/reserveregistration/?readableEventId=${readableEventId}`;
        return this.http.post<RegistrationResult>(url, reservationData);
    }
    
    /**
     * Release reservation
     * UPDATED: Now uses Azure Functions API
     */
    public releaseReservation(readableEventId: string, reservationData: ReservationData): Observable<RegistrationResult> {
        console.log('[EventService.releaseReservation] Releasing reservation:', reservationData.purchaseId);
        return this.azureFunctionsService.releaseEventReservation(reservationData.purchaseId).pipe(
            map(response => response as RegistrationResult)
        );
    }
    
    /**
     * Search for events
     * UPDATED: Now uses Azure Functions API
     * NOTE: Ministry parameter maps to LocationFilter (not MinistryFilter) per business requirements
     */
    public getSearchEvent(Startdate: string, EndDate: string, Region: string, Ministry: string, Location: string, Service: string, Keywords: string, resultsPage: number): Observable<any> {
        console.log('[EventService.getSearchEvent] STAGE 1: Method called with parameters:', {
            Startdate, EndDate, Region, Ministry, Location, Service, Keywords, resultsPage
        });

        // Store session values
        sessionStorage.setItem('Region', decodeURIComponent(Region));
        sessionStorage.setItem('Ministry', decodeURIComponent(Ministry));
        sessionStorage.setItem('Location', decodeURIComponent(Location));
        sessionStorage.setItem('Service', decodeURIComponent(Service));
        sessionStorage.setItem('Keywords', decodeURIComponent(Keywords));
        sessionStorage.setItem('resultsPage', resultsPage.toString());
        console.log('[EventService.getSearchEvent] STAGE 2: Session storage updated');

        const requestBody: any = {
            pro_region: "",
            pro_keywords_searchclasses: "",
            StartDate: "",
            EndDate: "",
            LocationFilter: "",
            MinistryFilter: "",
            ServiceFilter: "",
            Page: ""
        };

        if (Region != null && Region != "null" && Region != 'Empty') {
            requestBody.pro_region = decodeURIComponent(Region);
        }
        if (Keywords != null && Keywords != "null" && Keywords != 'Empty') {
            requestBody.pro_keywords_searchclasses = decodeURIComponent(Keywords);
        }
        if (Startdate != null && Startdate != "null") {
            requestBody.StartDate = Startdate;
        }
        if (EndDate != null && EndDate != "null") {
            requestBody.EndDate = EndDate;
        }
        
        // Ministry parameter maps to LocationFilter (per business requirements)
        if (Ministry != null && Ministry != "null" && Ministry != 'Empty') {
            requestBody.LocationFilter = decodeURIComponent(Ministry);
            console.log('[EventService.getSearchEvent] Ministry mapped to LocationFilter:', requestBody.LocationFilter);
        }
        
        // Location parameter also goes to LocationFilter if provided separately
        // Note: This will override Ministry if both are provided
        if (Location != null && Location != "null" && Location != 'Empty') {
            requestBody.LocationFilter = decodeURIComponent(Location);
            console.log('[EventService.getSearchEvent] Location mapped to LocationFilter:', requestBody.LocationFilter);
        }
        
        if (Service != null && Service != "null" && Service != 'Empty') {
            requestBody.ServiceFilter = decodeURIComponent(Service);
        }
        if (resultsPage != null) {
            requestBody.Page = resultsPage.toString();
        } else {
            requestBody.Page = "1";
        }
        
        console.log('[EventService.getSearchEvent] STAGE 3: Request body built:', requestBody);
        console.log('[EventService.getSearchEvent] STAGE 4: Calling Azure Functions API...');

        return this.azureFunctionsService.searchClasses(requestBody).pipe(
            map(response => {
                console.log('[EventService.getSearchEvent] STAGE 5: Response received');
                console.log('[EventService.getSearchEvent] Events count:', response.items?.length || 0);
                
                let events: Event2[] = response.items || [];
                
                if (events.length > 0) {
                    console.log('[EventService.getSearchEvent] Sample event structure:', {
                        ReadableEventId: events[0].ReadableEventId,
                        Name: events[0].Name
                    });
                    
                    // Map PascalCase to lowercase for backward compatibility
                    events = events.map(event => ({
                        ...event,
                        readableeventid: event.ReadableEventId,
                        name: event.Name,
                        eventtype: event.EventType,
                        description: event.Description,
                        startdate: event.StartDate,
                        enddate: event.EndDate,
                        building: event.Building,
                        ministry: event.Ministry,
                        servicelines: event.ServiceLines,
                        pricing: event.Pricing,
                        spacesavailable: event.SpacesAvailable,
                        moreevents: event.MoreEvents,
                        registrationrequired: event.RegistrationRequired,
                        selfpaced: event.SelfPaced,
                        redirectclass: event.RedirectClass,
                        redirecturl: event.RedirectURL,
                        maximumeventcapacity: event.MaximumEventCapacity,
                        classstatus: event.ClassStatus
                    }));
                }
                
                console.log('[EventService.getSearchEvent] STAGE 6: SUCCESS - Final response prepared');
                return { items: events };
            }),
            catchError(error => {
                console.error('[EventService.getSearchEvent] ❌ FAILED - API call error:', error);
                return throwError(() => error);
            })
        );
    }
    
    /**
     * Get search options
     * UPDATED: Now uses Azure Functions API
     */
    public getSearchOptions(): Observable<SearchOptions> {
        console.log('[EventService.getSearchOptions] Fetching search options');
        return this.azureFunctionsService.getEventSearchOptions('');
    }

    /**
     * Get dependent search options
     * UPDATED: Now uses Azure Functions API
     */
    public getDependentSearchOptions(Region): Observable<SearchOptions> {
        console.log('[EventService.getDependentSearchOptions] Fetching options for region:', Region);
        if (Region != null && Region != 'Empty') {
            return this.azureFunctionsService.getEventSearchOptions(Region);
        }
        return this.azureFunctionsService.getEventSearchOptions('');
    }

    /**
     * Finalize registration
     * UPDATED: Now uses Azure Functions API
     */
    public finalizeRegistration(readableEventId: string, requestData: FinalizeRegistrationRequest): Observable<any> {
        const caseId = sessionStorage.getItem('CaseId');
        const userId = sessionStorage.getItem('AgentId');
        
        console.log('[EventService.finalizeRegistration] Finalizing registration:', {
            readableEventId, caseId, userId
        });
        
        const payload = {
            ...requestData,
            readableEventId,
            caseId,
            regby: userId
        };
        
        return this.azureFunctionsService.eventRegFinalize(payload);
    }

    public getSessionsInATrack(trackId: String): Observable<Session[]> {
        return this.http.get<Session[]>(`${environment.baseUrl}${EventService.tracksEndpoint}/sessions/?trackId=${trackId}`);
    }

    // Address/Zipcode validation helper methods
    public setvarAddress_ZipCodeMandatory(dataaddress: boolean) {
        sessionStorage.setItem("AZCM", JSON.stringify(dataaddress));
    }

    public setvarAddress_ZipCodeOptional(dataaddress: boolean) {
        sessionStorage.setItem("AZCO", JSON.stringify(dataaddress));
    }

    public SetvarAddressOptional_ZipCodeMandatory(dataaddress: boolean) {
        sessionStorage.setItem("AOZM", JSON.stringify(dataaddress));
    }

    public getvarAddress_ZipCodeMandatory() {
        return JSON.parse(sessionStorage.getItem("AZCM"));
    }

    public getvarAddress_ZipCodeOptional() {
        return JSON.parse(sessionStorage.getItem("AZCO"));
    }

    public getvarAddressOptional_ZipCodeMandatory() {
        return JSON.parse(sessionStorage.getItem("AOZM"));
    }
}