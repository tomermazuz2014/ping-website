// Background push service worker for the Ping Business PWA.
//
// FlutterFire's firebase_messaging web plugin auto-registers this file at the
// site root (`/firebase-messaging-sw.js`). It runs when the tab/PWA is closed
// or backgrounded, so notifications arrive even when the app isn't open.
//
// The config here MUST stay in sync with WebFirebaseConfig in
// packages/ping_shared/lib/src/core/config/web_firebase_config.dart.
// A service worker can't read Dart --dart-define values, so it's hardcoded.
// These are public web identifiers (they ship in the JS bundle anyway).
importScripts(
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js',
);

firebase.initializeApp({
  apiKey: 'AIzaSyAtFyQ_6hgNp8QmzYUS3XqIjvf6XawGCbo',
  authDomain: 'ping-7ca7e.firebaseapp.com',
  projectId: 'ping-7ca7e',
  storageBucket: 'ping-7ca7e.firebasestorage.app',
  messagingSenderId: '551478371510',
  appId: '1:551478371510:web:ab479cea721faed7a5f217',
});

// Notifications sent by the backend include a `notification` block, so the
// browser displays them automatically. Registering messaging is enough; the
// handler below is a safety net for data-only messages.
const messaging = firebase.messaging();

// Data-only types the backend sends to make the app re-fetch, not to say
// anything to the user. On iOS/Android these carry no notification block so
// nothing is ever displayed; on web this fallback would show one, hence the
// skip below.
const SILENT_PUSH_TYPES = ['calendar_updated'];

messaging.onBackgroundMessage((message) => {
  const data = message.data || {};
  // Without this the fallback below would post an empty "Ping Business" banner
  // for every calendar poll that found a change.
  if (SILENT_PUSH_TYPES.indexOf(data.type) !== -1) {
    return;
  }

  const notification = message.notification || {};
  const title = notification.title || 'Ping Business';
  const options = {
    body: notification.body || '',
    icon: '/icons/Icon-192.png',
    // Carry the FCM data payload so the click handler can deep-link.
    data: message.data || {},
  };
  self.registration.showNotification(title, options);
});

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
