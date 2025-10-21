import type {
  Student,
  Module,
  Grade,
  Message,
  Notification,
  AcademicGoal,
  User,
  PathwayDemand,
  DegreeProgram,
  Specialization,
  AcademicYear,
  AcademicClass,
  Semester,
  Internship,
  InternshipMilestone,
  InternshipDocument,
  AnonymousReport,
  ReportAttachment,
  Intervention,
  InterventionResource,
  Meeting,
  SystemConfiguration,
  AuditLog,
  Backup,
  NotificationTemplate,
  ReportTemplate,
  ReportSection,
  AcademicCalendar,
  CalendarEvent,
  FeatureFlag,
  PathwayPreference,
  SpecializationPreference,
  RankingEntry,
  GradeUpload,
  GradeUploadError,
  ModuleSchedule,
} from '@/types';

// Helper functions
const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

const firstNames = [
  'Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry',
  'Isla', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter',
  'Quinn', 'Rachel', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xander',
  'Yara', 'Zane', 'Aisha', 'Ben', 'Chloe', 'Daniel'
];

const lastNames = [
  'Anderson', 'Brown', 'Chen', 'Davis', 'Evans', 'Fisher', 'Garcia', 'Harris',
  'Ivanov', 'Johnson', 'Kumar', 'Lee', 'Martinez', 'Nguyen', 'OBrien', 'Patel',
  'Quinn', 'Robinson', 'Smith', 'Taylor', 'Usman', 'Vargas', 'Wilson', 'Xavier',
  'Young', 'Zhang'
];

const moduleNames = [
  'Introduction to Programming',
  'Data Structures and Algorithms',
  'Database Systems',
  'Software Engineering',
  'Web Development',
  'Mobile Application Development',
  'Computer Networks',
  'Operating Systems',
  'Artificial Intelligence',
  'Machine Learning',
  'Business Systems Analysis',
  'Enterprise Resource Planning',
  'Supply Chain Management',
  'Business Intelligence',
  'Digital Marketing',
  'E-Commerce Systems',
  'Information Security',
  'Cloud Computing',
  'Project Management',
  'Human-Computer Interaction',
  'Data Analytics',
  'Business Process Management',
  'IT Service Management',
  'Systems Integration',
  'Calculus I',
  'Statistics for IT',
  'Discrete Mathematics',
  'Professional Ethics',
  'Research Methods',
  'Internship'
];

// Generate Students
export function generateStudents(count: number = 50): Student[] {
  const students: Student[] = [];
  const yearDistribution = { L1: 0.3, L2: 0.3, L3: 0.25, L4: 0.15 };
  const programDistribution = { MIT: 0.55, IT: 0.45 };
  const specializationDistribution = { BSE: 0.4, OSCM: 0.35, IS: 0.25 };

  for (let i = 0; i < count; i++) {
    const firstName = randomFromArray(firstNames);
    const lastName = randomFromArray(lastNames);
    const studentId = `STU${String(i + 1).padStart(4, '0')}`;

    // Determine academic year
    const rand = Math.random();
    let academicYear: AcademicYear;
    if (rand < yearDistribution.L1) academicYear = 'L1';
    else if (rand < yearDistribution.L1 + yearDistribution.L2) academicYear = 'L2';
    else if (rand < yearDistribution.L1 + yearDistribution.L2 + yearDistribution.L3) academicYear = 'L3';
    else academicYear = 'L4';

    // Determine degree program (L1 might not have selected yet)
    let degreeProgram: DegreeProgram | undefined;
    if (academicYear !== 'L1' || Math.random() > 0.3) {
      degreeProgram = Math.random() < programDistribution.MIT ? 'MIT' : 'IT';
    }

    // Determine specialization (only L2+)
    let specialization: Specialization | undefined;
    if (academicYear !== 'L1' && degreeProgram) {
      const specRand = Math.random();
      if (specRand < specializationDistribution.BSE) specialization = 'BSE';
      else if (specRand < specializationDistribution.BSE + specializationDistribution.OSCM) specialization = 'OSCM';
      else specialization = 'IS';
    }

    // Generate GPA (normal distribution around 3.0)
    const gpa = Math.max(2.0, Math.min(4.0, randomFloat(2.5, 3.8)));

    // Determine academic class based on GPA
    let academicClass: AcademicClass;
    if (gpa >= 3.7) academicClass = 'First Class';
    else if (gpa >= 3.3) academicClass = 'Second Class Upper';
    else if (gpa >= 3.0) academicClass = 'Second Class Lower';
    else if (gpa >= 2.5) academicClass = 'Third Class';
    else academicClass = 'Pass';

    // Calculate credits based on year
    const baseCredits = { L1: 30, L2: 60, L3: 90, L4: 110 };
    const totalCredits = baseCredits[academicYear] + randomInt(-5, 5);

    students.push({
      id: studentId,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@university.edu`,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      role: 'student',
      avatar: `/avatars/${firstName.toLowerCase()}.jpg`,
      isActive: Math.random() > 0.05,
      studentId,
      academicYear,
      degreeProgram,
      specialization,
      currentGPA: parseFloat(gpa.toFixed(2)),
      totalCredits,
      academicClass,
      pathwayLocked: academicYear !== 'L1' || !!degreeProgram,
      enrollmentDate: `20${21 + (4 - parseInt(academicYear.slice(1)))}-09-01`,
      enrollmentStatus: randomFromArray(['enrolled', 'enrolled', 'enrolled', 'enrolled', 'enrolled', 'enrolled', 'graduated', 'suspended']),
    });
  }

  return students;
}

// Generate Modules
export function generateModules(count: number = 30): Module[] {
  const modules: Module[] = [];
  const years: AcademicYear[] = ['L1', 'L2', 'L3', 'L4'];
  const semesters: Semester[] = ['S1', 'S2'];

  for (let i = 0; i < count; i++) {
    const year = randomFromArray(years);
    const code = `${year === 'L1' ? 'CS' : year === 'L2' ? randomFromArray(['MIT', 'IT']) : randomFromArray(['MIT', 'IT', 'IS'])}${randomInt(101, 499)}`;
    const title = randomFromArray(moduleNames);
    const credits = randomFromArray([2, 3, 4]);

    let degreeProgram: DegreeProgram | undefined;
    let specialization: Specialization | undefined;

    if (year !== 'L1' && Math.random() > 0.3) {
      degreeProgram = randomFromArray(['MIT', 'IT']);
      if (year !== 'L2' && Math.random() > 0.4) {
        specialization = randomFromArray(['BSE', 'OSCM', 'IS']);
      }
    }

    const capacity = randomInt(30, 100);
    const enrolled = randomInt(10, capacity);

    modules.push({
      id: `MOD${String(i + 1).padStart(3, '0')}`,
      code,
      title: `${title} ${i + 1}`,
      credits,
      description: `This module covers fundamental and advanced concepts in ${title.toLowerCase()}.`,
      prerequisites: i > 5 ? [modules[randomInt(0, Math.min(i - 1, 10))].code] : [],
      academicYear: year,
      degreeProgram,
      specialization,
      semester: randomFromArray(semesters),
      isActive: true,
      capacity,
      enrolled,
      lecturer: `Dr. ${randomFromArray(lastNames)}`,
      schedule: `${randomFromArray(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])} ${randomInt(8, 16)}:00-${randomInt(9, 17)}:00`,
    });
  }

  return modules;
}

// Generate Grades
export function generateGrades(students: Student[], modules: Module[]): Grade[] {
  const grades: Grade[] = [];
  let gradeId = 1;

  students.forEach(student => {
    // Generate 8-15 grades per student
    const gradeCount = randomInt(8, 15);
    const studentModules = modules
      .filter(m => {
        if (m.academicYear === 'L1') return true;
        if (m.degreeProgram && student.degreeProgram !== m.degreeProgram) return false;
        if (m.specialization && student.specialization !== m.specialization) return false;
        return true;
      })
      .slice(0, gradeCount);

    studentModules.forEach(module => {
      const gradeValue = Math.max(40, Math.min(100, randomFloat(student.currentGPA * 20, student.currentGPA * 25)));

      let letterGrade: string;
      let points: number;

      if (gradeValue >= 85) { letterGrade = 'A+'; points = 4.0; }
      else if (gradeValue >= 80) { letterGrade = 'A'; points = 4.0; }
      else if (gradeValue >= 75) { letterGrade = 'B+'; points = 3.5; }
      else if (gradeValue >= 70) { letterGrade = 'B'; points = 3.0; }
      else if (gradeValue >= 65) { letterGrade = 'C+'; points = 2.5; }
      else if (gradeValue >= 60) { letterGrade = 'C'; points = 2.0; }
      else if (gradeValue >= 55) { letterGrade = 'D+'; points = 1.5; }
      else if (gradeValue >= 50) { letterGrade = 'D'; points = 1.0; }
      else { letterGrade = 'F'; points = 0; }

      grades.push({
        id: `GRD${String(gradeId++).padStart(4, '0')}`,
        studentId: student.studentId,
        moduleId: module.id,
        moduleCode: module.code,
        moduleTitle: module.title,
        grade: parseFloat(gradeValue.toFixed(1)),
        letterGrade,
        points,
        credits: module.credits,
        semester: module.semester,
        academicYear: module.academicYear,
        isReleased: Math.random() > 0.1,
      });
    });
  });

  return grades;
}

// Generate Messages
export function generateMessages(students: Student[], count: number = 100): Message[] {
  const messages: Message[] = [];
  const advisors: User[] = [
    { id: 'ADV001', email: 'michael.smith@university.edu', firstName: 'Dr. Michael', lastName: 'Smith', name: 'Dr. Michael Smith', role: 'advisor', isActive: true },
    { id: 'ADV002', email: 'sarah.wilson@university.edu', firstName: 'Dr. Sarah', lastName: 'Wilson', name: 'Dr. Sarah Wilson', role: 'advisor', isActive: true },
  ];

  const subjects = [
    'Academic Progress Review',
    'Pathway Selection Guidance',
    'Module Registration Assistance',
    'GPA Improvement Strategies',
    'Career Counseling',
    'Internship Opportunities',
    'Specialization Selection Help',
    'Academic Support Resources',
  ];

  for (let i = 0; i < count; i++) {
    const isFromAdvisor = Math.random() > 0.5;
    const advisor = randomFromArray(advisors);
    const student = randomFromArray(students);
    const subject = randomFromArray(subjects);

    messages.push({
      id: `MSG${String(i + 1).padStart(4, '0')}`,
      senderId: isFromAdvisor ? advisor.id : student.id,
      senderName: isFromAdvisor ? `${advisor.firstName} ${advisor.lastName}` : `${student.firstName} ${student.lastName}`,
      senderRole: isFromAdvisor ? 'advisor' : 'student',
      receiverId: isFromAdvisor ? student.id : advisor.id,
      receiverName: isFromAdvisor ? `${student.firstName} ${student.lastName}` : `${advisor.firstName} ${advisor.lastName}`,
      subject,
      content: `This is a message regarding ${subject.toLowerCase()}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      isRead: Math.random() > 0.3,
      createdAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return messages;
}

// Generate Notifications
export function generateNotifications(students: Student[], count: number = 200): Notification[] {
  const notifications: Notification[] = [];

  type NotifTemplate = {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    url: string;
  };

  const templates: NotifTemplate[] = [
    { title: 'Grade Released', message: 'Your grade for {module} has been released', type: 'info', url: '/dashboard/student/grades' },
    { title: 'GPA Updated', message: 'Your GPA has been updated to {gpa}', type: 'success', url: '/dashboard/student/grades' },
    { title: 'Pathway Selection Open', message: 'Pathway selection is now open', type: 'info', url: '/dashboard/student/pathway' },
    { title: 'Module Registration Deadline', message: 'Module registration closes in 3 days', type: 'warning', url: '/dashboard/student/modules' },
    { title: 'Academic Alert', message: 'Your GPA has decreased. Contact your advisor', type: 'error', url: '/dashboard/student/communication' },
    { title: 'Internship Reminder', message: 'Please update your internship status', type: 'warning', url: '/dashboard/student/internship' },
  ];

  students.forEach(student => {
    const notifCount = randomInt(2, 8);
    for (let i = 0; i < notifCount; i++) {
      const template = randomFromArray(templates);
      notifications.push({
        id: `NOT${String(notifications.length + 1).padStart(4, '0')}`,
        userId: student.id,
        title: template.title,
        message: template.message.replace('{gpa}', student.currentGPA.toFixed(2)).replace('{module}', 'CS101'),
        type: template.type,
        isRead: Math.random() > 0.4,
        createdAt: new Date(Date.now() - randomInt(0, 14) * 24 * 60 * 60 * 1000).toISOString(),
        actionUrl: template.url,
      });
    }
  });

  return notifications;
}

// Generate Academic Goals
export function generateAcademicGoals(students: Student[]): AcademicGoal[] {
  const goals: AcademicGoal[] = [];

  students.forEach((student, index) => {
    if (Math.random() > 0.6) { // 40% of students have goals
      const targetGPA = Math.min(4.0, student.currentGPA + randomFloat(0.1, 0.5));
      let targetClass: AcademicClass;

      if (targetGPA >= 3.7) targetClass = 'First Class';
      else if (targetGPA >= 3.3) targetClass = 'Second Class Upper';
      else if (targetGPA >= 3.0) targetClass = 'Second Class Lower';
      else if (targetGPA >= 2.5) targetClass = 'Third Class';
      else targetClass = 'Pass';

      goals.push({
        id: `GOAL${String(index + 1).padStart(3, '0')}`,
        studentId: student.studentId,
        title: `Achieve ${targetClass}`,
        description: `Maintain academic performance to achieve ${targetClass} classification`,
        category: 'academic' as const,
        priority: targetGPA >= 3.5 ? 'high' as const : targetGPA >= 3.0 ? 'medium' as const : 'low' as const,
        targetGPA: parseFloat(targetGPA.toFixed(2)),
        targetClass,
        targetValue: `${targetGPA.toFixed(2)} GPA`,
        currentValue: `${student.currentGPA.toFixed(2)} GPA`,
        targetDate: new Date(Date.now() + randomInt(90, 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deadline: new Date(Date.now() + randomInt(90, 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currentProgress: randomInt(30, 90),
        progress: randomInt(30, 90),
        isActive: true,
        createdAt: new Date(Date.now() - randomInt(0, 180) * 24 * 60 * 60 * 1000).toISOString(),
        milestones: [
          'Complete all module assignments',
          'Improve attendance to 95%',
          'Participate in study groups',
          'Meet with advisor monthly',
        ],
      });
    }
  });

  return goals;
}

// Generate Pathway Demand
export function generatePathwayDemand(students: Student[]): PathwayDemand {
  const l1Students = students.filter(s => s.academicYear === 'L1');
  const totalL1 = l1Students.length;
  const mitCount = l1Students.filter(s => s.degreeProgram === 'MIT').length;
  const itCount = l1Students.filter(s => s.degreeProgram === 'IT').length;

  return {
    MIT: totalL1 > 0 ? parseFloat(((mitCount / totalL1) * 100).toFixed(1)) : 0,
    IT: totalL1 > 0 ? parseFloat(((itCount / totalL1) * 100).toFixed(1)) : 0,
    totalStudents: totalL1,
    thresholdReached: (mitCount / totalL1) * 100 >= 60 || (itCount / totalL1) * 100 >= 60,
    lastUpdated: new Date().toISOString(),
  };
}

// Generate specific test student user for Alice
export function generateTestStudent(): Student {
  return {
    id: 'STU0000',
    email: 'alice@university.edu',
    firstName: 'Alice',
    lastName: 'Johnson',
    name: 'Alice Johnson',
    role: 'student',
    avatar: '/avatars/alice.jpg',
    isActive: true,
    studentId: 'STU0000',
    academicYear: 'L2',
    degreeProgram: 'MIT',
    specialization: 'BSE',
    currentGPA: 3.65,
    totalCredits: 65,
    academicClass: 'Second Class Upper',
    pathwayLocked: true,
    enrollmentDate: '2023-09-01',
    enrollmentStatus: 'enrolled',
  };
}

// Generate staff users
export function generateStaffUsers(): User[] {
  return [
    { id: 'STAFF001', email: 'sarah.wilson@university.edu', firstName: 'Prof. Sarah', lastName: 'Wilson', name: 'Prof. Sarah Wilson', role: 'staff', isActive: true },
    { id: 'STAFF002', email: 'robert.brown@university.edu', firstName: 'Dr. Robert', lastName: 'Brown', name: 'Dr. Robert Brown', role: 'staff', isActive: true },
    { id: 'ADV001', email: 'michael.smith@university.edu', firstName: 'Dr. Michael', lastName: 'Smith', name: 'Dr. Michael Smith', role: 'advisor', isActive: true },
    { id: 'ADV002', email: 'emily.davis@university.edu', firstName: 'Dr. Emily', lastName: 'Davis', name: 'Dr. Emily Davis', role: 'advisor', isActive: true },
    { id: 'HOD001', email: 'john.anderson@university.edu', firstName: 'Prof. John', lastName: 'Anderson', name: 'Prof. John Anderson', role: 'hod', isActive: true },
    { id: 'ADMIN001', email: 'admin@university.edu', firstName: 'System', lastName: 'Administrator', name: 'System Administrator', role: 'admin', isActive: true },
  ];
}

// Generate Internships for L3 students
export function generateInternships(students: Student[]): Internship[] {
  const internships: Internship[] = [];
  const l3Students = students.filter(s => s.academicYear === 'L3');
  
  const companies = [
    'TechCorp Solutions', 'DataFlow Inc', 'CloudTech Systems', 'AI Innovations Ltd',
    'Software Dynamics', 'Digital Enterprises', 'CyberSec Pro', 'WebDev Masters',
    'MobileFirst Co', 'Enterprise Solutions'
  ];
  
  const roles = [
    'Software Development Intern', 'Data Analysis Intern', 'Web Development Intern',
    'Mobile App Development Intern', 'Database Management Intern', 'System Administration Intern',
    'Cybersecurity Intern', 'AI/ML Research Intern', 'DevOps Intern', 'QA Testing Intern'
  ];

  l3Students.forEach((student, index) => {
    if (Math.random() > 0.3) { // 70% of L3 students have internships
      const company = randomFromArray(companies);
      const role = randomFromArray(roles);
      const status = randomFromArray(['applied', 'accepted', 'in_progress', 'completed'] as const);
      
      const milestones: InternshipMilestone[] = [
        {
          id: `milestone-${index}-1`,
          title: 'Orientation and Setup',
          description: 'Complete company orientation and development environment setup',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: status === 'completed' || status === 'in_progress',
          completedDate: status === 'completed' ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        },
        {
          id: `milestone-${index}-2`,
          title: 'First Project Assignment',
          description: 'Complete first assigned project or task',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: status === 'completed',
          completedDate: status === 'completed' ? new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        },
        {
          id: `milestone-${index}-3`,
          title: 'Mid-term Evaluation',
          description: 'Complete mid-term performance evaluation',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: status === 'completed',
          completedDate: status === 'completed' ? new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        },
      ];

      const documents: InternshipDocument[] = status === 'completed' ? [
        {
          id: `doc-${index}-1`,
          name: 'Internship Report.pdf',
          type: 'report',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          url: '/mock-files/internship-report.pdf',
        },
        {
          id: `doc-${index}-2`,
          name: 'Completion Certificate.pdf',
          type: 'certificate',
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          url: '/mock-files/completion-certificate.pdf',
        },
      ] : [];

      internships.push({
        id: `INT${String(index + 1).padStart(3, '0')}`,
        studentId: student.studentId,
        company,
        role,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status,
        supervisorName: `Dr. ${randomFromArray(lastNames)}`,
        supervisorEmail: `supervisor.${randomFromArray(lastNames).toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
        supervisorPhone: `+1-${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
        description: `Internship opportunity at ${company} focusing on ${role.toLowerCase()}.`,
        progress: status === 'completed' ? 100 : status === 'in_progress' ? randomInt(30, 80) : status === 'accepted' ? 10 : 0,
        milestones,
        documents,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  });

  return internships;
}

// Generate Anonymous Reports
export function generateAnonymousReports(count: number = 15): AnonymousReport[] {
  const reports: AnonymousReport[] = [];
  
  const categories: Array<'academic_misconduct' | 'harassment' | 'discrimination' | 'safety_concern' | 'facility_issue' | 'other'> = 
    ['academic_misconduct', 'harassment', 'discrimination', 'safety_concern', 'facility_issue', 'other'];
  
  const titles = [
    'Concern about grading fairness',
    'Facility maintenance issue',
    'Inappropriate behavior report',
    'Academic support needed',
    'Technical system problems',
    'Staff conduct concern',
    'Safety issue in lab',
    'Accessibility problem',
    'Course content concern',
    'Equipment malfunction'
  ];

  const descriptions = [
    'I would like to report an issue regarding the grading system in my module. The grades seem inconsistent and I believe there may be an error.',
    'There is a persistent problem with the air conditioning in the computer lab that makes it difficult to concentrate during long sessions.',
    'I witnessed inappropriate behavior during a group project that made me uncomfortable. I would like this addressed.',
    'I am struggling with the course material and feel that additional support resources would be helpful for students.',
    'The online learning platform frequently crashes during important assignments, causing students to lose their work.',
    'I have concerns about the conduct of a staff member during office hours that I would like to address.',
    'There is a safety hazard in the laboratory that needs immediate attention.',
    'The building lacks proper accessibility features for students with disabilities.',
    'The course content seems outdated and does not reflect current industry practices.',
    'Several pieces of equipment in the lab are malfunctioning and need repair.'
  ];

  for (let i = 0; i < count; i++) {
    const category = randomFromArray(categories);
    const title = randomFromArray(titles);
    const description = randomFromArray(descriptions);
    const status = randomFromArray(['submitted', 'in_review', 'resolved', 'escalated'] as const);
    const priority = randomFromArray(['low', 'medium', 'high', 'urgent'] as const);
    
    const attachments: ReportAttachment[] = Math.random() > 0.7 ? [
      {
        id: `att-${i}-1`,
        fileName: 'evidence.pdf',
        fileType: 'application/pdf',
        fileSize: randomInt(100000, 2000000),
        url: '/mock-files/evidence.pdf',
        uploadedAt: new Date().toISOString(),
      },
    ] : [];

    reports.push({
      id: `RPT${String(i + 1).padStart(3, '0')}`,
      category,
      title,
      description,
      attachments,
      status,
      submittedAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
      reviewedAt: status !== 'submitted' ? new Date(Date.now() - randomInt(0, 20) * 24 * 60 * 60 * 1000).toISOString() : undefined,
      resolvedAt: status === 'resolved' || status === 'escalated' ? new Date(Date.now() - randomInt(0, 10) * 24 * 60 * 60 * 1000).toISOString() : undefined,
      adminNotes: status !== 'submitted' ? 'Report has been reviewed and appropriate action has been taken.' : undefined,
      priority,
    });
  }

  return reports;
}

// Generate Interventions
export function generateInterventions(students: Student[]): Intervention[] {
  const interventions: Intervention[] = [];
  
  const atRiskStudents = students.filter(s => s.currentGPA < 2.8);
  const advisors = generateStaffUsers().filter(u => u.role === 'advisor');
  
  const suggestions = [
    'Consider meeting with your academic advisor to discuss study strategies',
    'Join a study group for better peer support',
    'Utilize the university\'s tutoring services',
    'Review your time management and create a study schedule',
    'Consider reducing your course load for the next semester',
    'Attend all lectures and tutorials regularly',
    'Seek help from the student support services',
    'Consider taking a break from studies if personal issues are affecting performance'
  ];

  const resources: InterventionResource[] = [
    {
      id: 'res-1',
      title: 'Study Skills Workshop',
      description: 'Free workshop on effective study techniques',
      type: 'resource_link',
      url: '/resources/study-skills',
    },
    {
      id: 'res-2',
      title: 'Academic Support Center',
      description: 'One-on-one tutoring and academic guidance',
      type: 'contact_info',
      contactInfo: 'support@university.edu | Room 201, Student Center',
    },
    {
      id: 'res-3',
      title: 'Time Management Tips',
      description: 'Essential tips for managing academic workload',
      type: 'study_tip',
    },
    {
      id: 'res-4',
      title: 'Schedule Advisor Meeting',
      description: 'Book an appointment with your academic advisor',
      type: 'action_item',
    },
  ];

  atRiskStudents.forEach((student, index) => {
    if (Math.random() > 0.4) { // 60% of at-risk students have interventions
      const advisor = randomFromArray(advisors);
      const type = randomFromArray(['gpa_drop', 'class_decline', 'attendance_issue', 'academic_warning'] as const);
      const status = randomFromArray(['active', 'acknowledged', 'resolved', 'escalated'] as const);
      
      interventions.push({
        id: `INTV${String(index + 1).padStart(3, '0')}`,
        studentId: student.studentId,
        advisorId: advisor.id,
        type,
        title: `Academic Intervention - ${type.replace('_', ' ').toUpperCase()}`,
        description: `Intervention triggered due to ${type.replace('_', ' ')}`,
        triggerReason: `GPA dropped to ${student.currentGPA.toFixed(2)} (below 2.8 threshold)`,
        severity: randomFromArray(['low', 'medium', 'high'] as const),
        suggestions: suggestions.slice(0, randomInt(3, 6)),
        resources: resources.slice(0, randomInt(2, 4)),
        status,
        createdAt: new Date(Date.now() - randomInt(1, 14) * 24 * 60 * 60 * 1000).toISOString(),
        acknowledgedAt: status !== 'active' ? new Date(Date.now() - randomInt(1, 10) * 24 * 60 * 60 * 1000).toISOString() : undefined,
        resolvedAt: status === 'resolved' ? new Date(Date.now() - randomInt(1, 5) * 24 * 60 * 60 * 1000).toISOString() : undefined,
        notes: status !== 'active' ? 'Student has been contacted and is working on improvement plan.' : undefined,
      });
    }
  });

  return interventions;
}

// Generate Meetings
export function generateMeetings(students: Student[]): Meeting[] {
  const meetings: Meeting[] = [];
  const advisors = generateStaffUsers().filter(u => u.role === 'advisor');
  
  const meetingTypes: Array<'academic' | 'career' | 'personal' | 'emergency'> = 
    ['academic', 'career', 'personal', 'emergency'];
  
  const locations = [
    'Advisor Office - Room 301',
    'Student Center - Meeting Room A',
    'Library - Study Room 2',
    'Online - Microsoft Teams',
    'Cafeteria - Quiet Corner',
    'Advisor Office - Room 205',
  ];

  const titles = [
    'Academic Progress Review',
    'Career Planning Discussion',
    'Module Selection Guidance',
    'GPA Improvement Strategy',
    'Internship Planning',
    'Graduation Requirements Check',
    'Personal Development Planning',
    'Emergency Academic Support',
  ];

  students.forEach((student, index) => {
    if (Math.random() > 0.6) { // 40% of students have meetings
      const advisor = randomFromArray(advisors);
      const meetingCount = randomInt(1, 4);
      
      for (let i = 0; i < meetingCount; i++) {
        const type = randomFromArray(meetingTypes);
        const status = randomFromArray(['scheduled', 'completed', 'cancelled', 'rescheduled'] as const);
        const title = randomFromArray(titles);
        
        meetings.push({
          id: `MTG${String(meetings.length + 1).padStart(3, '0')}`,
          advisorId: advisor.id,
          studentId: student.studentId,
          title,
          description: `Meeting to discuss ${title.toLowerCase()} and provide guidance.`,
          scheduledDate: new Date(Date.now() + randomInt(-30, 30) * 24 * 60 * 60 * 1000).toISOString(),
          duration: randomInt(30, 90),
          location: randomFromArray(locations),
          status,
          meetingType: type,
          notes: status === 'completed' ? 'Productive discussion. Student shows improvement and commitment to academic goals.' : undefined,
          createdAt: new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
  });

  return meetings;
}

// Generate System Configuration
export function generateSystemConfiguration(): SystemConfiguration[] {
  const configs: SystemConfiguration[] = [];
  
  const academicConfigs = [
    { key: 'gpa_formula', value: 'weighted_average', description: 'GPA calculation method' },
    { key: 'credit_min', value: 12, description: 'Minimum credits per semester' },
    { key: 'credit_max', value: 24, description: 'Maximum credits per semester' },
    { key: 'pathway_threshold', value: 60, description: 'Pathway demand threshold percentage' },
    { key: 'first_class_threshold', value: 3.7, description: 'First Class GPA threshold' },
    { key: 'second_upper_threshold', value: 3.0, description: 'Second Class Upper GPA threshold' },
    { key: 'second_lower_threshold', value: 2.5, description: 'Second Class Lower GPA threshold' },
    { key: 'third_class_threshold', value: 2.0, description: 'Third Class GPA threshold' },
  ];

  const userConfigs = [
    { key: 'password_min_length', value: 8, description: 'Minimum password length' },
    { key: 'session_timeout', value: 30, description: 'Session timeout in minutes' },
    { key: 'max_login_attempts', value: 5, description: 'Maximum failed login attempts' },
    { key: 'account_lockout_duration', value: 15, description: 'Account lockout duration in minutes' },
  ];

  const systemConfigs = [
    { key: 'maintenance_mode', value: false, description: 'System maintenance mode' },
    { key: 'backup_frequency', value: 'daily', description: 'Automated backup frequency' },
    { key: 'log_retention_days', value: 90, description: 'Log retention period in days' },
    { key: 'max_file_upload_size', value: 10485760, description: 'Maximum file upload size in bytes' },
  ];

  const notificationConfigs = [
    { key: 'email_enabled', value: true, description: 'Email notifications enabled' },
    { key: 'sms_enabled', value: false, description: 'SMS notifications enabled' },
    { key: 'push_enabled', value: true, description: 'Push notifications enabled' },
    { key: 'notification_frequency', value: 'immediate', description: 'Notification delivery frequency' },
  ];

  const securityConfigs = [
    { key: 'two_factor_enabled', value: false, description: 'Two-factor authentication enabled' },
    { key: 'ip_whitelist_enabled', value: false, description: 'IP whitelist enabled' },
    { key: 'encryption_enabled', value: true, description: 'Data encryption enabled' },
    { key: 'audit_logging_enabled', value: true, description: 'Audit logging enabled' },
  ];

  const allConfigs = [
    ...academicConfigs.map(c => ({ ...c, category: 'academic' as const })),
    ...userConfigs.map(c => ({ ...c, category: 'user_management' as const })),
    ...systemConfigs.map(c => ({ ...c, category: 'system_settings' as const })),
    ...notificationConfigs.map(c => ({ ...c, category: 'notifications' as const })),
    ...securityConfigs.map(c => ({ ...c, category: 'security' as const })),
  ];

  allConfigs.forEach((config, index) => {
    configs.push({
      id: `CONFIG${String(index + 1).padStart(3, '0')}`,
      category: config.category,
      key: config.key,
      value: config.value,
      description: config.description,
      isActive: true,
      version: 1,
      lastModified: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
      modifiedBy: 'admin@university.edu',
    });
  });

  return configs;
}

// Generate Audit Logs
export function generateAuditLogs(count: number = 200): AuditLog[] {
  const logs: AuditLog[] = [];
  
  const actions = [
    'User Login', 'User Logout', 'Password Change', 'Profile Update',
    'Grade Upload', 'Grade Release', 'Module Registration', 'Pathway Selection',
    'Configuration Change', 'User Creation', 'User Deactivation', 'Backup Created',
    'Report Generated', 'Meeting Scheduled', 'Intervention Created', 'File Upload',
    'Data Export', 'System Restart', 'Failed Login Attempt', 'Permission Change'
  ];

  const resources = [
    'User', 'Grade', 'Module', 'Student', 'Configuration', 'Report',
    'Meeting', 'Intervention', 'Backup', 'AuditLog', 'System'
  ];

  const statuses: Array<'success' | 'failed' | 'warning'> = ['success', 'failed', 'warning'];
  
  const users = generateStaffUsers();
  const students = generateStudents(10);

  for (let i = 0; i < count; i++) {
    const user = randomFromArray([...users, ...students]);
    const action = randomFromArray(actions);
    const resource = randomFromArray(resources);
    const status = randomFromArray(statuses);
    
    logs.push({
      id: `LOG${String(i + 1).padStart(4, '0')}`,
      userId: user.id,
      userEmail: user.email,
      action,
      resource,
      resourceId: Math.random() > 0.5 ? `RES${randomInt(1, 999)}` : undefined,
      details: {
        timestamp: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
        additionalInfo: `Action performed on ${resource.toLowerCase()}`,
      },
      ipAddress: `192.168.1.${randomInt(1, 254)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
      status,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Generate Backups
export function generateBackups(count: number = 10): Backup[] {
  const backups: Backup[] = [];
  
  const types: Array<'manual' | 'scheduled' | 'system'> = ['manual', 'scheduled', 'system'];
  const statuses: Array<'in_progress' | 'completed' | 'failed'> = ['completed', 'completed', 'completed', 'failed'];
  
  for (let i = 0; i < count; i++) {
    const type = randomFromArray(types);
    const status = randomFromArray(statuses);
    const size = randomInt(100000000, 5000000000); // 100MB to 5GB
    
    backups.push({
      id: `BACKUP${String(i + 1).padStart(3, '0')}`,
      name: `Backup_${new Date().toISOString().split('T')[0]}_${i + 1}`,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} backup of system data`,
      type,
      status,
      size,
      createdAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: status === 'completed' ? new Date(Date.now() - randomInt(0, 25) * 24 * 60 * 60 * 1000).toISOString() : undefined,
      downloadUrl: status === 'completed' ? `/downloads/backup_${i + 1}.zip` : undefined,
      checksum: status === 'completed' ? `sha256:${Math.random().toString(36).substring(2, 66)}` : undefined,
    });
  }

  return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Generate Notification Templates
export function generateNotificationTemplates(): NotificationTemplate[] {
  const templates: NotificationTemplate[] = [
    {
      id: 'TMPL001',
      name: 'Grade Release Notification',
      category: 'grade_release',
      subject: 'Your grades for {{moduleName}} have been released',
      body: 'Dear {{studentName}},\n\nYour grades for {{moduleName}} have been released. You can view them in your student portal.\n\nGrade: {{grade}}\nPoints: {{points}}\n\nBest regards,\nAcademic Team',
      placeholders: ['{{studentName}}', '{{moduleName}}', '{{grade}}', '{{points}}'],
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'TMPL002',
      name: 'GPA Change Alert',
      category: 'gpa_change',
      subject: 'Important: Your GPA has changed',
      body: 'Dear {{studentName}},\n\nYour GPA has changed from {{oldGPA}} to {{newGPA}}. This change may affect your academic standing.\n\nPlease review your academic progress and consider meeting with your advisor if needed.\n\nBest regards,\nAcademic Team',
      placeholders: ['{{studentName}}', '{{oldGPA}}', '{{newGPA}}'],
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'TMPL003',
      name: 'Pathway Allocation Confirmation',
      category: 'pathway_allocated',
      subject: 'Your Pathway Allocation is Confirmed',
      body: 'Dear {{studentName}},\n\nYour application for the {{pathwayName}} pathway has been approved. You are now officially allocated to this pathway.\n\nCongratulations!\nAcademic Team',
      placeholders: ['{{studentName}}', '{{pathwayName}}'],
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'TMPL004',
      name: 'Upcoming Deadline Reminder',
      category: 'deadline_reminder',
      subject: 'Reminder: Upcoming Deadline for {{deadlineName}}',
      body: 'Dear {{studentName}},\n\nThis is a reminder that the deadline for {{deadlineName}} is on {{deadlineDate}}. Please ensure you submit all required documents/tasks on time.\n\nBest regards,\nAcademic Team',
      placeholders: ['{{studentName}}', '{{deadlineName}}', '{{deadlineDate}}'],
      isActive: false,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  return templates;
}

// Generate Report Templates
export function generateReportTemplates(): ReportTemplate[] {
  const templates: ReportTemplate[] = [
    {
      id: 'RPT001',
      name: 'Student Performance Report',
      description: 'Comprehensive report on student academic performance',
      category: 'performance',
      sections: [
        {
          id: 'SEC001',
          title: 'Academic Performance Overview',
          type: 'summary',
          dataFields: ['totalStudents', 'averageGPA', 'passRate', 'graduationRate'],
          chartType: 'pie',
          position: 1,
        },
        {
          id: 'SEC002',
          title: 'GPA Distribution',
          type: 'chart',
          dataFields: ['gpaDistribution'],
          chartType: 'bar',
          position: 2,
        },
      ],
      layout: 'portrait',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'RPT002',
      name: 'Pathway Analysis Report',
      description: 'Analysis of pathway demand and allocation',
      category: 'pathway',
      sections: [
        {
          id: 'SEC003',
          title: 'Pathway Demand Trends',
          type: 'chart',
          dataFields: ['pathwayDemand', 'selectionTrends'],
          chartType: 'line',
          position: 1,
        },
        {
          id: 'SEC004',
          title: 'Capacity Utilization',
          type: 'table',
          dataFields: ['pathway', 'capacity', 'demand', 'utilization'],
          position: 2,
        },
      ],
      layout: 'landscape',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'RPT003',
      name: 'Module Performance Report',
      description: 'Performance analysis by module',
      category: 'module',
      sections: [
        {
          id: 'SEC005',
          title: 'Module Statistics',
          type: 'table',
          dataFields: ['moduleName', 'averageGrade', 'passRate', 'enrollment'],
          position: 1,
        },
        {
          id: 'SEC006',
          title: 'Grade Distribution',
          type: 'chart',
          dataFields: ['gradeDistribution'],
          chartType: 'bar',
          position: 2,
        },
      ],
      layout: 'portrait',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  return templates;
}
