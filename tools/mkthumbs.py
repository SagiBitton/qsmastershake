"""Make small map-card pictures a/bt_<bg>.webp from the big beach backgrounds a/bg_*.webp.
The map shows 67 cards; decoding 67 full-size backgrounds made the map stutter on phones.
Run after adding or changing a beach background:  python3 tools/mkthumbs.py game/a"""
import sys,glob,os
from PIL import Image
d=sys.argv[1] if len(sys.argv)>1 else 'game/a'
n=0
for f in sorted(glob.glob(os.path.join(d,'bg_*.webp'))):
    name=os.path.basename(f)[3:-5]
    if name.startswith('map'):continue
    im=Image.open(f).convert('RGB')
    w=560;h=round(im.height*w/im.width)
    im.resize((w,h),Image.LANCZOS).save(os.path.join(d,'bt_'+name+'.webp'),quality=80,method=6)
    n+=1
print(n,'thumbs')
