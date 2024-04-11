from fastapi import FastAPI, APIRouter, Body, Request
from fastapi.staticfiles import StaticFiles
from database import Passwords, Users, db
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from dotenv import load_dotenv
from string import ascii_letters, digits, punctuation
import random
import bcrypt
import json
import jwt
import os

load_dotenv()
SECRET = os.getenv("KEY")
PORT = "0"
app = FastAPI()
router = APIRouter()
f = Fernet(SECRET)

if os.getenv("PORT"):
    PORT = os.getenv("PORT")
else:
    PORT = "8000"


def generate_password(
    length, uppercase=True, lowercase=True, numbers=True, symbols=True
):
    characters = ""
    if uppercase:
        characters += ascii_letters.upper()
    if lowercase:
        characters += ascii_letters.lower()
    if numbers:
        characters += digits
    if symbols:
        characters += punctuation
    password = "".join(random.choice(characters) for _ in range(length))

    return password


def get_bearer_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ")[1]


def validate_jwt(token: str):
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload.get("user")

    except Exception as _e:
        return None


@app.post("/api/sign-in")
def try_login(data: dict = Body(...)):
    if data.get("user") and data.get("password"):
        try:
            with db.connection_context():
                user = Users.get(Users.user_name == data["user"])
        except Exception as _e:
            return {"success": False}
        if bcrypt.checkpw(
            data.get("password").encode("utf8"), user.password.encode("utf8")
        ):
            exp_datetime = datetime.now() + timedelta(hours=1)
            payload = {"user": data["user"], "exp": exp_datetime.timestamp()}
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
            with db.connection_context():
                Users.create(user_name=data["user"], password=password_hash)
            exp_datetime = datetime.now() + timedelta(hours=1)
            payload = {"user": data["user"], "exp": exp_datetime.timestamp()}
            encoded_jwt = jwt.encode(payload, SECRET, algorithm="HS256")
            return {"success": True, "token": encoded_jwt}
        except Exception as _e:
            return {"success": False}
    else:
        return {"success": False}


@app.get("/api/generate")
def read_item():
    return {"password": generate_password(16)}


@app.get("/api/validate")
def validate_token(request: Request):
    token = get_bearer_token(request)
    decoded_token = validate_jwt(token)
    try:
        with db.connection_context():
            user = Users.get(Users.user_name == decoded_token)
        if user:
            return {"success": True}
        return {"success": False}
    except Exception as _e:
        return {"success": False}


@app.get("/api/password")
def getPasswords(request: Request):
    token = get_bearer_token(request)
    decoded_token = validate_jwt(token)
    if decoded_token:
        with db.connection_context():
            user = Users.get(Users.user_name == decoded_token)
            passwords_list = Passwords.select().where(Passwords.user == user.id)
        pw = []
        for password in passwords_list:
            pw.append(
                {
                    "site": password.site,
                    "user": password.user_site,
                    "password": f.decrypt(password.password),
                    "date": password.update_at,
                }
            )
        return {"success": True, "data": pw}
    return {"success": False}


@app.post("/api/password")
async def save_password(request: Request):
    token = get_bearer_token(request)
    decoded_token = validate_jwt(token)
    if not decoded_token:
        return {"success": False}
    raw_data = await request.body()
    data = json.loads(raw_data)
    if data.get("site") and data.get("user") and data.get("password"):
        with db.connection_context():
            user = Users.get(Users.user_name == decoded_token)
        try:
            Passwords.create(
                user=user.id,
                site=data.get("site"),
                user_site=data.get("user"),
                password=f.encrypt(bytes(data.get("password").encode("utf-8"))),
            )
            return {"success": True}
        except Exception as e:
            print(e)
            return {"success": False}
    return {"success": False}


app.mount("/", StaticFiles(directory="public", html=True), name="public")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(PORT),
        access_log="critical",
        limit_max_requests=100,
    )
