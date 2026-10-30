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
// Capacitor's view controller can't be subclassed for these properties, so we swap in the two answers at launch (ObjC runtime).
{const ad='ios/App/App/AppDelegate.swift';let a=fs.readFileSync(ad,'utf8');
 if(!a.includes('enum GameChrome')){
  a+=`

// QSMaster Shake: double swipe to leave the game, and the home bar fades out while playing
import ObjectiveC
enum GameChrome {
    static func install() {
        let cls: AnyClass = CAPBridgeViewController.self
        let edges: @convention(block) (AnyObject) -> UInt = { _ in UIRectEdge.all.rawValue }
        class_replaceMethod(cls, #selector(getter: UIViewController.preferredScreenEdgesDeferringSystemGestures), imp_implementationWithBlock(edges), "Q@:")
        let hide: @convention(block) (AnyObject) -> Bool = { _ in true }
        class_replaceMethod(cls, #selector(getter: UIViewController.prefersHomeIndicatorAutoHidden), imp_implementationWithBlock(hide), "B@:")
    }
}
`;
  if(!/import Capacitor/.test(a))a='import Capacitor\n'+a;
  a=a.replace(/(didFinishLaunchingWithOptions[^{]*\{)/,'$1\n        GameChrome.install()');
  fs.writeFileSync(ad,a)}
 console.log('GameChrome installed:',a.includes('GameChrome.install()'))}
