// Background push service worker for the Ping (customer) PWA.
//
// FlutterFire's firebase_messaging web plugin auto-registers this file at the
// site root (`/firebase-messaging-sw.js`). It runs when the tab/PWA is closed
// or backgrounded, so notifications arrive even when the app isn't open.
//
// The config here MUST stay in sync with WebFirebaseConfig in
// packages/ping_shared/lib/src/core/config/web_firebase_config.dart.
// A service worker can't read Dart --dart-define values, so it's hardcoded.
// These are public web identifiers (they ship in the JS bundle anyway).
// Web push is NOT configured on the new PING backend: the Firebase project
// this worker used belonged to the previous developer and was removed.
// The Supabase web path never initializes Firebase, so this worker only keeps
// the notification-click routing below. To enable web push later, register a
// Web app in Firebase project pingitnow-staging, put its config here and in
// WebFirebaseConfig, and the handler below becomes active again.
const FIREBASE_WEB_CONFIG = null;

if (FIREBASE_WEB_CONFIG) {
importScripts(
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js',
);

firebase.initializeApp(FIREBASE_WEB_CONFIG);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((message) => {
  const notification = message.notification || {};
  const title = notification.title || 'Ping';
  const options = {
    body: notification.body || '',
    icon: '/icons/Icon-192.png',
    // Carry the FCM data payload so the click handler can deep-link.
    data: message.data || {},
  };
  self.registration.showNotification(title, options);
});
}

// Pull the FCM data payload off a notification whether it was shown by
// onBackgroundMessage (data set directly) or auto-displayed by the FCM SDK
// (payload wrapped under FCM_MSG).
function extractNotificationData(notification) {
  let data = (notification && notification.data) || {};
  if (data.FCM_MSG) {
    const msg = data.FCM_MSG;
    data =
      (msg && msg.data) ||
      (msg && msg.notification && msg.notification.data) ||
      {};
  }
  return data || {};
}

// Cold-launch handoff: a tap that opens a brand-new window has no client yet to
// receive the postMessage, so stash the payload until the fresh app asks for it.
let pendingNotificationClick = null;

// Tapping a notification must open/focus the installed PWA and route to the
// right screen — without this handler the browser does nothing on click, and
// without the payload the app can only land on the home screen (native apps get
// both for free via onMessageOpenedApp).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = extractNotificationData(event.notification);
  const targetUrl = new URL('/', self.location.origin).href;
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Warm path: focus an open window and hand it the payload to route on.
        for (const client of windowClients) {
          if ('focus' in client) {
            client.focus();
            if (client.postMessage) {
              client.postMessage({ type: 'notificationclick', data: data });
            }
            return undefined;
          }
        }
        // Cold path: stash for the new window to collect, then launch.
        pendingNotificationClick = data;
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
        return undefined;
      }),
  );
});

// The freshly launched app asks for any tap that happened before it existed.
self.addEventListener('message', (event) => {
  const type = event.data && event.data.type;
  if (
    type === 'ping-request-pending-notification-click' &&
    pendingNotificationClick
  ) {
    const data = pendingNotificationClick;
    pendingNotificationClick = null;
    if (event.source && event.source.postMessage) {
      event.source.postMessage({ type: 'notificationclick', data: data });
    }
  }
});
