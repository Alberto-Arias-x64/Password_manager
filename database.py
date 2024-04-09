from peewee import *
from datetime import datetime
import os

db = SqliteDatabase("database.sqlite")


class __BaseModel(Model):
    class Meta:
        database = db


class Users(__BaseModel):
    username = TextField(unique=True)
    password = TextField()
    create_at = DateField(default=datetime.now())
    update_at = DateField(default=datetime.now())


class Passwords(__BaseModel):
    user = ForeignKeyField(Users, on_delete="CASCADE")
    Passwords = TextField()


if os.path.exists("database.sqlite"):
    os.remove("database.sqlite")

db.connect()
db.create_tables([Users, Passwords])

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, port=8000)
