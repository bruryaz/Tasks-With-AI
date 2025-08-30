import os

from fastapi import FastAPI
from pydantic import BaseModel
import agent_service

app = FastAPI()

class TextOfTask(BaseModel):
    text: str

@app.post('/manage-task')
async def manage_task(task: TextOfTask):
    response = agent_service.agent(task.text)
    return {"response": response}

@app.get('/')
async def get():
    return "todo tasks!"

def main():
    print("hello")

if __name__ == "__main__":
    main()
