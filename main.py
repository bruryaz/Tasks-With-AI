from fastapi import FastAPI
from pydantic import BaseModel
import agent_service
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

class TextOfTask(BaseModel):
    text: str

@app.post('/add-task')
async def add_task(task: TextOfTask):
    response = agent_service.agent(task.text)
    return {"response": response}

@app.get('/')
async def get():
    return "todo tasks!" + os.getenv("OPENAI_API_KEY")

@app.get('/tasks')
async def list_tasks():
    # This is a placeholder - you'll need to implement the actual task listing logic
    # For now, just returning a sample response
    return {"tasks": ["Task 1", "Task 2", "Task 3"]}

def main():
    print("hello")

if __name__ == "__main__":
    main()
