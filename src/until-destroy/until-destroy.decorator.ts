import {
  InjectableType,
  ɵComponentType as ComponentType,
  ɵDirectiveType as DirectiveType
} from '@angular/core';
import { SubscriptionLike } from 'rxjs';

import { PipeType, isPipe } from './ivy';
import {
  getSymbol,
  isFunction,
  completeSubjectOnTheInstance,
  markAsDecorated
} from './internals';

function unsubscribe(property: SubscriptionLike | undefined): void {
  property && isFunction(property.unsubscribe) && property.unsubscribe();
}

function unsubscribeIfPropertyIsArrayLike(property: any[]): void {
  Array.isArray(property) && property.forEach(unsubscribe);
}

function decorateNgOnDestroy(ngOnDestroy: (() => void) | null | undefined) {
  return function (this: any) {
    // Invoke the original `ngOnDestroy` if it exists
    ngOnDestroy && ngOnDestroy.call(this);

    // It's important to use `this` instead of caching instance
    // that may lead to memory leaks
    completeSubjectOnTheInstance(this, getSymbol());
  };
}

function decorateProviderDirectiveOrComponent<T>(
  type: InjectableType<T> | DirectiveType<T> | ComponentType<T>
): void {
  type.prototype.ngOnDestroy = decorateNgOnDestroy(type.prototype.ngOnDestroy);
}

function decoratePipe<T>(type: PipeType<T>): void {
  const def = type.ɵpipe;
  def.onDestroy = decorateNgOnDestroy(def.onDestroy);
}

export function UntilDestroy(): ClassDecorator {
  return (type: any) => {
    if (isPipe(type)) {
      decoratePipe(type);
    } else {
      decorateProviderDirectiveOrComponent(type);
    }

    markAsDecorated(type);
  };
}
