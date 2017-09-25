import { SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs';
import { Observable } from 'rxjs/Observable';

// These decorators are all about utils to turn lifecycle events into streams
/*
    The Destroy decorator creates a stream that gets nexted when the ngOnDestroy is being called.
    A use case might be to avoid memoryleaks by using the takeUntil operator
    @Component({
        selector: 'my-component',
        template: `...`,
    })
    export class HelloComponent {
        @Destroy() destroy$;

        constructor() {
            Observable.interval(500)
                .takeUntil(this.destroy$)
                .subscribe(e => console.log(e));
        }
    }
*/

export function Destroy() {
    return function (target: any, key: string) {
        const subject = new Subject();
        target[key] = subject.asObservable();
        const oldNgOnDestroy = target.ngOnDestroy;
        target.ngOnDestroy = () => {
            if (oldNgOnDestroy) {
                oldNgOnDestroy.call(target)
            }
            subject.next(true);
            subject.complete();
        }
    }
}

/*
    The Changes decorator creates a stream that gets nexted when the ngOnDestroy is being called.
    A use case might be to avoid memoryleaks by using the takeUntil operator
    @Component({
        selector: 'my-component',
        template: `...`,
    })
    export class HelloComponent {
        @Changes() changes$;

        constructor() {
            this.changes$.subscribe(e => console.log(e));
        }
    }
*/
export function Changes(inputProp?: string) {
    return function (target: any, key: string) {
        const subject = new Subject();
        target[key] = inputProp ? subject
            .filter(changes => !!changes && changes[inputProp] && changes[inputProp].currentValue)
            .map(changes => changes[inputProp].currentValue) : subject.asObservable();
        const oldNgOnChanges = target.ngOnChanges;
        if (!target._subjectsToNext) {
            target._subjectsToNext = [];
        }
        target._subjectsToNext.push(subject);
        target.ngOnChanges = (simpleChanges: SimpleChanges) => {
            if (oldNgOnChanges) {
                oldNgOnChanges();
            }
            target._subjectsToNext.forEach(sub => sub.next(simpleChanges));
        }
    }
}

/*
    @Component({
      selector: 'my-component',
      template: `
        <detail [detail]="..." (remove)="remove$.bind($event)"></detail>
      `
    })
    export class MyComponent {
      @ObserveOutput() remove$: Observable<string>;
    }
 */
export class BindableObservable<T> extends Observable<T> {
    static create<T>(): BindableObservable<T> {
        let observer;
        const stream$ = Observable.create((obs) => {
            observer = obs;
        });
        stream$.bind = (e) => {
            observer && observer.next(e);
        };
        return stream$;
    }
}

export function ObserveOutput() {
    return function(target: any, key: string) {
        target[key] = BindableObservable.create();
    }
}
