import sys
from PIL import Image, ImageFilter, ImageOps
import numpy as np

input_path = r"C:\Users\AXIO\.gemini\antigravity-ide\brain\ba7b3aa8-98a5-4e33-9cc7-b2c61b41b4b5\.user_uploaded\media_1788786825506.jpg"
output_group = r"e:\Map Famgath\public\avatars\pju_squad_4.png"

# Load image
img = Image.open(input_path).convert("RGBA")
arr = np.array(img)

# R, G, B channels
r = arr[:, :, 0].astype(np.float32)
g = arr[:, :, 1].astype(np.float32)
b = arr[:, :, 2].astype(np.float32)

# Black background detection: luminance
# Near pure black background has very low r, g, b
brightness = np.maximum(np.maximum(r, g), b)

# Create alpha channel: 0 where brightness < 12, 255 where brightness > 25, smooth in between
alpha = np.clip((brightness - 8) / (25 - 8) * 255, 0, 255).astype(np.uint8)

arr[:, :, 3] = alpha
result_img = Image.fromarray(arr, mode="RGBA")

# Clean stray pixels with alpha thresholding and gentle smoothing
alpha_channel = result_img.split()[3]
# Smooth alpha slightly for crisp anti-aliased edge
alpha_blurred = alpha_channel.filter(ImageFilter.SMOOTH_MORE)
result_img.putalpha(alpha_blurred)

# Crop transparent borders
bbox = result_img.getbbox()
if bbox:
    result_img = result_img.crop(bbox)

result_img.save(output_group, "PNG")
print("Saved squad image:", output_group, "Size:", result_img.size)

# Also create individual crops
w, h = result_img.size
# 4 figures roughly evenly distributed across width
step = w / 4.0
crop_faried = result_img.crop((0, 0, int(step * 1.15), h))
crop_budi = result_img.crop((int(step * 0.85), 0, int(step * 2.15), h))
crop_faizal = result_img.crop((int(step * 1.85), 0, int(step * 3.15), h))
crop_sujadi = result_img.crop((int(step * 2.85), 0, w, h))

# Crop each transparent edge
for name, c in [
    ("pju_faried.png", crop_faried),
    ("pju_budi.png", crop_budi),
    ("pju_faizal.png", crop_faizal),
    ("pju_sujadi.png", crop_sujadi),
]:
    cb = c.getbbox()
    if cb:
        c = c.crop(cb)
    out_ind = f"e:\\Map Famgath\\public\\avatars\\{name}"
    c.save(out_ind, "PNG")
    print(f"Saved {name}: {c.size}")

print("Done processing PJU squad!")
