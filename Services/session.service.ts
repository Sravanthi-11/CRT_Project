import { Injectable } from '@angular/core';
import { HipObject } from './../models/HipObject';
import { environment } from '../../environments/environment';

@Injectable()
export class SessionService {
    private readonly captchaKey: string = environment.captchaStorageKey;
    private readonly purchaseIdKey: string = environment.purchaseIdStorageKey;

    constructor() {
    }

    public setCaptcha(captcha: HipObject) {
      sessionStorage.setItem(this.captchaKey, JSON.stringify(captcha));
    }

    public getCaptcha(): HipObject {
        return JSON.parse(sessionStorage.getItem(this.captchaKey));
    }

    public setPurchaseId(purchaseId: string) {
      sessionStorage.setItem(this.purchaseIdKey, purchaseId);
    }

    public getPurchaseId(): string {
        return sessionStorage.getItem(this.purchaseIdKey);
    }
}
