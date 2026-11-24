export const courses = [
  { id:'math-2', name:'Engineering Mathematics II', code:'BAS203', semester:2, category:'Mathematics', color:'violet', icon:'∑', lessons:32, units:5, progress:68, teacher:'Dr. Meera Shah', description:'Build a strong foundation in differential equations, transforms and the mathematics behind modern engineering.', updated:'2 hours ago', popular:true },
  { id:'data-structures', name:'Data Structures', code:'BCS301', semester:3, category:'Computer Science', color:'blue', icon:'⌘', lessons:28, units:6, progress:42, teacher:'Prof. Arjun Rao', description:'Master the structures and algorithms that power efficient, real-world software.', updated:'Yesterday', popular:true },
  { id:'electrical', name:'Basic Electrical Engineering', code:'BEE101', semester:1, category:'Electrical', color:'amber', icon:'ϟ', lessons:24, units:5, progress:84, teacher:'Dr. Priya Nair', description:'Understand circuits, machines and electrical principles through clear explanations and worked examples.', updated:'3 days ago', popular:false },
  { id:'dbms', name:'Database Management Systems', code:'BCS503', semester:5, category:'Computer Science', color:'emerald', icon:'◫', lessons:26, units:5, progress:15, teacher:'Prof. Arjun Rao', description:'From relational design to SQL and transactions: get confident with the systems behind data.', updated:'4 days ago', popular:true },
  { id:'physics', name:'Engineering Physics', code:'BAS102', semester:1, category:'Applied Science', color:'rose', icon:'◉', lessons:30, units:5, progress:0, teacher:'Dr. Vivek Menon', description:'Explore optics, quantum mechanics and material science with intuitive lessons.', updated:'1 week ago', popular:false },
  { id:'operating-systems', name:'Operating Systems', code:'BCS401', semester:4, category:'Computer Science', color:'cyan', icon:'▣', lessons:27, units:5, progress:34, teacher:'Dr. Kavita Joshi', description:'Understand processes, memory and concurrency with practical, exam-ready material.', updated:'2 days ago', popular:true },
  { id:'signals', name:'Signals & Systems', code:'BEC501', semester:5, category:'Electronics', color:'pink', icon:'∿', lessons:22, units:4, progress:0, teacher:'Prof. R. K. Verma', description:'Analyze continuous and discrete signals with step-by-step problem solving.', updated:'5 days ago', popular:false },
  { id:'software-eng', name:'Software Engineering', code:'BCS601', semester:6, category:'Computer Science', color:'indigo', icon:'◇', lessons:20, units:5, progress:0, teacher:'Dr. Ananya Das', description:'Plan, design and deliver reliable software using modern engineering methods.', updated:'1 week ago', popular:false },
]

export const branchSubjects = {
  'CSE': ['math-2','data-structures','electrical','dbms','physics','operating-systems','software-eng'],
  'AI&DS': ['math-2','data-structures','electrical','dbms','physics','operating-systems','signals','software-eng'],
  'AI': ['math-2','data-structures','electrical','dbms','physics','signals'],
}

export const materials = [
  { id:'m1', title:'Laplace Transform — Complete Notes', course:'Engineering Mathematics II', code:'BAS203', type:'PDF Notes', pages:24, date:'Today', size:'2.4 MB', icon:'file' },
  { id:'m2', title:'Data Structures: Trees & Graphs', course:'Data Structures', code:'BCS301', type:'Chapter Notes', pages:18, date:'Yesterday', size:'1.8 MB', icon:'file' },
  { id:'m3', title:'BEE 2025 — End Semester Paper', course:'Basic Electrical Engineering', code:'BEE101', type:'Question Paper', pages:8, date:'18 Nov 2025', size:'960 KB', icon:'file' },
  { id:'m4', title:'DBMS Important Questions — Unit 3', course:'Database Management Systems', code:'BCS503', type:'Important Questions', pages:6, date:'16 Nov 2025', size:'740 KB', icon:'file' },
  { id:'m5', title:'Engineering Physics: Optics', course:'Engineering Physics', code:'BAS102', type:'Chapter Notes', pages:16, date:'14 Nov 2025', size:'1.2 MB', icon:'file' },
  { id:'m6', title:'Operating Systems — AKTU 2024 Paper', course:'Operating Systems', code:'BCS401', type:'Question Paper', pages:10, date:'12 Nov 2025', size:'1.1 MB', icon:'file' },
  { id:'m7', title:'Fourier Series: Practice Set', course:'Engineering Mathematics II', code:'BAS203', type:'Practice Set', pages:12, date:'10 Nov 2025', size:'820 KB', icon:'file' },
  { id:'m8', title:'Semester 3 Exam Formula Sheet', course:'Data Structures', code:'BCS301', type:'Quick Revision', pages:4, date:'8 Nov 2025', size:'530 KB', icon:'file' },
  { id:'quantum-notes', title:'Quantum Mechanics - Core Concepts and Notes', course:'Engineering Physics', code:'BAS102', type:'PDF Notes', pages:18, date:'Just added', size:'1.6 MB', icon:'file' },
  { id:'quantum-questions', title:'Quantum Mechanics - Important Questions', course:'Engineering Physics', code:'BAS102', type:'Important Questions', pages:7, date:'Just added', size:'640 KB', icon:'file' },
  { id:'quantum-paper-2025', title:'Quantum Mechanics - 2025 Sample Practice Paper', course:'Engineering Physics', code:'BAS102', type:'Question Paper', pages:8, paperYear:'2025', date:'Just added', size:'890 KB', icon:'file' },
  { id:'p3', title:'Mathematics II - AKTU 2024 Paper', course:'Engineering Mathematics II', code:'BAS203', type:'Question Paper', pages:10, paperYear:'2024', date:'4 Nov 2025', size:'1.3 MB', icon:'file' },
  { id:'p4', title:'Data Structures - AKTU 2023 Paper', course:'Data Structures', code:'BCS301', type:'Question Paper', pages:8, paperYear:'2023', date:'28 Oct 2025', size:'1.0 MB', icon:'file' },
  { id:'p5', title:'DBMS - AKTU 2023 Paper', course:'Database Management Systems', code:'BCS503', type:'Question Paper', pages:9, paperYear:'2023', date:'20 Oct 2025', size:'1.2 MB', icon:'file' },
  { id:'p6', title:'Data Structures - 2026 Sample Practice Paper', course:'Data Structures', code:'BCS301', type:'Question Paper', pages:8, paperYear:'2026', date:'20 Nov 2026', size:'1.1 MB', icon:'file' },
]

// Ensure every subject has a notes resource and a question set in the frontend preview.
for (const course of courses) {
  for (const [type, title] of [
    ['PDF Notes', `${course.name} - Complete Study Notes`],
    ['Important Questions', `${course.name} - Important Exam Questions`],
  ]) {
    if (!materials.some(item => item.code === course.code && item.type === type)) {
      materials.push({
        id: `sample-${course.id}-${type.toLowerCase().replaceAll(' ', '-')}`,
        title,
        course: course.name,
        code: course.code,
        type,
        pages: type === 'PDF Notes' ? 16 : 8,
        date: 'Sample resource',
        size: type === 'PDF Notes' ? '1.4 MB' : '680 KB',
        icon: 'file',
      })
    }
  }
  for (const topic of ['The Self', 'Gateway Classes', 'Multiatoms']) {
    materials.push({
      id: `topic-${course.id}-${topic.toLowerCase().replaceAll(' ', '-')}`,
      title: `${topic} - ${course.name}`,
      course: course.name,
      code: course.code,
      type: 'PDF Notes',
      pages: 6,
      date: 'Sample resource',
      size: '520 KB',
      icon: 'file',
    })
  }
}

export const semesterNames = ['Semester 1','Semester 2','Semester 3','Semester 4','Semester 5','Semester 6','Semester 7','Semester 8']
export const courseUnits = {
 'math-2': ['Differential Equations','Laplace Transform','Fourier Series','Complex Variables','Statistical Techniques'],
 'data-structures': ['Algorithm Analysis','Linear Data Structures','Trees','Graphs','Searching & Sorting','Hashing'],
 'electrical': ['DC Circuits','AC Circuits','Transformers','Electrical Machines','Electrical Safety'],
 'dbms': ['Database Concepts','Relational Model & SQL','Relational Design','Transactions','Advanced Databases'],
 'physics': ['Quantum Mechanics','Wave Optics','Electromagnetism','Lasers & Fibre Optics','Material Science'],
 'operating-systems': ['OS Fundamentals','Processes & Threads','CPU Scheduling','Memory Management','File Systems'],
 'signals': ['Signal Fundamentals','LTI Systems','Fourier Analysis','Laplace & Z Transforms'],
 'software-eng': ['Software Process','Requirements','Design & Architecture','Testing','Project Management'],
}
