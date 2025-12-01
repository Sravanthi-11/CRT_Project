import { EventService } from '../../services/event.service';
import { UserService } from '../../services/user.service';
import { Component, Inject, OnInit, Renderer2, ElementRef, DOCUMENT } from '@angular/core';
import { Event2 } from '../../models/Event2';
import { SearchOptions } from '../../models/SearchOptions';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { CartItem } from 'src/app/models/CartItem';
import { CartService } from 'src/app/services/cart.service';
import { DomSanitizer } from '@angular/platform-browser';
import { RegistrationDetails} from 'src/app/models/RegistrationDetails';
import { MutationObserverService } from 'src/app/services/mutationobserver.service';
import { RegistrationService } from 'src/app/services/registration.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'home2',
    templateUrl: './home2.component.html',
    styleUrls: ['./home2.component.css'],
    standalone: false
})
export class Home2Component implements OnInit {
    public allEvents: Event2[];
    public displayEvents: Event2[];
    public displaySupportGroups: Event2[];
    public startDate: Date;
    public endDate: Date;
    public searchForm: UntypedFormGroup;
    public bsConfig: Partial<BsDatepickerConfig>;
    public eventLocationQueryParam: string = null;
    public eventNameQueryParm: string = null;
    public eventRegionQueryParm: string = null;
    public eventOriginalRegionQueryParm: string = null;
    public eventMinistryQueryParm: string = null;
    public lockQueryParm: string = null;
    public eventOriginalMinistryQueryParm: string = null;
    public eventServiceyQueryParm: string = null;
    public eventStartdateyQueryParm: string = null;
    public eventEnddateQueryParm: string = null;
    public eventKeywordQueryParm: string = null;
    public eventIsUSD: string = null;
    public agentId: string = null;
    public caseId: string = null;
    public eventsearchoptions: SearchOptions = null;
    public bregionshouldbedisabled: boolean = false;
    public bministryshouldbedisabled: boolean = false;
    public registrantPECContactIDQueryParm: string = null;
    cartItemList: CartItem[];
    public regionAndLocationSelected: boolean = true;
    public showResults: boolean = false;
    public refreshingResults: boolean = false;
    public loading: boolean;
    public resultsPage: number = 1;
    public disabled: string = '';

    constructor(
        private eventService: EventService,
        private userService: UserService,
        private cartService: CartService,
        private router: Router,
        private route: ActivatedRoute,
        protected sanitizer: DomSanitizer,
        private renderer2: Renderer2,
        private elRef: ElementRef,
        private mutationObserverService: MutationObserverService,
        private registrationService: RegistrationService,
        @Inject(DOCUMENT) private _document) {
    }

    ngOnInit(): void {
        const s = this.renderer2.createElement('script');
        s.type = 'text/javascript';
        s.text = `function toggleReadMoreLess(e){var n=document.getElementById("dots"+e),l=document.getElementById("more"+e),t=document.getElementById("myBtn"+e),d=document.getElementById("here"+e);"none"===n.style.display?(n.style.display="inline",t.innerHTML="(Read more)",l.style.display="none"):(n.style.display="none",t.innerHTML="(Read less)",l.style.display="inline"),d.scrollIntoView(),window.scrollBy(0,-100)}`;
        this.renderer2.appendChild(this._document.body, s);

        this.loading = false;
        this.cartItemList = this.cartService.getItemList();
        // parse route for args
        this.initRouteArgs();

        // assign calendar color (theme-blue) for search bar Datepicker
        this.bsConfig = Object.assign({}, { containerClass: 'theme-dark-blue' });

        this.fetchRegistrationDetails('ER 85KV27NQYU7VEHQBX56NBJZRSC');        if (this.eventRegionQueryParm === null) {
            this.eventRegionQueryParm = 'Empty';
            let testRegion = sessionStorage.getItem('Region');
            if (testRegion != null && testRegion != 'Empty' && testRegion != 'null') {
                this.eventRegionQueryParm = testRegion;
                let originalRegion = sessionStorage.getItem('OriginalRegion');
                if (originalRegion != null && originalRegion != 'Empty' && originalRegion != 'null') {
                    this.bregionshouldbedisabled = true;
                }
            }
        }
        else {
            this.bregionshouldbedisabled = true;
        }        if (this.eventMinistryQueryParm === null) {
            this.eventMinistryQueryParm = 'Empty';
            let testMinistry = sessionStorage.getItem('Ministry');
            if (testMinistry != null && testMinistry != 'Empty' && testMinistry != 'null') {
                this.eventMinistryQueryParm = testMinistry;
                let originalMinistry = sessionStorage.getItem('OriginalMinistry');
                if (originalMinistry != null && originalMinistry != 'Empty' && originalMinistry != 'null') {
                    let bOriginalLock = sessionStorage.getItem('OriginalLock')
                    if (bOriginalLock == '1') {
                        this.bministryshouldbedisabled = true;
                    }
                    else if(bOriginalLock == '2')
                    {
                        this.bministryshouldbedisabled = false;
                    }
                    else{
                        this.bministryshouldbedisabled = true;
                    }
                }
            }
        }
        else {
            let bOriginalLock = sessionStorage.getItem('OriginalLock')
            if (bOriginalLock == '1') {
                this.bministryshouldbedisabled = true;
            }
            else if(bOriginalLock == '2') {
                this.bministryshouldbedisabled = false;
            }
            else {
                this.bministryshouldbedisabled = true;
                
            }
        }

        if (this.eventServiceyQueryParm === null) {
            this.eventServiceyQueryParm = 'Empty';
            let testService = sessionStorage.getItem('Service');
            if (testService != null) {
                this.eventServiceyQueryParm = testService;
            }
        }
        let testService = '';
        if (this.eventKeywordQueryParm === null) {
            testService = sessionStorage.getItem('Keywords');
            if (testService != null && testService != 'null') {
                this.eventKeywordQueryParm = testService.replace(',', ' ');
            }
        }
        if (this.eventStartdateyQueryParm === null) {
            let testService = sessionStorage.getItem('Startdate');
            if (testService != 'null') {
                this.eventStartdateyQueryParm = testService;
            }
        }
        else {
            this.eventStartdateyQueryParm = '';
        }
        if (this.resultsPage === null) {
            testService = sessionStorage.getItem('resultsPage');
            if (testService != null && testService != 'null') {
                this.resultsPage = parseInt(testService);
            }
        }
        // Reactive form for search bar
        this.searchForm = new UntypedFormGroup({
            startDate: new UntypedFormControl(this.eventStartdateyQueryParm),
            endDate: new UntypedFormControl(''),
            keywords: new UntypedFormControl(this.eventKeywordQueryParm),
            region: new UntypedFormControl({ value: this.eventRegionQueryParm, disabled: this.bregionshouldbedisabled }),
            ministry: new UntypedFormControl({ value: this.eventMinistryQueryParm, disabled: this.bministryshouldbedisabled }),
            service: new UntypedFormControl(this.eventServiceyQueryParm)
        });        this.eventsearchoptions = { regions: [], ministries: [], servicelines: [] };
        if (this.searchForm.get('region').value && this.searchForm.get('region').value != 'Empty' && this.searchForm.get('region').value != 'null') {
            console.log('[Home2Component] Loading ministries for region:', this.searchForm.get('region').value);
            this.loadMinistries(this.searchForm.get('region').value);
        }
        else {
            console.log('[Home2Component] Loading initial search options');
            this.loading = true;
            this.eventService.getSearchOptions().subscribe(searchoptions => {
                this.eventsearchoptions = searchoptions;
                console.log('[Home2Component] Search options loaded:', searchoptions);
                
                // Clear ministries except for empty option
                var count = this.eventsearchoptions.ministries.length;
                this.eventsearchoptions.ministries.splice(1, count - 1);
                this.eventsearchoptions.ministries[0].cmscode = 'Empty';
                this.eventsearchoptions.ministries[0].name = '';

                // Only set to Empty if not already set from query params
                if (!this.searchForm.get('region').value || this.searchForm.get('region').value == 'Empty') {
                    this.searchForm.controls['region'].setValue("Empty");
                }
                if (!this.searchForm.get('ministry').value || this.searchForm.get('ministry').value == 'Empty') {
                    this.searchForm.controls['ministry'].setValue("Empty");
                }

                sessionStorage.setItem('LogoUrl', "https://www.providence.org/-/media/Project/PSJH/providence/socal/Images/Logos/providence_color.png");
                sessionStorage.setItem('TargetUrl', "https://www.providence.org");
                sessionStorage.setItem('LogoAltText', "Providence");
                this.loading = false;

            }, error => {
                console.error('Error loading search options:', error);
                this.loading = false;
            });
        }

        this.eventService.getSearchEvent(this.eventStartdateyQueryParm, this.eventEnddateQueryParm, encodeURIComponent(this.eventRegionQueryParm), encodeURIComponent(this.eventMinistryQueryParm), encodeURIComponent(this.eventLocationQueryParam), encodeURIComponent(this.eventServiceyQueryParm), encodeURIComponent(this.eventKeywordQueryParm), this.resultsPage)
        .subscribe(events => {
          if (events != null) {
            var j;
            for (j = 0; j < events.items.length; j++) {
              if (events.items[j].description != null && events.items[j].description.length > 110) {
                var a = events.items[j].description;
                var b = `<span id='dots${j}' style='color:#00338E;'>...</span><span id='more${j}' style='display:none;'>`;
                var position = 100;
                var output = [a.slice(0, position), b, a.slice(position)].join('');
                events.items[j].description = output; // We keep it simple here, no inline onclick
                events.items[j].showMore = false; // Add the showMore property to control display
              }
            }
      
            this.allEvents = events.items;
            this.displayEvents = Object.assign([], events.items);
            this.showResults = true;
          }
        }, error => console.error(error));

        
    }
    

    ngOnDestroy(): void {
        this.mutationObserverService.disconnectMutationObserver();
      }

    fetchRegistrationDetails(confirmationCode: string): void {
            this.registrationService.getRegistrationDetails(confirmationCode).subscribe({
            next: (details: RegistrationDetails) => {
                console.log('Registration Details:', details);
            },
            error: (error) => {
                console.error('Error fetching registration details:', error);
            }
            });
        }    public loadMinistries(regionCMS: string) {
        console.log('[Home2Component.loadMinistries] Loading ministries for region:', regionCMS);
        
        if (regionCMS != 'Empty' && regionCMS != null && regionCMS != 'null') {
            this.loading = true;
            this.showResults = false;
            
            // Store the region value
            sessionStorage.setItem('Region', regionCMS);
            
            this.eventService.getDependentSearchOptions(regionCMS).subscribe(searchoptions => {
                console.log('[Home2Component.loadMinistries] Received search options:', searchoptions);
                
                // The response is now properly parsed by the DynamicsService
                this.eventsearchoptions = searchoptions;
                
                var UseDefaultLogo = true;
                if (searchoptions.regions && searchoptions.regions.length > 0) {
                    var i;
                    for (i = 0; i < searchoptions.regions.length; i++) {
                        if (searchoptions.regions[i].cmscode == regionCMS) {
                            const logo = searchoptions.regions[i].logo;
                            const target = searchoptions.regions[i].target;
                            const name = searchoptions.regions[i].name;
                            
                            console.log('[Home2Component.loadMinistries] Found region logo:', { logo, target, name });
                            
                            sessionStorage.setItem('LogoUrl', logo || '');
                            sessionStorage.setItem('TargetUrl', target || '');
                            sessionStorage.setItem('LogoAltText', name || '');
                            
                            if (logo == "" || logo == null) {
                                UseDefaultLogo = true;
                            }
                            else {
                                UseDefaultLogo = false;
                            }
                            break;
                        }
                    }
                }
                
                if (UseDefaultLogo) {
                    sessionStorage.setItem('LogoUrl', "https://www.providence.org/-/media/Project/PSJH/providence/socal/Images/Logos/providence_color.png");
                    sessionStorage.setItem('TargetUrl', "https://www.providence.org");
                    sessionStorage.setItem('LogoAltText', "Providence");
                }
                
                // Reset ministry dropdown to Empty when region changes
                const currentMinistry = this.searchForm.controls['ministry'].value;
                if (currentMinistry == null || currentMinistry == "" || currentMinistry == "Empty") {
                    this.searchForm.controls['ministry'].setValue("Empty");
                }
                
                console.log('[Home2Component.loadMinistries] Ministries loaded. Count:', this.eventsearchoptions.ministries?.length || 0);
                this.loading = false;
            }, error => {
                console.error('[Home2Component.loadMinistries] Error loading ministries for region:', error);
                this.loading = false;
            });
        }
        else {
            console.log('[Home2Component.loadMinistries] Clearing ministries - region is Empty');
            var count = this.eventsearchoptions.ministries.length;
            this.eventsearchoptions.ministries.splice(1, count - 1);
            if (this.eventsearchoptions.ministries.length > 0) {
                this.eventsearchoptions.ministries[0].cmscode = 'Empty';
                this.eventsearchoptions.ministries[0].name = '';
            }
            this.searchForm.markAsPristine();
            this.searchForm.markAsUntouched();
        }
    }public onRegionChange(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        const regionValue = selectElement.value;
        console.log('[Home2Component] Region changed to:', regionValue);
        
        this.showResults = false;
        this.regionAndLocationSelected = true;
        
        // Reset ministry when region changes
        this.searchForm.controls['ministry'].setValue('Empty');
        
        // Load ministries for the selected region
        if (regionValue && regionValue !== 'Empty') {
            this.loadMinistries(regionValue);
        } else {
            // Clear ministries if no region selected
            var count = this.eventsearchoptions.ministries.length;
            this.eventsearchoptions.ministries.splice(1, count - 1);
            if (this.eventsearchoptions.ministries.length > 0) {
                this.eventsearchoptions.ministries[0].cmscode = 'Empty';
                this.eventsearchoptions.ministries[0].name = '';
            }
        }
    }

    public onMinistryChange(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        const ministryValue = selectElement.value;
        console.log('[Home2Component] Ministry changed to:', ministryValue);
        
        this.showResults = false;
        if (this.searchForm.get('region').value && this.searchForm.get('region').value !== 'Empty' &&
            ministryValue && ministryValue !== 'Empty') {
            this.regionAndLocationSelected = true;
        } else {
            this.regionAndLocationSelected = false;
        }
    }

    public onServiceChange(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        const serviceValue = selectElement.value;
        console.log('[Home2Component] Service changed to:', serviceValue);
        this.clearResults();
    }

    public clearError() {
        this.showResults = false;
        if (this.searchForm.get('region').value && this.searchForm.get('region').value !== 'Empty' &&
            this.searchForm.get('ministry').value && this.searchForm.get('ministry').value !== 'Empty') {
            this.regionAndLocationSelected = true;
        }
    }

    public clearResults() {
        this.showResults = false;
        if (this.displayEvents) {
            this.displayEvents.length = 0;
        }
        if (this.displaySupportGroups) {
            this.displaySupportGroups.length = 0;
        }
    }

    initRouteArgs(): void {
        // check for query string route params: /?location=xxx&name=yyy
        this.route.queryParamMap.subscribe(params => {
            params.keys.forEach(key => {
                if (key.toLowerCase() === 'location') {
                    this.eventLocationQueryParam = params.get(key);
                }

                if (key.toLowerCase() === 'name') {
                    this.eventNameQueryParm = params.get(key);
                }

                if (key.toLowerCase() === 'region') {
                    this.eventRegionQueryParm = params.get(key);
                    sessionStorage.setItem('OriginalRegion', params.get(key));
                }

                if (key.toLowerCase() === 'ministry') {
                    this.eventMinistryQueryParm = params.get(key);
                    sessionStorage.setItem('OriginalMinistry', params.get(key));
                }

                if (key.toLowerCase() === 'lock') {
                    this.lockQueryParm = params.get(key);
                    sessionStorage.setItem('OriginalLock', params.get(key));
                }

                if (key.toLowerCase() === 'service') {
                    this.eventServiceyQueryParm = params.get(key);
                }

                if (key.toLowerCase() === 'startdate') {
                    this.eventStartdateyQueryParm = params.get(key);
                }

                if (key.toLowerCase() === 'enddate') {
                    this.eventEnddateQueryParm = params.get(key);
                }

                if (key.toLowerCase() === 'keywords') {
                    this.eventKeywordQueryParm = params.get(key);
                }

                if (key.toLowerCase() === 'navigate') {
                    this.eventIsUSD = params.get(key);
                }

                if (key.toLowerCase() === 'agent') {
                    this.agentId = params.get(key);
                }

                if (key.toLowerCase() === 'cid') {
                    this.caseId = params.get(key);
                }

                if (key.toLowerCase() === 'pid') {
                    this.registrantPECContactIDQueryParm = params.get(key);
                }

            });

            if (this.eventIsUSD != null) {
                this.userService.getPECCallerInfo(this.registrantPECContactIDQueryParm).subscribe(callerInfo => {
                    sessionStorage.setItem('RegFirstName', callerInfo.firstname);
                    sessionStorage.setItem('RegLastName', callerInfo.lastname);
                    sessionStorage.setItem('RegLine1', callerInfo.address1_line1);
                    sessionStorage.setItem(
                        "RegLine2",
                        callerInfo.address1_line2
                    );
                    sessionStorage.setItem("RegCity", callerInfo.address1_city);
                    sessionStorage.setItem(
                        "RegState",
                        callerInfo.address1_stateorprovince
                    );
                    sessionStorage.setItem(
                        "RegZIP",
                        callerInfo.address1_postalcode
                    );
                    sessionStorage.setItem(
                        "RegEmail",
                        callerInfo.emailaddress1
                    );
                    sessionStorage.setItem(
                        "RegHomePhone",
                        callerInfo.telephone1
                    );
                    sessionStorage.setItem('RegMobilePhone', callerInfo.mobilephone);
                }, error => console.error(error));
                sessionStorage.setItem('IsUSD', 'true');
                sessionStorage.setItem('AgentId', this.agentId);
                sessionStorage.setItem('CaseId', this.caseId);
            } else if (sessionStorage.getItem('IsUSD') === null) {
                sessionStorage.setItem('IsUSD', 'false');
            }
        });
    }

    public routeToCart() {
        this.router.navigateByUrl('/cart');
    }

    public emptyCart() {
        this.cartService.emptyCart();
        this.cartItemList = this.cartService.getItemList();
    }

    public toggleReadMoreLessAng(item) {
        var dots = document.getElementById("dots" + item);
        var moreText = document.getElementById("more" + item);
        var btnText = document.getElementById("myBtn" + item);

        if (dots.style.display === "none") {
            dots.style.display = "inline";
            btnText.innerHTML = "(Read more)";
            moreText.style.display = "none";
        } else {
            dots.style.display = "none";
            btnText.innerHTML = "(Read less)";
            moreText.style.display = "inline";
        }
    }

    goToNextPage(page, $top) {
        this.resultsPage = parseInt(page) + this.resultsPage;
        this.filterEvents(this.resultsPage);
        if ($top) {
            $top.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }
    }    filterEvents(page = 1): void {
        console.log('[Home2Component.filterEvents] Starting search with page:', page);
        console.log('[Home2Component.filterEvents] Form values:', this.searchForm.value);
        
        this.showResults = false;
        this.refreshingResults = true;
        
        let start = null;
        if (this.searchForm.get('startDate').value) {
            start = new Date(this.searchForm.get('startDate').value).toJSON().split('T')[0];
        }
        let end = null;
        if (this.searchForm.get('endDate').value) {
            end = new Date(this.searchForm.get('endDate').value).toJSON().split('T')[0];
        }

        let regionx = null;
        const regionValue = this.searchForm.get('region').value;
        if (regionValue && regionValue != 'Empty' && regionValue != 'null') {
            regionx = regionValue;
        } else {
            console.warn('[Home2Component.filterEvents] Region not selected');
            this.regionAndLocationSelected = false;
            this.refreshingResults = false;
            return;
        }
        
        let ministryx = null;
        const ministryValue = this.searchForm.get('ministry').value;
        if (ministryValue && ministryValue != 'Empty' && ministryValue != 'null') {
            ministryx = ministryValue;
        } else {
            console.warn('[Home2Component.filterEvents] Ministry/Location not selected');
            this.regionAndLocationSelected = false;
            this.refreshingResults = false;
            return;
        }
        
        let servicex = null;
        const serviceValue = this.searchForm.get('service').value;
        if (serviceValue && serviceValue != 'Empty') {
            servicex = serviceValue;
        }

        let keywordsx = null;
        if (this.searchForm.get('keywords').value) {
            keywordsx = this.searchForm.get('keywords').value;
            keywordsx = keywordsx.trim();
            keywordsx = keywordsx.replace(/ /g, ',');
        }
        
        console.log('[Home2Component.filterEvents] Search parameters:', {
            start,
            end,
            region: regionx,
            ministry: ministryx,
            service: servicex,
            keywords: keywordsx,
            page
        });
        
        this.eventService.getSearchEvent(
            start, 
            end, 
            encodeURIComponent(regionx), 
            encodeURIComponent(ministryx), 
            encodeURIComponent(this.eventLocationQueryParam || ''), 
            encodeURIComponent(servicex || ''), 
            encodeURIComponent(keywordsx || ''), 
            page
        ).subscribe(evt => {
            console.log('[Home2Component.filterEvents] Search results received:', evt);
            
            var j;
            for (j = 0; j < evt.items.length; j++) {
                if (evt.items[j].description != null && evt.items[j].description.length > 110) {
                    var a = evt.items[j].description;
                    var b = "<span id='dots" + j + "' style='color:#00338E;'>...</span><span id='more" + j + "' style='display:none;'>";
                    var position = 100;
                    var output = [a.slice(0, position), b, a.slice(position)].join('');
                    evt.items[j].description = "<span id='here" + j + "' />" + output + "</span><a style='color:#00338E;' onclick='toggleReadMoreLess(" + j + ");' id='myBtn" + j + "'>(Read more)</a>";
                }
            }

            this.allEvents = evt.items;
            this.displayEvents = Object.assign([], evt.items);
            this.showResults = true;
            this.refreshingResults = false;
            
            console.log('[Home2Component.filterEvents] ✅ Search completed. Results count:', evt.items.length);
        }, error => {
            console.error('[Home2Component.filterEvents] ❌ Search failed:', error);
            this.refreshingResults = false;
            this.showResults = true;
            this.displayEvents = [];
        });
    }
}
