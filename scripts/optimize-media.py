import os
from PIL import Image

def optimize():
    # Remove unused duplicate files
    duplicates = [
        "public/maps-3d-model.png",
        "public/maps-diorama.png",
        "public/resort_media/mountain_lounge/Foto/IMG_3568.jpg"
    ]
    for d in duplicates:
        if os.path.exists(d):
            os.remove(d)
            print(f"Removed duplicate: {d}")

    # Optimize all images in public/
    count = 0
    saved_bytes = 0
    for root, _, files in os.walk("public"):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in [".jpg", ".jpeg", ".png"]:
                path = os.path.join(root, f)
                old_size = os.path.getsize(path)
                
                # If image is larger than 600KB, optimize it
                if old_size > 600 * 1024:
                    try:
                        with Image.open(path) as img:
                            orig_format = img.format
                            w, h = img.size
                            
                            # Max dimension 2200px
                            max_dim = 2200
                            if max(w, h) > max_dim:
                                scale = max_dim / max(w, h)
                                img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
                            
                            if ext in [".jpg", ".jpeg"]:
                                if img.mode != "RGB":
                                    img = img.convert("RGB")
                                img.save(path, format="JPEG", quality=82, optimize=True, progressive=True)
                            elif ext == ".png":
                                # If it doesn't have transparency, convert to JPEG if it was huge photo named .png or optimize PNG
                                if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                                    img.save(path, format="PNG", optimize=True)
                                else:
                                    img.save(path, format="PNG", optimize=True)
                        
                        new_size = os.path.getsize(path)
                        saved = old_size - new_size
                        if saved > 0:
                            saved_bytes += saved
                            count += 1
                            print(f"Optimized {f}: {old_size/1024/1024:.2f}MB -> {new_size/1024/1024:.2f}MB")
                    except Exception as e:
                        print(f"Error optimizing {path}: {e}")

    print(f"Total optimized: {count} images, saved {saved_bytes/1024/1024:.2f} MB")

if __name__ == "__main__":
    optimize()
