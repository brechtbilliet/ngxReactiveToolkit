import { Destroy } from './decorators';

describe('on Destroy decorator', () => {
    it('should create a destroy stream and next true in it when the component gets destroyed', () => {
        class MyComponent {
            @Destroy() destroy$;
        }

        const instance = new MyComponent();
        const results = [];
        instance.destroy$.subscribe(r => results.push(r));
        expect(results.length).toBe(0);
        instance['ngOnDestroy']();
        expect(results[0]).toBe(true);
    });
    it('should have completed that stream', () => {
        class MyComponent {
            @Destroy() destroy$;
        }

        const instance = new MyComponent();
        const results = [];
        instance.destroy$.subscribe(r => results.push(r));
        instance['ngOnDestroy']();
        instance['ngOnDestroy']();
        expect(results.length).toBe(1);
    });

    it('should not override the old destroy method', () => {
        class MyComponent {
            @Destroy() destroy$;
            oldFnCalled = false;

            ngOnDestroy(): void {
                this.oldFnCalled = true;
            }
        }

        const instance = new MyComponent();
        // instance.destroy$.subscribe();
        (instance as any).ngOnDestroy();
        expect(instance.oldFnCalled).toEqual(true);
    })
});