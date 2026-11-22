from sqlalchemy import Boolean, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    name: Mapped[str] = mapped_column(String(240), index=True)
    code: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    semester: Mapped[int] = mapped_column(Integer, index=True)
    category: Mapped[str] = mapped_column(String(120), default="Computer Science")
    branches: Mapped[list] = mapped_column(JSON, default=list)
    color: Mapped[str] = mapped_column(String(40), default="blue")
    icon: Mapped[str] = mapped_column(String(40), default="+")
    lessons: Mapped[int] = mapped_column(Integer, default=0)
    units: Mapped[int] = mapped_column(Integer, default=0)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    teacher: Mapped[str] = mapped_column(String(180), default="LearnHub Faculty")
    description: Mapped[str] = mapped_column(Text, default="")
    updated: Mapped[str] = mapped_column(String(80), default="Just added")
    popular: Mapped[bool] = mapped_column(Boolean, default=False)


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    title: Mapped[str] = mapped_column(String(300), index=True)
    course: Mapped[str] = mapped_column(String(240), index=True)
    code: Mapped[str] = mapped_column(String(80), index=True)
    type: Mapped[str] = mapped_column(String(80), index=True)
    pages: Mapped[int] = mapped_column(Integer, default=1)
    paper_year: Mapped[str] = mapped_column(String(8), default="")
    date: Mapped[str] = mapped_column(String(80), default="Just added")
    size: Mapped[str] = mapped_column(String(40), default="")
    file_name: Mapped[str] = mapped_column(String(300), default="")
    file_path: Mapped[str] = mapped_column(Text, default="")
    uploaded: Mapped[bool] = mapped_column(Boolean, default=False)

