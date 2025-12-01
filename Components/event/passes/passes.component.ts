import { EventService } from '../../../services/event.service';
import { Component, OnInit, Input } from '@angular/core';
import { Pass } from '../../../models/Pass';
import { Event } from '../../../models/Event';
import { PendingRegistrations } from '../../../models/PendingRegistrations';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-passes',
    templateUrl: './passes.component.html',
    styleUrls: ['./passes.component.css'],
    standalone: false
})
export class PassesComponent implements OnInit {
    @Input() readableEventId: string;
    passes: Pass[];
    event: Event;
    pendingRegistrations: PendingRegistrations[];

    constructor(private eventService: EventService) { }

    ngOnInit() {
        this.loadPasses();
    }

    private loadPasses(): void {
        console.log('[PassesComponent.loadPasses] Starting to load passes for:', this.readableEventId);
        
        // Chain the observables properly using switchMap
        this.eventService.getEvent(this.readableEventId).pipe(
            switchMap(event => {
                this.event = event;
                console.log('[PassesComponent] Event loaded:', this.event);
                console.log('[PassesComponent] Event ID:', this.event.eventId);
                
                // Once we have the event, fetch both pending registrations and passes
                return forkJoin({
                    pendingRegistrations: this.eventService.getPendingRegistrations(this.readableEventId),
                    passes: this.eventService.getPasses(this.event.eventId)
                });
            })
        ).subscribe(
            result => {
                this.pendingRegistrations = result.pendingRegistrations.items || [];
                this.passes = result.passes || [];
                
                console.log('[PassesComponent] Pending Registrations:', this.pendingRegistrations);
                console.log('[PassesComponent] Passes:', this.passes);
                
                // Adjust pass availability based on pending registrations
                this.adjustPassAvailability();
            },
            error => {
                console.error('[PassesComponent.loadPasses] Error:', error);
                // Set defaults on error
                this.pendingRegistrations = [];
                this.passes = [];
            }
        );
    }

    private adjustPassAvailability(): void {
        // Adjust the number of passes based on pending registrations
        this.pendingRegistrations.forEach(pendingRegistration => {
            this.passes.forEach(pass => {
                if (pass.passId === pendingRegistration.passId) {
                    pass.numberOfPassesSold += pendingRegistration.pendingRegistrationsCount;
                    
                    const adjustedPassesLeft = pass.numberOfPassesLeft - pendingRegistration.pendingRegistrationsCount;
                    pass.numberOfPassesLeft = adjustedPassesLeft < 0 ? 0 : adjustedPassesLeft;
                }
            });
        });
        
        console.log('[PassesComponent.adjustPassAvailability] Adjusted passes:', this.passes);
    }
}