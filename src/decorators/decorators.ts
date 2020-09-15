import { SimpleChanges } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

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
    const oldNgOnDestroy = target.constructor.prototype.ngOnDestroy;
    if (!oldNgOnDestroy) {
      throw new Error(
        `ngOnDestroy must be implemented for ${target.constructor.name}`
      );
    }

    const accessor = `${key}$`;
    const secret = `_${key}$`;

    Object.defineProperty(target, accessor, {
      get: function () {
        if (this[secret]) {
          return this[secret];
        }
        this[secret] = new Subject();
        return this[secret];
      }
    });
    Object.defineProperty(target, key, {
      get: function () {
        return this[accessor];
      },
      set: function () {
        throw new Error(
          'You cannot set this property in the Component if you use @Destroy.'
        );
      }
    });

    target.constructor.prototype.ngOnDestroy = function () {
      if (oldNgOnDestroy) {
        oldNgOnDestroy.apply(this, arguments);
      }
      this[accessor].next(true);
      this[accessor].complete();
    };
  };
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
    const oldNgOnChanges = target.constructor.prototype.ngOnChanges;

    if (!oldNgOnChanges) {
      throw new Error(
        `ngOnChanges must be implemented for ${target.constructor.name}`
      );
    }

    const stateSub = new ReplaySubject(1);
    const state = inputProp
      ? stateSub.pipe(
          filter(changes => !!changes && changes[inputProp]),
          map(changes => changes[inputProp].currentValue)
        )
      : stateSub.asObservable();

    // Object.defineProperty provides the value property as well.
    // The reason it's not used is because we want to display a meaningful message
    // to the consumer when he tries to mutate the property himself.
    // That would not be possible with the without the use of get and set.
    Object.defineProperty(target, key, {
      get: function () {
        return state;
      },
      set: function () {
        throw new Error(
          'You cannot set this property in the Component if you use @Changes.'
        );
      }
    });

    target.ngOnChanges = function (simpleChanges: SimpleChanges) {
      if (oldNgOnChanges) {
        oldNgOnChanges.apply(this, [simpleChanges]);
      }

      stateSub.next(simpleChanges);
    };
  };
}
