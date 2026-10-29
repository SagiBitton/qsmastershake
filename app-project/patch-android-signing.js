// Codemagic: sign the release bundle with the upload key Codemagic provides (CM_KEYSTORE_* env vars),
// and set versionCode from the build number. Run after "npx cap add android".
const fs=require('fs'),p='android/app/build.gradle';let g=fs.readFileSync(p,'utf8');
if(!g.includes('signingConfigs {')){
  g=g.replace(/android\s*\{/,`android {
    signingConfigs {
        release {
            if (System.getenv("CM_KEYSTORE_PATH")) {
                storeFile file(System.getenv("CM_KEYSTORE_PATH"))
                storePassword System.getenv("CM_KEYSTORE_PASSWORD")
                keyAlias System.getenv("CM_KEY_ALIAS")
                keyPassword System.getenv("CM_KEYSTORE_PASSWORD") // PKCS12: key password = store password
            }
        }
    }`);
}
g=g.replace(/(buildTypes\s*\{\s*release\s*\{)/,'$1\n            signingConfig signingConfigs.release');
const vc=parseInt(process.env.BUILD_NUMBER||process.env.PROJECT_BUILD_NUMBER||'1',10)+100;
g=g.replace(/versionCode\s+\d+/,'versionCode '+vc).replace(/versionName\s+"[^"]*"/,'versionName "1.0"');
fs.writeFileSync(p,g);console.log('build.gradle signing patched, versionCode',vc);
