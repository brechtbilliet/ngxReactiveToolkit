import { Changes, Destroy } from './decorators';
import { OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';

describe('on Destroy decorator', () => {
  it('should create a destroy stream and next true in it (and complete it) when the component gets destroyed', () => {
    class MyComponent implements OnDestroy {
      @Destroy() destroy$;

      ngOnDestroy(): void {}
    }

    const instance = new MyComponent();
    const results = [];
    instance.destroy$.subscribe(r => results.push(r));
    expect(results.length).toBe(0);
    instance['ngOnDestroy']();
    instance['ngOnDestroy']();
    expect(results).toEqual([true]);
  });

  it('should not override the old destroy method', () => {
    class MyComponent implements OnDestroy {
      @Destroy() destroy$;
      oldFnCalled = false;

      ngOnDestroy(): void {
        this.oldFnCalled = true;
      }
    }

    const instance = new MyComponent();
    instance['ngOnDestroy']();
    expect(instance.oldFnCalled).toEqual(true);
  });

  it('should work with multiple instances', () => {
    class MyComponent implements OnDestroy {
      @Destroy() destroy$;

      ngOnDestroy(): void {}
    }

    const instance1DestroyResults = [];
    const instance2DestroyResults = [];
    const instance = new MyComponent();
    const instance2 = new MyComponent();
    instance.destroy$.subscribe(r => instance1DestroyResults.push(r));
    instance2.destroy$.subscribe(r => instance2DestroyResults.push(r));
    instance['ngOnDestroy']();
    expect(instance1DestroyResults).toEqual([true]);
    expect(instance2DestroyResults).toEqual([]);
  });

  describe('given the ngOnDestroy is not implemented', () => {
    it('should throw an error', () => {
      expect(() => {
        class MyComponent {
          @Destroy() destroy$;
        }
      }).toThrowError('ngOnDestroy must be implemented for MyComponent');
    });
  });

  describe('given we try to set the value of destroy$ ourselves', () => {
    it('should throw an error', () => {
      expect(() => {
        class MyComponent implements OnDestroy {
          @Destroy() destroy$ = new Subject();

          ngOnDestroy(): void {}
        }

        const instance = new MyComponent();
      }).toThrowError(
        'You cannot set this property in the Component if you use @Destroy'
      );
    });
  });
});

describe('on Changes decorator', () => {
  describe('given the ngOnChanges function is not implemented', () => {
    it('should throw an error', () => {
      expect(() => {
        class MyComponent {
          @Changes() changes$;
        }
      }).toThrowError('ngOnChanges must be implemented for MyComponent');
    });
  });

  describe('given there is no key specified', () => {
    it(
      'should have created a changes stream that contains the changes of all inputs and still' +
        'executes the old ngOnchanges function',
      () => {
        class MyComponent implements OnChanges {
          @Changes() changes$;
          oldFnCalledWithChanges = null;

          ngOnChanges(changes: SimpleChanges): void {
            this.oldFnCalledWithChanges = changes;
          }
        }

        const instance = new MyComponent();
        const results = [];
        instance.changes$.subscribe(change => results.push(change));
        const simpleChanges = {
          foo: {
            currentValue: [],
            previousValue: undefined
          },
          bar: {
            currentValue: [],
            previousValue: undefined
          }
        };
        const simpleChanges2 = {
          foo: {
            currentValue: [1, 2, 3],
            previousValue: undefined
          },
          bar: {
            currentValue: [4, 5, 6],
            previousValue: undefined
          }
        };
        instance.ngOnChanges(simpleChanges as any);
        instance.ngOnChanges(simpleChanges2 as any);
        expect(instance.oldFnCalledWithChanges).toBeTruthy();
        expect(results[0]).toBe(simpleChanges);
        expect(results[1]).toBe(simpleChanges2);
      }
    );
  });

  describe('given there is a key specified', () => {
    it('should only listen to the changes of that input', () => {
      class MyComponent implements OnChanges {
        @Changes('foo') foo$;
        oldFnCalledWithChanges = null;

        ngOnChanges(changes: SimpleChanges): void {
          this.oldFnCalledWithChanges = changes;
        }
      }

      const instance = new MyComponent();
      const results = [];
      instance.foo$.subscribe(change => results.push(change));
      const simpleChanges = {
        foo: {
          currentValue: [1, 2, 3],
          previousValue: undefined
        }
      };
      const simpleChanges2 = {
        bar: {
          currentValue: [4, 5, 6],
          previousValue: undefined
        }
      };
      const simpleChanges3 = {
        foo: {
          currentValue: [4, 5, 6],
          previousValue: undefined
        }
      };
      instance.ngOnChanges(simpleChanges as any);
      instance.ngOnChanges(simpleChanges2 as any);
      instance.ngOnChanges(simpleChanges3 as any);
      expect(results[0]).toEqual(simpleChanges.foo.currentValue);
      expect(results[1]).toEqual(simpleChanges3.foo.currentValue);
    });
  });

  it('should handle multiple instances', () => {
    class MyComponent implements OnChanges {
      @Changes('foo') foo$;
      oldFnCalledWithChanges = null;

      ngOnChanges(changes: SimpleChanges): void {
        this.oldFnCalledWithChanges = changes;
      }
    }

    const instance = new MyComponent();
    const instance2 = new MyComponent();
    const simpleChanges = {
      foo: {
        currentValue: [1, 2, 3],
        previousValue: undefined
      }
    };
    const instance1Results = [];
    const instance2Results = [];
    instance.foo$.subscribe(change => instance1Results.push(change));
    instance2.foo$.subscribe(change => instance2Results.push(change));
    instance.ngOnChanges(simpleChanges as any);
    expect(instance1Results).toEqual([[1, 2, 3]]);
    expect(instance2Results).toEqual([]);
  });

  it('should handle undefined', () => {
    class MyComponent implements OnChanges {
      @Changes('foo') foo$;
      oldFnCalledWithChanges = null;

      ngOnChanges(changes: SimpleChanges): void {
        this.oldFnCalledWithChanges = changes;
      }
    }

    const instance = new MyComponent();
    const instance2 = new MyComponent();
    const simpleChanges = {
      foo: {
        currentValue: undefined,
        previousValue: 'fake-value'
      }
    };
    const instance1Results = [];
    const instance2Results = [];
    instance.foo$.subscribe(change => instance1Results.push(change));
    instance2.foo$.subscribe(change => instance2Results.push(change));
    instance.ngOnChanges(simpleChanges as any);
    expect(instance1Results).toEqual([undefined]);
    expect(instance2Results).toEqual([]);
  });

  it('should handle null', () => {
    class MyComponent implements OnChanges {
      @Changes('foo') foo$;
      oldFnCalledWithChanges = null;

      ngOnChanges(changes: SimpleChanges): void {
        this.oldFnCalledWithChanges = changes;
      }
    }

    const instance = new MyComponent();
    const instance2 = new MyComponent();
    const simpleChanges = {
      foo: {
        currentValue: null,
        previousValue: 'fake-value'
      }
    };
    const instance1Results = [];
    const instance2Results = [];
    instance.foo$.subscribe(change => instance1Results.push(change));
    instance2.foo$.subscribe(change => instance2Results.push(change));
    instance.ngOnChanges(simpleChanges as any);
    expect(instance1Results).toEqual([null]);
    expect(instance2Results).toEqual([]);
  });

  it('should handle zero', () => {
    class MyComponent implements OnChanges {
      @Changes('foo') foo$;
      oldFnCalledWithChanges = null;

      ngOnChanges(changes: SimpleChanges): void {
        this.oldFnCalledWithChanges = changes;
      }
    }

    const instance = new MyComponent();
    const instance2 = new MyComponent();
    const simpleChanges = {
      foo: {
        currentValue: 0,
        previousValue: 'fake-value'
      }
    };
    const instance1Results = [];
    const instance2Results = [];
    instance.foo$.subscribe(change => instance1Results.push(change));
    instance2.foo$.subscribe(change => instance2Results.push(change));
    instance.ngOnChanges(simpleChanges as any);
    expect(instance1Results).toEqual([0]);
    expect(instance2Results).toEqual([]);
  });

  describe('given we try to set the value of change$ ourselves', () => {
    it('should throw an error', () => {
      expect(() => {
        class MyComponent implements OnChanges {
          @Changes() changes$ = new Subject();

          ngOnChanges(): void {}
        }

        const instance = new MyComponent();
      }).toThrowError(
        'You cannot set this property in the Component if you use @Changes'
      );
    });
  });
});
