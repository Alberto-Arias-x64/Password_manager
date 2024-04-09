from fastapi import FastAPI, APIRouter, Body
from fastapi.staticfiles import StaticFiles
from database import Users
from datetime import datetime
import bcrypt
import jwt

SECRET = "1234"

app = FastAPI()
router = APIRouter()


@app.post("/api/sign-in")
def try_login(data: dict = Body(...)):
    if data.get("user") and data.get("password"):
        user = Users.select(["password"]).where(Users.username == data["user"])
        print(user)
        if user:
            payload = {"user": data["user"], "exp": datetime.now()}
            encoded_jwt = jwt.encode(payload, SECRET, algorithm="HS256")
            return {"success": True, "token": encoded_jwt}
        return {"success": False}
    else:
        return {"success": False}


@app.post("/api/sign-up")
def try_(data: dict = Body(...)):
    if (
        data.get("user")
        and data.get("password")
        and data.get("confirmPassword")
        and data.get("password") == data.get("confirmPassword")
    ):
        try:
            password_hash = bcrypt.hashpw(
                data["password"].encode("utf-8"), bcrypt.gensalt(12)
            )
            Users(username=data["user"], password=password_hash).save()
            payload = {"user": data["user"], "exp": datetime.now()}
            encoded_jwt = jwt.encode(payload, SECRET, algorithm="HS256")
            return {"success": True, "token": encoded_jwt}
        except Exception as e:
            print(e)
            return {"success": False}
    else:
        return {"success": False}


@app.get("/api/generate")
def read_item():
    return {"item_id": 1234}


app.mount("/", StaticFiles(directory="public", html=True), name="public")

# jwt.decode(encoded_jwt, "secret", algorithms=["HS256"])
