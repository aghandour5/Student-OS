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
  section: string;
  semester: string;
  campus: string;
  instructor: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}

export const seedCourses: SeedCourse[] = [
  // Foundation Courses (Year 0) - Pre-program requirements
  { id: 'MATH160', code: 'MATH160', title: 'Pre-Calculus', credits: 3, description: 'Foundational mathematics covering algebraic functions, trigonometry, and analytic geometry. Required for entry into calculus and engineering courses.', category: 'Foundation', year: 0, semester: 1 },
  { id: 'MATH161', code: 'MATH161', title: 'Calculus I', credits: 3, description: 'Introduction to limits, derivatives, and integrals. Covers single-variable calculus with applications in science and engineering.', category: 'Foundation', year: 0, semester: 1 },
  { id: 'PHYS160', code: 'PHYS160', title: 'Physics I', credits: 3, description: 'Classical mechanics including kinematics, dynamics, energy, momentum, and rotational motion.', category: 'Foundation', year: 0, semester: 1 },
  { id: 'PHYS161', code: 'PHYS161', title: 'Physics II', credits: 3, description: 'Electricity and magnetism, electric fields, circuits, electromagnetic waves, and optics.', category: 'Foundation', year: 0, semester: 2 },
  { id: 'ENGL051', code: 'ENGL051', title: 'English Foundation', credits: 3, description: 'Foundational English language skills including reading comprehension, grammar, and basic writing.', category: 'Foundation', year: 0, semester: 1 },
  { id: 'ENGL101', code: 'ENGL101', title: 'English Composition I', credits: 3, description: 'Development of writing skills with emphasis on essay structure, argumentation, and research methods.', category: 'Foundation', year: 0, semester: 1 },
  { id: 'ENGL151', code: 'ENGL151', title: 'English Composition II', credits: 3, description: 'Advanced writing skills covering critical analysis, literary interpretation, and academic discourse.', category: 'Foundation', year: 0, semester: 2 },
  { id: 'CHEM160', code: 'CHEM160', title: 'General Chemistry', credits: 3, description: 'Fundamentals of chemistry including atomic structure, bonding, stoichiometry, and thermodynamics.', category: 'Foundation', year: 0, semester: 2 },

  // Year 1 - Fall Semester
  { id: 'MATH225', code: 'MATH225', title: 'Linear Algebra with Applications', credits: 3, description: 'Vectors, matrices, determinants, eigenvalues, linear transformations, and applications to engineering problems. Corequisites: None.', category: 'Mathematics', year: 1, semester: 1 },
  { id: 'PHYS220', code: 'PHYS220', title: 'Physics for Engineers', credits: 3, description: 'Advanced physics topics for engineering students including waves, thermodynamics, and modern physics. Corequisites: MATH210.', category: 'Science', year: 1, semester: 1 },
  { id: 'CULT200', code: 'CULT200', title: 'Introduction to Arab-Islamic Civilization', credits: 3, description: 'Survey of Arab-Islamic history, culture, contributions to science and philosophy, and contemporary issues.', category: 'General Education', year: 1, semester: 1 },
  { id: 'MATH210', code: 'MATH210', title: 'Calculus II', credits: 3, description: 'Continuation of calculus covering integration techniques, sequences, series, Taylor polynomials, and parametric equations.', category: 'Mathematics', year: 1, semester: 1 },
  { id: 'ENGG200', code: 'ENGG200', title: 'Introduction to Engineering', credits: 3, description: 'Overview of engineering disciplines, problem-solving methodology, engineering design process, and professional skills.', category: 'Engineering Core', year: 1, semester: 1 },
  { id: 'ENGL201', code: 'ENGL201', title: 'Composition and Research Skills', credits: 3, description: 'Development of advanced writing and research skills with emphasis on academic and technical communication.', category: 'General Education', year: 1, semester: 1 },

  // Year 1 - Spring Semester
  { id: 'EENG250', code: 'EENG250', title: 'Electric Circuits I', credits: 3, description: 'Analysis of resistive circuits, Kirchhoff\'s laws, Thevenin/Norton theorems, and operational amplifiers. Corequisites: ENGG200, MATH210.', category: 'Electrical Engineering', year: 1, semester: 2 },
  { id: 'CENG250', code: 'CENG250', title: 'Digital Logic I', credits: 3, description: 'Boolean algebra, combinational logic design, truth tables, Karnaugh maps, and basic sequential circuits. Corequisites: EENG250.', category: 'Computer Engineering', year: 1, semester: 2 },
  { id: 'MATH270', code: 'MATH270', title: 'Ordinary Differential Equations', credits: 3, description: 'First and second order ODEs, Laplace transforms, systems of differential equations, and applications. Corequisites: MATH225.', category: 'Mathematics', year: 1, semester: 2 },
  { id: 'ENGL251', code: 'ENGL251', title: 'Communication Skills', credits: 3, description: 'Oral and written communication skills for professional contexts including presentations, reports, and technical writing.', category: 'General Education', year: 1, semester: 2 },
  { id: 'CSCI250L', code: 'CSCI250L', title: 'Introduction to Programming Lab', credits: 1, description: 'Hands-on programming laboratory complementing CSCI250. Practice with coding exercises and small projects. Corequisites: ENGL101, CSCI250.', category: 'Computer Science', year: 1, semester: 2 },
  { id: 'MATH220', code: 'MATH220', title: 'Calculus III', credits: 3, description: 'Multivariable calculus including partial derivatives, multiple integrals, vector calculus, and applications.', category: 'Mathematics', year: 1, semester: 2 },
  { id: 'CSCI250', code: 'CSCI250', title: 'Introduction to Programming', credits: 3, description: 'Introduction to programming using C/C++. Covers variables, control structures, functions, arrays, and basic data structures. Corequisites: ENGL101, CSCI250L.', category: 'Computer Science', year: 1, semester: 2 },

  // Year 2 - Fall Semester
  { id: 'CSCI300', code: 'CSCI300', title: 'Intermediate Programming with Objects', credits: 3, description: 'Object-oriented programming concepts including classes, inheritance, polymorphism, and design patterns using Java/C++.', category: 'Computer Science', year: 2, semester: 1 },
  { id: 'EENG300', code: 'EENG300', title: 'Electric Circuits II', credits: 3, description: 'AC circuit analysis, frequency response, filters, resonance, and two-port networks. Corequisites: EENG301L.', category: 'Electrical Engineering', year: 2, semester: 1 },
  { id: 'ENGG300', code: 'ENGG300', title: 'Engineering Economics', credits: 3, description: 'Time value of money, economic analysis of engineering projects, cost estimation, and financial decision-making. Corequisites: MATH220.', category: 'Engineering Core', year: 2, semester: 1 },
  { id: 'MATH310', code: 'MATH310', title: 'Probability & Statistics for Scientists & Engineers', credits: 3, description: 'Probability theory, random variables, distributions, hypothesis testing, regression analysis, and applications.', category: 'Mathematics', year: 2, semester: 1 },
  { id: 'CENG335', code: 'CENG335', title: 'Digital Logic II', credits: 3, description: 'Advanced sequential logic design, finite state machines, VHDL/Verilog, and FPGA implementation.', category: 'Computer Engineering', year: 2, semester: 1 },
  { id: 'CENG325', code: 'CENG325', title: 'Software Applications and Design', credits: 3, description: 'Software design principles, UML modeling, design patterns, and software development lifecycle. Corequisites: CSCI300.', category: 'Computer Engineering', year: 2, semester: 1 },
  { id: 'EENG301L', code: 'EENG301L', title: 'Electric Circuits Lab', credits: 1, description: 'Laboratory experiments in electric circuit analysis, measurements, and instrumentation. Corequisites: EENG300.', category: 'Electrical Engineering', year: 2, semester: 1 },

  // Year 2 - Spring Semester
  { id: 'ARAB200', code: 'ARAB200', title: 'Arabic Language and Literature', credits: 3, description: 'Study of Arabic language, grammar, composition, and selected works from classical and modern Arabic literature.', category: 'General Education', year: 2, semester: 2 },
  { id: 'EENG350L', code: 'EENG350L', title: 'Electronic Circuits I Lab', credits: 1, description: 'Laboratory experiments in electronic circuit design, transistor circuits, and amplifier measurements. Corequisites: EENG350.', category: 'Electrical Engineering', year: 2, semester: 2 },
  { id: 'CENG352L', code: 'CENG352L', title: 'Digital Logic Circuits Lab', credits: 1, description: 'Hands-on digital logic design laboratory with breadboard prototyping and FPGA implementation.', category: 'Computer Engineering', year: 2, semester: 2 },
  { id: 'CENG380', code: 'CENG380', title: 'Microprocessors and Microcontrollers', credits: 3, description: 'Microprocessor architecture, assembly language programming, embedded systems, and interfacing with peripherals. Corequisites: CENG352L.', category: 'Computer Engineering', year: 2, semester: 2 },
  { id: 'EENG385', code: 'EENG385', title: 'Signals and Systems', credits: 3, description: 'Continuous and discrete-time signals, Fourier analysis, Laplace and Z-transforms, and system theory. Corequisites: MATH310, MATH270.', category: 'Electrical Engineering', year: 2, semester: 2 },
  { id: 'CENG375', code: 'CENG375', title: 'Introduction to Database Systems', credits: 3, description: 'Relational databases, SQL, normalization, ER modeling, query optimization, and database application development.', category: 'Computer Engineering', year: 2, semester: 2 },
  { id: 'EENG350', code: 'EENG350', title: 'Electronic Circuits I', credits: 3, description: 'Semiconductor physics, diodes, BJTs, MOSFETs, and basic amplifier design and analysis. Corequisites: EENG350L.', category: 'Electrical Engineering', year: 2, semester: 2 },

  // Year 3 - Fall Semester
  { id: 'CENG430L', code: 'CENG430L', title: 'Linux Lab', credits: 1, description: 'Hands-on Linux system administration, shell scripting, process management, and development tools.', category: 'Computer Engineering', year: 3, semester: 1 },
  { id: 'EENG447', code: 'EENG447', title: 'Analog Communication Systems', credits: 3, description: 'Amplitude and frequency modulation, noise analysis, superheterodyne receivers, and analog communication theory.', category: 'Electrical Engineering', year: 3, semester: 1 },
  { id: 'CENG435', code: 'CENG435', title: 'Mobile Application Development', credits: 3, description: 'Design and development of mobile applications for iOS and Android platforms using modern frameworks and tools.', category: 'Computer Engineering', year: 3, semester: 1 },
  { id: 'CENG415', code: 'CENG415', title: 'Communication Networks', credits: 3, description: 'Network protocols, TCP/IP stack, routing algorithms, wireless networks, and network security fundamentals.', category: 'Computer Engineering', year: 3, semester: 1 },
  { id: 'CENG400L', code: 'CENG400L', title: 'Microcontroller Applications Lab', credits: 1, description: 'Hands-on microcontroller programming, sensor interfacing, actuator control, and embedded project development.', category: 'Computer Engineering', year: 3, semester: 1 },
  { id: 'CENG420', code: 'CENG420', title: 'Web Programming and Technologies', credits: 3, description: 'Full-stack web development including HTML/CSS/JavaScript, server-side programming, REST APIs, and databases.', category: 'Computer Engineering', year: 3, semester: 1 },
  { id: 'CENG400', code: 'CENG400', title: 'Computer Organization and Design', credits: 3, description: 'CPU architecture, instruction set design, pipelining, memory hierarchy, I/O systems, and performance optimization.', category: 'Computer Engineering', year: 3, semester: 1 },

  // Year 3 - Spring Semester
  { id: 'CENG450L', code: 'CENG450L', title: 'Scripting Languages Lab', credits: 1, description: 'Practical scripting with Python, Bash, and automation tools for system administration and data processing.', category: 'Computer Engineering', year: 3, semester: 2 },
  { id: 'CENG455L', code: 'CENG455L', title: 'Communication Networks Lab', credits: 1, description: 'Network configuration, packet analysis with Wireshark, routing setup, and network troubleshooting exercises.', category: 'Computer Engineering', year: 3, semester: 2 },
  { id: 'CENG495', code: 'CENG495', title: 'Senior Project', credits: 3, description: 'Capstone design project integrating computer engineering knowledge. Proposal, design, implementation, testing, and presentation.', category: 'Capstone', year: 3, semester: 2 },
  { id: 'EENG467L', code: 'EENG467L', title: 'Analog Communication Systems Lab', credits: 1, description: 'Laboratory experiments in AM/FM modulation, demodulation, noise measurement, and communication system testing.', category: 'Electrical Engineering', year: 3, semester: 2 },
  { id: 'ENGG450', code: 'ENGG450', title: 'Engineering Ethics and Professional Practice', credits: 3, description: 'Professional ethics, engineering codes of conduct, intellectual property, project management, and leadership. Corequisites: CENG495, ENGG300.', category: 'Engineering Core', year: 3, semester: 2 },

  // Major Elective Courses
  { id: 'CENG460', code: 'CENG460', title: 'Operating Systems', credits: 3, description: 'Process management, memory management, file systems, concurrency, scheduling, and distributed systems concepts.', category: 'Elective', year: 3, semester: 1 },
  { id: 'CENG470', code: 'CENG470', title: 'Data Structures and Analysis of Algorithms', credits: 3, description: 'Advanced data structures including trees, graphs, hash tables, and algorithm analysis including sorting, searching, and complexity.', category: 'Elective', year: 3, semester: 1 },
];

export const seedPrerequisites: SeedPrerequisite[] = [
  // Year 1 Fall prerequisites (from foundation courses)
  { courseId: 'MATH225', requiresCourseId: 'MATH160' },
  { courseId: 'MATH225', requiresCourseId: 'ENGL051' },
  { courseId: 'MATH225', requiresCourseId: 'MATH161' },

  { courseId: 'PHYS220', requiresCourseId: 'PHYS161' },
  { courseId: 'PHYS220', requiresCourseId: 'ENGL101' },
  { courseId: 'PHYS220', requiresCourseId: 'PHYS160' },

  { courseId: 'MATH210', requiresCourseId: 'MATH161' },
  { courseId: 'MATH210', requiresCourseId: 'MATH160' },

  { courseId: 'ENGG200', requiresCourseId: 'MATH160' },
  { courseId: 'ENGG200', requiresCourseId: 'CHEM160' },

  { courseId: 'ENGL201', requiresCourseId: 'ENGL151' },

  // Year 1 Spring prerequisites
  { courseId: 'EENG250', requiresCourseId: 'PHYS161' },
  { courseId: 'EENG250', requiresCourseId: 'PHYS160' },
  { courseId: 'EENG250', requiresCourseId: 'MATH161' },
  { courseId: 'EENG250', requiresCourseId: 'MATH160' },
  { courseId: 'EENG250', requiresCourseId: 'ENGL051' },

  { courseId: 'MATH270', requiresCourseId: 'MATH210' },

  { courseId: 'ENGL251', requiresCourseId: 'ENGL201' },

  { courseId: 'MATH220', requiresCourseId: 'MATH210' },

  // Year 2 Fall prerequisites
  { courseId: 'CSCI300', requiresCourseId: 'CSCI250L' },
  { courseId: 'CSCI300', requiresCourseId: 'CSCI250' },

  { courseId: 'EENG300', requiresCourseId: 'EENG250' },

  { courseId: 'ENGG300', requiresCourseId: 'ENGL201' },
  { courseId: 'ENGG300', requiresCourseId: 'MATH225' },

  { courseId: 'MATH310', requiresCourseId: 'MATH210' },
  { courseId: 'MATH310', requiresCourseId: 'ENGL201' },

  { courseId: 'CENG335', requiresCourseId: 'CSCI250' },
  { courseId: 'CENG335', requiresCourseId: 'CENG250' },

  { courseId: 'EENG301L', requiresCourseId: 'EENG250' },

  // Year 2 Spring prerequisites
  { courseId: 'EENG350L', requiresCourseId: 'EENG300' },
  { courseId: 'EENG350L', requiresCourseId: 'EENG250' },
  { courseId: 'EENG350L', requiresCourseId: 'EENG301L' },

  { courseId: 'CENG352L', requiresCourseId: 'CENG250' },
  { courseId: 'CENG352L', requiresCourseId: 'EENG301L' },

  { courseId: 'CENG380', requiresCourseId: 'CENG250' },
  { courseId: 'CENG380', requiresCourseId: 'CENG335' },
  { courseId: 'CENG380', requiresCourseId: 'EENG250' },
  { courseId: 'CENG380', requiresCourseId: 'CSCI250' },

  { courseId: 'EENG385', requiresCourseId: 'MATH225' },
  { courseId: 'EENG385', requiresCourseId: 'EENG300' },

  { courseId: 'CENG375', requiresCourseId: 'CENG325' },
  { courseId: 'CENG375', requiresCourseId: 'CSCI300' },

  { courseId: 'EENG350', requiresCourseId: 'ENGG200' },
  { courseId: 'EENG350', requiresCourseId: 'CENG250' },
  { courseId: 'EENG350', requiresCourseId: 'EENG300' },
  { courseId: 'EENG350', requiresCourseId: 'EENG250' },

  // Year 3 Fall prerequisites
  { courseId: 'CENG430L', requiresCourseId: 'CENG380' },
  { courseId: 'CENG430L', requiresCourseId: 'CENG325' },

  { courseId: 'EENG447', requiresCourseId: 'MATH310' },
  { courseId: 'EENG447', requiresCourseId: 'EENG385' },

  { courseId: 'CENG435', requiresCourseId: 'CENG325' },
  { courseId: 'CENG435', requiresCourseId: 'CSCI300' },
  { courseId: 'CENG435', requiresCourseId: 'CENG375' },

  { courseId: 'CENG415', requiresCourseId: 'CENG250' },
  { courseId: 'CENG415', requiresCourseId: 'CENG325' },
  { courseId: 'CENG415', requiresCourseId: 'CSCI250' },
  { courseId: 'CENG415', requiresCourseId: 'CSCI300' },

  { courseId: 'CENG400L', requiresCourseId: 'CENG380' },

  { courseId: 'CENG420', requiresCourseId: 'CENG325' },
  { courseId: 'CENG420', requiresCourseId: 'CSCI300' },
  { courseId: 'CENG420', requiresCourseId: 'CENG375' },

  { courseId: 'CENG400', requiresCourseId: 'CENG335' },
  { courseId: 'CENG400', requiresCourseId: 'CENG250' },
  { courseId: 'CENG400', requiresCourseId: 'CENG380' },

  // Year 3 Spring prerequisites
  { courseId: 'CENG450L', requiresCourseId: 'CENG430L' },

  { courseId: 'CENG455L', requiresCourseId: 'CENG415' },

  { courseId: 'CENG495', requiresCourseId: 'CENG420' },
  { courseId: 'CENG495', requiresCourseId: 'EENG350' },
  { courseId: 'CENG495', requiresCourseId: 'EENG447' },
  { courseId: 'CENG495', requiresCourseId: 'CENG435' },
  { courseId: 'CENG495', requiresCourseId: 'CENG415' },
  { courseId: 'CENG495', requiresCourseId: 'CENG380' },
  { courseId: 'CENG495', requiresCourseId: 'CENG375' },

  { courseId: 'EENG467L', requiresCourseId: 'EENG447' },

  { courseId: 'ENGG450', requiresCourseId: 'ENGL251' },

  // Elective prerequisites
  { courseId: 'CENG460', requiresCourseId: 'CENG380' },
  { courseId: 'CENG460', requiresCourseId: 'CSCI300' },

  { courseId: 'CENG470', requiresCourseId: 'CENG325' },
  { courseId: 'CENG470', requiresCourseId: 'CSCI300' },
];

export const seedOfferings: SeedOffering[] = [
  // Foundation courses (offered every semester)
  { courseId: 'MATH160', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Ahmad Khalil', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'SCI 101' },
  { courseId: 'MATH160', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Ahmad Khalil', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'SCI 101' },
  { courseId: 'MATH161', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Layla Hassan', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'SCI 102' },
  { courseId: 'MATH161', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Layla Hassan', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'SCI 102' },
  { courseId: 'PHYS160', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Omar Farooq', dayOfWeek: 'TTh', startTime: '08:00', endTime: '09:30', room: 'SCI 201' },
  { courseId: 'PHYS161', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Omar Farooq', dayOfWeek: 'TTh', startTime: '08:00', endTime: '09:30', room: 'SCI 201' },
  { courseId: 'ENGL051', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Prof. Sarah Mitchell', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'HUM 110' },
  { courseId: 'ENGL101', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Prof. James Roberts', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'HUM 112' },
  { courseId: 'ENGL101', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Prof. James Roberts', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'HUM 112' },
  { courseId: 'ENGL151', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Prof. Sarah Mitchell', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'HUM 110' },
  { courseId: 'CHEM160', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Nadia El-Amin', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'SCI 301' },
  { courseId: 'CHEM160', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Nadia El-Amin', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'SCI 301' },

  // Year 1 Fall
  { courseId: 'MATH225', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Youssef Mansour', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'ENG 201' },
  { courseId: 'PHYS220', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Rania Abdelrahman', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'SCI 205' },
  { courseId: 'CULT200', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Fatima Al-Zahrani', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'HUM 201' },
  { courseId: 'CULT200', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Fatima Al-Zahrani', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'HUM 201' },
  { courseId: 'MATH210', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Layla Hassan', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'ENG 202' },
  { courseId: 'ENGG200', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Khalid Nasser', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ENG 100' },
  { courseId: 'ENGL201', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Prof. David Anderson', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'HUM 115' },

  // Year 1 Spring
  { courseId: 'EENG250', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Hassan Ibrahim', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'ENG 301' },
  { courseId: 'CENG250', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 305' },
  { courseId: 'MATH270', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Youssef Mansour', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'ENG 201' },
  { courseId: 'ENGL251', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Prof. David Anderson', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'HUM 115' },
  { courseId: 'CSCI250L', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Amira Saleh', dayOfWeek: 'W', startTime: '14:00', endTime: '16:00', room: 'LAB 101' },
  { courseId: 'MATH220', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Layla Hassan', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ENG 202' },
  { courseId: 'CSCI250', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Amira Saleh', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 310' },

  // Year 2 Fall
  { courseId: 'CSCI300', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Amira Saleh', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 310' },
  { courseId: 'EENG300', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Hassan Ibrahim', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 301' },
  { courseId: 'ENGG300', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Mona Al-Qasim', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'ENG 100' },
  { courseId: 'MATH310', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Youssef Mansour', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ENG 201' },
  { courseId: 'CENG335', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ENG 305' },
  { courseId: 'CENG325', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Zainab Othman', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 315' },
  { courseId: 'EENG301L', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Hassan Ibrahim', dayOfWeek: 'Th', startTime: '15:30', endTime: '17:30', room: 'LAB 201' },

  // Year 2 Spring
  { courseId: 'ARAB200', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Samir Haddad', dayOfWeek: 'TTh', startTime: '08:00', endTime: '09:30', room: 'HUM 205' },
  { courseId: 'EENG350L', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Walid Khoury', dayOfWeek: 'W', startTime: '14:00', endTime: '16:00', room: 'LAB 202' },
  { courseId: 'CENG352L', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'M', startTime: '14:00', endTime: '16:00', room: 'LAB 301' },
  { courseId: 'CENG380', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 320' },
  { courseId: 'EENG385', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Hassan Ibrahim', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'ENG 301' },
  { courseId: 'CENG375', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Zainab Othman', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'ENG 315' },
  { courseId: 'EENG350', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Walid Khoury', dayOfWeek: 'TTh', startTime: '13:00', endTime: '14:30', room: 'ENG 302' },

  // Year 3 Fall
  { courseId: 'CENG430L', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'T', startTime: '14:00', endTime: '16:00', room: 'LAB 302' },
  { courseId: 'EENG447', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Karim Azzam', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'ENG 401' },
  { courseId: 'CENG435', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Zainab Othman', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 315' },
  { courseId: 'CENG415', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Hana Barakat', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'ENG 410' },
  { courseId: 'CENG400L', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'Th', startTime: '14:00', endTime: '16:00', room: 'LAB 302' },
  { courseId: 'CENG420', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Amira Saleh', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ENG 310' },
  { courseId: 'CENG400', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ENG 305' },
  { courseId: 'CENG460', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'MWF', startTime: '14:00', endTime: '15:00', room: 'ENG 320' },
  { courseId: 'CENG470', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Amira Saleh', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 310' },

  // Year 3 Spring
  { courseId: 'CENG450L', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'M', startTime: '14:00', endTime: '16:00', room: 'LAB 302' },
  { courseId: 'CENG455L', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Hana Barakat', dayOfWeek: 'W', startTime: '14:00', endTime: '16:00', room: 'LAB 303' },
  { courseId: 'CENG495', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Khalid Nasser', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 500' },
  { courseId: 'EENG467L', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Karim Azzam', dayOfWeek: 'T', startTime: '14:00', endTime: '16:00', room: 'LAB 201' },
  { courseId: 'ENGG450', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Mona Al-Qasim', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'ENG 100' },

  // Section B offerings for popular courses
  { courseId: 'MATH160', section: 'B', semester: 'Fall', campus: 'Main', instructor: 'Dr. Layla Hassan', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'SCI 105' },
  { courseId: 'MATH161', section: 'B', semester: 'Fall', campus: 'Main', instructor: 'Dr. Ahmad Khalil', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'SCI 103' },
  { courseId: 'MATH225', section: 'B', semester: 'Fall', campus: 'Main', instructor: 'Dr. Ahmad Khalil', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ENG 203' },
  { courseId: 'MATH210', section: 'B', semester: 'Fall', campus: 'Main', instructor: 'Dr. Youssef Mansour', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 204' },
  { courseId: 'EENG250', section: 'B', semester: 'Spring', campus: 'Main', instructor: 'Dr. Walid Khoury', dayOfWeek: 'TTh', startTime: '13:00', endTime: '14:30', room: 'ENG 303' },
  { courseId: 'CSCI250', section: 'B', semester: 'Spring', campus: 'Main', instructor: 'Dr. Zainab Othman', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 312' },
  { courseId: 'CSCI300', section: 'B', semester: 'Fall', campus: 'Main', instructor: 'Dr. Zainab Othman', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ENG 312' },
  { courseId: 'CENG380', section: 'B', semester: 'Spring', campus: 'Main', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 322' },
  { courseId: 'CENG415', section: 'B', semester: 'Fall', campus: 'Main', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'TTh', startTime: '13:00', endTime: '14:30', room: 'ENG 412' },
  { courseId: 'CENG420', section: 'B', semester: 'Fall', campus: 'Main', instructor: 'Dr. Zainab Othman', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 315' },
];
