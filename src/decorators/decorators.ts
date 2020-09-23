import { SimpleChanges } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';

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
          'You cannot set this property in the Component if you use @Destroy'
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

export function Changes(inputProp?: string, initialValue?: any) {
  return function (target: any, key: string): any {
    const oldNgOnChanges = target.constructor.prototype.ngOnChanges;

    if (!oldNgOnChanges) {
      throw new Error(
        `ngOnChanges must be implemented for ${target.constructor.name}`
      );
    }

    target.ngOnChanges = function (simpleChanges: SimpleChanges) {
      if (oldNgOnChanges) {
        oldNgOnChanges.apply(this, [simpleChanges]);
      }

      this[accessorSub].next(simpleChanges);
    };

    const secretSub = `_${key}$Sub`;
    const secretObs = `_${key}$Obs`;
    const accessorSub = `${key}$Sub`;
    const accessorObs = `${key}$Obs`;

    Object.defineProperty(target, accessorSub, {
      get: function () {
        if (this[secretSub]) {
          return this[secretSub];
        }

        this[secretSub] = new ReplaySubject(1);

        return this[secretSub];
      }
    });

    Object.defineProperty(target, accessorObs, {
      get: function () {
        if (this[secretObs]) {
          return this[secretObs];
        }

        this[secretObs] = inputProp
          ? this[accessorSub].pipe(
              filter(changes => !!changes && changes[inputProp]),
              map(changes => changes[inputProp].currentValue),
              s =>
                initialValue !== undefined ? s.pipe(startWith(initialValue)) : s
            )
          : this[accessorSub].asObservable();

        return this[secretObs];
      }
    });

    return {
      get: function () {
        return this[accessorObs];
      },
      set: function () {
        throw new Error(
          'You cannot set this property in the Component if you use @Changes'
        );
      }
    };
  };
}
