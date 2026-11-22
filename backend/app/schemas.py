from pydantic import BaseModel, ConfigDict, Field, field_validator


class CourseCreate(BaseModel):
    id: str | None = None
    name: str = Field(min_length=2, max_length=240)
    code: str = Field(min_length=2, max_length=80)
    semester: int = Field(ge=1, le=8)
    category: str = "Computer Science"
    branches: list[str] = Field(default_factory=list)
    color: str = "blue"
    icon: str = "+"
    lessons: int = 0
    units: int = 0
    progress: int = 0
    teacher: str = "LearnHub Faculty"
    description: str = ""
    updated: str = "Just added"
    popular: bool = False


class CourseOut(CourseCreate):
    id: str
    model_config = ConfigDict(from_attributes=True)


class ResourceUpdate(BaseModel):
    # Defaults keep PATCH fields optional, while non-optional annotations make
    # explicit JSON null values invalid under Pydantic v2.
    title: str = Field(default=None, min_length=1, max_length=300)
    course: str = Field(default=None, min_length=1, max_length=240)
    code: str = Field(default=None, min_length=1, max_length=80)
    type: str = Field(default=None, min_length=1, max_length=80)
    paper_year: str = Field(default=None, max_length=8)

    @field_validator("title", "course", "code", "type", mode="before")
    @classmethod
    def reject_blank_strings(cls, value):
        if isinstance(value, str) and not value.strip():
            raise ValueError("This field cannot be blank.")
        return value.strip() if isinstance(value, str) else value


class ResourceOut(BaseModel):
    id: str
    title: str
    course: str
    code: str
    type: str
    pages: int
    paperYear: str = Field(default="", validation_alias="paper_year")
    date: str
    size: str
    fileName: str = Field(default="", validation_alias="file_name")
    uploaded: bool
    apiBacked: bool = True
    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=1, max_length=256)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=12, max_length=256)

    @field_validator("name", "email", mode="before")
    @classmethod
    def strip_registration_fields(cls, value):
        return value.strip() if isinstance(value, str) else value


class ProfileUpdate(BaseModel):
    name: str = Field(default=None, min_length=2, max_length=160)
    email: str = Field(default=None, min_length=3, max_length=320)
    phone: str = Field(default=None, max_length=40)

    @field_validator("name", "email", mode="before")
    @classmethod
    def strip_required_profile_fields(cls, value):
        if isinstance(value, str) and not value.strip():
            raise ValueError("This field cannot be blank.")
        return value.strip() if isinstance(value, str) else value

    @field_validator("phone", mode="before")
    @classmethod
    def strip_phone(cls, value):
        return value.strip() if isinstance(value, str) else value


class AuthUserOut(BaseModel):
    id: str
    name: str
    email: str
    phone: str = ""
    role: str
    isAdmin: bool


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserOut

