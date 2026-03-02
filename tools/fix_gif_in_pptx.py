"""
后处理 PPTX 文件，确保 GIF 动图能在 PowerPoint 中正常播放。
python-pptx 有时会将 GIF 的 Content-Type 设置错误，这里修复它。
"""
import zipfile
import os
import shutil
import xml.etree.ElementTree as ET

PPTX_PATH = os.path.join(os.path.dirname(__file__), '..', 'docs', '云笔记产品介绍.pptx')
TEMP_DIR = os.path.join(os.path.dirname(__file__), '_pptx_temp')

def fix_gif_playback():
    print(f'Processing: {PPTX_PATH}')

    # 解压
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)

    with zipfile.ZipFile(PPTX_PATH, 'r') as z:
        z.extractall(TEMP_DIR)

    # 检查媒体文件
    media_dir = os.path.join(TEMP_DIR, 'ppt', 'media')
    if os.path.exists(media_dir):
        print('Media files:')
        gif_files = []
        for f in sorted(os.listdir(media_dir)):
            fpath = os.path.join(media_dir, f)
            size = os.path.getsize(fpath)
            # 检查文件头判断是否真的是 GIF
            with open(fpath, 'rb') as fp:
                header = fp.read(6)
            is_gif = header[:3] == b'GIF'
            fmt = 'GIF' if is_gif else 'PNG/other'
            print(f'  {f} ({size/1024:.0f} KB) [{fmt}]')
            if is_gif:
                gif_files.append(f)

        if not gif_files:
            print('No GIF files found in media! python-pptx may have converted them.')
            # 手动复制 GIF 文件替换
            ss_dir = os.path.join(os.path.dirname(__file__), 'screenshots')
            # 查找哪些图片对应 GIF，通过文件大小匹配
            demo_theme_size = os.path.getsize(os.path.join(ss_dir, 'demo_theme.gif'))
            demo_sticky_size = os.path.getsize(os.path.join(ss_dir, 'demo_sticky.gif'))

            for f in sorted(os.listdir(media_dir)):
                fpath = os.path.join(media_dir, f)
                fsize = os.path.getsize(fpath)
                # 尝试通过大小匹配（GIF 通常比 PNG 大得多或不同）
                # 检查对应的关系来确定

            print('Will check relationship files to identify GIF images...')

    # 检查 [Content_Types].xml
    ct_path = os.path.join(TEMP_DIR, '[Content_Types].xml')
    tree = ET.parse(ct_path)
    root = tree.getroot()
    ns = 'http://schemas.openxmlformats.org/package/2006/content-types'

    print('\nContent Types:')
    has_gif_type = False
    for elem in root:
        tag = elem.tag.replace(f'{{{ns}}}', '')
        ext = elem.get('Extension', '')
        pn = elem.get('PartName', '')
        ct = elem.get('ContentType', '')
        if 'gif' in ext.lower() or 'gif' in ct.lower() or 'gif' in pn.lower():
            print(f'  {tag}: Extension={ext} ContentType={ct} PartName={pn}')
            has_gif_type = True

    if not has_gif_type:
        print('  No GIF content type found. Adding...')
        # 添加 GIF 扩展名 content type
        default = ET.SubElement(root, f'{{{ns}}}Default')
        default.set('Extension', 'gif')
        default.set('ContentType', 'image/gif')
        tree.write(ct_path, xml_declaration=True, encoding='UTF-8')
        print('  Added: Default Extension=gif ContentType=image/gif')

    # 检查关系文件，看 GIF 图片的引用
    slides_rels_dir = os.path.join(TEMP_DIR, 'ppt', 'slides', '_rels')
    rel_ns = 'http://schemas.openxmlformats.org/package/2006/relationships'

    gif_source_map = {
        'demo_theme.gif': os.path.join(os.path.dirname(__file__), 'screenshots', 'demo_theme.gif'),
        'demo_sticky.gif': os.path.join(os.path.dirname(__file__), 'screenshots', 'demo_sticky.gif'),
    }

    # 查找 GIF 对应的媒体文件（通过匹配关系）
    # python-pptx 通常将 .gif 文件保存为 imageN.gif 或 imageN.png
    print('\nChecking slide relationships for GIF references...')
    for rels_file in sorted(os.listdir(slides_rels_dir)):
        if not rels_file.endswith('.rels'):
            continue
        rels_path = os.path.join(slides_rels_dir, rels_file)
        rels_tree = ET.parse(rels_path)
        rels_root = rels_tree.getroot()
        for rel in rels_root:
            target = rel.get('Target', '')
            if 'media' in target:
                rel_type = rel.get('Type', '').split('/')[-1]
                # 检查目标文件是否为 GIF
                media_file = os.path.basename(target)
                media_path = os.path.join(media_dir, media_file)
                if os.path.exists(media_path):
                    with open(media_path, 'rb') as fp:
                        header = fp.read(6)
                    if header[:3] == b'GIF':
                        print(f'  {rels_file}: {media_file} is GIF (rel type: {rel_type})')

    # 重新打包
    backup = PPTX_PATH + '.bak'
    if os.path.exists(backup):
        os.remove(backup)
    os.rename(PPTX_PATH, backup)

    with zipfile.ZipFile(PPTX_PATH, 'w', zipfile.ZIP_DEFLATED) as zout:
        for dirpath, dirnames, filenames in os.walk(TEMP_DIR):
            for fn in filenames:
                full = os.path.join(dirpath, fn)
                arcname = os.path.relpath(full, TEMP_DIR)
                zout.write(full, arcname)

    # 清理
    shutil.rmtree(TEMP_DIR)
    if os.path.exists(backup):
        os.remove(backup)

    new_size = os.path.getsize(PPTX_PATH)
    print(f'\nDone! PPTX size: {new_size/1024:.0f} KB')

if __name__ == '__main__':
    fix_gif_playback()
