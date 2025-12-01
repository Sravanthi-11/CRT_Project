import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { CartItem } from 'src/app/models/CartItem';
import { Pass } from 'src/app/models/Pass';
import { Router } from '@angular/router';

@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.component.html',
    styleUrls: ['./confirmation.component.css'],
    standalone: false
})
export class ConfirmationComponent implements OnInit {

    public waitlist: CartItem[];
    public cart: CartItem[];
    public discountTotal: number;
    readableEventId: string;

    constructor(private cartService: CartService, private router: Router) { }

    ngOnInit() {
        this.waitlist = this.cartService.getWaitlist();
        if (this.waitlist.length === 0) {
            this.cart = this.cartService.getItemList();
            this.cartService.emptyCart();
        }
        this.cartService.emptyWaitlist();
        this.discountTotal = 0;
        const events = [];
        if (this.cart != undefined) {
            this.cart.forEach(item => {
                if (events.indexOf(item.event.readableEventId) === -1) {
                    events.push(item.event.readableEventId);
                }
                if (item.attendee.selectedDiscount) {
                    if (item.attendee.selectedDiscount.type == "100000000") {
                        this.discountTotal += item.attendee.selectedDiscount.amount;
                    } else if (item.attendee.selectedDiscount.type == "100000001") {
                        this.discountTotal += ((item.attendee.selectedDiscount.percentage / 100) * item.attendee.pass.price);
                    }
                }
            });
        }
    }

    public getPassDisplayString(pass: Pass): string {
        return `${pass.passName} (${pass.currencySymbol}${pass.price.toFixed(2)})`;
    }

    public getSubtotal(pass: Pass): number {
        return pass.price;
    }

    public routeToHome() {
        this.router.navigateByUrl('/home');
    }

    public routetoEvent(readableEventId: string) {
        this.router.navigateByUrl('/event?id=' + readableEventId);
    }

    // calculate subtotal
    public getPassSubtotal(): number {
        let subtotal = 0;
        this.cart.forEach(item => {
            subtotal += item.attendee.pass.price;
        });
        return subtotal;
    }

    public getAddOnSubtotal(): number {
        let total = 0;
        this.cart.forEach(item => {
            item.attendee.chosenAddons.forEach(addon => {
                total += addon.price * addon.quantity;
            });
        });
        return total;
    }

    public hasAddOns(): boolean {
        let hasAddOns = false;
        this.cart.forEach(item => {
            item.attendee.chosenAddons.forEach(addon => {
                if (addon.quantity > 0) {
                    hasAddOns = true;
                }
            });
        });
        return hasAddOns;
    }

}
