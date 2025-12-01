import { environment } from './../../environments/environment';
import { MyRegistration } from './../models/MyRegistration';
import { HttpHelper } from '../helpers/HttpHelper';
import { Injectable } from '@angular/core';
import { User } from '../models/User';
import { Observable, of, timer } from 'rxjs';
import { map, flatMap, shareReplay, catchError } from 'rxjs/operators';
import { AzureFunctionsService } from './azure-functions.service';

@Injectable()
export class UserService {

    public static readonly AnonymousUser: User = {
        fullName: '',
        isAnonymous: true
    };

    private static readonly usersEndpoint: string = environment.usersEndpoint;
    private static readonly timerPeriodInMillis: number = 15 * 60 * 1000; // 15 minutes

    private getLoggedInUserApiCall$: Observable<User>;

    constructor(
        private http: HttpHelper,
        private azureFunctionsService: AzureFunctionsService
    ) {
        this.getLoggedInUserApiCall$ = timer(0, UserService.timerPeriodInMillis)
            .pipe(
                flatMap(i => this.http.get<User>(`${environment.baseUrl}${UserService.usersEndpoint}/authenticated/`)),
                catchError(error => of(UserService.AnonymousUser)),
                shareReplay(1));
    }

    public getLoggedInUser(): Observable<User> {
        if (!environment.areUsersSupported) {
            return of(UserService.AnonymousUser);
        }

        return this.getLoggedInUserApiCall$;
    }

    public isLoggedIn(): Observable<boolean> {
        return this.getLoggedInUser().pipe(map(user => user != null && !user.isAnonymous));
    }

    public getRegistrationsForUser(confirmationCode: string): Observable<MyRegistration> {
        return this.http.get<MyRegistration>(`${environment.baseUrl}${UserService.usersEndpoint}/myregistrations/?confirmationCode=${confirmationCode}`);
    }

    /**
     * Cancel registration
     * UPDATED: Now uses Azure Functions API
     */
    public cancelRegistration(eventRegistrationId: string): Observable<boolean> {
        console.log('[UserService.cancelRegistration] Cancelling registration:', eventRegistrationId);
        return this.azureFunctionsService.cancelUserReg(eventRegistrationId).pipe(
            map(response => {
                // Assuming the response indicates success
                return true;
            }),
            catchError(error => {
                console.error('[UserService.cancelRegistration] Error:', error);
                return of(false);
            })
        );
    }

    public registerToSession(readableEventId: string, sessionId: string): Observable<boolean> {
        return this.http.post<boolean>(
            `${environment.baseUrl}${UserService.usersEndpoint}/registertosession/`,
            {
                'readableEventId': readableEventId,
                'sessionId': sessionId
            }
        );
    }

    /**
     * Get PEC caller information
     * UPDATED: Now uses Azure Functions API with GetPECContact
     */
    public getPECCallerInfo(pid: string): Observable<any> {
        console.log('[UserService.getPECCallerInfo] Fetching PEC contact info for:', pid);
        return this.azureFunctionsService.getPECContact(pid);
    }
}