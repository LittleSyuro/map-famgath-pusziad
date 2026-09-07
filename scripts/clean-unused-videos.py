import os
import glob

used_videos = {
    "mongolian_12.mp4",
    "the_cave_22.mp4",
    "Mountain Lounge.mp4",
    "grand_ballroom_47.mp4",
}

media_dir = r"e:\Map Famgath\public\resort_media"
deleted_count = 0
deleted_bytes = 0

for root, dirs, files in os.walk(media_dir):
    for f in files:
        if f.lower().endswith((".mp4", ".mov", ".avi")):
            if f not in used_videos:
                full_path = os.path.join(root, f)
                size = os.path.getsize(full_path)
                os.remove(full_path)
                deleted_count += 1
                deleted_bytes += size
                print(f"Removed unused video: {f} ({round(size / 1024 / 1024, 2)} MB)")

print(f"Total deleted: {deleted_count} files, {round(deleted_bytes / 1024 / 1024, 2)} MB")
