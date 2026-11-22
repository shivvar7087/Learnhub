from sqlalchemy.orm import Session

from .models import Course, Resource

COURSE_DATA = [
    {"id":"math-2","name":"Engineering Mathematics II","code":"BAS203","semester":2,"category":"Mathematics","branches":["CSE","AI&DS","AI"],"color":"violet","icon":"sum","lessons":32,"units":5,"progress":68,"teacher":"Dr. Meera Shah","description":"Build a strong foundation in differential equations, transforms and the mathematics behind modern engineering.","popular":True},
    {"id":"data-structures","name":"Data Structures","code":"BCS301","semester":3,"category":"Computer Science","branches":["CSE","AI&DS","AI"],"color":"blue","icon":"command","lessons":28,"units":6,"progress":42,"teacher":"Prof. Arjun Rao","description":"Master the structures and algorithms that power efficient, real-world software.","popular":True},
    {"id":"electrical","name":"Basic Electrical Engineering","code":"BEE101","semester":1,"category":"Electrical","branches":["CSE","AI&DS","AI"],"color":"amber","icon":"bolt","lessons":24,"units":5,"progress":84,"teacher":"Dr. Priya Nair","description":"Understand circuits, machines and electrical principles through clear explanations and worked examples."},
    {"id":"dbms","name":"Database Management Systems","code":"BCS503","semester":5,"category":"Computer Science","branches":["CSE","AI&DS","AI"],"color":"emerald","icon":"database","lessons":26,"units":5,"progress":15,"teacher":"Prof. Arjun Rao","description":"From relational design to SQL and transactions: get confident with the systems behind data.","popular":True},
    {"id":"physics","name":"Engineering Physics","code":"BAS102","semester":1,"category":"Applied Science","branches":["CSE","AI&DS","AI"],"color":"rose","icon":"atom","lessons":30,"units":5,"progress":0,"teacher":"Dr. Vivek Menon","description":"Explore optics, quantum mechanics and material science with intuitive lessons."},
    {"id":"operating-systems","name":"Operating Systems","code":"BCS401","semester":4,"category":"Computer Science","branches":["CSE","AI&DS"],"color":"cyan","icon":"square","lessons":27,"units":5,"progress":34,"teacher":"Dr. Kavita Joshi","description":"Understand processes, memory and concurrency with practical, exam-ready material.","popular":True},
    {"id":"signals","name":"Signals & Systems","code":"BEC501","semester":5,"category":"Electronics","branches":["AI&DS","AI"],"color":"pink","icon":"wave","lessons":22,"units":4,"progress":0,"teacher":"Prof. R. K. Verma","description":"Analyze continuous and discrete signals with step-by-step problem solving."},
    {"id":"software-eng","name":"Software Engineering","code":"BCS601","semester":6,"category":"Computer Science","branches":["CSE","AI&DS"],"color":"indigo","icon":"diamond","lessons":20,"units":5,"progress":0,"teacher":"Dr. Ananya Das","description":"Plan, design and deliver reliable software using modern engineering methods."},
]


def seed_database(db: Session):
    if db.query(Course).count() == 0:
        db.add_all(Course(**item) for item in COURSE_DATA)
    if db.query(Resource).count() == 0:
        resources = []
        for course in COURSE_DATA:
            for kind, title, pages in [
                ("PDF Notes", f"{course['name']} - Complete Study Notes", 16),
                ("Important Questions", f"{course['name']} - Important Exam Questions", 8),
            ]:
                resources.append(Resource(id=f"seed-{course['id']}-{kind.lower().replace(' ', '-')}",title=title,course=course['name'],code=course['code'],type=kind,pages=pages,size="Sample PDF",date="Sample resource"))
            for topic in ["The Self", "Gateway Classes", "Multiatoms"]:
                resources.append(Resource(id=f"topic-{course['id']}-{topic.lower().replace(' ', '-')}",title=f"{topic} - {course['name']}",course=course['name'],code=course['code'],type="PDF Notes",pages=6,size="Sample PDF",date="Sample resource"))
        resources.extend([
            Resource(id="quantum-notes",title="Quantum Mechanics - Core Concepts and Notes",course="Engineering Physics",code="BAS102",type="PDF Notes",pages=18,size="Sample PDF",date="Just added"),
            Resource(id="quantum-questions",title="Quantum Mechanics - Important Questions",course="Engineering Physics",code="BAS102",type="Important Questions",pages=7,size="Sample PDF",date="Just added"),
            Resource(id="quantum-paper-2025",title="Quantum Mechanics - 2025 Sample Practice Paper",course="Engineering Physics",code="BAS102",type="Question Paper",pages=8,paper_year="2025",size="Sample PDF",date="Just added"),
            Resource(id="aktu-paper-2026",title="Data Structures - 2026 Sample Practice Paper",course="Data Structures",code="BCS301",type="Question Paper",pages=8,paper_year="2026",size="Sample PDF",date="Just added"),
            Resource(id="aktu-paper-2025",title="BEE 2025 - End Semester Paper",course="Basic Electrical Engineering",code="BEE101",type="Question Paper",pages=8,paper_year="2025",size="Sample PDF",date="18 Nov 2025"),
            Resource(id="aktu-paper-2024",title="Operating Systems - AKTU 2024 Paper",course="Operating Systems",code="BCS401",type="Question Paper",pages=10,paper_year="2024",size="Sample PDF",date="12 Nov 2025"),
            Resource(id="aktu-paper-2023",title="DBMS - AKTU 2023 Paper",course="Database Management Systems",code="BCS503",type="Question Paper",pages=9,paper_year="2023",size="Sample PDF",date="20 Oct 2025"),
        ])
        db.add_all(resources)
    db.commit()
