import os
import re

dir_path = 'd:\\College\\Interns\\Vector Shift\\frontend\\src'

replacements = {
    'omori-room-title': 'omoriRoomTitle',
    'omori-room-id': 'omoriRoomId',
    'omori-input-group': 'omoriInputGroup',
    'omori-nav-btn': 'omoriNavBtn',
    'omori-nav-divider': 'omoriNavDivider',
    'omori-dialogue-speaker': 'omoriDialogueSpeaker',
    'omori-dialogue-row': 'omoriDialogueRow',
    'omori-room': 'omoriRoom',
    'omori-input': 'omoriInput',
    'omori-draggable': 'omoriDraggable',
    'omori-cord': 'omoriCord',
    'omori-lightbulb': 'omoriLightbulb',
    'omori-dots-bg': 'omoriDotsBg',
    'omori-nav': 'omoriNav',
    'omori-dialogue': 'omoriDialogue',
    'omori-submit': 'omoriSubmit',
    'omori-sparkle': 'omoriSparkle'
}

for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.js') or file.endswith('.css'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements.items():
                new_content = re.sub(r'\b' + old + r'\b', new, new_content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {path}")
