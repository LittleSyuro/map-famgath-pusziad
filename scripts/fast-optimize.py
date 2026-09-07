import os
import sys
from PIL import Image

def fast_optimize():
    # Remove unused duplicates
    for d in [
        "public/maps-3d-model.png",
        "public/maps-diorama.png",
        "public/resort_media/mountain_lounge/Foto/IMG_3568.jpg"
    ]:
        if os.path.exists(d):
            try:
                os.remove(d)
                print(f"Removed {d}", flush=True)
            except Exception:
                pass

    for root, _, files in os.walk("public"):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in [".jpg", ".jpeg", ".png"]:
                path = os.path.join(root, f)
                # Skip small files and avatar icons
                if "avatars" in root or "legend" in root:
                    continue
                size = os.path.getsize(path)
                if size > 800 * 1024:
                    try:
                        with Image.open(path) as img:
                            w, h = img.size
                            if max(w, h) > 1920:
                                scale = 1920 / max(w, h)
                                img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.BILINEAR)
                            if ext in [".jpg", ".jpeg"]:
                                if img.mode != "RGB":
                                    img = img.convert("RGB")
                                img.save(path, format="JPEG", quality=80)
                            elif ext == ".png":
                                if f != "maps-area.png":
                                    # If it's a spot photo saved as PNG without alpha, convert to JPG or resize
                                    if img.mode == "RGBA":
                                        img.save(path, format="PNG", compress_level=3)
                                    else:
                                        img = img.convert("RGB")
                                        img.save(path, format="JPEG", quality=80)
                                else:
                                    # maps-area.png
                                    img.save(path, format="PNG", compress_level=3)
                        new_size = os.path.getsize(path)
                        print(f"Compressed {f}: {size//1024}KB -> {new_size//1024}KB", flush=True)
                    except Exception as e:
                        print(f"Error {f}: {e}", flush=True)

if __name__ == "__main__":
    fast_optimize()
    print("ALL DONE", flush=True)
