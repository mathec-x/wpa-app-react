import React from 'react';
import { post } from './Auth';
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import ListItem from '@material-ui/core/ListItem'

import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';
import NotificationsIcon from '@material-ui/icons/Notifications';
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';
import urlBase64ToUint8Array from '../serviceWorker'

function notifyMe() {
    if (Notification.permission !== 'granted')
        Notification.requestPermission();

    else {
        var notification = new Notification('Notification title', {
            icon: 'https://heaconsultoria.com.br/projav400.png',
            body: 'Hey there! You\'ve been notified!',
        });
        notification.onclick = function () {
            // window.open('http://stackoverflow.com/a/13328397/1269037');
        };
    }
}

export function SubscribePushnotifications(method) {
    navigator.serviceWorker.ready.then(registration => {
        if (!registration.pushManager) {
            console.log("Push Unsupported")
            return;
        }

      // this gets public key only, makes testing easier, when changing keys
        post("/push/subscription-key")
            .then(res => res.text())
            .then(vapidPublicKey => {

                registration.pushManager
                    .subscribe({
                        userVisibleOnly: true, //Always display notifications
                        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                    })
                    .then(subscription => {
                        // this sends the registration to save in the database
                        post("/push/subscribe/user", { subscription });
                        return notifyMe()
                    })
                    .catch(err => console.error("Push subscription error: ", err))
            })
            .catch(err => console.error("Post subscription error: ", err))

    })
}

export function UnSubscribePushnotifications(method) {
    navigator.serviceWorker.ready.then(registration => {
        //Find the registered push subscription in the service worker
        registration.pushManager
            .getSubscription()
            .then(subscription => {
                if (!subscription) {
                    console.log("If there isn't a subscription, then there's nothing to do");
                    return false
                }

                subscription
                    .unsubscribe()
                    .then(() => post("/push/unsubscribe/user", { subscription }))
                    .catch(err => console.error(err))
            })
            .catch((err) => console.error(err))
    })
}

const sw = navigator.serviceWorker;

export default function SubscriberButton() {
    const [active, setActive] = React.useState(false);

    React.useEffect(() => {

        if (sw)
            sw.ready.then(registration => {
                registration.pushManager.getSubscription()
                    .then(subscription => {
                        if (!subscription)
                            setActive(false)
                        else
                            setActive(true)
                    })
            })

    }, [])

   // change this layout to one according
    if (Notification?.permission === 'denied')
        return (
            <ListItem button divider onClick={() => SubscribePushnotifications()}>
                <ListItemAvatar><Avatar><NotificationImportantIcon /></Avatar></ListItemAvatar>
                <ListItemText
                    primaryTypographyProps={{ variant: 'body2' }}
                    primary="Não suportado"
                    secondary="As notificações estão desabilitadas"
                />
            </ListItem>
        )

    return (
        !active
            ? <ListItem button divider onClick={() => {
                SubscribePushnotifications();
                setActive(true);
            }}>
                <ListItemAvatar><Avatar><NotificationsOffIcon /></Avatar></ListItemAvatar>
                <ListItemText
                    primary="Ativar notificações"
                    primaryTypographyProps={{ variant: 'body2' }}
                />
            </ListItem>
            : <ListItem button divider onClick={() => {
                UnSubscribePushnotifications()
                setActive(false);
            }}>
                <ListItemAvatar><Avatar><NotificationsIcon /></Avatar></ListItemAvatar>
                <ListItemText
                    primary="Notificações ativadas"
                    primaryTypographyProps={{ variant: 'body2' }}
                />
            </ListItem>
    )

}
