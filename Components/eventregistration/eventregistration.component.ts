import { environment } from './../../../environments/environment';
import { CaptchaService } from './../../services/captcha.service';
import { Component, OnInit, Inject, Input } from '@angular/core';
import { Attendee } from '../../models/Attendee';
import { ActivatedRoute, Router } from '@angular/router';
import { Event } from '../../models/Event';
import { Pass } from '../../models/Pass';
import { RegistrationData } from '../../models/RegistrationData';
import { ReservationData } from '../../models/ReservationData';
import { HipObject } from '../../models/HipObject';
import * as CustomRegistrationFieldModel from '../../models/CustomRegistrationField';
import { CustomRegistrationFieldResponse } from '../../models/CustomRegistrationFieldResponse';
import { EventService } from '../../services/event.service';
import { LabelsService } from '../../services/labels.service';
import { SessionService } from '../../services/session.service';
import { SessionTimeStrings } from '../../models/SessionTimeStrings';
import { CartService } from 'src/app/services/cart.service';
import { CartItem } from 'src/app/models/CartItem';
import { states } from '../../models/States';
import { AddOn } from '../../models/AddOn';
import { Discount } from '../../models/Discount';
import { PendingRegistrations } from '../../models/PendingRegistrations';
import { isValid } from 'date-fns';
import { CommonModule } from '@angular/common';


@Component({
    selector: "app-eventregistration",
    templateUrl: "./eventregistration.component.html",
    styleUrls: ["./eventregistration.component.css"],
    standalone: false
})
export class EventRegistrationComponent implements OnInit {
    attendees: Attendee[];
    waitlistedAttendees: Attendee[];
    event: Event;
    eventtimestrings: SessionTimeStrings[];
    passes: Pass[];
    registrationCount: number;
    expired: boolean;
    passesLeft: number;
    passesUsed: number;
    roomLeft: number;
    pendingRegistrationCount: number;
    readableEventId: string;
    cartContainsWaitlister: boolean;
    cartContainsPurchaser: boolean;
    registrationInProgress: boolean;
    errorMessage: string;
    customRegistrationFields: CustomRegistrationFieldModel.CustomRegistrationField[];
    isJapanese: boolean;
    showCaptcha: boolean;
    discountCode: string;
    validDiscount: boolean[];
    discountChecked: boolean[];
    discountAmount: number;
    totalAmount: number;
    purchaseId: string;
    usStates: string[];
    addons: AddOn[];
    discounts: Discount[];
    last: boolean;
    useCaptcha: boolean;
    hasAddons: boolean;
    hasDiscounts: boolean;
    pendingRegistrations: PendingRegistrations[];
    processing: boolean;
    varAddress_ZipCodeMandatory: boolean;
    varAddress_ZipCodeOptional: boolean;
    varAddressOptional_ZipCodeMandatory: boolean;
    public timeZone: string = "America/Los_Angeles";
    varIsMandatoryNotFilled: boolean;

    private total = 0.0;
    private currencySymbol = "$";

    constructor(
        private eventService: EventService,
        private captchaService: CaptchaService,
        private route: ActivatedRoute,
        private router: Router,
        public labelsService: LabelsService,
        private sessionService: SessionService,
        private cartService: CartService
    ) {
        this.attendees = [];
        this.waitlistedAttendees = [];
        this.customRegistrationFields = [];
    }

    ngOnInit() {
        this.hasDiscounts = true;
        this.hasAddons = true;
        this.useCaptcha = environment.useCaptcha;
        this.last = false;
        this.varAddressOptional_ZipCodeMandatory;
        this.varAddress_ZipCodeMandatory;
        this.varAddress_ZipCodeOptional;
        // US states for dropdown
        this.usStates = states;
        this.showCaptcha = environment.useCaptcha;
        this.readableEventId = this.route.snapshot.queryParams["id"];
        this.loadEvent();
        //this.loadEventTimeStrings();

        this.validDiscount = [false];
        this.discountChecked = [false];
        this.discountAmount = 0;
        this.discounts = [];
        this.labelsService.getLabelsModel().subscribe((labelsModel) => {
            this.isJapanese = labelsModel.isJapanese;
        });
        this.eventService
            .getDiscounts(this.readableEventId)
            .subscribe((discounts) => {
                if (discounts.items.length <= 0) {
                    this.hasDiscounts = false;
                }
                this.discounts = discounts.items;
            });
        this.loadCustomRegistrationFields();

        this.eventService
            .getAddons(this.readableEventId)
            .subscribe((addons) => {
                // 2-D array to represent an attendee's chosen add-ons
                // Access: this.chosenAddons[attendee][add-on]
                // Should update in form: this.chosenAddons[attendee][add-on].quantity
                if (addons.items.length <= 0) {
                    this.hasAddons = false;
                }
                this.addons = addons.items;
                if (this.last) {
                    var homePhone = this.formatPhoneNumber(
                        sessionStorage.getItem("RegHomePhone")
                    );
                    var mobilePhone = this.formatPhoneNumber(
                        sessionStorage.getItem("RegMobilePhone")
                    );
                    var state = this.resolveState(
                        sessionStorage.getItem("RegState")
                    );
                    this.newAttendee(
                        sessionStorage.getItem("RegFirstName") &&
                            sessionStorage.getItem("RegFirstName") != "null"
                            ? sessionStorage.getItem("RegFirstName")
                            : "",
                        sessionStorage.getItem("RegLastName") &&
                            sessionStorage.getItem("RegLastName") != "null"
                            ? sessionStorage.getItem("RegLastName")
                            : "",
                        sessionStorage.getItem("RegLine1") &&
                            sessionStorage.getItem("RegLine1") != "null"
                            ? sessionStorage.getItem("RegLine1")
                            : "",
                        sessionStorage.getItem("RegLine2") &&
                            sessionStorage.getItem("RegLine2") != "null"
                            ? sessionStorage.getItem("RegLine2")
                            : "",
                        sessionStorage.getItem("RegCity") &&
                            sessionStorage.getItem("RegCity") != "null"
                            ? sessionStorage.getItem("RegCity")
                            : "",
                        state,
                        sessionStorage.getItem("RegZIP") &&
                            sessionStorage.getItem("RegZIP") != "null"
                            ? sessionStorage.getItem("RegZIP")
                            : "",
                        sessionStorage.getItem("RegEmail") &&
                            sessionStorage.getItem("RegEmail") != "null"
                            ? sessionStorage.getItem("RegEmail")
                            : "",
                        mobilePhone != "" ? mobilePhone : homePhone
                    );
                }
                this.last = true;
            });
    }

    public resolveState(state: string): string {
        state = state && state != "null" ? state : "";
        switch (state.toLowerCase()) {
            case "alabama":
                state = "AL";
                break;
            case "alaska":
                state = "AK";
                break;
            case "arizona":
                state = "AZ";
                break;
            case "arkansas":
                state = "AR";
                break;
            case "california":
                state = "CA";
                break;
            case "colorado":
                state = "CO";
                break;
            case "connecticut":
                state = "CT";
                break;
            case "delaware":
                state = "DE";
                break;
            case "florida":
                state = "FL";
                break;
            case "georgia":
                state = "GA";
                break;
            case "hawaii":
                state = "HI";
                break;
            case "idaho":
                state = "ID";
                break;
            case "illinois":
                state = "IL";
                break;
            case "indiana":
                state = "IN";
                break;
            case "iowa":
                state = "IA";
                break;
            case "kansas":
                state = "KS";
                break;
            case "kentucky":
                state = "KY";
                break;
            case "louisiana":
                state = "LA";
                break;
            case "maine":
                state = "ME";
                break;
            case "maryland":
                state = "MD";
                break;
            case "massachusetts":
                state = "MA";
                break;
            case "michigan":
                state = "MI";
                break;
            case "minnesota":
                state = "MN";
                break;
            case "mississippi":
                state = "MS";
                break;
            case "missouri":
                state = "MO";
                break;
            case "montana":
                state = "MT";
                break;
            case "nebraska":
                state = "NE";
                break;
            case "nevada":
                state = "NV";
                break;
            case "new hampshire":
                state = "NH";
                break;
            case "new jersey":
                state = "NJ";
                break;
            case "new mexico":
                state = "NM";
                break;
            case "new york":
                state = "NY";
                break;
            case "north carolina":
                state = "NC";
                break;
            case "north dakota":
                state = "ND";
                break;
            case "ohio":
                state = "OH";
                break;
            case "oklahoma":
                state = "OK";
                break;
            case "oregon":
                state = "OR";
                break;
            case "pennsylvania":
                state = "PA";
                break;
            case "rhode island":
                state = "RI";
                break;
            case "south carolina":
                state = "SC";
                break;
            case "south dakota":
                state = "SD";
                break;
            case "tennessee":
                state = "TN";
                break;
            case "texas":
                state = "TX";
                break;
            case "utah":
                state = "UT";
                break;
            case "vermont":
                state = "VT";
                break;
            case "virginia":
                state = "VA";
                break;
            case "washington":
                state = "WA";
                break;
            case "west virginia":
                state = "WV";
                break;
            case "wisconsin":
                state = "WI";
                break;
            case "wyoming":
                state = "WY";
                break;
            case "american samoa":
                state = "AS";
                break;
            case "district of columbia":
                state = "DC";
                break;
            case "federated states of micronesia":
                state = "FM";
                break;
            case "guam":
                state = "GU";
                break;
            case "marshall islands":
                state = "MH";
                break;
            case "northern mariana islands":
                state = "MP";
                break;
            case "palau":
                state = "PW";
                break;
            case "puerto rico":
                state = "PR";
                break;
            case "virgin islands":
                state = "VI";
                break;
            default:
                break;
        }
        if (this.usStates.includes(state)) {
            return state;
        } else {
            return "";
        }
    }

    public formatPhoneNumber(pn) {
        var nvsTmp = pn;
        if (
            pn != null &&
            pn.toLowerCase() != "null" &&
            pn.substring(0, 1) != "+"
        ) {
            nvsTmp = pn.replace(/[^0-9]/g, "");
            switch (nvsTmp.length) {
                case 10:
                    nvsTmp =
                        "(" +
                        nvsTmp.substr(0, 3) +
                        ")" +
                        nvsTmp.substr(3, 3) +
                        "-" +
                        nvsTmp.substr(6, 4);
                    break;
                case 11:
                    if (nvsTmp.substr(0, 1) == "1") {
                        nvsTmp =
                            "(" +
                            nvsTmp.substr(1, 3) +
                            ")" +
                            nvsTmp.substr(4, 3) +
                            "-" +
                            nvsTmp.substr(7, 4);
                    } else {
                        nvsTmp = pn;
                    }
                    break;
                default:
                    //alert("Phone must contain 10 numeric digits.");
                    break;
            }
        } else if (
            pn == null ||
            pn == undefined ||
            pn.toLowerCase() == "null"
        ) {
            nvsTmp = "";
        }
        return nvsTmp;
    }

    public getCityAndState() {
        if (this.attendees[this.attendees.length - 1].zip.length == 5) {
            if (this.attendees[this.attendees.length - 1].city == "") {
                if (this.attendees[this.attendees.length - 1].state == "") {
                    this.eventService
                        .getZIPCityState(
                            this.attendees[this.attendees.length - 1].zip
                        )
                        .subscribe(
                            (zip) => {
                                this.attendees[this.attendees.length - 1].city =
                                    zip.city;
                                this.attendees[
                                    this.attendees.length - 1
                                ].state = zip.state;
                            },
                            (error) => console.error(error)
                        );
                }
            }
        }
    }

    public toProperCase(s) {
        return s.toLowerCase().replace(/^(.)|\s(.)/g, function ($1) {
            return $1.toUpperCase();
        });
    }

    public namesOnBlur(field) {
        if (
            field == "first" &&
            this.attendees[this.attendees.length - 1].firstName.length > 0
        ) {
            this.attendees[this.attendees.length - 1].firstName =
                this.toProperCase(
                    this.attendees[this.attendees.length - 1].firstName
                );
        }
        if (
            field == "last" &&
            this.attendees[this.attendees.length - 1].lastName.length > 0
        ) {
            this.attendees[this.attendees.length - 1].lastName =
                this.toProperCase(
                    this.attendees[this.attendees.length - 1].lastName
                );
        }
    }

    public routetoEvent(readableEventId: string) {
        this.router.navigateByUrl("/event?id=" + readableEventId);
    }

    public clearForms(): void {
        let selectorResults = document.querySelectorAll(
            ".event-customregistrationsfields-container input"
        );
        let selectorResult: any;
        let i: number;
        for (i = 0; i < selectorResults.length; i++) {
            selectorResult = selectorResults[i];
            selectorResult.value = "";
            selectorResult.dispatchEvent(new Event("input"));
        }

        selectorResults = document.querySelectorAll(
            ".event-customregistrationsfields-container input:checked"
        );
        for (i = 0; i < selectorResults.length; i++) {
            selectorResult = selectorResults[i];
            selectorResult.checked = false;
        }

        selectorResults = document.querySelectorAll(
            ".event-customregistrationsfields-container select"
        );
        for (i = 0; i < selectorResults.length; i++) {
            selectorResult = selectorResults[i];
            selectorResult.selectedIndex = 0;
        }
    }

    // Add new attendee to list of attendees for this class registration instance
    public newAttendee(
        fn = "",
        ln = "",
        al1 = "",
        al2 = "",
        city = "",
        state = "",
        zip = "",
        email = "",
        phone = "",
        $top = null
    ): void {
        this.incrementPasses();
        if ($top) {
            $top.scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest",
            });
        }
        //this.validateDiscountCode = false;
        //this.discountCode = null;
        this.attendees.push({
            firstName: fn,
            lastName: ln,
            addressLine1: al1,
            addressLine2: al2,
            city: city,
            state: state,
            zip: zip,
            phone: this.formatPhoneNumber(phone),
            email: email,
            passId:
                this.passes && this.passes.length == 1
                    ? this.passes[0].passId
                    : "",
            pass: null,
            waitlisted: false,
            autoRegister: false,
            responses: [],
            chosenAddons: [],
            selectedDiscount: null,
        });
        const index =
            this.attendees.length !== 0 ? this.attendees.length - 1 : 0;
        this.discountChecked[index] = false;
        this.addons.forEach((addon) => {
            this.attendees[index].chosenAddons.push({
                name: addon.name,
                productid: addon.productid,
                quantity: 0,
                type: addon.type,
                price: addon.price,
            });
        });
    }

    public handleAddressClick(index) {
        if (
            (index == null || index == 0) &&
            this.cartService != null &&
            this.cartService.getItemList() != null &&
            this.cartService.getItemList()[0] != null &&
            this.cartService.getItemList()[0].attendee != null
        ) {
            this.attendees[0].addressLine1 =
                this.cartService.getItemList()[0].attendee.addressLine1;
            this.attendees[0].addressLine2 =
                this.cartService.getItemList()[0].attendee.addressLine2;
            this.attendees[0].city =
                this.cartService.getItemList()[0].attendee.city;
            this.attendees[0].state =
                this.cartService.getItemList()[0].attendee.state;
            this.attendees[0].zip =
                this.cartService.getItemList()[0].attendee.zip;
        } else {
            this.attendees[index].addressLine1 = this.attendees[0].addressLine1;
            this.attendees[index].addressLine2 = this.attendees[0].addressLine2;
            this.attendees[index].city = this.attendees[0].city;
            this.attendees[index].state = this.attendees[0].state;
            this.attendees[index].zip = this.attendees[0].zip;
        }
    }

    public incrementPasses(): void {
        this.passesUsed = 0;
        if (this.attendees != undefined && this.passes != undefined) {
            if (this.attendees.length == 1) {
                this.passes.forEach((pass) => {
                    this.attendees.forEach((attendee) => {
                        if (pass.passId === attendee.passId) {
                            if (pass.numberOfPassesLeft === 0) {
                                this.cartContainsWaitlister = true;
                            } else {
                                pass.passesUsed += 1;
                                this.passesUsed += 1;
                                this.cartContainsPurchaser = true;
                            }
                        }
                    });
                });
                if (this.cartContainsWaitlister == true) {
                    this.excludePurchasePasses();
                } else if (this.cartContainsPurchaser == true) {
                    this.excludeWaitlistPasses();
                }
            } else {
                this.passes.forEach((pass) => {
                    pass.passesUsed = 0;
                    this.attendees.forEach((attendee) => {
                        if (pass.passId === attendee.passId) {
                            if (pass.numberOfPassesLeft > 0) {
                                pass.passesUsed += 1;
                                this.passesUsed += 1;
                            }
                        }
                    });
                });
            }
        }
    }

    // route to home page
    public goToHome(): void {
        if (this.processing == true) {
            return;
        } else if (this.errorMessage) {
            this.router.navigateByUrl("/home");
        } else {
            this.processing = true;
            this.register("/home");
        }
    }

    // Add Class attendee info, chosen Pass info, and add-on info to Cart
    public addToCart(url, purchaseId, numRegistrants, attendee): void {
        // there needs to be at last one attendee
        if (!(this.attendees && this.attendees.length)) {
            return;
        }

        if (url === "/event/confirmation") {
            //const cart: CartItem[] = [];
            const cartItem = <CartItem>{
                attendee: attendee,
                event: this.event,
                purchaseId: purchaseId,
            };
            //cart.push(cartItem);
            //this.cartService.addToWaitlist(cart);
            this.cartService.addItemToWaitlist(cartItem);
        } else {
            const cartItem = <CartItem>{
                attendee: attendee,
                event: this.event,
                purchaseId: purchaseId,
            };
            this.cartService.addItem(cartItem);
        }
        if (numRegistrants === this.attendees.length) {
            this.router.navigateByUrl(url);
        }
    }

    // route to cart
    public goToCart(): void {
        if (this.processing == true) {
            return;
        } else if (this.errorMessage) {
            this.router.navigateByUrl("/cart");
        } else {
            this.processing = true;
            this.register("/cart");
        }
    }

    private loadEvent(): void {
        this.eventService.getEvent(this.readableEventId).subscribe(
            (event) => {
                this.event = event;
                const date = new Date();
                if (
                    event.timeZoneName.includes(
                        "Chennai, Kolkata, Mumbai, New Delhi"
                    )
                ) {
                    this.timeZone = "Asia/Kolkata";
                } else if (event.timeZoneName.includes("Alaska")) {
                    this.timeZone = "US/Alaska";
                } else if (
                    event.timeZoneName.includes("Pacific Time (US & Canada)")
                ) {
                    this.timeZone = "US/Pacific";
                } else if (
                    event.timeZoneName.includes("Mountain Time (US & Canada)")
                ) {
                    this.timeZone = "US/Mountain";
                } else if (
                    event.timeZoneName.includes("Eastern Time (US & Canada)")
                ) {
                    this.timeZone = "US/Eastern";
                } else if (
                    event.timeZoneName.includes("Central Time (US & Canada)")
                ) {
                    this.timeZone = "US/Central";
                } else if (event.timeZoneName.includes("Hawaii")) {
                    this.timeZone = "US/Hawaii";
                } else {
                    this.timeZone = "America/Los_Angeles";
                }
                const pst = date.toLocaleString("en-US", {
                    timeZone: this.timeZone,
                });
            
                if (this.event.customFields.psjh_isaddresszipcodeempty) {
                    if (
                        this.event.customFields
                            .psjh_addresszipcoderequirementoption.Value ===
                        100000000
                    ) {
                        this.eventService.setvarAddress_ZipCodeMandatory(true);
                        this.varAddress_ZipCodeMandatory =
                            this.eventService.getvarAddress_ZipCodeMandatory();
                    } else if (
                        this.event.customFields
                            .psjh_addresszipcoderequirementoption.Value ===
                        100000001
                    ) {
                        this.eventService.setvarAddress_ZipCodeOptional(true);
                        this.varAddress_ZipCodeOptional =
                            this.eventService.getvarAddress_ZipCodeOptional();
                    } else if (
                        this.event.customFields
                            .psjh_addresszipcoderequirementoption.Value ===
                        100000002
                    ) {
                        this.eventService.SetvarAddressOptional_ZipCodeMandatory(
                            true
                        );
                        this.varAddressOptional_ZipCodeMandatory =
                            this.eventService.getvarAddressOptional_ZipCodeMandatory();
                    }
                } else {
                    this.eventService.setvarAddress_ZipCodeMandatory(true);
                    this.varAddress_ZipCodeMandatory =
                        this.eventService.getvarAddress_ZipCodeMandatory();
                }
                if (!this.event.customFields.psjh_ispublished) {
                    this.errorMessage = "This class is currently unavailable.";
                } else if (new Date(this.event.startDate) < new Date(pst)) {
                    this.expired = true;
                    this.errorMessage =
                        "This class as already begun and is accepting no new registrations.";
                } else {
                    this.expired = false;
                }
                if (this.event) {
                    this.loadEventRegistrationCount();
                    this.loadEventPasses();
                }
            },
            (error) => console.error(error)
        );
    }

    private marryEventAndEventTimeStrings(): void {
        if (this.event != null && this.event != undefined) {
            if (
                this.eventtimestrings != null &&
                this.eventtimestrings != undefined
            ) {
                for (const eventtimestrings of this.eventtimestrings) {
                    if (this.event.eventId == eventtimestrings.id) {
                        this.event.startDateString =
                            eventtimestrings.startTimeString;
                        this.event.endDateString =
                            eventtimestrings.endTimeString;
                    }
                }
            }
        }
    }

    private loadCustomRegistrationFields() {
        this.eventService
            .getCustomRegistrationFields(this.readableEventId)
            .subscribe(
                (customRegistrationFields) => {
                    this.customRegistrationFields = customRegistrationFields;
                    if (this.last) {
                        var homePhone = this.formatPhoneNumber(
                            sessionStorage.getItem("RegHomePhone")
                        );
                        var mobilePhone = this.formatPhoneNumber(
                            sessionStorage.getItem("RegMobilePhone")
                        );
                        var state = this.resolveState(
                            sessionStorage.getItem("RegState")
                        );
                        this.newAttendee(
                            sessionStorage.getItem("RegFirstName") &&
                                sessionStorage.getItem("RegFirstName") != "null"
                                ? sessionStorage.getItem("RegFirstName")
                                : "",
                            sessionStorage.getItem("RegLastName") &&
                                sessionStorage.getItem("RegLastName") != "null"
                                ? sessionStorage.getItem("RegLastName")
                                : "",
                            sessionStorage.getItem("RegLine1") &&
                                sessionStorage.getItem("RegLine1") != "null"
                                ? sessionStorage.getItem("RegLine1")
                                : "",
                            sessionStorage.getItem("RegLine2") &&
                                sessionStorage.getItem("RegLine2") != "null"
                                ? sessionStorage.getItem("RegLine2")
                                : "",
                            sessionStorage.getItem("RegCity") &&
                                sessionStorage.getItem("RegCity") != "null"
                                ? sessionStorage.getItem("RegCity")
                                : "",
                            state,
                            sessionStorage.getItem("RegZIP") &&
                                sessionStorage.getItem("RegZIP") != "null"
                                ? sessionStorage.getItem("RegZIP")
                                : "",
                            sessionStorage.getItem("RegEmail") &&
                                sessionStorage.getItem("RegEmail") != "null"
                                ? sessionStorage.getItem("RegEmail")
                                : "",
                            mobilePhone != "" ? mobilePhone : homePhone
                        );
                    }
                    this.last = true;
                },
                (error) => console.error(error)
            );
    }

        private loadEventPasses(): void {
        console.log('[EventRegistrationComponent.loadEventPasses] Loading passes for event:', this.event.eventId);
        
        // Use the eventId from the already loaded event
        this.eventService.getPasses(this.event.eventId).subscribe(
            (passes) => {
                const displayPasses = [];
                passes.forEach((pass) => {
                    if (
                        pass.numberOfPassesLeft > 0 ||
                        this.event.showWaitlist
                    ) {
                        displayPasses.push(pass);
                    }
                });
                this.passes = displayPasses;
                for (const pass of this.passes) {
                    pass.passesUsed = 0;
                }
                if (passes.length == 1) {
                    this.attendees[0].passId = passes[0].passId;
                }
                
                console.log('[EventRegistrationComponent.loadEventPasses] Passes loaded:', this.passes.length);
            },
            (error) => {
                console.error('[EventRegistrationComponent.loadEventPasses] Error loading passes:', error);
            }
        );
        
        this.eventService
            .getPendingRegistrations(this.readableEventId)
            .subscribe(
                (pendingRegistrations) => {
                    this.pendingRegistrations = pendingRegistrations.items || [];
                    this.pendingRegistrationCount = 0;
                    for (const pendReg of this.pendingRegistrations) {
                        this.pendingRegistrationCount +=
                            pendReg.pendingRegistrationsCount;
                    }
                    if (
                        this.event.maxCapacity -
                            this.event.customFields.msevtmgt_registrationcount -
                            this.pendingRegistrationCount <=
                            0 &&
                        !this.event.showWaitlist
                    ) {
                        this.errorMessage =
                            "This event has just been filled and is no longer accepting registrations.";
                    }
                    
                    console.log('[EventRegistrationComponent.loadEventPasses] Pending registrations loaded:', this.pendingRegistrationCount);
                },
                (error) => {
                    console.error('[EventRegistrationComponent.loadEventPasses] Error loading pending registrations:', error);
                    this.pendingRegistrations = [];
                    this.pendingRegistrationCount = 0;
                }
            );
    }

    private excludeWaitlistPasses(): void {
        var passCount = this.passes.length;
        this.passes.forEach((pass, index) => {
            if (pass.numberOfPassesLeft === 0) {
                this.passes.splice(index, 1);
            }
        });
        if (passCount != this.passes.length) {
            this.excludeWaitlistPasses();
        }
    }

    private excludePurchasePasses(): void {
        var passCount = this.passes.length;
        this.passes.forEach((pass, index) => {
            if (pass.numberOfPassesLeft > 0) {
                this.passes.splice(index, 1);
            }
        });
        if (passCount != this.passes.length) {
            this.excludePurchasePasses();
        }
    }

    private loadEventRegistrationCount(): void {
        this.eventService
            .getEventRegistrationCount(this.readableEventId)
            .subscribe(
                (registrationCount) => {
                    this.registrationCount = registrationCount;
                },
                (error) => console.error(error)
            );
    }

    public dataLoaded(): boolean {
        return (
            this.attendees.length > 0 &&
            (!this.hasDiscounts || this.discounts.length > 0) &&
            (this.addons.length > 0 || !this.hasAddons)
        );
    }

    private getOptions(str: string): string[] {
        return str.split("\u000a");
    }

    private showWaitlist(): boolean {
        if (!this.paidEvent()) {
            return (
                this.event.showWaitlist &&
                this.event.maxCapacity !== null &&
                this.isAttendeeCountExceedingEventCapacity()
            );
        }

        return (
            this.event.showWaitlist &&
            (this.allPassesSoldOut() ||
                this.isAttendeeCountExceedingEventCapacity())
        );
    }

    private isAttendeeCountExceedingEventCapacity(): boolean {
        return (
            this.attendees.length + this.registrationCount >=
            this.event.maxCapacity
        );
    }

    private allPassesSoldOut(): boolean {
        for (const pass of this.passes) {
            if (pass.numberOfPassesLeft > pass.passesUsed) {
                return false;
            }
        }

        return true;
    }

    private onePassLeft(): boolean {
        this.getCityAndState();
        this.passesLeft = 0;
        this.passesUsed = 0;
        this.roomLeft =
            this.event.maxCapacity -
            this.event.customFields.msevtmgt_registrationcount;
        for (const pass of this.passes) {
            if (this.roomLeft - this.pendingRegistrationCount <= 0) {
                this.roomLeft = 0;
                pass.numberOfPassesLeft = 0;
                if (!this.event.showWaitlist) {
                    this.errorMessage =
                        "This event has just been filled and is no longer accepting registrations.";
                }
            } else {
                this.passesLeft += pass.numberOfPassesLeft - pass.passesUsed;
                this.passesUsed += pass.passesUsed;
            }
        }
        if (
            this.passesLeft == 1 ||
            (this.passesLeft > 1 && this.roomLeft - this.passesUsed == 1)
        ) {
            return true;
        } else {
            return false;
        }
    }

    private addResponsesToAttendee(
        attendee: Attendee,
        index: number
    ): Attendee {
        attendee.responses = [];
        let fieldId, type;
        let checkboxChecked;
        for (const next of this.customRegistrationFields) {
            let fieldValue = "";
            fieldId = next.customRegistrationFieldId;
            type = next.type;
            if (type === CustomRegistrationFieldModel.Types.Boolean) {
                const id = fieldId.toString() + index.toString();
                checkboxChecked = (<any>document.getElementById(id)).checked;
                fieldValue = checkboxChecked ? "Yes" : "No";
            } else {
                const id = fieldId.toString() + index.toString();
                fieldValue = (<any>document.getElementById(id)).value;
            }

            const customRegistrationResponse: CustomRegistrationFieldResponse =
                {
                    id: fieldId,
                    value: fieldValue,
                };

            attendee.responses.push(customRegistrationResponse);
        }
        return attendee;
    }

    private addAttendee(
        attendee: Attendee,
        waitlisted: boolean,
        index: number
    ): Attendee {
        if (waitlisted) {
            // this.waitlistedAttendees.push(attendee);
        } else {
            attendee = this.addResponsesToAttendee(attendee, index);
            return attendee;
        }

        this.updateTotal(null, attendee.passId);
    }

    /**
     * Finds the index of the first waitlisted attendee with a specified pass
     * @param passId The pass id
     */
    private indexOfFirstWaitlistedAttendeeWithPassId(passId: string) {
        return this.waitlistedAttendees.findIndex((a) => a.passId === passId);
    }

    /**
     * Event handler for the update attendee event of the attendee component
     * @param attendees An array of length 2, the first item being the attendee before the update operation,
     * the second is the attendee after the update
     * @param waitlisted Whether the attendee updated is in the waitlist or not
     */
    private updateAttendee(
        attendees: Attendee[],
        waitlisted: boolean,
        i: number
    ): void {
        const index = this.findAttendeeIndex(attendees[0], waitlisted);
        if (index !== -1) {
            if (waitlisted) {
                this.waitlistedAttendees[index] = attendees[1];
            } else {
                const attendee = this.addResponsesToAttendee(attendees[1], i);
                this.attendees[index] = attendee;
                this.clearForms();
            }

            this.updateTotal(attendees[0].passId, attendees[1].passId);
        }
    }

    /**
     * Finds the index of the attendee
     * @param attendee The attendee
     * @param waitlisted If true the waitlisted attendee list will be searched, otherwise the attendee list
     */
    private findAttendeeIndex(attendee: Attendee, waitlisted: boolean): number {
        return waitlisted
            ? this.waitlistedAttendees.findIndex(
                  (a) =>
                      a.firstName === attendee.firstName &&
                      a.lastName === attendee.lastName &&
                      a.email === attendee.email
              )
            : this.attendees.findIndex(
                  (a) =>
                      a.firstName === attendee.firstName &&
                      a.lastName === attendee.lastName &&
                      a.email === attendee.email
              );
    }

    private updateTotal(passIdToRemove: string, passIdToAdd: string): void {
        if (passIdToRemove != null) {
            this.total -= this.findPassValue(passIdToRemove);
        }

        if (passIdToAdd != null) {
            this.total += this.findPassValue(passIdToAdd);
        }
    }

    private findPassValue(passId: string): number {
        const pass: Pass = this.passes.find((p) => p.passId === passId);
        if (pass) {
            this.currencySymbol = pass.currencySymbol;
            return pass.price;
        } else {
            return 0.0;
        }
    }
    private IsAllRequiredCustomFieldsFilled(attendee: Attendee, index: number): boolean {
        attendee.responses = [];
        let fieldId, type, isRequired;
        for (const next of this.customRegistrationFields) {
            fieldId = next.customRegistrationFieldId;
            type = next.type;
            isRequired = next.isRequired;
            if(isRequired) {
                const id = fieldId.toString() + index.toString();
                if (type === CustomRegistrationFieldModel.Types.Boolean) {
                    if(!(<any>document.getElementById(id)).checked) {
                            return false;
                    }
                } 
                else {
                    if((<any>document.getElementById(id)).value == '') {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private showUp(): void { window.scroll(0,0); }

    private validateCustomFieldsOnChange(): boolean {
        let isValid = true;
        this.attendees.forEach((attendee, index) => {
            let isfilled = this.IsAllRequiredCustomFieldsFilled(attendee, index);
            if(!isfilled) {
               isValid = isfilled;
               this.varIsMandatoryNotFilled = true;
             }
             else {
                this.varIsMandatoryNotFilled = false;
                this.errorMessage = null;
                this.processing = false;
             }
         });
         return isValid;
    }

    private validateCustomFields(): boolean {
        let isValid = true;
        this.attendees.forEach((attendee, index) => {
            let isfilled = this.IsAllRequiredCustomFieldsFilled(attendee, index);
            if(!isfilled) {
               isValid = isfilled;
               this.varIsMandatoryNotFilled = true;
             }
             else {
                this.varIsMandatoryNotFilled = false;
                this.errorMessage = null;
             }
         });
         return isValid;
    }

    private register(url): void {
        let numRegistrants = 0;
        let numRegsRemaining = this.attendees.length;
        let isValid = true;
        // Required field validation
        isValid = this.validateCustomFields();
         
        if(!isValid){
              this.errorMessage = "please fill all the required custom registration fields";
              this.showUp();
              
         } else {
            this.attendees.forEach((attendee, index) => {
                this.attendees[index] = this.addAttendee(attendee, false, index);
                this.attendees[index].phone = this.formatPhoneNumber(
                    attendee.phone
                );
                this.passes.forEach((pass) => {
                    if (pass.passId === attendee.passId) {
                        attendee.pass = pass;
                        if (pass.numberOfPassesLeft === 0) {
                            attendee.waitlisted = true;
                        }
                    }
                });
                const addons: AddOn[] = [];
                attendee.chosenAddons.forEach((addon) => {
                    if (addon.quantity !== 0) {
                        addons.push(addon);
                    }
                });
                attendee.chosenAddons = addons;

                let hipObjectResult: HipObject = CaptchaService.EmptyHipObject;
                hipObjectResult = this.captchaService.getHipObject();
                this.sessionService.setCaptcha(hipObjectResult);
                if (this.paidEvent()) {
                    this.sessionService.setCaptcha(hipObjectResult);
                }
                const registrationData: RegistrationData = {
                    attendees: [attendee],
                    hipObject: hipObjectResult,
                };

                const reservationData: ReservationData = {
                    passId: "",
                    firstName: "",
                    lastName: "",
                    purchaseId: "",
                };

                if (!environment.useCaptcha) {
                    registrationData.hipObject = null;
                }

                this.registrationInProgress = true;

                this.eventService
                    .registerToEvent(this.readableEventId, registrationData)
                    .subscribe(
                        (registrationResult) => {
                            if (registrationResult.status === "Success") {
                                numRegistrants++;
                                if (numRegistrants === this.attendees.length) {
                                    this.addToCart(
                                        "/event/confirmation",
                                        null,
                                        numRegistrants,
                                        attendee
                                    );
                                }
                                //this.addToCart(url, null, numRegistrants, attendee);
                            } else if (registrationResult.status === "Initiated") {
                                if (!attendee.waitlisted) {
                                    reservationData.passId =
                                        attendee.pass.passId.toString();
                                    reservationData.firstName = attendee.firstName;
                                    reservationData.lastName = attendee.lastName;
                                    reservationData.purchaseId =
                                        registrationResult.purchaseId.toString();
                                    this.eventService
                                        .reserveEventRegistration(
                                            this.readableEventId,
                                            reservationData
                                        )
                                        .subscribe(
                                            (reservationResult) => {
                                                numRegsRemaining--;
                                                if (
                                                    reservationResult.success.toString() !=
                                                    "true"
                                                ) {
                                                    this.errorMessage =
                                                        "Unable to reserve registration for " +
                                                        attendee.firstName +
                                                        " " +
                                                        attendee.lastName +
                                                        " for " +
                                                        this.event.eventName;
                                                    if (numRegsRemaining == 0) {
                                                        this.processing = false;
                                                    }
                                                } else {
                                                    numRegistrants++;
                                                    if (numRegsRemaining == 0) {
                                                        this.processing = false;
                                                    }
                                                    this.addToCart(
                                                        url,
                                                        registrationResult.purchaseId,
                                                        numRegistrants,
                                                        attendee
                                                    );
                                                }
                                            },
                                            (error) => {
                                                this.errorMessage = error.message;
                                                numRegsRemaining--;
                                                if (numRegsRemaining == 0) {
                                                    this.processing = false;
                                                }
                                            }
                                        )
                                        .add(() => {});
                                } else {
                                    numRegistrants++;
                                    numRegsRemaining--;
                                    if (numRegsRemaining == 0) {
                                        this.processing = false;
                                    }
                                    this.addToCart(
                                        url,
                                        registrationResult.purchaseId,
                                        numRegistrants,
                                        attendee
                                    );
                                }
                            } else if (registrationResult.status === "Redirect") {
                                if (!attendee.waitlisted) {
                                    reservationData.passId =
                                        attendee.pass.passId.toString();
                                    reservationData.firstName = attendee.firstName;
                                    reservationData.lastName = attendee.lastName;
                                    reservationData.purchaseId =
                                        registrationResult.purchaseId.toString();
                                    this.eventService
                                        .reserveEventRegistration(
                                            this.readableEventId,
                                            reservationData
                                        )
                                        .subscribe(
                                            (reservationResult) => {
                                                numRegsRemaining--;
                                                if (
                                                    reservationResult.success.toString() !=
                                                    "true"
                                                ) {
                                                    this.errorMessage =
                                                        "Unable to reserve registration for " +
                                                        attendee.firstName +
                                                        " " +
                                                        attendee.lastName +
                                                        " for " +
                                                        this.event.eventName;
                                                    if (numRegsRemaining == 0) {
                                                        this.processing = false;
                                                    }
                                                } else {
                                                    numRegistrants++;
                                                    if (numRegsRemaining == 0) {
                                                        this.processing = false;
                                                    }
                                                    this.addToCart(
                                                        url,
                                                        registrationResult.purchaseId,
                                                        numRegistrants,
                                                        attendee
                                                    );
                                                }
                                            },
                                            (error) => {
                                                this.errorMessage = error.message;
                                                numRegsRemaining--;
                                                if (numRegsRemaining == 0) {
                                                    this.processing = false;
                                                }
                                            }
                                        )
                                        .add(() => {});
                                } else {
                                    numRegistrants++;
                                    numRegsRemaining--;
                                    if (numRegsRemaining == 0) {
                                        this.processing = false;
                                    }
                                    this.addToCart(
                                        url,
                                        registrationResult.purchaseId,
                                        numRegistrants,
                                        attendee
                                    );
                                    // window.location.href = registrationResult.redirectUrl + '&total=' + this.total;
                                }
                            } else {
                                this.errorMessage = registrationResult.errorMessage;
                                numRegsRemaining--;
                                if (numRegsRemaining == 0) {
                                    this.processing = false;
                                }
                            }
                        },
                        (error) => {
                            this.errorMessage = error.message;
                            numRegsRemaining--;
                            if (numRegsRemaining == 0) {
                                this.processing = false;
                            }
                        }
                    )
                    .add(() => {
                        if (numRegistrants === this.attendees.length) {
                            this.registrationInProgress = false;
                            this.processing = false;
                        }
                    });
            });
        }
    }

    private paidEvent(): boolean {
        return this.passes.length > 0;
    }

    private autoregisterWaitlistItems(): boolean {
        return this.event.autoregisterWaitlistItems;
    }

    private showAutomaticRegistrationCheckbox(): boolean {
        return this.event.showAutomaticRegistrationCheckbox;
    }

    private calculateMultipleCheckboxes(index: number): void {
        let fieldId, type, choices;
        let checkboxChecked, choicesArray;

        for (const next of this.customRegistrationFields) {
            let fieldValue = "";
            fieldId = next.customRegistrationFieldId;
            type = next.type;
            if (type === CustomRegistrationFieldModel.Types.MultipleChoice) {
                choices = next.choices;
                choicesArray = this.getOptions(choices);
                for (let i = 0; i < choicesArray.length; i++) {
                    checkboxChecked = (<any>(
                        document.getElementById(fieldId + "-" + i + index)
                    )).checked;
                    if (checkboxChecked) {
                        if (fieldValue !== "") {
                            fieldValue += ", ";
                        }
                        fieldValue += choicesArray[i];
                    }
                }

                const myInput: any = document.getElementById(fieldId + index);
                myInput.value = fieldValue;
                myInput.dispatchEvent(new Event("input"));
            }
        }
        this.validateCustomFieldsOnChange();
    }

    private validateDiscountCode(index: number): void {
        this.discountChecked[index] = true;
        this.discounts.forEach((discount) => {
            if (discount.code.includes("*")) {
                var regex =
                    discount.code.replace(
                        /\*/gi,
                        /\w/gi.source.substring(0, 2)
                    ) + "$";
                var regualrex = new RegExp("^" + regex);
                if (regualrex.test(this.discountCode)) {
                    this.validDiscount[index] = true;
                    this.discountAmount += discount.amount;
                    this.attendees[index].selectedDiscount = discount;
                    this.discountCode = "";
                }
            } else if (discount.code.includes("#")) {
                var regex =
                    discount.code.replace(
                        /\#/gi,
                        /\d/gi.source.substring(0, 2)
                    ) + "$";
                var regualrex = new RegExp("^" + regex);
                if (regualrex.test(this.discountCode)) {
                    this.validDiscount[index] = true;
                    this.discountAmount += discount.amount;
                    this.attendees[index].selectedDiscount = discount;
                    this.discountCode = "";
                }
            } else if (discount.code.includes("@")) {
                var regex =
                    discount.code.replace(
                        /\@/gi,
                        /[A-Za-z]/gi.source.substring(0, 8)
                    ) + "$";
                var regualrex = new RegExp("^" + regex);
                if (regualrex.test(this.discountCode)) {
                    this.validDiscount[index] = true;
                    this.discountAmount += discount.amount;
                    this.attendees[index].selectedDiscount = discount;
                    this.discountCode = "";
                }
            } else {
                if (this.discountCode === discount.code) {
                    this.validDiscount[index] = true;
                    this.discountAmount += discount.amount;
                    this.attendees[index].selectedDiscount = discount;
                    this.discountCode = "";
                }
            }
        });
    }

    private removeDiscountCode(index: number): void {
        this.attendees[index].selectedDiscount = null;
        this.discountCode = "";
        this.validDiscount[index] = false;
        this.discountChecked[index] = false;
    }

    private calculateAddOnTotal(): number {
        let total = 0;
        this.attendees.forEach((attendee) => {
            attendee.chosenAddons.forEach((addon) => {
                total += addon.quantity * addon.price;
            });
        });
        return total;
    }

    private calculateDiscountTotal(): number {
        this.discountAmount = 0;
        this.attendees.forEach((attendee) => {
            if (attendee.selectedDiscount) {
                if (attendee.selectedDiscount.type == "100000000") {
                    this.discountAmount += attendee.selectedDiscount.amount;
                } else if (attendee.selectedDiscount.type == "100000001") {
                    this.discountAmount +=
                        (attendee.selectedDiscount.percentage / 100) *
                        this.findPassValue(attendee.passId);
                }
            }
        });
        return this.discountAmount;
    }

    private calculateSubTotal(): number {
        let total = 0;
        this.attendees.forEach((attendee) => {
            if (attendee.passId) {
                total += this.findPassValue(attendee.passId);
            }
        });
        return total;
    }

    private calculateTotal(): number {
        return (
            this.calculateSubTotal() +
            this.calculateAddOnTotal() -
            this.calculateDiscountTotal()
        );
    }

    private removeAttendee(index): void {
        this.attendees.splice(index, 1);
    }
}
