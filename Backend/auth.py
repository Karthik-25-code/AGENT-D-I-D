from fastapi import APIRouter, HTTPException, status
from botocore.exceptions import ClientError
from pydantic import EmailStr, BaseModel
from database import table
from utils.auth_utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth")

class UserLoginAuth(BaseModel):
    email: EmailStr
    password: str

class UserAuth(BaseModel):
    fullName: str
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(user: UserAuth):
    hashed = hash_password(user.password)
    try:
        table.put_item(
            Item={
                'fullName' : user.fullName,
                'email': user.email,
                'password': hashed,
            },
            ConditionExpression='attribute_not_exists(email)'
        )
        return {"message": "User created successfully"}
    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/login")
async def login(user: UserLoginAuth):
    response = table.get_item(Key={'email': user.email})
    db_user = response.get('Item')
    
    if not db_user or not verify_password(user.password, db_user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(data={"sub": db_user['email']})
    return {"access_token": token, "token_type": "bearer"}

