from peewee import *
from datetime import datetime

db = SqliteDatabase("database.sqlite")


class __BaseModel(Model):
    class Meta:
        database = db


class Users(__BaseModel):
    user_name = TextField(unique=True)
    password = TextField()
    create_at = DateField(default=datetime.now())
    update_at = DateField(default=datetime.now())


class Passwords(__BaseModel):
    user = ForeignKeyField(Users, on_delete="CASCADE")
    site = TextField(null=False)
    user_site = TextField(null=False)
    password = TextField(null=False)
    create_at = DateField(default=datetime.now())
    update_at = DateField(default=datetime.now())


# if os.path.exists("database.sqlite"):
#     os.remove("database.sqlite")

db.connect()
db.create_tables([Users, Passwords])
