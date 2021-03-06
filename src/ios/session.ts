import {Observable} from 'data/observable';
import {topmost} from 'ui/frame';
import {TNSOTPublisher} from './publisher';
import {TNSOTSubscriber} from './subscriber';

declare var OTSession: any,
            OTSessionDelegate: any,
            interop: any,
            OTSessionErrorCode: any;

export class TNSOTSession extends NSObject {

    public static ObjCProtocols = [OTSessionDelegate];

    public subscriber: TNSOTSubscriber;
    public _ios: any;

    private _events: Observable;
    private _publisher: TNSOTPublisher;

    public static initWithApiKeySessionId(apiKey: string, sessionId: string): TNSOTSession {
        let instance = <TNSOTSession>TNSOTSession.new();
        instance._events = new Observable();
        instance._ios = OTSession.alloc().initWithApiKeySessionIdDelegate(apiKey.toString(), sessionId.toString(), instance);
        return instance;
    }

    connect(token: string): void {
        let errorRef = new interop.Reference();
        this._ios.connectWithTokenError(token, errorRef);
        if(errorRef.value) {
            console.log(errorRef.value);
        }
    }

    disconnect(): void {
        if(this._ios) {
            try {
                this._ios.disconnect();
            } catch(error) {
                console.log(error);
            }
        }
    }

    unsubscribe(): void {
        try {
            if(this._ios) {
                this._ios.unsubscribe();
            }
        }
        catch(error) {
            console.log(error);
        }
    }

    get events(): Observable {
        return this._events;
    }

    public sessionDidConnect(session: any) {
        if(this.events) {
            this.events.notify({
                eventName: 'sessionDidConnect',
                object: session
            });
        }
    }

    public sessionDidDisconnect(session: any) {
        if(this.events) {
            this.events.notify({
                eventName: 'sessionDidDisconnect',
                object: new Observable(session)
            });
        }
    }

    public sessionDidReconnect(session: any) {
        if(this.events) {
            this.events.notify({
                eventName: 'sessionDidReconnect',
                object: new Observable(session)
            });
        }
    }

    public sessionDidBeginReconnecting(session: any) {
        if(this.events) {
            this.events.notify({
                eventName: 'sessionDidBeginReconnecting',
                object: new Observable(session)
            });
        }
    }

    public sessionStreamCreated(session: any, stream: any) {
        if(this.events) {
            this.events.notify({
                eventName: 'streamCreated',
                object: new Observable({
                    session: session,
                    stream: stream
                })
            });
        }
        this.subscriber = new TNSOTSubscriber();
        this.subscriber.subscribe(session, stream);
    }

    public sessionStreamDestroyed(session: any, stream: any) {
        if(this.events) {
            this.events.notify({
                eventName: 'streamDestroyed',
                object: new Observable({
                    session: session,
                    stream: stream
                })
            });
        }
    }

    public sessionDidFailWithError(session: any, error: any) {
        if(this.events) {
            this.events.notify({
                eventName: 'didFailWithError',
                object: new Observable({
                    session: session,
                    error: error
                })
            });
        }
    }

    public sessionConnectionDestroyed(session: any, connection: any) {
        if(this.events) {
            this.events.notify({
                eventName: 'connectionDestroyed',
                object: new Observable({
                    session: session,
                    connection: connection
                })
            });
        }
    }

    public sessionConnectionCreated(session: any, connection: any) {
        if(this.events) {
            this.events.notify({
                eventName: 'connectionCreated',
                object: new Observable({
                    session: session,
                    connection: connection
                })
            });
        }
    }

    public sessionArchiveStartedWithId(session:any, archiveId: string, name?: string) {
        if(this.events) {
            this.events.notify({
                eventName: 'archiveStartedWithId',
                object: new Observable({
                    session: session,
                    archiveId: archiveId,
                    name: name
                })
            });
        }
    }

    public sessionArchiveStoppedWithId(session: any, archiveId: string) {
        if(this.events) {
            this.events.notify({
                eventName: 'archiveStoppedWithId',
                object: new Observable({
                    session: session,
                    archiveId: archiveId
                })
            });
        }
    }

}
