# PMT - Author Dmitry Khorov


import os

AUTHOR_INFO = """Author: Dmitry Khorov
Telegram: @dkdevelop @jpegweb
DK Studio Production
"""

def create_info_file(folder_path):
    # Список всех элементов в папке
    items = os.listdir(folder_path)

    # Файлы (кроме info.txt)
    files = [f for f in items if os.path.isfile(os.path.join(folder_path, f)) and f != "info.txt"]
    # Папки
    folders = [f for f in items if os.path.isdir(os.path.join(folder_path, f))]

    # Формируем строки с файлами и их размерами
    file_details = []
    for f in files:
        size_kb = os.path.getsize(os.path.join(folder_path, f)) / 1024
        file_details.append(f"{f} - {size_kb:.2f} KB")

    # Текст для info.txt
    content_lines = [
        f"Folder: {os.path.basename(folder_path) or folder_path}",
        f"Files: {len(files)}",
        "",
        *file_details,
        "",
        AUTHOR_INFO.strip()
    ]

    info_path = os.path.join(folder_path, "info.txt")
    with open(info_path, "w", encoding="utf-8") as f:
        f.write("\n".join(content_lines))

    # Рекурсивно обрабатываем поддиректории
    for subfolder in folders:
        subfolder_path = os.path.join(folder_path, subfolder)
        create_info_file(subfolder_path)

def main():
    root_dir = os.getcwd()  # текущая директория, где запущен скрипт
    create_info_file(root_dir)
    print("✅ Файлы info.txt успешно созданы во всех папках проекта!")

if __name__ == "__main__":
    main()

# AtomGlide Front-end Client
# Author: Dmitry Khorov
# GitHub: DKhorov
# Telegram: @dkdevelop @jpegweb
# 2025 Project
