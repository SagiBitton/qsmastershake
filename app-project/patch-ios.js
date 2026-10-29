// Run after "npx cap add ios" (on a Mac). Makes the iPhone/iPad project ready for AdMob + landscape only.
// The game is for children: it never asks for tracking permission (no App Tracking Transparency popup),
// so do NOT add NSUserTrackingUsageDescription.
const fs=require('fs'),path='ios/App/App/Info.plist';
// >>> PUT YOUR iOS AdMob APP ID HERE (admob.google.com > Apps > your iOS app > App settings). This one is Google's TEST id. <<<
const ADMOB_IOS_APP_ID='ca-app-pub-1207843103281016~7681038609'; // QSMaster Shake iOS (real)
let p=fs.readFileSync(path,'utf8');
const put=(key,xml)=>{const re=new RegExp('\\s*<key>'+key+'</key>\\s*(<string>[^<]*</string>|<true/>|<false/>|<array>[\\s\\S]*?</array>)');p=p.replace(re,'');p=p.replace(/<\/dict>\s*<\/plist>\s*$/,`\t<key>${key}</key>\n\t${xml}\n</dict>\n</plist>\n`)};
put('GADApplicationIdentifier',`<string>${ADMOB_IOS_APP_ID}</string>`);
put('SKAdNetworkItems',`<array>\n\t\t<dict><key>SKAdNetworkIdentifier</key><string>cstr6suwn9.skadnetwork</string></dict>\n\t</array>`);
put('UIRequiresFullScreen','<true/>');
put('UIStatusBarHidden','<true/>');
put('UISupportedInterfaceOrientations','<array>\n\t\t<string>UIInterfaceOrientationLandscapeLeft</string>\n\t\t<string>UIInterfaceOrientationLandscapeRight</string>\n\t</array>');
put('UISupportedInterfaceOrientations~ipad','<array>\n\t\t<string>UIInterfaceOrientationLandscapeLeft</string>\n\t\t<string>UIInterfaceOrientationLandscapeRight</string>\n\t</array>');
put('ITSAppUsesNonExemptEncryption','<false/>');
fs.writeFileSync(path,p);console.log('Info.plist patched for Master Shake');
