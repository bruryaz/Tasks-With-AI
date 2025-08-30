# main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import agent_service
import todo_services

app = FastAPI()

class TextOfTask(BaseModel):
    text: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # כתובת React שלך
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post('/manage-task')
async def manage_task(task: TextOfTask):
    response = agent_service.agent(task.text)
    return {"response": response}

@app.get('/tasks')
async def get_tasks():
    return todo_services.get_tasks()

@app.get('/')
async def root():
    return "Todo tasks API is running!"
