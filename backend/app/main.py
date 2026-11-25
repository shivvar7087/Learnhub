import os
import re
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pypdf import PdfReader
from pypdf.generic import ArrayObject, DictionaryObject, IndirectObject
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .auth_routes import router as auth_router
from .database import Base, engine, get_db
from .models import Course, Resource
from .rate_limits import limiter
from .schemas import CourseCreate, CourseOut, ResourceOut, ResourceUpdate
from .security import jwt_secret, require_admin
from .seed import seed_database

ROOT=Path(__file__).resolve().parents[1]
upload_dir=Path(os.getenv('UPLOAD_DIR','./uploads'))
if not upload_dir.is_absolute():upload_dir=ROOT/upload_dir
upload_dir.mkdir(parents=True,exist_ok=True)

app=FastAPI(title='LearnHub API',version='1.0.0')
origins=[origin.strip() for origin in os.getenv('FRONTEND_ORIGINS','http://localhost:5173,http://127.0.0.1:5173').split(',') if origin.strip()]
app.add_middleware(CORSMiddleware,allow_origins=origins,allow_credentials=True,allow_methods=['*'],allow_headers=['*'])
app.state.limiter=limiter
app.add_exception_handler(RateLimitExceeded,_rate_limit_exceeded_handler)
app.include_router(auth_router)

FAVICON_SVG='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#3269d8"/><path d="m10 26 22-12 22 12-22 12-22-12Z" fill="#fff"/><path d="M19 32v10c8 7 18 7 26 0V32l-13 7-13-7Z" fill="#dce8ff"/><path d="M53 27v13" stroke="#fff" stroke-linecap="round" stroke-width="3"/></svg>'''


@app.get('/favicon.ico', include_in_schema=False)
def favicon():
    return Response(content=FAVICON_SVG,media_type='image/svg+xml',headers={'Cache-Control':'public, max-age=86400'})


MAX_PDF_BYTES=20*1024*1024
MAX_UPLOAD_REQUEST_BYTES=MAX_PDF_BYTES+1024*1024


@app.middleware("http")
async def guard_upload_request_size(request:Request,call_next):
    is_upload=(request.method=="POST" and request.url.path=="/api/resources") or (request.method=="PUT" and request.url.path.startswith("/api/resources/") and request.url.path.endswith("/file"))
    if is_upload:
        length=request.headers.get("content-length")
        if length is None:
            return JSONResponse(status_code=411,content={"detail":"Upload requests must include a Content-Length header."})
        try:
            request_size=int(length)
        except ValueError:
            return JSONResponse(status_code=400,content={"detail":"Invalid Content-Length header."})
        if request_size>MAX_UPLOAD_REQUEST_BYTES:
            return JSONResponse(status_code=413,content={"detail":"Upload request exceeds the 20 MiB file limit."})
    return await call_next(request)


MAX_PDF_PAGES=500
DANGEROUS_PDF_KEYS={'/JavaScript','/JS','/OpenAction','/AA','/Launch','/EmbeddedFiles','/RichMedia','/SubmitForm','/ImportData','/GoToR'}


def inspect_pdf(filename:str,content_type:str,contents:bytes)->int:
    if Path(filename).suffix.lower()!='.pdf':
        raise HTTPException(status_code=415,detail='Only PDF files can be uploaded.')
    if content_type not in {'application/pdf','application/octet-stream'}:
        raise HTTPException(status_code=415,detail='The uploaded file must have PDF content.')
    if not contents.startswith(b'%PDF-'):
        raise HTTPException(status_code=415,detail='The uploaded file is not a valid PDF.')
    try:
        reader=PdfReader(BytesIO(contents),strict=True)
        if reader.is_encrypted:
            raise HTTPException(status_code=415,detail='Encrypted PDFs are not accepted.')
        page_count=len(reader.pages)
        if page_count<1 or page_count>MAX_PDF_PAGES:
            raise HTTPException(status_code=413,detail=f'PDFs must contain between 1 and {MAX_PDF_PAGES} pages.')
        visited=set()
        node_count=0
        def inspect_object(value):
            nonlocal node_count
            node_count+=1
            if node_count>100000:
                raise ValueError('PDF object graph is too large.')
            if isinstance(value,IndirectObject):
                identity=(value.idnum,value.generation)
                if identity in visited:return
                visited.add(identity)
                value=value.get_object()
            if isinstance(value,DictionaryObject):
                for key,child in value.items():
                    if str(key) in DANGEROUS_PDF_KEYS:
                        raise HTTPException(status_code=415,detail='PDFs with scripts, launch actions, or embedded files are not accepted.')
                    inspect_object(child)
            elif isinstance(value,ArrayObject):
                for child in value:inspect_object(child)
        inspect_object(reader.trailer)
        return page_count
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=415,detail='The PDF structure could not be safely inspected.')


@app.on_event('startup')
def initialize_database():
    jwt_secret()
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:seed_database(db)


def resource_json(item:Resource):
    return ResourceOut.model_validate(item)


@app.get('/')
def api_root():
    return {'service':'LearnHub API','docs':'/docs','health':'/api/health'}


@app.get('/api/health')
def health(db:Session=Depends(get_db)):
    db.execute(select(1))
    return {'status':'ok','database':'connected'}


@app.get('/api/courses',response_model=list[CourseOut])
def list_courses(db:Session=Depends(get_db)):
    return db.scalars(select(Course).order_by(Course.semester,Course.name)).all()


@app.post('/api/courses',response_model=CourseOut,status_code=201)
def create_course(payload:CourseCreate,admin=Depends(require_admin),db:Session=Depends(get_db)):
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
def delete_course(course_id:str,admin=Depends(require_admin),db:Session=Depends(get_db)):
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
@limiter.limit('10/hour')
async def upload_resource(
    request:Request,response:Response,title:str=Form(...),course:str=Form(...),code:str=Form(...),resource_type:str=Form(...,alias='type'),
    paper_year:str=Form(''),file:UploadFile=File(...),admin=Depends(require_admin),db:Session=Depends(get_db)
):
    filename=Path(file.filename or 'resource.pdf').name
    contents=await file.read(MAX_PDF_BYTES+1)
    if len(contents)>MAX_PDF_BYTES:raise HTTPException(status_code=413,detail='PDF must be 20 MB or smaller.')
    from starlette.concurrency import run_in_threadpool
    pages=await run_in_threadpool(inspect_pdf,filename,file.content_type or '',contents)
    safe_name=re.sub(r'[^a-zA-Z0-9._-]+','-',filename)
    resource_id=f"res-{uuid4().hex}"
    path=upload_dir/f'{resource_id}-{safe_name}'
    path.write_bytes(contents)
    item=Resource(id=resource_id,title=title.strip(),course=course.strip(),code=code.strip().upper(),type=resource_type,paper_year=paper_year or '',pages=pages,date='Just added',size=f'{len(contents)/1024/1024:.2f} MB',file_name=filename,file_path=str(path),uploaded=True)
    db.add(item)
    try:db.commit()
    except Exception:
        db.rollback();path.unlink(missing_ok=True);raise
    db.refresh(item)
    return resource_json(item)


@app.patch('/api/resources/{resource_id}',response_model=ResourceOut)
def update_resource(resource_id:str,payload:ResourceUpdate,admin=Depends(require_admin),db:Session=Depends(get_db)):
    item=db.get(Resource,resource_id)
    if item is None:raise HTTPException(status_code=404,detail='Resource not found.')
    for key,value in payload.model_dump(exclude_unset=True).items():
        setattr(item,'paper_year' if key=='paper_year' else key,value)
    db.commit()
    db.refresh(item)
    return resource_json(item)


@app.put('/api/resources/{resource_id}/file',response_model=ResourceOut)
@limiter.limit('10/hour')
async def replace_resource_file(request:Request,response:Response,resource_id:str,file:UploadFile=File(...),admin=Depends(require_admin),db:Session=Depends(get_db)):
    item=db.get(Resource,resource_id)
    if item is None:raise HTTPException(status_code=404,detail='Resource not found.')
    filename=Path(file.filename or 'resource.pdf').name
    contents=await file.read(MAX_PDF_BYTES+1)
    if len(contents)>MAX_PDF_BYTES:raise HTTPException(status_code=413,detail='PDF must be 20 MB or smaller.')
    from starlette.concurrency import run_in_threadpool
    pages=await run_in_threadpool(inspect_pdf,filename,file.content_type or '',contents)
    safe_name=re.sub(r'[^a-zA-Z0-9._-]+','-',filename)
    path=upload_dir/f'{resource_id}-{uuid4().hex[:8]}-{safe_name}'
    path.write_bytes(contents)
    old_path=Path(item.file_path) if item.file_path else None
    item.file_path=str(path);item.file_name=filename;item.size=f'{len(contents)/1024/1024:.2f} MB';item.pages=pages;item.uploaded=True
    try:db.commit();db.refresh(item)
    except Exception:
        db.rollback();path.unlink(missing_ok=True);raise
    if old_path:
        try:old_path.unlink(missing_ok=True)
        except OSError:pass
    return resource_json(item)


@app.delete('/api/resources/{resource_id}',status_code=204)
def delete_resource(resource_id:str,admin=Depends(require_admin),db:Session=Depends(get_db)):
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
