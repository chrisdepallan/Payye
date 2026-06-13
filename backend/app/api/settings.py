from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import User, UserSettings
from app.schemas import SettingsOut, SettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


def _ensure_settings(user: User, db: Session) -> UserSettings:
    if user.settings is None:
        user.settings = UserSettings(user_id=user.id)
        db.add(user.settings)
        db.commit()
        db.refresh(user.settings)
    return user.settings


@router.get("", response_model=SettingsOut)
def get_settings(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SettingsOut:
    return SettingsOut.model_validate(_ensure_settings(user, db))


@router.patch("", response_model=SettingsOut)
def update_settings(
    payload: SettingsUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SettingsOut:
    settings = _ensure_settings(user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return SettingsOut.model_validate(settings)
