from pydantic.v1 import BaseModel


class TextOfTask(BaseModel):
    text: str
