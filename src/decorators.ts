import { SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs';

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
        target[key] = new Subject();
        const oldNgOnDestroy = target.ngOnDestroy;
        target.ngOnDestroy = () => {
            if (oldNgOnDestroy) {
                oldNgOnDestroy();
            }
            target[key].next(true);
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
            .map(changes => changes[inputProp].currentValue) : subject;
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