import { EventService } from '../../services/event.service';
import { Component, OnInit, OnDestroy,ElementRef  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Event } from '../../models/Event';
import { ImageHelper } from '../../helpers/ImageHelper';
import { EventCalendarService } from 'src/app/services/event.calendar.service';
import { SessionCalendar } from 'src/app/models/SessionCalendar';
import { PendingRegistrations } from 'src/app/models/PendingRegistrations';
import { environment } from 'src/environments/environment.dev';
import * as internal from "assert";
import { TealiumUtagService } from 'src/app/services/data.collection.service';
import { MutationObserverService } from 'src/app/services/mutationobserver.service';

@Component({
    selector: "app-event",
    providers: [TealiumUtagService],
    templateUrl: "./event.component.html",
    styleUrls: ["./event.component.css"],
    standalone: false
})
export class EventComponent implements OnInit,OnDestroy{
    public sessionCalendar: SessionCalendar = null;
    public readableEventId: string;
    public classstatus: string;
    public event: Event;
    public expired: boolean;
    public duration: number;
    public durationReached: boolean;
    public numberOfPassesLeft: number;
    public diffMs: any;
    public diffMins: number;
    private defaultImageUrl = "homehero.jpg";
    public registrationDisabled: boolean;
    public registrationRequired: boolean;
    public loading: boolean;
    public pendingRegistrationCount: number;
    public pendingRegistrations: PendingRegistrations[];
    public locationmapurl: string;
    public eventimageurl: string;
    public eventRegionQueryParm: string = null;
    public timeZone: string = "America/Los_Angeles";

    constructor(
        private route: ActivatedRoute,
        private eventService: EventService,
        private imageHelper: ImageHelper,
        private eventCalService: EventCalendarService,
        private tealium: TealiumUtagService,
        private mutationObserverService: MutationObserverService,
        private elRef: ElementRef,
    ) {
        this.tealium.setConfig({ account: environment.tealiumAccount, profile: environment.tealiumProfile, environment: environment.tealiumEnvironment });
    }    ngOnInit() {
        console.log('[EventComponent.ngOnInit] Component initializing...');
        this.loading = true;
        this.eventRegionQueryParm = this.route.snapshot.queryParams["region"];
        console.log('[EventComponent.ngOnInit] Query params:', this.route.snapshot.queryParams);
        
        this.setLogo();
        this.registrationDisabled = true;
        this.registrationRequired = true;
        this.readableEventId =
            this.route.snapshot.queryParams["readableEventId"];
        if (!this.readableEventId) {
            this.readableEventId = this.route.snapshot.queryParams["id"];
        }
        
        console.log('[EventComponent.ngOnInit] Readable Event ID:', this.readableEventId);
        
        if (!this.readableEventId) {
            console.error('[EventComponent.ngOnInit] ERROR: No event ID provided in query parameters!');
            this.loading = false;
            alert('Error: No event ID provided. Please check the URL.');
            return;
        }
        
        this.getLocationMap(this.readableEventId);
        this.loadEvent(this.readableEventId);
        this.initSessionCalendar(this.readableEventId);
        this.tealium.view({event_name: 'init'});
        this.mutationObserverService.initializeMutationObserver();
        
        console.log('[EventComponent.ngOnInit] All initialization calls completed');
    }
    ngOnDestroy(): void {
        this.mutationObserverService.disconnectMutationObserver();
      }

    public setLogo(): void {
        this.eventService
            .getDependentSearchOptions(
                encodeURIComponent(this.eventRegionQueryParm)
            )
            .subscribe(
                (searchoptions) => {
                    var UseDefaultLogo = true;
                    var i;
                    for (i = 0; i < searchoptions.regions.length; i++) {
                        if (
                            searchoptions.regions[i].cmscode ==
                            this.eventRegionQueryParm
                        ) {
                            sessionStorage.setItem(
                                "LogoUrl",
                                searchoptions.regions[i].logo
                            );
                            sessionStorage.setItem(
                                "TargetUrl",
                                searchoptions.regions[i].target
                            );
                            sessionStorage.setItem(
                                "LogoAltText",
                                searchoptions.regions[i].name
                            );
                            if (
                                searchoptions.regions[i].logo == "" ||
                                searchoptions.regions[i].logo == null
                            ) {
                                UseDefaultLogo = true;
                            } else {
                                UseDefaultLogo = false;
                            }
                        }
                    }

                    if (UseDefaultLogo) {
                        sessionStorage.setItem(
                            "LogoUrl",
                            "https://www.providence.org/-/media/Project/PSJH/providence/socal/Images/Logos/providence_color.png"
                        );
                        sessionStorage.setItem(
                            "TargetUrl",
                            "https://www.providence.org"
                        );
                        sessionStorage.setItem("LogoAltText", "Providence");
                    }
                },
                (error) => console.error(error)
            );
    }
    
    private initSessionCalendar(readableEventId: string) {
        this.eventCalService
            .getSessionCalendar(readableEventId)
            .then((calendar) => {
                this.sessionCalendar = calendar;
            })
            .catch((error) => {
                console.warn('[EventComponent.initSessionCalendar] CORS/API error for sessions, using defaults:', error.message || error);
                this.sessionCalendar = null;
            });
    }
    
    private getLocationMap(id: string) {
        this.eventService.getEventLocationMap(id).subscribe(
            (locationmap) => {
                this.locationmapurl = locationmap.locationmapurl;
                if (locationmap.eventimageurl) {
                    this.eventimageurl = locationmap.eventimageurl;
                } else {
                    this.eventimageurl = this.imageHelper.getImage(
                        null,
                        this.defaultImageUrl
                    );
                }
            },
            (error) => {
                // Handle CORS or API error - use default image
                console.warn('[EventComponent.getLocationMap] API call blocked or failed, using defaults:', error.message);
                this.eventimageurl = this.imageHelper.getImage(
                    null,
                    this.defaultImageUrl
                );
                this.locationmapurl = "https://assets-usa.mkt.dynamics.com/9ec2f535-cda9-43c7-8c8f-54646305fa84/digitalassets/images/c372048d-8d98-ed11-aad1-0022482a98a7?ts=638119326962686274";
            }
        );
    }
    
    private loadEvent(id: string) {
        console.log('[EventComponent.loadEvent] Loading event:', id);
        this.eventService.getEvent(id).subscribe(
            (event) => {
                console.log('[EventComponent.loadEvent] Event received:', event);
                this.event = event;
                console.log('[EventComponent.loadEvent] Event assigned to component property');
                
                // Now that we have the event with eventId, load dependent data
                this.loadEventDependentData(event.eventId);
            },
            (error) => {
                console.error('[EventComponent.loadEvent] getEvent API failed:', error);
                this.loading = false;
                alert('Unable to load event details. Please try again later.');
            }
        );
    }

    private loadEventDependentData(eventId: string): void {
        console.log('[EventComponent.loadEventDependentData] Loading data for eventId:', eventId);
        
        // Load pending registrations
        this.eventService.getPendingRegistrations(this.readableEventId).subscribe(
            (pendingRegistrations) => {
                console.log('[EventComponent] Pending registrations response:', pendingRegistrations);
                
                this.pendingRegistrations = pendingRegistrations?.items || [];
                this.pendingRegistrationCount = 0;
                
                if (Array.isArray(this.pendingRegistrations)) {
                    for (const pendReg of this.pendingRegistrations) {
                        this.pendingRegistrationCount += pendReg.pendingRegistrationsCount || 0;
                    }
                } else {
                    console.warn('[EventComponent] pendingRegistrations is not an array:', this.pendingRegistrations);
                    this.pendingRegistrations = [];
                }
                
                // Calculate event timing and registration status
                this.calculateEventStatus();
                
                this.loading = false;
            },
            (error) => {
                console.error('[EventComponent] getPendingRegistrations failed:', error);
                this.pendingRegistrations = [];
                this.pendingRegistrationCount = 0;
                this.loading = false;
            }
        );
        
        // Load passes using eventId
        this.loadPassesCount(eventId);
    }

    private loadPassesCount(eventId: string): void {
        console.log('[EventComponent.loadPassesCount] Loading passes for eventId:', eventId);
        
        this.numberOfPassesLeft = 0;
        
        this.eventService.getPasses(eventId).subscribe(
            (passes) => {
                console.log('[EventComponent.loadPassesCount] Passes received:', passes.length);
                
                for (let i = 0; i < passes.length; i++) {
                    this.numberOfPassesLeft += passes[i].numberOfPassesLeft;
                }
                
                console.log('[EventComponent.loadPassesCount] Total passes left:', this.numberOfPassesLeft);
            },
            (error) => {
                console.warn('[EventComponent.loadPassesCount] Error fetching passes:', error);
                this.numberOfPassesLeft = 0;
            }
        );
    }

    private calculateEventStatus(): void {
        const date = new Date();
        
        // Set timezone
        if (this.event.timeZoneName.includes("Chennai, Kolkata, Mumbai, New Delhi")) {
            this.timeZone = "Asia/Kolkata";
        } else if (this.event.timeZoneName.includes("Alaska")) {
            this.timeZone = "US/Alaska";
        } else if (this.event.timeZoneName.includes("Pacific Time (US & Canada)")) {
            this.timeZone = "US/Pacific";
        } else if (this.event.timeZoneName.includes("Mountain Time (US & Canada)")) {
            this.timeZone = "US/Mountain";
        } else if (this.event.timeZoneName.includes("Eastern Time (US & Canada)")) {
            this.timeZone = "US/Eastern";
        } else if (this.event.timeZoneName.includes("Central Time (US & Canada)")) {
            this.timeZone = "US/Central";
        } else if (this.event.timeZoneName.includes("Hawaii")) {
            this.timeZone = "US/Hawaii";
        } else {
            this.timeZone = "America/Los_Angeles";
        }
        
        const pst = date.toLocaleString("en-US", { timeZone: this.timeZone });
        
        // Calculate time differences
        this.diffMs = new Date(this.event.startDate).getTime() - new Date(pst).getTime();
        this.diffMins = Math.floor(this.diffMs / 60000);
        
        // Check if expired
        if (new Date(this.event.startDate) < new Date(pst)) {
            this.expired = true;
        } else {
            this.expired = false;
        }
        
        // Check duration
        this.duration = this.event.customFields.pro_registrationclosebefore;
        if (this.duration > this.diffMins || new Date(this.event.startDate) < new Date(pst)) {
            this.durationReached = true;
        } else {
            this.durationReached = false;
        }
        
        // Check if registration is enabled
        if (this.event.customFields) {
            if ((this.event.maxCapacity > 
                this.event.customFields.msevtmgt_registrationcount + this.pendingRegistrationCount ||
                this.event.showWaitlist) && this.classstatus != "Full") {
                this.registrationDisabled = false;
            }
        }
        
        this.registrationRequired = this.event.customFields.psjh_areregistrationsrequired;
    }



    public getBannerImage() {
        return this.eventimageurl;
    }

    public getLocationMapImage() {
        return this.locationmapurl
            ? this.locationmapurl
            : "https://assets-usa.mkt.dynamics.com/9ec2f535-cda9-43c7-8c8f-54646305fa84/digitalassets/images/c372048d-8d98-ed11-aad1-0022482a98a7?ts=638119326962686274";
    }
}
