import {Observable} from 'data/observable';
import {topmost} from 'ui/frame';
import {TNSOTPublisherI} from '../common';

declare var OTSubscriber: any,
            CGRectMake: any,
            OTSubscriberKitDelegate: any,
            AVCaptureDevicePositionBack: any,
            AVCaptureDevicePositionFront: any;

export class TNSOTSubscriber  {

    private _subscriberKitDelegate: TNSSubscriberKitDelegate;
    private _nativeSubscriber: any;

    constructor() {
        this._subscriberKitDelegate = new TNSSubscriberKitDelegate();
        this._subscriberKitDelegate.initSubscriberEvents();
    }

    subscribe(session: any, stream: any) {
        this._nativeSubscriber = new OTSubscriber(stream, this._subscriberKitDelegate);
        session.subscribe(this._nativeSubscriber);
    }

    /**
     * Cleans the subscriber from the view hierarchy, if any.
     *
     * @param {*} session THe session to unsubscribe from
     */
    unsubscribe(session: any) {
        if(this._nativeSubscriber) {
            if(session) {
                try {
                    session.unsubscribe(this._nativeSubscriber);
                } catch(error) {
                    console.log('Failed to unsubscribe from session: ' + error);
                }
                this._nativeSubscriber.view.removeFromSuperview();
                this._nativeSubscriber = null;
            }
        }
    }

    /**
     * Cleans the subscriber from the view hierarchy, if any.
     * NB: You do *not* have to call unsubscribe in your controller in response to
     * a streamDestroyed event. Any subscribers (or the publisher) for a stream will
     * be automatically removed from the session during cleanup of the stream.
     */
    cleanup() {
        let subscriber = this._nativeSubscriber;
        if(subscriber) {
            subscriber.view.removeFromSuperview();
            subscriber = null;
            this._subscriberKitDelegate.subscriberEvents.notify({
                eventName: 'didStopSubscribing',
                object: null
            });
        }
    }

    get subscriberEvents(): Observable {
        return this._subscriberKitDelegate.subscriberEvents;
    }

}

class TNSSubscriberKitDelegate extends NSObject {

    public static ObjCProtocols = [OTSubscriberKitDelegate];

    private _subscriberEvents: Observable;

    initSubscriberEvents(emitEvents: boolean = true) {
        if(emitEvents) {
            this._subscriberEvents = new Observable();
        }
    }

    subscriberDidFailWithError(subscriber: any, error: any) {
        if(this._subscriberEvents) {
            this._subscriberEvents.notify({
                eventName: 'didFailWithError',
                object: new Observable({
                    subscriber: subscriber,
                    error: error
                })
            });
        }
    }

    subscriberDidConnectToStream(subscriber) {
         if(this._subscriberEvents) {
            this._subscriberEvents.notify({
                eventName: 'subscriberDidConnectToStream',
                object: new Observable({
                    subscriber: subscriber
                })
            });
        }
        subscriber.view.frame = CGRectMake(0, 100, 100, 100);// Todo - allow for custom positioning?
        topmost().currentPage.ios.view.addSubview(subscriber.view);
    }

    subscriberDidDisconnectFromStream(subscriber: any) {
        if(this._subscriberEvents) {
            this._subscriberEvents.notify({
                eventName: 'didDisconnectFromStream',
                object: subscriber
            });
        }
    }

    subscriberDidReconnectToStream(subscriber: any) {
         if(this._subscriberEvents) {
            this._subscriberEvents.notify({
                eventName: 'didReconnectToStream',
                object: subscriber
            });
        }
    }

    subscriberVideoDisableWarning(subscriber: any) {

    }

    subscriberVideoDisableWarningLifted(subscriber: any) {

    }

    subscriberVideoDisabledReason(subscriber, reason) {

    }

    subscriberVideoEnabledReason(subscriber, reason) {

    }

    get subscriberEvents(): Observable {
        return this._subscriberEvents;
    }

}