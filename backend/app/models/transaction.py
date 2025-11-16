from pydantic import BaseModel

class Transaction(BaseModel):
    id: int
    value_date: str
    entry_date: str
    type: str
    amount: float
    description: str

    class Config:
        orm_mode = True