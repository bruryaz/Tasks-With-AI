from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Task(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    type: str
    date_start: datetime
    date_finish: datetime
    status: int
