"""
将多帧截图合成为 GIF 动画
"""
from PIL import Image
import os

SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), 'screenshots')

def make_gif(frame_pattern, output_name, count, duration=1200):
    """将一组帧合成为 GIF"""
    frames = []
    for i in range(1, count + 1):
        fname = frame_pattern.format(i)
        fpath = os.path.join(SCREENSHOT_DIR, fname)
        if os.path.exists(fpath):
            img = Image.open(fpath).convert('RGBA')
            # 转为 RGB + 白底（GIF 不支持半透明）
            bg = Image.new('RGB', img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[3])
            frames.append(bg)
            print(f'  + {fname} ({img.size[0]}x{img.size[1]})')
        else:
            print(f'  ! {fname} not found')

    if len(frames) >= 2:
        out = os.path.join(SCREENSHOT_DIR, output_name)
        frames[0].save(
            out, save_all=True, append_images=frames[1:],
            duration=duration, loop=0, optimize=True
        )
        size_kb = os.path.getsize(out) / 1024
        print(f'  => {output_name} ({size_kb:.0f} KB, {len(frames)} frames)')
    else:
        print(f'  ! Not enough frames for {output_name}')

if __name__ == '__main__':
    print('=== Theme switch GIF ===')
    make_gif('theme_f{}.png', 'demo_theme.gif', 5, duration=1500)

    print('=== Sticky theme GIF ===')
    make_gif('sticky_f{}.png', 'demo_sticky.gif', 6, duration=1000)

    print('Done!')
