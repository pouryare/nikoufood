"""Build a small gold cursor (.cur + .png) for old browsers (IE11, legacy Edge).
Run: python tools/make-cursor.py
"""
import struct
from PIL import Image
from io import BytesIO

SIZE = 16
HOTX, HOTY = 2, 2

def make_png():
    im = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    cx = cy = SIZE // 2
    for y in range(SIZE):
        for x in range(SIZE):
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            if d <= 5.5:
                a = 255
            elif d <= 7.5:
                a = int(255 * (7.5 - d))
            else:
                a = 0
            if a:
                im.putpixel((x, y), (227, 176, 75, a))
    buf = BytesIO()
    im.save(buf, format="PNG")
    return im, buf.getvalue()

def make_cur(im, png):
    entry = struct.pack("<BBBBHHII", SIZE, SIZE, 0, 0, HOTX, HOTY, len(png), 22)
    header = struct.pack("<HHH", 0, 2, 1)
    px = im.load()
    and_rows = []
    for y in range(SIZE - 1, -1, -1):
        row = 0
        for x in range(SIZE):
            row <<= 1
            if px[x, y][3] == 0:
                row |= 1
        and_rows.append(row)
    and_mask = b"".join(struct.pack("<I", r) for r in and_rows)
    return header + entry + png + and_mask

if __name__ == "__main__":
    im, png = make_png()
    cur_data = make_cur(im, png)
    with open("src/components/effects/cursor.cur", "wb") as f:
        f.write(cur_data)
    with open("src/components/effects/cursor.png", "wb") as f:
        f.write(png)
    print("cursor.cur and cursor.png written")
