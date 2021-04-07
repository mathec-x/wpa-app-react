const Router = require('express').Router();
const webpush = require("web-push");

// VAPID keys should only be generated only once.
// const vapidKeys = webpush.generateVAPIDKeys();

/**
 * more in https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications#request_permission
 */

const vapidKeys = {
    publicKey: 'large key generated in https://console.firebase.google.com/project',
    privateKey: 'hidden key generated in https://console.firebase.google.com/project'
}

webpush.setGCMAPIKey('get yours in firebase google message');
webpush.setVapidDetails(
    'mailto:my_mail@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

/**@typedef {{ keys: { auth: string,p256dh: string }, endpoint: string, expirationTime: string? }} subscription */

const RemoveSubscribes = async (bd, subscription, where) => {
    /**@type {{subscribes: subscription[]}}*/
    let { subscribes = [] } = await bd.findFirst({ where, select: { subscribes: true } })

    const removeSubscription = await bd.update({
        where,
        data: {
            subscribes: subscribes.filter(e => e.endpoint != subscription.endpoint)
        }
    })

    console.log({ removeSubscription });
    return true;

}

const sendNotification = async (subscription, message) => {    
    var options = {
        gcmAPIKey: vapidKeys.privateKey,
        TTL: 60
      };

    try {

        await webpush.sendNotification(subscription, 'teste', options);
        return true;
    } catch (error) {
        console.log('[catch webpush.sendNotification]')
        return false;
    }
}

Router.all('/subscription-key', (req, res) => {
    res.send(vapidKeys.publicKey)

})

Router.post('/subscribe/:method', async (req, res) => {

    try {

      /**@type {{subscription: subscription}}*/
        const { subscription } = req.body;
      /**@type {{subscribes: subscription[]}}*/
        var { subscribes } = await bd.findFirst({ where, select: { subscribes: true } })

        if (!subscribes) subscribes = [];
        if (!subscribes.some(e => e.endpoint == subscription.endpoint)) {
            const createSubscription = await bd.update({
                where,
                data: {
                    subscribes: [...subscribes, subscription]
                }
            })
            console.log({ createSubscription });
        }

      await sendNotification(subscription, {
            title: 'Inscrição feita',
            body: 'Você receberá atualizações importantes'
        });

        res.json({ message: "subscribed" });

    } catch (error) {
        console.log(error);
        res.sendStatus(400)
    }
})

Router.post('/unsubscribe', async (req, res) => {
    try {
        /**@type {{subscription: subscription}}*/
        const { subscription } = req.body;
        await RemoveSubscribes(bd, subscription, where)
        res.json({ message: "unsubscribed" });
      
    } catch (error) {

        return res.sendStatus(400)
    }
})

Router.post('/notification/:uuid', async (req, res) => {
  
    const result = await this.SendNotification(bd , { uuid: req.params.uuid }, req.body);
    if(!result) return res.sendStatus(400)
    res.json(result);
})

exports.SendNotification = async (bd, where, message) => {
    const invalidSubscriptions = [];
    const { subscribes = [] } = await bd.findFirst({ where, select: { subscribes: true } });

    if (subscribes.length == 0) return { message: "user is not subscribed" };

    try {

        // const message = "Hello World from server";
        for (let index = 0; index < subscribes.length; index++) {
            const subscription = subscribes[index];

            const sender = await sendNotification(subscription, message);

            if (!sender) {
                invalidSubscriptions.push(subscription);
                await RemoveSubscribes(bd, subscription, where)
            }

        }

        return { message: "message sent to " + subscribes.length + " subscribes com " + invalidSubscriptions.length + ' inválidos' };

    } catch (error) {
        console.log("[catch send notification]\n\n\n", { subscribes, message, error })
        return false
    }
}

module.exports = Router;
