import re

with open('src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

def repl(match):
    comment = match.group(1).strip()
    comment = re.sub(r'[=]+', '', comment).strip() # remove ===
    comment = comment.lower()
    
    # manual shortenings for the big ones
    if "omori css custom properties" in comment: return "/* variables */"
    if "omori room" in comment: return "/* nodes */"
    if "node background overrides" in comment: return "/* node bg */"
    if "style the connection handles" in comment: return "/* handles */"
    if "tree canopy teal" in comment: return "/* green */"
    if "dark brown buffer" in comment: return "/* buffer */"
    if "selection animation" in comment: return "/* selection */"
    if "omori inputs" in comment: return "/* inputs */"
    if "top toolbar" in comment: return "/* toolbar */"
    if "submit button" in comment: return "/* submit */"
    if "context menu" in comment: return "/* context menu */"
    if "react flow overrides" in comment: return "/* react flow */"
    if "hanging cord" in comment: return "/* cord */"
    if "white space box" in comment: return "/* whitespace box */"
    if "modal" in comment: return "/* modal */"
    if "navigation toolbar" in comment: return "/* nav */"
    if "minimap overrides" in comment: return "/* minimap */"
    if "reduced motion" in comment: return "/* motion */"
    if "aspect ratio" in comment: return "/* aspect ratio */"
    if "all icons" in comment: return "/* icons */"
    if "door \u2014 upper left" in comment: return "/* door */"
    if "sketchbook" in comment: return "/* sketchbook */"
    if "laptop" in comment: return "/* laptop */"
    if "tissuebox" in comment: return "/* tissuebox */"
    if "hide the default reactflow controls" in comment: return "/* hide controls */"
    if "start below the toolbar" in comment: return "/* positioning */"
    if "inner white border" in comment: return "/* border */"
    if "match the green border" in comment: return "/* border */"
    if "shorter cord" in comment: return "/* size */"
    
    # remove multi-line decorative comments entirely
    if "inspired by" in comment: return "/* whitespace box */"
    if "bottom right" in comment and "white space box" not in comment: return ""

    # Keep very short ones
    comment = ' '.join(comment.split())
    if len(comment) > 20:
        words = comment.split()
        comment = ' '.join(words[:2])

    return f"/* {comment} */"

new_content = re.sub(r'/\*(.*?)\*/', repl, content, flags=re.DOTALL)

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("done")
