
export abstract class EventEmitter<TEventsConfig extends { [key: string]: object }> {
    private readonly listeners: { [key in keyof TEventsConfig]: Array<(event: TEventsConfig[key]) => void> } = {} as any;

    addEventListener<TEvent extends keyof TEventsConfig>(event: TEvent, listener: (event: TEventsConfig[TEvent]) => void) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        this.listeners[event].push(listener);
    }

    protected emitEvent<TEvent extends keyof TEventsConfig>(event: TEvent, eventData: TEventsConfig[TEvent]) {
        if (this.listeners[event]) {
            for (const listener of this.listeners[event]) {
                listener(eventData);
                // TODO: handle errors
                // TODO: handle async listeners
                // TODO: handle listener timeouts
                // TODO: handle listener return values
            }
        }
    }


}