import { OnDestroy } from '@angular/core';
import { of } from 'rxjs';
import { takeUntilDestroy } from './take-until-destroy.operator';

describe('operator: takeUntilDestroy', () => {
  describe('on takeUntilDestroy()', () => {
    it('should create a stream __takeUntilDestroy$ and next on it', () => {
      class MyComponent implements OnDestroy {
        tmp$ = of('').pipe(takeUntilDestroy(this));

        ngOnDestroy(): void {}
      }

      const instance = new MyComponent();
      const results = [];
      instance['__takeUntilDestroy$'].subscribe(r => results.push(r));
      expect(results.length).toBe(0);
      instance.ngOnDestroy();
      instance.ngOnDestroy();
      expect(results.length).toBe(1);
    });

    it('should not override the old destroy method', () => {
      class MyComponent implements OnDestroy {
        tmp$ = of('').pipe(takeUntilDestroy(this));
        oldFnCalled = false;

        ngOnDestroy(): void {
          this.oldFnCalled = true;
        }
      }

      const instance = new MyComponent();
      instance.ngOnDestroy();
      expect(instance.oldFnCalled).toEqual(true);
    });

    it('should work with multiple instances', () => {
      class MyComponent implements OnDestroy {
        tmp$ = of('').pipe(takeUntilDestroy(this));

        ngOnDestroy(): void {}
      }

      const instance1DestroyResults = [];
      const instance2DestroyResults = [];
      const instance = new MyComponent();
      const instance2 = new MyComponent();
      instance['__takeUntilDestroy$'].subscribe(r =>
        instance1DestroyResults.push(r)
      );
      instance2['__takeUntilDestroy$'].subscribe(r =>
        instance2DestroyResults.push(r)
      );
      instance['ngOnDestroy']();
      expect(instance1DestroyResults.length).toBe(1);
      expect(instance2DestroyResults.length).toBe(0);
    });

    describe('given the ngOnDestroy is not implemented', () => {
      it('should throw an error', () => {
        expect(() => {
          class MyComponent {
            tmp$ = of('').pipe(takeUntilDestroy(this));
          }

          new MyComponent();
        }).toThrowError('ngOnDestroy must be implemented for MyComponent');
      });
    });
  });
});
