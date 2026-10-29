import sys,numpy as np
from PIL import Image
from scipy import ndimage as nd
f=sys.argv[1];r=int(sys.argv[2]) if len(sys.argv)>2 else 7
im=np.array(Image.open(f).convert('RGBA'));a=im[...,3]>40
H,W=a.shape
# close the bottom: the figures are cut at the waist, so their bottom edge counts as a wall
pad=np.zeros((H+1,W),bool);pad[:H]=a
lab,n=nd.label(nd.binary_dilation(a,iterations=3))
bot=np.zeros(W,bool)
for x in range(W):
    if a[H-12:,x].any():bot[x]=True
pad[H]=bot
y,x=np.ogrid[-r:r+1,-r:r+1];disk=x*x+y*y<=r*r
cl=nd.binary_closing(np.pad(pad,r+2),structure=disk)[r+2:-r-2,r+2:-r-2]
fill=nd.binary_fill_holes(cl)[:H]
add=fill&~a
im[add,0:3]=255;im[add,3]=255
im[fill&(im[...,3]>0),3]=255
Image.fromarray(im).save(f,lossless=False,quality=92) if f.endswith('.webp') else Image.fromarray(im).save(f)
print(f,int(add.sum()))
