import { Session } from "./Session";
import {
    startOfDay,
    endOfDay,
    subDays,
    addDays,
    endOfMonth,
    isSameDay,
    isSameMonth,
    addHours
} from 'date-fns';
import {
    CalendarEvent,
    CalendarEventAction,
    CalendarEventTimesChangedEvent,
    CalendarView
} from 'angular-calendar';

const colors: any = {
    red: {
        primary: '#ad2121',
        secondary: '#FAE3E3'
    },
    blue: {
        primary: '#1e90ff',
        secondary: '#D1E8FF'
    },
    yellow: {
        primary: '#e3bc08',
        secondary: '#FDF1BA'
    }
};

export class SessionCalendar {
    public viewDate: Date = new Date();
    public calendarEvents: CalendarEvent[] = [];
    public activeDayIsOpen: boolean = false;
    public view: CalendarView = CalendarView.Month;

    constructor(private sessions: Session[]) {
        if (!(sessions && sessions.length)) {
            return;
        }

        this.initCalendarEvents(sessions);
    }

    initCalendarEvents(sessions: Session[]): void {
        sessions.forEach((session) => {
            let calEvent = <CalendarEvent>({
                start: startOfDay(session.startTime),
                end: endOfDay(session.endTime),
                title: session.name,
                color: colors.yellow,
                actions: null
            });

            this.calendarEvents.push(calEvent);
        });

        this.viewDate = new Date(sessions[0].startTime);
    }

    dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
        if (isSameMonth(date, this.viewDate)) {
            this.viewDate = date;
            if (
            (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
            events.length === 0
            ) {
            this.activeDayIsOpen = false;
            } else {
            this.activeDayIsOpen = true;
            }
        }
    }
}
