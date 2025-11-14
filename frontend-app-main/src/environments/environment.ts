// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.


export const environment = {
    baseUrl: 'http://localhost:8080/api/v1',
    baseUrl2: 'http://localhost:8080',
    production: true,

  defaultauth: 'fakebackend',
  firebaseConfig: {
    apiKey: "AIzaSyCWtAzHHM6P6rpiJ2sgGdW8do9EP14Xjr8",
    authDomain: "test-demo-b61da.firebaseapp.com",
    databaseURL: "https://test-demo-b61da-default-rtdb.firebaseio.com",
    projectId: "test-demo-b61da",
    storageBucket: "test-demo-b61da.firebasestorage.app",
    messagingSenderId: "383255507294",
    appId: "1:383255507294:web:7185e56d33f6b8c1331fcf",
    measurementId: "G-1N6FB2GG55"
  }
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
