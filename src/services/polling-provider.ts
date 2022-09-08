import {asyncScheduler, delayWhen, from, Observable, retryWhen, Subject, tap, timer} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import { QueryResult } from 'gamedig';

export abstract class PollingProvider {
    private try = 1;
    private interval: number = 10000;
    private resultSubject = new Subject<QueryResult | undefined>();

    protected constructor() {
        timer(0, this.interval).pipe(
            switchMap(() => from(this.retrieve())),
            retryWhen((errors => {
                return errors.pipe(
                    tap(val => {
                        this.resultSubject.next(undefined);
                        if (this.try > 15) {
                            throw new Error('PollingProvider became unhealty, exiting... Check the configuration and make sure the game server is online.');
                        }
                        console.log('PollingProvider errored, retrying in ' + (this.try + 1) * 2 + ' seconds for max 15 tries (' + this.try + '. try). Error:', val.message);
                        this.try++;
                    }),
                    delayWhen(() => {
                        return timer(this.try * 2 * 1000, asyncScheduler);
                    }),
                );
            })),
            tap(() => {
                this.try = 1;
            }),
        ).subscribe((val) => this.resultSubject.next(val));
    }

    provide(): Observable<QueryResult | undefined> {
        return this.resultSubject.asObservable();
    }

    protected abstract retrieve(): Promise<QueryResult>;
}
