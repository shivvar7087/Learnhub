from pydantic import BaseModel, ConfigDict, Field


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
    title: str | None = None
    course: str | None = None
    code: str | None = None
    type: str | None = None
    paper_year: str | None = None


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

