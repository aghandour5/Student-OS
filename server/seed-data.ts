export interface SeedCourse {
  id: string;
  code: string;
  title: string;
  credits: number;
  description: string;
  category: string;
  year: number;
  semester: number;
}

export interface SeedPrerequisite {
  courseId: string;
  requiresCourseId: string;
}

export interface SeedOffering {
  courseId: string;
  semester: string;
  campus: string;
  instructor: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}

export const seedCourses: SeedCourse[] = [
  // Year 1 - Semester 1
  { id: 'MATH101', code: 'MATH 101', title: 'Calculus I', credits: 4, description: 'Introduction to limits, derivatives, and integrals. Covers single-variable calculus with applications in engineering.', category: 'Mathematics', year: 1, semester: 1 },
  { id: 'PHYS101', code: 'PHYS 101', title: 'Physics I: Mechanics', credits: 4, description: 'Classical mechanics including kinematics, dynamics, energy, momentum, and rotational motion.', category: 'Science', year: 1, semester: 1 },
  { id: 'CHEM101', code: 'CHEM 101', title: 'General Chemistry', credits: 3, description: 'Fundamentals of chemistry including atomic structure, bonding, stoichiometry, and thermodynamics.', category: 'Science', year: 1, semester: 1 },
  { id: 'ENGL101', code: 'ENGL 101', title: 'English Composition', credits: 3, description: 'Development of writing skills with emphasis on argumentation, research, and technical writing.', category: 'General Education', year: 1, semester: 1 },
  { id: 'ENGR100', code: 'ENGR 100', title: 'Introduction to Engineering', credits: 2, description: 'Overview of engineering disciplines, problem-solving methodology, and engineering design process.', category: 'Engineering Core', year: 1, semester: 1 },

  // Year 1 - Semester 2
  { id: 'MATH102', code: 'MATH 102', title: 'Calculus II', credits: 4, description: 'Continuation of calculus covering integration techniques, sequences, series, and parametric equations.', category: 'Mathematics', year: 1, semester: 2 },
  { id: 'PHYS102', code: 'PHYS 102', title: 'Physics II: Electromagnetism', credits: 4, description: 'Electric fields, magnetic fields, circuits, electromagnetic waves, and optics.', category: 'Science', year: 1, semester: 2 },
  { id: 'CS101', code: 'CS 101', title: 'Programming Fundamentals', credits: 3, description: 'Introduction to programming using C/C++. Covers variables, control structures, functions, arrays, and basic data structures.', category: 'Computer Science', year: 1, semester: 2 },
  { id: 'MATH120', code: 'MATH 120', title: 'Linear Algebra', credits: 3, description: 'Vectors, matrices, determinants, eigenvalues, linear transformations, and applications.', category: 'Mathematics', year: 1, semester: 2 },

  // Year 2 - Semester 1
  { id: 'MATH201', code: 'MATH 201', title: 'Calculus III', credits: 4, description: 'Multivariable calculus including partial derivatives, multiple integrals, and vector calculus.', category: 'Mathematics', year: 2, semester: 1 },
  { id: 'CS201', code: 'CS 201', title: 'Data Structures', credits: 3, description: 'Advanced data structures including linked lists, trees, graphs, hash tables, and sorting algorithms.', category: 'Computer Science', year: 2, semester: 1 },
  { id: 'ECE201', code: 'ECE 201', title: 'Circuit Analysis I', credits: 3, description: 'Analysis of resistive circuits, Kirchhoff\'s laws, Thevenin/Norton theorems, and operational amplifiers.', category: 'Electrical Engineering', year: 2, semester: 1 },
  { id: 'MATH210', code: 'MATH 210', title: 'Differential Equations', credits: 3, description: 'Ordinary differential equations, Laplace transforms, and systems of differential equations.', category: 'Mathematics', year: 2, semester: 1 },
  { id: 'ECE210', code: 'ECE 210', title: 'Digital Logic Design', credits: 3, description: 'Boolean algebra, combinational logic, sequential logic, state machines, and basic FPGA design.', category: 'Computer Engineering', year: 2, semester: 1 },

  // Year 2 - Semester 2
  { id: 'ECE202', code: 'ECE 202', title: 'Circuit Analysis II', credits: 3, description: 'AC circuit analysis, frequency response, filters, and two-port networks.', category: 'Electrical Engineering', year: 2, semester: 2 },
  { id: 'CS202', code: 'CS 202', title: 'Object-Oriented Programming', credits: 3, description: 'Object-oriented design principles, inheritance, polymorphism, design patterns, and Java/C++.', category: 'Computer Science', year: 2, semester: 2 },
  { id: 'ECE220', code: 'ECE 220', title: 'Computer Architecture', credits: 3, description: 'Instruction set architecture, processor design, pipelining, memory hierarchy, and I/O systems.', category: 'Computer Engineering', year: 2, semester: 2 },
  { id: 'MATH230', code: 'MATH 230', title: 'Probability & Statistics', credits: 3, description: 'Probability theory, random variables, distributions, hypothesis testing, and regression analysis.', category: 'Mathematics', year: 2, semester: 2 },
  { id: 'PHYS201', code: 'PHYS 201', title: 'Modern Physics', credits: 3, description: 'Special relativity, quantum mechanics, atomic physics, and solid-state physics fundamentals.', category: 'Science', year: 2, semester: 2 },

  // Year 3 - Semester 1
  { id: 'ECE301', code: 'ECE 301', title: 'Signals & Systems', credits: 3, description: 'Continuous and discrete-time signals, Fourier analysis, Z-transforms, and system theory.', category: 'Electrical Engineering', year: 3, semester: 1 },
  { id: 'ECE310', code: 'ECE 310', title: 'Microprocessor Systems', credits: 3, description: 'Microprocessor architecture, assembly language, embedded programming, and interfacing.', category: 'Computer Engineering', year: 3, semester: 1 },
  { id: 'CS301', code: 'CS 301', title: 'Operating Systems', credits: 3, description: 'Process management, memory management, file systems, concurrency, and distributed systems.', category: 'Computer Science', year: 3, semester: 1 },
  { id: 'ECE315', code: 'ECE 315', title: 'Electronics I', credits: 3, description: 'Semiconductor physics, diodes, BJTs, MOSFETs, and basic amplifier configurations.', category: 'Electrical Engineering', year: 3, semester: 1 },
  { id: 'CS310', code: 'CS 310', title: 'Algorithms', credits: 3, description: 'Algorithm design techniques, graph algorithms, dynamic programming, NP-completeness, and complexity analysis.', category: 'Computer Science', year: 3, semester: 1 },

  // Year 3 - Semester 2
  { id: 'ECE320', code: 'ECE 320', title: 'Embedded Systems', credits: 3, description: 'Real-time operating systems, embedded C, sensor interfaces, actuator control, and IoT protocols.', category: 'Computer Engineering', year: 3, semester: 2 },
  { id: 'ECE302', code: 'ECE 302', title: 'Digital Signal Processing', credits: 3, description: 'Discrete Fourier transform, FIR/IIR filter design, spectral analysis, and DSP applications.', category: 'Electrical Engineering', year: 3, semester: 2 },
  { id: 'CS320', code: 'CS 320', title: 'Computer Networks', credits: 3, description: 'Network protocols, TCP/IP stack, routing algorithms, wireless networks, and network security.', category: 'Computer Science', year: 3, semester: 2 },
  { id: 'ECE316', code: 'ECE 316', title: 'Electronics II', credits: 3, description: 'Advanced amplifier design, feedback systems, oscillators, and power electronics.', category: 'Electrical Engineering', year: 3, semester: 2 },
  { id: 'ECE330', code: 'ECE 330', title: 'Control Systems', credits: 3, description: 'Feedback control theory, stability analysis, root locus, Bode plots, and PID controllers.', category: 'Electrical Engineering', year: 3, semester: 2 },

  // Year 4 - Semester 1
  { id: 'ECE401', code: 'ECE 401', title: 'VLSI Design', credits: 3, description: 'CMOS circuit design, layout techniques, timing analysis, and full custom IC design.', category: 'Computer Engineering', year: 4, semester: 1 },
  { id: 'CS401', code: 'CS 401', title: 'Machine Learning', credits: 3, description: 'Supervised and unsupervised learning, neural networks, deep learning, and practical applications.', category: 'Computer Science', year: 4, semester: 1 },
  { id: 'ECE410', code: 'ECE 410', title: 'Computer Security', credits: 3, description: 'Cryptography, network security, system vulnerabilities, ethical hacking, and security protocols.', category: 'Computer Engineering', year: 4, semester: 1 },
  { id: 'ECE490', code: 'ECE 490', title: 'Senior Design I', credits: 3, description: 'First part of the capstone design project. Proposal, literature review, design methodology.', category: 'Capstone', year: 4, semester: 1 },
  { id: 'ELEC01', code: 'ECE 450', title: 'Wireless Communications', credits: 3, description: 'Wireless channel models, modulation techniques, OFDM, MIMO systems, and cellular architectures.', category: 'Elective', year: 4, semester: 1 },

  // Year 4 - Semester 2
  { id: 'ECE491', code: 'ECE 491', title: 'Senior Design II', credits: 3, description: 'Completion of capstone project. Prototype building, testing, documentation, and final presentation.', category: 'Capstone', year: 4, semester: 2 },
  { id: 'CS420', code: 'CS 420', title: 'Database Systems', credits: 3, description: 'Relational databases, SQL, normalization, query optimization, and NoSQL databases.', category: 'Computer Science', year: 4, semester: 2 },
  { id: 'ELEC02', code: 'ECE 460', title: 'Robotics & Automation', credits: 3, description: 'Robot kinematics, dynamics, path planning, computer vision, and autonomous systems.', category: 'Elective', year: 4, semester: 2 },
  { id: 'ELEC03', code: 'ECE 470', title: 'Cloud Computing', credits: 3, description: 'Virtualization, containerization, microservices, distributed computing, and cloud platforms.', category: 'Elective', year: 4, semester: 2 },
  { id: 'PROF01', code: 'ENGR 400', title: 'Engineering Ethics & Management', credits: 2, description: 'Professional ethics, project management, intellectual property, and engineering leadership.', category: 'Professional', year: 4, semester: 2 },
];

export const seedPrerequisites: SeedPrerequisite[] = [
  // Calculus chain
  { courseId: 'MATH102', requiresCourseId: 'MATH101' },
  { courseId: 'MATH201', requiresCourseId: 'MATH102' },
  { courseId: 'MATH210', requiresCourseId: 'MATH102' },
  { courseId: 'MATH230', requiresCourseId: 'MATH102' },

  // Physics chain
  { courseId: 'PHYS102', requiresCourseId: 'PHYS101' },
  { courseId: 'PHYS102', requiresCourseId: 'MATH101' },
  { courseId: 'PHYS201', requiresCourseId: 'PHYS102' },
  { courseId: 'PHYS201', requiresCourseId: 'MATH102' },

  // CS chain
  { courseId: 'CS201', requiresCourseId: 'CS101' },
  { courseId: 'CS202', requiresCourseId: 'CS101' },
  { courseId: 'CS202', requiresCourseId: 'CS201' },
  { courseId: 'CS301', requiresCourseId: 'CS201' },
  { courseId: 'CS301', requiresCourseId: 'CS202' },
  { courseId: 'CS310', requiresCourseId: 'CS201' },
  { courseId: 'CS310', requiresCourseId: 'MATH201' },
  { courseId: 'CS320', requiresCourseId: 'CS201' },
  { courseId: 'CS401', requiresCourseId: 'CS310' },
  { courseId: 'CS401', requiresCourseId: 'MATH230' },
  { courseId: 'CS401', requiresCourseId: 'MATH120' },
  { courseId: 'CS420', requiresCourseId: 'CS201' },

  // ECE chain
  { courseId: 'ECE201', requiresCourseId: 'PHYS102' },
  { courseId: 'ECE201', requiresCourseId: 'MATH102' },
  { courseId: 'ECE210', requiresCourseId: 'CS101' },
  { courseId: 'ECE202', requiresCourseId: 'ECE201' },
  { courseId: 'ECE202', requiresCourseId: 'MATH210' },
  { courseId: 'ECE220', requiresCourseId: 'ECE210' },
  { courseId: 'ECE220', requiresCourseId: 'CS101' },
  { courseId: 'ECE301', requiresCourseId: 'ECE202' },
  { courseId: 'ECE301', requiresCourseId: 'MATH210' },
  { courseId: 'ECE310', requiresCourseId: 'ECE220' },
  { courseId: 'ECE310', requiresCourseId: 'CS201' },
  { courseId: 'ECE315', requiresCourseId: 'ECE201' },
  { courseId: 'ECE315', requiresCourseId: 'PHYS102' },
  { courseId: 'ECE320', requiresCourseId: 'ECE310' },
  { courseId: 'ECE320', requiresCourseId: 'CS301' },
  { courseId: 'ECE302', requiresCourseId: 'ECE301' },
  { courseId: 'ECE316', requiresCourseId: 'ECE315' },
  { courseId: 'ECE330', requiresCourseId: 'ECE301' },
  { courseId: 'ECE330', requiresCourseId: 'MATH210' },
  { courseId: 'ECE401', requiresCourseId: 'ECE220' },
  { courseId: 'ECE401', requiresCourseId: 'ECE315' },
  { courseId: 'ECE410', requiresCourseId: 'CS320' },
  { courseId: 'ECE410', requiresCourseId: 'CS301' },
  { courseId: 'ECE490', requiresCourseId: 'ECE320' },
  { courseId: 'ECE491', requiresCourseId: 'ECE490' },
  { courseId: 'ELEC01', requiresCourseId: 'ECE301' },
  { courseId: 'ELEC02', requiresCourseId: 'ECE330' },
  { courseId: 'ELEC02', requiresCourseId: 'ECE310' },
  { courseId: 'ELEC03', requiresCourseId: 'CS320' },
  { courseId: 'ELEC03', requiresCourseId: 'CS301' },
];

export const seedOfferings: SeedOffering[] = [
  // Year 1 Sem 1 offerings
  { courseId: 'MATH101', semester: 'Fall', campus: 'Main', instructor: 'Dr. Sarah Chen', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'MATH 201' },
  { courseId: 'PHYS101', semester: 'Fall', campus: 'Main', instructor: 'Dr. James Walker', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'SCI 105' },
  { courseId: 'CHEM101', semester: 'Fall', campus: 'Main', instructor: 'Dr. Lisa Park', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'CHEM 302' },
  { courseId: 'ENGL101', semester: 'Fall', campus: 'Main', instructor: 'Prof. Mark Davis', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'HUM 110' },
  { courseId: 'ENGR100', semester: 'Fall', campus: 'Main', instructor: 'Dr. Robert Kim', dayOfWeek: 'W', startTime: '14:00', endTime: '16:00', room: 'ENGR 100' },

  // Year 1 Sem 2
  { courseId: 'MATH102', semester: 'Spring', campus: 'Main', instructor: 'Dr. Sarah Chen', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'MATH 201' },
  { courseId: 'PHYS102', semester: 'Spring', campus: 'Main', instructor: 'Dr. Alan Foster', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'SCI 105' },
  { courseId: 'CS101', semester: 'Fall', campus: 'Main', instructor: 'Dr. Emily Zhang', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'CS 201' },
  { courseId: 'CS101', semester: 'Spring', campus: 'Main', instructor: 'Dr. Emily Zhang', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'CS 201' },
  { courseId: 'MATH120', semester: 'Spring', campus: 'Main', instructor: 'Dr. Nina Patel', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'MATH 305' },
  { courseId: 'MATH120', semester: 'Fall', campus: 'Main', instructor: 'Dr. Nina Patel', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'MATH 305' },

  // Year 2
  { courseId: 'MATH201', semester: 'Fall', campus: 'Main', instructor: 'Dr. John Lee', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'MATH 401' },
  { courseId: 'CS201', semester: 'Fall', campus: 'Main', instructor: 'Dr. Kevin Wang', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'CS 301' },
  { courseId: 'ECE201', semester: 'Fall', campus: 'Main', instructor: 'Dr. Thomas Brown', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'ECE 201' },
  { courseId: 'MATH210', semester: 'Fall', campus: 'Main', instructor: 'Dr. Maria Santos', dayOfWeek: 'TTh', startTime: '13:00', endTime: '14:30', room: 'MATH 302' },
  { courseId: 'ECE210', semester: 'Fall', campus: 'Main', instructor: 'Dr. Alex Rivera', dayOfWeek: 'MWF', startTime: '14:00', endTime: '15:00', room: 'ECE 105' },

  { courseId: 'ECE202', semester: 'Spring', campus: 'Main', instructor: 'Dr. Thomas Brown', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ECE 201' },
  { courseId: 'CS202', semester: 'Spring', campus: 'Main', instructor: 'Dr. Kevin Wang', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'CS 301' },
  { courseId: 'ECE220', semester: 'Spring', campus: 'Main', instructor: 'Dr. Alex Rivera', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'ECE 305' },
  { courseId: 'MATH230', semester: 'Spring', campus: 'Main', instructor: 'Dr. Nina Patel', dayOfWeek: 'TTh', startTime: '13:00', endTime: '14:30', room: 'MATH 201' },
  { courseId: 'PHYS201', semester: 'Spring', campus: 'Main', instructor: 'Dr. James Walker', dayOfWeek: 'MWF', startTime: '14:00', endTime: '15:00', room: 'SCI 302' },

  // Year 3
  { courseId: 'ECE301', semester: 'Fall', campus: 'Main', instructor: 'Dr. Helen Cho', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'ECE 401' },
  { courseId: 'ECE310', semester: 'Fall', campus: 'North', instructor: 'Dr. Brian Torres', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'TECH 201' },
  { courseId: 'CS301', semester: 'Fall', campus: 'Main', instructor: 'Dr. David Clark', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'CS 401' },
  { courseId: 'ECE315', semester: 'Fall', campus: 'Main', instructor: 'Dr. Grace Liu', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ECE 301' },
  { courseId: 'CS310', semester: 'Fall', campus: 'Main', instructor: 'Dr. Michael Ross', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'CS 305' },

  { courseId: 'ECE320', semester: 'Spring', campus: 'North', instructor: 'Dr. Brian Torres', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'TECH 301' },
  { courseId: 'ECE302', semester: 'Spring', campus: 'Main', instructor: 'Dr. Helen Cho', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'ECE 401' },
  { courseId: 'CS320', semester: 'Spring', campus: 'Main', instructor: 'Dr. Rachel Green', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'CS 305' },
  { courseId: 'ECE316', semester: 'Spring', campus: 'Main', instructor: 'Dr. Grace Liu', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ECE 301' },
  { courseId: 'ECE330', semester: 'Spring', campus: 'Main', instructor: 'Dr. Paul Anderson', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ECE 201' },

  // Year 4
  { courseId: 'ECE401', semester: 'Fall', campus: 'North', instructor: 'Dr. Susan White', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'TECH 401' },
  { courseId: 'CS401', semester: 'Fall', campus: 'Main', instructor: 'Dr. Michael Ross', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'CS 501' },
  { courseId: 'ECE410', semester: 'Fall', campus: 'Main', instructor: 'Dr. Rachel Green', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'CS 401' },
  { courseId: 'ECE490', semester: 'Fall', campus: 'Main', instructor: 'Dr. Robert Kim', dayOfWeek: 'F', startTime: '14:00', endTime: '17:00', room: 'ENGR 501' },
  { courseId: 'ELEC01', semester: 'Fall', campus: 'Main', instructor: 'Dr. Helen Cho', dayOfWeek: 'TTh', startTime: '13:00', endTime: '14:30', room: 'ECE 501' },

  { courseId: 'ECE491', semester: 'Spring', campus: 'Main', instructor: 'Dr. Robert Kim', dayOfWeek: 'F', startTime: '14:00', endTime: '17:00', room: 'ENGR 501' },
  { courseId: 'CS420', semester: 'Spring', campus: 'Main', instructor: 'Dr. David Clark', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'CS 401' },
  { courseId: 'ELEC02', semester: 'Spring', campus: 'North', instructor: 'Dr. Brian Torres', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'TECH 501' },
  { courseId: 'ELEC03', semester: 'Spring', campus: 'Main', instructor: 'Dr. Rachel Green', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'CS 501' },
  { courseId: 'PROF01', semester: 'Spring', campus: 'Main', instructor: 'Dr. Amanda Foster', dayOfWeek: 'W', startTime: '15:00', endTime: '17:00', room: 'ENGR 201' },
  { courseId: 'PROF01', semester: 'Fall', campus: 'Main', instructor: 'Dr. Amanda Foster', dayOfWeek: 'W', startTime: '15:00', endTime: '17:00', room: 'ENGR 201' },
];
