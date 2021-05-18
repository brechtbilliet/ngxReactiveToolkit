import {
  ɵPipeDef as PipeDef,
  ɵComponentDef as ComponentDef,
  ɵɵdefinePipe as definePipe,
  ɵɵdefineComponent as defineComponent
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';

import { callNgOnDestroy } from './utils';
import { takeUntilDestroy } from '../take-until-destroy.operator';
import { UntilDestroy } from '../until-destroy.decorator';

function createObserver() {
  return {
    next: jest.fn(),
    error: jest.fn(),
    complete: jest.fn()
  };
}

describe('takeUntilDestroy operator with non-directive/component classes', () => {
  it('should not destroy other instances', () => {
    const spy = createObserver();
    const spy2 = createObserver();

    class Test {
      subscription!: Subscription;

      destroy() {}

      subscribe(spy: ReturnType<typeof createObserver>) {
        this.subscription = new Subject()
          .pipe(takeUntilDestroy(this, 'destroy'))
          .subscribe(spy);
      }
    }

    const component1 = new Test();
    const component2 = new Test();
    component1.subscribe(spy);
    component2.subscribe(spy2);
    component1.destroy();
    expect(spy.complete).toHaveBeenCalledTimes(1);
    expect(spy2.complete).not.toHaveBeenCalled();
    component2.destroy();
    expect(spy2.complete).toHaveBeenCalledTimes(1);
  });

  it('should work with multiple observables', () => {
    const spy = createObserver();
    const spy2 = createObserver();
    const spy3 = createObserver();

    class Test {
      obs = new Subject()
        .pipe(takeUntilDestroy(this, 'destroy'))
        .subscribe(spy);
      obs2 = new Subject()
        .pipe(takeUntilDestroy(this, 'destroy'))
        .subscribe(spy2);
      obs3 = new Subject()
        .pipe(takeUntilDestroy(this, 'destroy'))
        .subscribe(spy3);

      destroy() {}
    }

    const instance = new Test();
    instance.destroy();
    expect(spy.complete).toHaveBeenCalledTimes(1);
    expect(spy2.complete).toHaveBeenCalledTimes(1);
    expect(spy3.complete).toHaveBeenCalledTimes(1);
  });

  describe('it should work anywhere', () => {
    const spy = createObserver();
    const spy2 = createObserver();
    const spy3 = createObserver();

    class LoginComponent {
      dummy = new Subject()
        .pipe(takeUntilDestroy(this, 'destroy'))
        .subscribe(spy);

      constructor() {
        new Subject().pipe(takeUntilDestroy(this, 'destroy')).subscribe(spy2);
      }

      ngOnInit() {
        new Subject().pipe(takeUntilDestroy(this, 'destroy')).subscribe(spy3);
      }

      destroy() {}
    }

    it('should unsubscribe', () => {
      const instance = new LoginComponent();
      instance.ngOnInit();
      instance.destroy();
      expect(spy.complete).toHaveBeenCalledTimes(1);
      expect(spy2.complete).toHaveBeenCalledTimes(1);
      expect(spy3.complete).toHaveBeenCalledTimes(1);
    });
  });

  describe('it should throw on non-directive/component classes', () => {
    it('should throw when destroy method does not exist', () => {
      const spy = createObserver();

      class Test {
        // Here we explicitly set `@ts-ignore` since the compiler will throw
        // because of non-existing method.
        // @ts-ignore
        dummy = new Subject()
          .pipe(takeUntilDestroy(this, 'destroy'))
          .subscribe(spy);
      }

      expect(() => {
        new Test();
      }).toThrow(
        `Test is using takeUntilDestroy but doesn't implement destroy`
      );
    });

    it('should work with super', () => {
      const spy = createObserver();

      class A {
        destroy() {}
      }

      class B extends A {
        dummy = new Subject()
          .pipe(takeUntilDestroy(this, 'destroy'))
          .subscribe(spy);
      }

      expect(() => {
        new B();
      }).not.toThrow(
        `B is using takeUntilDestroy but doesn't implement destroy`
      );
    });
  });

  describe('inheritance', () => {
    it('should work with subclass', () => {
      const spy = createObserver();

      class Parent {
        destroy() {}
      }

      class Child extends Parent {
        constructor() {
          super();
        }
        obs = new Subject()
          .pipe(takeUntilDestroy(this, 'destroy'))
          .subscribe(spy);
      }

      const instance = new Child();
      instance.destroy();
      expect(spy.complete).toHaveBeenCalledTimes(1);
    });
  });
});

describe('UntilDestroy decorator and takeUntilDestroy operator', () => {
  it('operator should unsubscribe on component destroy', () => {
    const spy = createObserver();

    @UntilDestroy()
    class TestComponent {
      static ɵcmp = defineComponent({
        vars: 0,
        decls: 0,
        type: TestComponent,
        selectors: [[]],
        template: () => {}
      }) as ComponentDef<TestComponent>;

      constructor() {
        new Subject().pipe(takeUntilDestroy(this)).subscribe(spy);
      }

      static ɵfac = () => new TestComponent();
    }

    const component = TestComponent.ɵfac();
    callNgOnDestroy(component);

    expect(spy.complete).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe on pipe destroy', () => {
    const spy = createObserver();

    @UntilDestroy()
    class TestPipe {
      static ɵpipe = definePipe({
        name: 'test',
        pure: false,
        type: TestPipe
      }) as PipeDef<TestPipe>;

      constructor() {
        new Subject().pipe(takeUntilDestroy(this)).subscribe(spy);
      }

      static ɵfac = () => new TestPipe();
    }

    const pipe = TestPipe.ɵfac();
    TestPipe.ɵpipe.onDestroy!.call(pipe);

    expect(spy.complete).toHaveBeenCalledTimes(1);
  });

  it('should apply symbol to decorated class definition', () => {
    @UntilDestroy()
    class TestComponent {
      static ɵcmp = defineComponent({
        vars: 0,
        decls: 0,
        type: TestComponent,
        selectors: [[]],
        template: () => {}
      }) as ComponentDef<TestComponent>;
    }

    const ownPropertySymbols = Object.getOwnPropertySymbols(
      TestComponent.prototype
    );
    const decoratorAppliedSymbol = ownPropertySymbols.find(
      symbol => symbol.toString() === 'Symbol(__decoratorApplied)'
    );

    expect(decoratorAppliedSymbol).toBeDefined();
  });

  it('should throw if directive/component not decorated with UntilDestroy', () => {
    class TestComponent {
      static ɵcmp = defineComponent({
        vars: 0,
        decls: 0,
        type: TestComponent,
        selectors: [[]],
        template: () => {}
      }) as ComponentDef<TestComponent>;

      subscription = new Subject().pipe(takeUntilDestroy(this)).subscribe();

      static ɵfac = () => new TestComponent();
    }

    expect(() => TestComponent.ɵfac()).toThrow();
  });
});
