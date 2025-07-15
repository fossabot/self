# Firebase Web Setup

This document explains how to set up Firebase for the web version of the app.

## Environment Variables

You need to set the following environment variables for Firebase to work:

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

## Firebase Services Used

1. **Firebase Remote Config** - For feature flags and configuration
2. **Firebase Cloud Messaging** - For push notifications

## Service Worker

The app includes a service worker (`sw.js`) for handling background notifications. Make sure to:

1. Update the Firebase configuration in `sw.js` with your actual project details
2. Add the service worker to your web server's public directory
3. Ensure the service worker is accessible at `/sw.js`

## VAPID Key

For push notifications to work, you need to:

1. Generate a VAPID key in your Firebase console
2. Add it to your environment variables as `VITE_FIREBASE_VAPID_KEY`
3. Configure your Firebase project to use the VAPID key

## Testing

To test Firebase functionality:

1. Run the web app: `yarn web`
2. Check the browser console for Firebase initialization messages
3. Test push notifications by sending a test message from Firebase console
4. Verify that remote config values are being fetched correctly

## Troubleshooting

- If Firebase doesn't initialize, check that all environment variables are set correctly
- If push notifications don't work, verify the VAPID key and service worker setup
- If remote config doesn't work, ensure your Firebase project has Remote Config enabled
