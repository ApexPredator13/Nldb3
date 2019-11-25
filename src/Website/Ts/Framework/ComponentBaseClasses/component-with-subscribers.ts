export class ComponentWithSubscribers<TEmitType, TThis> {

    private Subscribers: Array<(id: TEmitType) => any>;

    constructor(private caller: ThisType<TThis>, ...subscribers: Array<(id: TEmitType) => any>) {
        this.Subscribers = new Array<(id: TEmitType) => any>(...subscribers);
    }

    Subscribe(fn: (id: TEmitType) => any) {
        this.Subscribers.push(fn);
    }

    Emit(id: TEmitType) {
        if (this.Subscribers.length > 0) {
            for (const subscriber of this.Subscribers) {
                const boundFunction = subscriber.bind(this.caller);
                console.log('emitting ', id);
                boundFunction(id);
            }
        }
    }
}

