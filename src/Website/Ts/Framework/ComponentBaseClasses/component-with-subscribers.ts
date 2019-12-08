export class ComponentWithSubscribers<TSubscriber extends Object, TEmit> {

    private Subscribers: Array<(id: TEmit) => any>;

    constructor(private subscriber: TSubscriber, ...subscribers: Array<(id: TEmit) => any>) {
        this.Subscribers = new Array<(id: TEmit) => any>(...subscribers);
    }

    Subscribe(fn: (id: TEmit) => any) {
        this.Subscribers.push(fn);
    }

    Emit(id: TEmit) {
        if (this.Subscribers.length > 0) {
            for (const subscriber of this.Subscribers) {
                subscriber.call(this.subscriber, id);
            }
        }
    }
}

