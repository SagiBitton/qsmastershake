// Run after "npx cap add android". Makes the Android project ready for Google Play Families:
// AdMob app id, LANDSCAPE ONLY (sensorLandscape: always sideways, even with rotation lock), full screen, and NO advertising-id permission (required for apps for children).
const fs=require('fs'),path='android/app/src/main/AndroidManifest.xml';
// >>> PUT YOUR AdMob APP ID HERE (admob.google.com > Apps > App settings). This one is Google's TEST app id. <<<
const ADMOB_APP_ID='ca-app-pub-1207843103281016~1307201944'; // QSMaster Shake Android (real)
let m=fs.readFileSync(path,'utf8');
if(!m.includes('xmlns:tools'))m=m.replace('<manifest ','<manifest xmlns:tools="http://schemas.android.com/tools" ');
if(!m.includes('com.google.android.gms.ads.APPLICATION_ID'))m=m.replace('<application',`<application`).replace(/(<application[^>]*>)/,`$1\n        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${ADMOB_APP_ID}"/>`);
else m=m.replace(/(APPLICATION_ID" android:value=")[^"]*/,`$1${ADMOB_APP_ID}`);
if(!m.includes('gms.permission.AD_ID'))m=m.replace('</manifest>','    <uses-permission android:name="com.google.android.gms.permission.AD_ID" tools:node="remove"/>\n</manifest>');
m=m.replace(/<activity([^>]*?)android:screenOrientation="[^"]*"/,'<activity$1');
m=m.replace(/<activity(\s)/,'<activity android:screenOrientation="sensorLandscape"$1');
fs.writeFileSync(path,m);console.log('AndroidManifest patched for Master Shake');
