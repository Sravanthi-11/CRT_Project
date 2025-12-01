import { Injectable } from '@angular/core';
import { CartItem } from 'src/app/models/CartItem';
import { ReservationData } from 'src/app/models/ReservationData';
import { EventService } from 'src/app/services/event.service';
import { SessionStorageService } from 'ngx-webstorage';

@Injectable()
export class CartService {
  ITEM_STORE_KEY = 'shopping.cart';
  WAITLIST_KEY = 'waitlist';

  constructor(
    private localStore: SessionStorageService,
    private eventService: EventService
  ) {
    this._initCartStore();
  }

  private _initCartStore() {
    let itemList = (this.localStore.retrieve(this.ITEM_STORE_KEY) || []) as CartItem[];
    let waitlist = (this.localStore.retrieve(this.WAITLIST_KEY) || []) as CartItem[];

    if (!itemList) {
      itemList = [];
      this.localStore.store(this.ITEM_STORE_KEY, itemList);
    }

    if (!waitlist) {
      waitlist = [];
      this.localStore.store(this.WAITLIST_KEY, waitlist);
    }
  }

  public addItem(item: CartItem): void {
    if (!(item && item.event && item.attendee)) return;

    const itemList = (this.localStore.retrieve(this.ITEM_STORE_KEY) || []) as CartItem[];
    itemList.push(item);
    this.localStore.store(this.ITEM_STORE_KEY, itemList);
  }

  public addToWaitlist(items: CartItem[]): void {
    this.localStore.store(this.WAITLIST_KEY, items);
  }

  public addItemToWaitlist(item: CartItem): void {
    if (!(item && item.event && item.attendee)) return;

    const waitlist = (this.localStore.retrieve(this.WAITLIST_KEY) || []) as CartItem[];
    waitlist.push(item);
    this.localStore.store(this.WAITLIST_KEY, waitlist);
  }

  public emptyWaitlist(): void {
    this.localStore.clear(this.WAITLIST_KEY);
  }

  public removeItem(itemToRemove: CartItem): CartItem[] {
    if (!itemToRemove) return;

    if (itemToRemove.purchaseId) {
      const reservationData: ReservationData = {
        passId: "",
        firstName: "",
        lastName: "",
        purchaseId: itemToRemove.purchaseId
      };
      this.eventService.releaseReservation(itemToRemove.event.readableEventId, reservationData)
        .subscribe(console.log, console.error);
    }

    const itemList = (this.localStore.retrieve(this.ITEM_STORE_KEY) || []) as CartItem[];
    const filteredList = itemList.filter(cartItem =>
      !(cartItem.event.eventId === itemToRemove.event.eventId &&
        cartItem.attendee.passId === itemToRemove.attendee.passId &&
        cartItem.attendee.firstName === itemToRemove.attendee.firstName &&
        cartItem.attendee.lastName === itemToRemove.attendee.lastName &&
        cartItem.attendee.email === itemToRemove.attendee.email &&
        cartItem.purchaseId === itemToRemove.purchaseId)
    );

    this.localStore.store(this.ITEM_STORE_KEY, filteredList);
    return filteredList;
  }

  public getItemList(): CartItem[] {
    return (this.localStore.retrieve(this.ITEM_STORE_KEY) || []) as CartItem[];
  }

  public getItemCount(): number {
    return this.getItemList().length;
  }

  public getCartTotal(): number {
    const itemList = this.getItemList();
    return itemList.reduce((total, cartItem) => {
      if (cartItem?.attendee?.pass?.price) {
        return total + cartItem.attendee.pass.price;
      }
      return total;
    }, 0);
  }

  public getWaitlist(): CartItem[] {
    return (this.localStore.retrieve(this.WAITLIST_KEY) || []) as CartItem[];
  }

  public emptyCart(): void {
    const itemList = this.getItemList();

    itemList.forEach(cartItem => {
      if (cartItem?.purchaseId) {
        const reservationData: ReservationData = {
          passId: "",
          firstName: "",
          lastName: "",
          purchaseId: cartItem.purchaseId
        };
        this.eventService.releaseReservation(cartItem.event.readableEventId, reservationData)
          .subscribe(console.log, console.error);
      }
    });

    this.localStore.store(this.ITEM_STORE_KEY, []);
  }
}