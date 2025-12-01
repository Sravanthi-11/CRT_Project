import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'; 
import { MutationObserverService } from 'src/app/services/mutationobserver.service';
import { Event2 } from './../../models/Event2';
import { TealiumUtagService } from 'src/app/services/data.collection.service';
import { environment } from 'src/environments/environment.dev';

@Component({
    selector: 'app-event-table',
    templateUrl: './event-table.component.html',
    styleUrls: ['./event-table.component.css'],
    providers: [TealiumUtagService] // Provide TealiumUtagService
    ,
    standalone: false
})
export class EventTableComponent implements AfterViewInit {
  @Input() public displayEvents: Event2[] = [];  // Use Event2[] type for displayEvents
  @Input() resultsPage!: number;
  @Output() nextPage: EventEmitter<number> = new EventEmitter();
  
  // @ViewChild('eventTable') eventTable!: ElementRef; Upgraded to this code version
    @ViewChild('eventTable', { static: true }) eventTable!: ElementRef;


  constructor(
    public sanitizer: DomSanitizer,
    private mutationObserverService: MutationObserverService, // Inject the service
    private tealium: TealiumUtagService // Inject TealiumUtagService

  ) {}

  ngAfterViewInit() {
    this.initializeMutationObserver();
    this.initializeTealium(); // Initialize Tealium after view initialization

  }
  toggleReadMoreLess(event: any): void {
    event.showMore = !event.showMore;
  }
  
  goToNextPage(direction: number, top: any): void {
    this.nextPage.emit(direction);
    if (top) {
      top.scrollIntoView({ behavior: 'smooth' });
    }
  }
  initializeTealium() {
    // Set Tealium config using the environment variables
    this.tealium.setConfig({
      account: environment.tealiumAccount,
      profile: environment.tealiumProfile,
      environment: environment.tealiumEnvironment
    });

    // Trigger a view event
    this.tealium.view({ event_name: 'init' });
  }

  initializeMutationObserver() {
    this.mutationObserverService.initializeMutationObserver(this.eventTable.nativeElement);
  }

  // Optionally disconnect the observer when the component is destroyed
  ngOnDestroy(): void {
    console.log("Stopping destruction")
    // this.mutationObserverService.disconnectMutationObserver();
  }
}
