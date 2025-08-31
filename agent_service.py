import json
import httpx
from dotenv import load_dotenv
from models.Task import Task
import todo_services
from openai import OpenAI
import os
from extract_json import extract_json

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    http_client=httpx.Client(verify=False)
)

with open("prompts/system-message.md", encoding="utf-8") as f:
    SYSTEM_PROMPT = f.read()

conversation_summary = "השיחה התחילה."

def agent(query: str):
    global conversation_summary

    tasks_list = todo_services.get_tasks()
    tasks_text = "\n".join([f"{t.id}: {t.title} - {t.status}" for t in tasks_list])

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": f"סיכום השיחה עד כה: {conversation_summary}"},
        {"role": "system", "content": f"מצב המשימות כרגע:\n{tasks_text}"},
        {"role": "user", "content": query}
    ]

    
    # קריאה ל-GPT
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0
    )

    reply = completion.choices[0].message.content

    result = None
    try:
        json_text = extract_json(reply)
        if json_text:
            instruction = json.loads(json_text)
        else:
            raise Exception(f"לא הצלחתי לחלץ JSON מתוך התשובה: {reply}")

        instruction = json.loads(json_text)
        function_name = instruction.get("function")
        parameters = instruction.get("parameters", {})

        if function_name == "add_task":
            parameters.pop("id", None)
            task_obj = Task(**parameters)
            result = todo_services.add_task(task_obj)

        elif function_name == "update_task":
            task_id = parameters.get("id")
            if not task_id:
                raise Exception("חובה לספק id של המשימה לעדכון")

            existing_task = next((t for t in todo_services.get_tasks() if t.id == task_id), None)
            if not existing_task:
                raise Exception(f"לא נמצאה משימה עם id: {task_id}")

            # עדכון רק של השדות שהגיעו
            for key, value in parameters.items():
                if key != "id":  # id נשאר אותו הדבר
                    setattr(existing_task, key, value)

            result = todo_services.update_task(existing_task)


        elif function_name == "delete_task":
            task_id = parameters.get("id")
            if task_id is None or not any(t.id == task_id for t in todo_services.get_tasks()):
                raise Exception(f"לא נמצאה משימה עם id: {task_id}")
            result = todo_services.delete_task(task_id)

        elif function_name == "get_tasks":
            result = todo_services.get_tasks()

        else:
            result = f"פונקציה לא מוכרת: {function_name}"

    except json.JSONDecodeError:
        result = f"GPT לא החזיר JSON תקין. תשובה: {reply}"
    except Exception as e:
        result = f"שגיאה בהפעלה: {e}"

    # עדכון סיכום השיחה
    summary_prompt = [
        {"role": "system", "content": "אתה עוזר חכם שמסכם שיחות בצורה תמציתית ומדויקת."},
        {"role": "user", "content": f"עדכן את סיכום השיחה הבא בהתאם לשאלה והתשובה החדשה:\n\nסיכום קודם:\n{conversation_summary}\n\nשאלה:\n{query}\n\nתשובה:\n{reply}"}
    ]

    summary_completion = client.chat.completions.create(
        model="gpt-4o",
        messages=summary_prompt,
        temperature=0
    )

    conversation_summary = summary_completion.choices[0].message.content

    # ניסוח תשובה נחמדה למשתמש
    final_prompt = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": query},
        {"role": "assistant", "content": reply},
        {"role": "system", "content": f"סיכום השיחה עד כה: {conversation_summary}"},
        {"role": "user", "content": f"התוצאה: {result}. תנסח תשובה נחמדה למשתמש."}
    ]

    final_completion = client.chat.completions.create(
        model="gpt-4o",
        messages=final_prompt,
        temperature=0.7
    )

    print("Current tasks after operation:", todo_services.get_tasks())

    return final_completion.choices[0].message.content
