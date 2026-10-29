import sys,collections
from PIL import Image
src,name,out=sys.argv[1],sys.argv[2],sys.argv[3]
im=Image.open(src).convert('RGBA');W,H=im.size;px=im.load()
white=lambda p:p[0]>238 and p[1]>238 and p[2]>238
# 1) background = near-white connected to top/left/right edges (not the bottom: figures are cut at the waist there)
bg=bytearray(W*H);q=collections.deque([(x,0) for x in range(W)]+[(0,y) for y in range(H)]+[(W-1,y) for y in range(H)])
while q:
  x,y=q.popleft()
  if x<0 or y<0 or x>=W or y>=H or bg[y*W+x] or not white(px[x,y]):continue
  bg[y*W+x]=1;q.extend(((x+1,y),(x-1,y),(x,y+1),(x,y-1)))
# also clear white running along the bottom row between figures (seed only where the column above is background)
import os
for x in (range(W) if not os.environ.get('NOBOTTOM') else []):
  if white(px[x,H-1]) and bg[(H-2)*W+x]:
    y=H-1
    while y>0 and white(px[x,y]) and not bg[y*W+x]:bg[y*W+x]=1;y-=1
for y in range(H):
  for x in range(W):
    if bg[y*W+x]:px[x,y]=(255,255,255,0)
    else:
      r,g,b,a=px[x,y]
      if r>215 and g>215 and b>215 and any(bg[yy*W+xx] for xx,yy in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)) if 0<=xx<W and 0<=yy<H):
        px[x,y]=(r,g,b,int(255*min(1,(255-(r+g+b)/3)/40)))
# 2) split into 3 frames at the two widest empty column gaps
cols=[any(px[x,y][3]>20 for y in range(H)) for x in range(W)]
gaps=[];x=0
while x<W:
  if not cols[x]:
    s=x
    while x<W and not cols[x]:x+=1
    if s>0 and x<W:gaps.append((x-s,s,x))
  else:x+=1
gaps=sorted(sorted(gaps,reverse=True)[:2],key=lambda g:g[1])
assert len(gaps)==2,gaps
bounds=[(0,gaps[0][1]),(gaps[0][2],gaps[1][1]),(gaps[1][2],W)]
frames=[im.crop((a,0,b,H)) for a,b in bounds]
boxes=[f.getbbox() for f in frames]
top=min(b[1] for b in boxes);bot=max(b[3] for b in boxes)
outs=[]
for f,b in zip(frames,boxes):
  c=f.crop((b[0],top,b[2],bot));k=250/c.height;outs.append(c.resize((max(1,round(c.width*k)),250),Image.LANCZOS))
ws=[o.width for o in outs];strip=Image.new('RGBA',(sum(ws),250),(0,0,0,0));x=0
for o in outs:strip.paste(o,(x,0));x+=o.width
strip.save(out,quality=90,method=6);print(name,ws)
