from datetime import datetime

from pydantic import BaseModel


class Task(BaseModel):
    id: int
    title: str
    description: str
    type: str
    date_start: datetime
    date_finish: datetime
    status: int
