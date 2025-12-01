import { Injectable } from '@angular/core';
import { Event } from '../models/Event';
import { EventService } from '../services/event.service';
import { Session } from '../models/Session';
import { promise } from 'protractor';
import { SessionCalendar } from '../models/SessionCalendar';
import { reject } from 'q';

@Injectable()
export class EventCalendarService {

    constructor(private eventService: EventService) { }

    public getSessionCalendar(readableEventId: string): Promise<SessionCalendar> {
        let sessionCalendarPromise = new Promise<SessionCalendar>((resolve, reject) => {
            this.getSessionsForEvent(readableEventId).then((sessions) => {
                resolve(new SessionCalendar(sessions));
            }).catch((error) => {
                reject([]);
            });
        });

        return sessionCalendarPromise;
    }

    private getSessionsForEvent(readableEventId: string): Promise<Session[]> {
        let sessionsPromise = new Promise<Session[]>((resolve, reject) => {
            this.eventService.getSessions(readableEventId).subscribe(sessions => {
                sessions = sessions || [];
                sessions.forEach(s => {
                    s.startTime = new Date(s.startTime as any);
                    s.endTime = new Date(s.endTime as any);
                });
                resolve(sessions);
            }, 
            (error) => {
                reject(error);
            });
        }); 

        return sessionsPromise;
    }
}
