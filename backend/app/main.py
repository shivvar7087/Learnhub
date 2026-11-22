import os
import re
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Course, Resource
from .schemas import CourseCreate, CourseOut, ResourceOut, ResourceUpdate
from .seed import seed_database

ROOT=Path(__file__).resolve().parents[1]
upload_dir=Path(os.getenv('UPLOAD_DIR','./uploads'))
if not upload_dir.is_absolute():upload_dir=ROOT/upload_dir
upload_dir.mkdir(parents=True,exist_ok=True)

app=FastAPI(title='LearnHub API',version='1.0.0')
origins=[origin.strip() for origin in os.getenv('FRONTEND_ORIGINS','http://localhost:5173,http://127.0.0.1:5173').split(',') if origin.strip()]
app.add_middleware(CORSMiddleware,allow_origins=origins,allow_credentials=True,allow_methods=['*'],allow_headers=['*'])


@app.on_event('startup')
def initialize_database():
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:seed_database(db)


def resource_json(item:Resource):
    return ResourceOut.model_validate(item)


@app.get('/api/health')
def health(db:Session=Depends(get_db)):
    db.execute(select(1))
    return {'status':'ok','database':'connected'}


@app.get('/api/courses',response_model=list[CourseOut])
def list_courses(db:Session=Depends(get_db)):
    return db.scalars(select(Course).order_by(Course.semester,Course.name)).all()


@app.post('/api/courses',response_model=CourseOut,status_code=201)
def create_course(payload:CourseCreate,db:Session=Depends(get_db)):
    values=payload.model_dump()
    values['id']=values['id'] or f"course-{uuid4().hex[:12]}"
    values['code']=values['code'].strip().upper()
    course=Course(**values)
    db.add(course)
    try:db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409,detail='A course already uses that code.')
    db.refresh(course)
    return course


@app.delete('/api/courses/{course_id}',status_code=204)
def delete_course(course_id:str,db:Session=Depends(get_db)):
    course=db.get(Course,course_id)
    if course is None:raise HTTPException(status_code=404,detail='Course not found.')
    for resource in db.scalars(select(Resource).where(Resource.course==course.name)).all():
        if resource.file_path:
            try:Path(resource.file_path).unlink(missing_ok=True)
            except OSError:pass
        db.delete(resource)
    db.delete(course)
    db.commit()


@app.get('/api/resources',response_model=list[ResourceOut])
def list_resources(db:Session=Depends(get_db)):
    rows=db.scalars(select(Resource).order_by(Resource.title)).all()
    return [resource_json(item) for item in rows]


@app.post('/api/resources',response_model=ResourceOut,status_code=201)
async def upload_resource(
    title:str=Form(...),course:str=Form(...),code:str=Form(...),resource_type:str=Form(...,alias='type'),
    paper_year:str=Form(''),file:UploadFile=File(...),db:Session=Depends(get_db)
):
    filename=Path(file.filename or 'resource.pdf').name
    if not filename.lower().endswith('.pdf') and file.content_type!='application/pdf':
        raise HTTPException(status_code=415,detail='Only PDF files can be uploaded.')
    contents=await file.read(20*1024*1024+1)
    if len(contents)>20*1024*1024:raise HTTPException(status_code=413,detail='PDF must be 20 MB or smaller.')
    if not contents.startswith(b'%PDF'):raise HTTPException(status_code=415,detail='The uploaded file is not a valid PDF.')
    safe_name=re.sub(r'[^a-zA-Z0-9._-]+','-',filename)
    resource_id=f"res-{uuid4().hex}"
    path=upload_dir/f'{resource_id}-{safe_name}'
    path.write_bytes(contents)
    item=Resource(id=resource_id,title=title.strip(),course=course.strip(),code=code.strip().upper(),type=resource_type,paper_year=paper_year or '',pages=1,date='Just added',size=f'{len(contents)/1024/1024:.2f} MB',file_name=filename,file_path=str(path),uploaded=True)
    db.add(item)
    db.commit()
    db.refresh(item)
    return resource_json(item)


@app.patch('/api/resources/{resource_id}',response_model=ResourceOut)
def update_resource(resource_id:str,payload:ResourceUpdate,db:Session=Depends(get_db)):
    item=db.get(Resource,resource_id)
    if item is None:raise HTTPException(status_code=404,detail='Resource not found.')
    for key,value in payload.model_dump(exclude_unset=True).items():
        setattr(item,'paper_year' if key=='paper_year' else key,value)
    db.commit()
    db.refresh(item)
    return resource_json(item)


@app.put('/api/resources/{resource_id}/file',response_model=ResourceOut)
async def replace_resource_file(resource_id:str,file:UploadFile=File(...),db:Session=Depends(get_db)):
    item=db.get(Resource,resource_id)
    if item is None:raise HTTPException(status_code=404,detail='Resource not found.')
    filename=Path(file.filename or 'resource.pdf').name
    if not filename.lower().endswith('.pdf') and file.content_type!='application/pdf':raise HTTPException(status_code=415,detail='Only PDF files can be uploaded.')
    contents=await file.read(20*1024*1024+1)
    if len(contents)>20*1024*1024:raise HTTPException(status_code=413,detail='PDF must be 20 MB or smaller.')
    if not contents.startswith(b'%PDF'):raise HTTPException(status_code=415,detail='The uploaded file is not a valid PDF.')
    safe_name=re.sub(r'[^a-zA-Z0-9._-]+','-',filename)
    path=upload_dir/f'{resource_id}-{uuid4().hex[:8]}-{safe_name}'
    path.write_bytes(contents)
    old_path=Path(item.file_path) if item.file_path else None
    item.file_path=str(path);item.file_name=filename;item.size=f'{len(contents)/1024/1024:.2f} MB';item.uploaded=True
    db.commit();db.refresh(item)
    if old_path:
        try:old_path.unlink(missing_ok=True)
        except OSError:pass
    return resource_json(item)


@app.delete('/api/resources/{resource_id}',status_code=204)
def delete_resource(resource_id:str,db:Session=Depends(get_db)):
    item=db.get(Resource,resource_id)
    if item is None:raise HTTPException(status_code=404,detail='Resource not found.')
    if item.file_path:
        try:Path(item.file_path).unlink(missing_ok=True)
        except OSError:pass
    db.delete(item)
    db.commit()


@app.get('/api/resources/{resource_id}/file')
def get_resource_file(resource_id:str,db:Session=Depends(get_db)):
    item=db.get(Resource,resource_id)
    if item is None:raise HTTPException(status_code=404,detail='Resource not found.')
    path=Path(item.file_path) if item.file_path else None
    if path is None or not path.is_file():raise HTTPException(status_code=404,detail='This is a sample resource without a stored PDF.')
    return FileResponse(path,media_type='application/pdf',filename=item.file_name or path.name)
