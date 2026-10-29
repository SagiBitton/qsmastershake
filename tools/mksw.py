"""Rebuild game/sw.js (offline cache for the installed web app). Run after any change:
   python3 tools/mksw.py game"""
import sys,os,hashlib
g=sys.argv[1] if len(sys.argv)>1 else 'game'
files=['./','index.html','manifest.webmanifest','privacy.html','terms.html','strips.js','icon-192.png','icon-512.png','icon-180.png']
files+=sorted('a/'+f for f in os.listdir(os.path.join(g,'a')))
h=hashlib.md5()
for f in files[1:]:
    with open(os.path.join(g,f),'rb') as fh:h.update(fh.read())
C='mshake-'+h.hexdigest()[:8]
js=f"""const C='{C}';const F={files!r};
self.addEventListener('install',e=>{{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))}});
self.addEventListener('activate',e=>{{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))}});
self.addEventListener('fetch',e=>{{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request,{{ignoreSearch:true}}).then(r=>r||fetch(e.request).then(res=>{{const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{{}});return res}}).catch(()=>caches.match('index.html'))))}});
"""
open(os.path.join(g,'sw.js'),'w').write(js.replace("'",'"',0));print(C,len(files),'files')
