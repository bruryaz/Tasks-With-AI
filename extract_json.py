import re
import json

def extract_json(text: str):
    # חיפוש בלוק JSON בין ```json ל-```
    match = re.search(r"```json(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    
    # אם לא מצא, ננסה לחפש סתם { ... }
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return match.group(0).strip()
    
    return None
