## Reactive toolkit

Angular is a framework that embraces reactive programming, in particular RXJS.
This project is to help you embrace reactive programming even more.

The toolkit is pretty small for now and only comes with a handful of helpers and utils.
It will get updated in the future to help us even more. If you want to contribute or have great ideas...
Please do not hesitate to request changes.

## Installation

```bash
npm install --save ngx-reactivetoolkit
```

## Documentation

### Versions

**Angular 11**: 9.x.x

**Angular 10**: 9.x.x

**Angular 9**: 8.x.x

**Angular 8**: 7.x.x, 6.x.x

**Angular 7**: 5.x.x

**Angular 6**: 4.x.x

**Angular 5**: 3.x.x, 2.x.x and 1.x.x

**Angular 4**: 3.x.x, 2.x.x and 1.x.x


### The Destroy decorator

When using streams in angular you have to make sure that you are unsubscribing to your streams.
When using async pipes those particular streams are already getting unsubscribed for you automatically.
But in a bunch of cases it is still needed to subscribe to streams at component level.
In that case there are two things you can do:
- Keep track of all subscriptions and destroy them at ngOnDestroy
- Keep track of a destroy stream and use the takeUntil operator

The Destroy decorator covers that logic for you.

An cleaner alternative to the destroy decorator is the takeUntilDestroy operator also available in this library.

```javascript
import {Destroy} from 'ngx-reactivetoolkit';

@Component({
    selector: 'my-component',
    template: `...`,
})
export class HelloComponent implements OnDestroy {
    // by using the @Destroy annotation a stream will be created for you
    // and will get a true value when the component gets destroyed
    @Destroy() destroy$;

    constructor() {
        interval(500).pipe(
            // be safe and use the created destroy$ to stop the stream automatically
            takeUntil(this.destroy$)
        ).subscribe(e => console.log(e));
    }

    // because of aot we need to implement the ngOnDestroy method for @Destroy to work
    ngOnDestroy(): void {}
}
```

### The Changes decorator

What if a component gets a lot of inputs and we need to combine all these values. Wouldn't it be great if we
could just create streams of these values and combine them where we want to. That way we could start writing
reactive code in dumb components as well.

The changes decorator covers that logic for you.

```javascript
import {Changes} from 'ngx-reactivetoolkit';

@Component({
    selector: 'my-component',
    template: `...`,
})
export class HelloComponent implements OnChanges {
    @Input() a;
    @Input() b;
    // by using the @Changes annotation a stream will be created for you
    // and will get a new value every time an input of a component changes
    @Changes() changes$;

    constructor(){
        this.changes$.subscribe(e => console.log(e));
    }
    a$ = this.changes$.filter(changes => changes.a).map(changes => changes.a.currentValue);
    b$ = this.changes$.filter(changes => changes.b).map(changes => changes.b.currentValue);

    // because of aot we need to implement the ngOnChanges method for @Changes to work
    ngOnChanges(): void {}
}
```

You could also pass the name of an input to create a stream directly from that input as well as define a starting value.

```javascript
import {Changes} from 'ngx-reactivetoolkit';

@Component({
    selector: 'my-component',
    template: `...`,
})
export class HelloComponent implements OnChanges {
    @Input() a;
    @Input() b;
    @Changes('a') a$; // will get nexted every time a changes
    @Changes('b', 100) b$; // will get nexted every time b changes, and will start with the value 100 

    // because of aot we need to implement the ngOnChanges method for @Changes to work
    ngOnChanges(): void {}
}
```

### The takeUntilDestroy operator

The takeUntilDestroy operator is a cleaner alternative over the destroy decorator. The implementation is mostly identical to the one of Netanel Basal. Credits to him and his team.

When using streams in angular you have to make sure that you are unsubscribing to your streams.
When using async pipes those particular streams are already getting unsubscribed for you automatically.
But in a bunch of cases it is still needed to subscribe to streams at component level.
In that case there are two things you can do:
- Keep track of all subscriptions and destroy them at ngOnDestroy
- Keep track of a destroy stream and use the takeUntil operator

The takeUntilDestroy operator covers that logic for you.

```javascript
import {UntilDestroy, takeUntilDestroy} from 'ngx-reactivetoolkit';

@UntilDestroy()
@Component({
    selector: 'my-component',
    template: `...`,
})
export class HelloComponent {
    constructor() {
        interval(500).pipe(
            takeUntilDestroy(this)
        ).subscribe(e => console.log(e));
    }
}
```
