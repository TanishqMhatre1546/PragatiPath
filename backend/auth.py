from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from database import get_db
from models import User

SECRET_KEY = "pragatipath-sih-demo-jwt-secret-key-zero-cost"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours for demo ease

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    full_name: str
    email: str


class LoginRequest(BaseModel):
    username: str
    password: Optional[str] = "demo123"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/login", response_model=TokenResponse)
def login(form_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Demo login endpoint: Accepts trainee_demo, employer_demo, or govt_demo (or role name directly).
    Returns JWT with role claim for role-based views.
    """
    uname = form_data.username.strip().lower()
    
    # Map convenience role names to demo accounts
    if uname in ["trainee", "trainee_demo"]:
        uname = "trainee_demo"
    elif uname in ["employer", "employer_demo"]:
        uname = "employer_demo"
    elif uname in ["government", "govt", "govt_demo", "admin"]:
        uname = "govt_demo"

    user = db.query(User).filter(User.username == uname).first()
    if not user:
        # Fallback: create mock demo user if needed
        role = "government" if "govt" in uname or "admin" in uname else ("employer" if "employer" in uname else "trainee")
        user = User(
            username=uname,
            role=role,
            email=f"{uname}@pragatipath.gov.in",
            full_name=f"{uname.replace('_', ' ').title()}"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token_data = {
        "sub": user.username,
        "role": user.role,
        "full_name": user.full_name,
        "user_id": user.id
    }
    token = create_access_token(token_data)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        username=user.username,
        full_name=user.full_name,
        email=user.email
    )


def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        # Return default guest user with government privileges in demo mode if unauthenticated
        default_user = db.query(User).filter(User.role == "government").first()
        return default_user or User(id=1, username="demo_guest", role="government", full_name="Demo Guest", email="guest@demo.in")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token claims")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
