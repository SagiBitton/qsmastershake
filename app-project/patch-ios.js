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
// iPhone: landscape AND upright. When the phone is upright the game turns itself sideways (fit() in index.html), and the
// iOS home bar follows the phone, so you can leave the game from the bottom or from the side.
put('UISupportedInterfaceOrientations','<array>\n\t\t<string>UIInterfaceOrientationLandscapeLeft</string>\n\t\t<string>UIInterfaceOrientationLandscapeRight</string>\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t</array>');
put('UISupportedInterfaceOrientations~ipad','<array>\n\t\t<string>UIInterfaceOrientationLandscapeLeft</string>\n\t\t<string>UIInterfaceOrientationLandscapeRight</string>\n\t</array>');
put('ITSAppUsesNonExemptEncryption','<false/>');
fs.writeFileSync(path,p);console.log('Info.plist patched for Master Shake');

// Game-style home bar: the first swipe only shows the bar, a second (strong) swipe leaves the game, so children don't exit by accident.
// A small view controller (inside AppDelegate.swift, already part of the app) replaces Capacitor's default one in Main.storyboard.
{const ad='ios/App/App/AppDelegate.swift';let a=fs.readFileSync(ad,'utf8');
 if(!a.includes('class GameViewController')){a+=`

// QSMaster Shake: double swipe to leave the game, home bar fades out while playing
class GameViewController: CAPBridgeViewController {
    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge { return .all }
    override var prefersHomeIndicatorAutoHidden: Bool { return true }
    override var prefersStatusBarHidden: Bool { return true }
}
`;if(!/import Capacitor/.test(a))a='import Capacitor\n'+a;fs.writeFileSync(ad,a)}
 const sb='ios/App/App/Base.lproj/Main.storyboard';let b=fs.readFileSync(sb,'utf8');
 b=b.replace(/customClass="CAPBridgeViewController"\s+customModule="Capacitor"/,'customClass="GameViewController" customModule="App" customModuleProvider="target"');
 fs.writeFileSync(sb,b);console.log('GameViewController set:',b.includes('GameViewController'))}
