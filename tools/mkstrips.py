import base64,os,sys,json
d=sys.argv[1];out=sys.argv[2]
names=[f[:-5] for f in sorted(os.listdir(d)) if f.endswith('.webp') and (f.startswith(('cs_','ps_','bls_')) or f in('decor.webp','decor2.webp','icons.webp'))]
m={n:'data:image/webp;base64,'+base64.b64encode(open(os.path.join(d,n+'.webp'),'rb').read()).decode() for n in names}
sfx='data:audio/mpeg;base64,'+base64.b64encode(open(os.path.join(d,'sfx_shake.mp3'),'rb').read()).decode()
open(out,'w').write('/* picture strips embedded as data, so the game can cut them apart even when its files come from another web address (e.g. a hosted preview) */\nwindow.__STRIP='+json.dumps(m)+';\nwindow.__SFX='+json.dumps(sfx)+';\n')
print(len(names),os.path.getsize(out))
