import {
  ɵComponentDef as ComponentDef,
  ɵɵdefineComponent as defineComponent
} from '@angular/core';
import { interval } from 'rxjs';

import { UntilDestroy } from '../until-destroy.decorator';
import { callNgOnDestroy } from './utils';
import { takeUntilDestroy } from '../take-until-destroy.operator';

describe('UntilDestroy decorator alone', () => {
  it('should unsubscribe from the subscription property', () => {
    // Arrange
    @UntilDestroy()
    class TestComponent {
      static ɵcmp = defineComponent({
        vars: 0,
        decls: 0,
        type: TestComponent,
        selectors: [[]],
        template: () => {}
      }) as ComponentDef<TestComponent>;

      subscription = interval(1000).pipe(takeUntilDestroy(this)).subscribe();

      static ɵfac = () => new TestComponent();
    }

    // Act & assert
    const component = TestComponent.ɵfac();

    expect(component.subscription.closed).toBeFalsy();
    callNgOnDestroy(component);
    expect(component.subscription.closed).toBeTruthy();
  });
});
