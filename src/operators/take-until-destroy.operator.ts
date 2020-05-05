import { MonoTypeOperatorFunction, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export function takeUntilDestroy<T>(instance: {
  [key: string]: any;
}): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => {
    const oldNgOnDestroy = instance.ngOnDestroy;

    if (!oldNgOnDestroy) {
      throw new Error(
        `ngOnDestroy must be implemented for ${instance.constructor.name}`
      );
    }

    if (!instance['__takeUntilDestroy$']) {
      instance['__takeUntilDestroy$'] = new Subject();
      instance.ngOnDestroy = function () {
        oldNgOnDestroy.apply(this, arguments);
        instance['__takeUntilDestroy$'].next();
        instance['__takeUntilDestroy$'].complete();
      };
    }

    return source.pipe(takeUntil<T>(instance['__takeUntilDestroy$']));
  };
}
