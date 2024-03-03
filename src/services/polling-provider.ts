import { Observable, Subject, timer } from 'rxjs';
import { ServerResponse } from '../models/server-response';

export abstract class PollingProvider {
    private interval: number = 10000;
    private resultSubject = new Subject<ServerResponse[] | undefined>();

    protected constructor() {
        timer(0, this.interval).subscribe(
           () => this.retrieve().then(val => this.resultSubject.next(val))
        );
    }

    provide(): Observable<ServerResponse[] | undefined> {
        return this.resultSubject.asObservable();
    }

    protected abstract retrieve(): Promise<ServerResponse[]>;
}
