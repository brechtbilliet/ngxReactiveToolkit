"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Subject_1 = require("rxjs/Subject");
require("rxjs");
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
function Destroy() {
    return function (target, key) {
        target[key] = new Subject_1.Subject();
        var oldNgOnDestroy = target.ngOnDestroy;
        target.ngOnDestroy = function () {
            if (oldNgOnDestroy) {
                oldNgOnDestroy();
            }
            target[key].next(true);
        };
    };
}
exports.Destroy = Destroy;
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
function Changes(inputProp) {
    return function (target, key) {
        var subject = new Subject_1.Subject();
        target[key] = inputProp ? subject
            .filter(function (changes) { return !!changes && changes[inputProp] && changes[inputProp].currentValue; })
            .map(function (changes) { return changes[inputProp].currentValue; }) : subject;
        var oldNgOnChanges = target.ngOnChanges;
        if (!target._subjectsToNext) {
            target._subjectsToNext = [];
        }
        target._subjectsToNext.push(subject);
        target.ngOnChanges = function (simpleChanges) {
            if (oldNgOnChanges) {
                oldNgOnChanges();
            }
            target._subjectsToNext.forEach(function (sub) { return sub.next(simpleChanges); });
        };
    };
}
exports.Changes = Changes;
//# sourceMappingURL=decorators.js.map