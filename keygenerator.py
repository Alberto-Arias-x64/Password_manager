from cryptography.fernet import Fernet

clave = Fernet.generate_key()

print("Clave generada para Fernet:", clave)
