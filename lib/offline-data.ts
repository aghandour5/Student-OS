import type { CourseWithPrereqs } from '@shared/schema';

// Embedded course data for offline use
export const offlineCourses: CourseWithPrereqs[] = [
    // Foundation Courses (Year 0)
    { id: 'MATH160', code: 'MATH160', title: 'Pre-Calculus', credits: 3, description: 'Foundational mathematics covering algebraic functions, trigonometry, and analytic geometry. Required for entry into calculus and engineering courses.', category: 'Foundation', year: 0, semester: 1, prerequisites: [], unlocks: ['MATH225', 'MATH210', 'ENGG200'] },
    { id: 'MATH161', code: 'MATH161', title: 'Calculus I', credits: 3, description: 'Introduction to limits, derivatives, and integrals. Covers single-variable calculus with applications in science and engineering.', category: 'Foundation', year: 0, semester: 1, prerequisites: [], unlocks: ['MATH225', 'MATH210', 'EENG250'] },
    { id: 'PHYS160', code: 'PHYS160', title: 'Physics I', credits: 3, description: 'Classical mechanics including kinematics, dynamics, energy, momentum, and rotational motion.', category: 'Foundation', year: 0, semester: 1, prerequisites: [], unlocks: ['PHYS220', 'EENG250'] },
    { id: 'PHYS161', code: 'PHYS161', title: 'Physics II', credits: 3, description: 'Electricity and magnetism, electric fields, circuits, electromagnetic waves, and optics.', category: 'Foundation', year: 0, semester: 2, prerequisites: [], unlocks: ['PHYS220', 'EENG250'] },
    { id: 'ENGL051', code: 'ENGL051', title: 'English Foundation', credits: 3, description: 'Foundational English language skills including reading comprehension, grammar, and basic writing.', category: 'Foundation', year: 0, semester: 1, prerequisites: [], unlocks: ['MATH225', 'EENG250'] },
    { id: 'ENGL101', code: 'ENGL101', title: 'English Composition I', credits: 3, description: 'Development of writing skills with emphasis on essay structure, argumentation, and research methods.', category: 'Foundation', year: 0, semester: 1, prerequisites: [], unlocks: ['PHYS220', 'CSCI250L', 'CSCI250'] },
    { id: 'ENGL151', code: 'ENGL151', title: 'English Composition II', credits: 3, description: 'Advanced writing skills covering critical analysis, literary interpretation, and academic discourse.', category: 'Foundation', year: 0, semester: 2, prerequisites: [], unlocks: ['ENGL201'] },
    { id: 'CHEM160', code: 'CHEM160', title: 'General Chemistry', credits: 3, description: 'Fundamentals of chemistry including atomic structure, bonding, stoichiometry, and thermodynamics.', category: 'Foundation', year: 0, semester: 2, prerequisites: [], unlocks: ['ENGG200'] },

    // Year 1 - Fall Semester
    { id: 'MATH225', code: 'MATH225', title: 'Linear Algebra with Applications', credits: 3, description: 'Vectors, matrices, determinants, eigenvalues, linear transformations, and applications to engineering problems. Corequisites: None.', category: 'Mathematics', year: 1, semester: 1, prerequisites: ['MATH160', 'ENGL051', 'MATH161'], unlocks: ['ENGG300', 'EENG385'] },
    { id: 'PHYS220', code: 'PHYS220', title: 'Physics for Engineers', credits: 3, description: 'Advanced physics topics for engineering students including waves, thermodynamics, and modern physics. Corequisites: MATH210.', category: 'Science', year: 1, semester: 1, prerequisites: ['PHYS161', 'ENGL101', 'PHYS160'], unlocks: [] },
    { id: 'CULT200', code: 'CULT200', title: 'Introduction to Arab-Islamic Civilization', credits: 3, description: 'Survey of Arab-Islamic history, culture, contributions to science and philosophy, and contemporary issues.', category: 'General Education', year: 1, semester: 1, prerequisites: [], unlocks: [] },
    { id: 'MATH210', code: 'MATH210', title: 'Calculus II', credits: 3, description: 'Continuation of calculus covering integration techniques, sequences, series, Taylor polynomials, and parametric equations.', category: 'Mathematics', year: 1, semester: 1, prerequisites: ['MATH161', 'MATH160'], unlocks: ['MATH270', 'MATH220', 'MATH310'] },
    { id: 'ENGG200', code: 'ENGG200', title: 'Introduction to Engineering', credits: 3, description: 'Overview of engineering disciplines, problem-solving methodology, engineering design process, and professional skills.', category: 'Engineering Core', year: 1, semester: 1, prerequisites: ['MATH160', 'CHEM160'], unlocks: ['EENG350'] },
    { id: 'ENGL201', code: 'ENGL201', title: 'Composition and Research Skills', credits: 3, description: 'Development of advanced writing and research skills with emphasis on academic and technical communication.', category: 'General Education', year: 1, semester: 1, prerequisites: ['ENGL151'], unlocks: ['ENGL251', 'ENGG300', 'MATH310'] },

    // Year 1 - Spring Semester
    { id: 'EENG250', code: 'EENG250', title: 'Electric Circuits I', credits: 3, description: 'Analysis of resistive circuits, Kirchhoff\'s laws, Thevenin/Norton theorems, and operational amplifiers. Corequisites: ENGG200, MATH210.', category: 'Electrical Engineering', year: 1, semester: 2, prerequisites: ['PHYS161', 'PHYS160', 'MATH161', 'MATH160', 'ENGL051'], unlocks: ['EENG300', 'EENG301L', 'EENG350L', 'EENG350', 'CENG380'] },
    { id: 'CENG250', code: 'CENG250', title: 'Digital Logic I', credits: 3, description: 'Boolean algebra, combinational logic design, truth tables, Karnaugh maps, and basic sequential circuits. Corequisites: EENG250.', category: 'Computer Engineering', year: 1, semester: 2, prerequisites: [], unlocks: ['CENG335', 'CENG352L', 'CENG380', 'EENG350', 'CENG415', 'CENG400'] },
    { id: 'MATH270', code: 'MATH270', title: 'Ordinary Differential Equations', credits: 3, description: 'First and second order ODEs, Laplace transforms, systems of differential equations, and applications. Corequisites: MATH225.', category: 'Mathematics', year: 1, semester: 2, prerequisites: ['MATH210'], unlocks: ['EENG385'] },
    { id: 'ENGL251', code: 'ENGL251', title: 'Communication Skills', credits: 3, description: 'Oral and written communication skills for professional contexts including presentations, reports, and technical writing.', category: 'General Education', year: 1, semester: 2, prerequisites: ['ENGL201'], unlocks: ['ENGG450'] },
    { id: 'CSCI250L', code: 'CSCI250L', title: 'Introduction to Programming Lab', credits: 1, description: 'Hands-on programming laboratory complementing CSCI250. Practice with coding exercises and small projects. Corequisites: ENGL101, CSCI250.', category: 'Computer Science', year: 1, semester: 2, prerequisites: ['ENGL101'], unlocks: ['CSCI300'] },
    { id: 'MATH220', code: 'MATH220', title: 'Calculus III', credits: 3, description: 'Multivariable calculus including partial derivatives, multiple integrals, vector calculus, and applications.', category: 'Mathematics', year: 1, semester: 2, prerequisites: ['MATH210'], unlocks: ['ENGG300'] },
    { id: 'CSCI250', code: 'CSCI250', title: 'Introduction to Programming', credits: 3, description: 'Introduction to programming using C/C++. Covers variables, control structures, functions, arrays, and basic data structures. Corequisites: ENGL101, CSCI250L.', category: 'Computer Science', year: 1, semester: 2, prerequisites: ['ENGL101'], unlocks: ['CSCI300', 'CENG335', 'CENG380', 'CENG415'] },

    // Year 2 - Fall Semester
    { id: 'CSCI300', code: 'CSCI300', title: 'Intermediate Programming with Objects', credits: 3, description: 'Object-oriented programming concepts including classes, inheritance, polymorphism, and design patterns using Java/C++.', category: 'Computer Science', year: 2, semester: 1, prerequisites: ['CSCI250L', 'CSCI250'], unlocks: ['CENG325', 'CENG375', 'CENG435', 'CENG415', 'CENG420', 'CENG460', 'CENG470'] },
    { id: 'EENG300', code: 'EENG300', title: 'Electric Circuits II', credits: 3, description: 'AC circuit analysis, frequency response, filters, resonance, and two-port networks. Corequisites: EENG301L.', category: 'Electrical Engineering', year: 2, semester: 1, prerequisites: ['EENG250'], unlocks: ['EENG350L', 'EENG385', 'EENG350'] },
    { id: 'ENGG300', code: 'ENGG300', title: 'Engineering Economics', credits: 3, description: 'Time value of money, economic analysis of engineering projects, cost estimation, and financial decision-making. Corequisites: MATH220.', category: 'Engineering Core', year: 2, semester: 1, prerequisites: ['ENGL201', 'MATH225'], unlocks: ['ENGG450'] },
    { id: 'MATH310', code: 'MATH310', title: 'Probability & Statistics for Scientists & Engineers', credits: 3, description: 'Probability theory, random variables, distributions, hypothesis testing, regression analysis, and applications.', category: 'Mathematics', year: 2, semester: 1, prerequisites: ['MATH210', 'ENGL201'], unlocks: ['EENG447'] },
    { id: 'CENG335', code: 'CENG335', title: 'Digital Logic II', credits: 3, description: 'Advanced sequential logic design, finite state machines, VHDL/Verilog, and FPGA implementation.', category: 'Computer Engineering', year: 2, semester: 1, prerequisites: ['CSCI250', 'CENG250'], unlocks: ['CENG380', 'CENG400'] },
    { id: 'CENG325', code: 'CENG325', title: 'Software Applications and Design', credits: 3, description: 'Software design principles, UML modeling, design patterns, and software development lifecycle. Corequisites: CSCI300.', category: 'Computer Engineering', year: 2, semester: 1, prerequisites: ['CSCI300'], unlocks: ['CENG375', 'CENG430L', 'CENG435', 'CENG415', 'CENG420', 'CENG470'] },
    { id: 'EENG301L', code: 'EENG301L', title: 'Electric Circuits Lab', credits: 1, description: 'Laboratory experiments in electric circuit analysis, measurements, and instrumentation. Corequisites: EENG300.', category: 'Electrical Engineering', year: 2, semester: 1, prerequisites: ['EENG250'], unlocks: ['EENG350L', 'CENG352L'] },

    // Year 2 - Spring Semester
    { id: 'ARAB200', code: 'ARAB200', title: 'Arabic Language and Literature', credits: 3, description: 'Study of Arabic language, grammar, composition, and selected works from classical and modern Arabic literature.', category: 'General Education', year: 2, semester: 2, prerequisites: [], unlocks: [] },
    { id: 'EENG350L', code: 'EENG350L', title: 'Electronic Circuits I Lab', credits: 1, description: 'Laboratory experiments in electronic circuit design, transistor circuits, and amplifier measurements. Corequisites: EENG350.', category: 'Electrical Engineering', year: 2, semester: 2, prerequisites: ['EENG300', 'EENG250', 'EENG301L'], unlocks: [] },
    { id: 'CENG352L', code: 'CENG352L', title: 'Digital Logic Circuits Lab', credits: 1, description: 'Hands-on digital logic design laboratory with breadboard prototyping and FPGA implementation.', category: 'Computer Engineering', year: 2, semester: 2, prerequisites: ['CENG250', 'EENG301L'], unlocks: ['CENG380'] },
    { id: 'CENG380', code: 'CENG380', title: 'Microprocessors and Microcontrollers', credits: 3, description: 'Microprocessor architecture, assembly language programming, embedded systems, and interfacing with peripherals. Corequisites: CENG352L.', category: 'Computer Engineering', year: 2, semester: 2, prerequisites: ['CENG250', 'CENG335', 'EENG250', 'CSCI250'], unlocks: ['CENG430L', 'CENG400L', 'CENG400', 'CENG495', 'CENG460'] },
    { id: 'EENG385', code: 'EENG385', title: 'Signals and Systems', credits: 3, description: 'Continuous and discrete-time signals, Fourier analysis, Laplace and Z-transforms, and system theory. Corequisites: MATH310, MATH270.', category: 'Electrical Engineering', year: 2, semester: 2, prerequisites: ['MATH225', 'EENG300'], unlocks: ['EENG447'] },
    { id: 'CENG375', code: 'CENG375', title: 'Introduction to Database Systems', credits: 3, description: 'Relational databases, SQL, normalization, ER modeling, query optimization, and database application development.', category: 'Computer Engineering', year: 2, semester: 2, prerequisites: ['CENG325', 'CSCI300'], unlocks: ['CENG435', 'CENG420', 'CENG495'] },
    { id: 'EENG350', code: 'EENG350', title: 'Electronic Circuits I', credits: 3, description: 'Semiconductor physics, diodes, BJTs, MOSFETs, and basic amplifier design and analysis. Corequisites: EENG350L.', category: 'Electrical Engineering', year: 2, semester: 2, prerequisites: ['ENGG200', 'CENG250', 'EENG300', 'EENG250'], unlocks: ['CENG495'] },

    // Year 3 - Fall Semester
    { id: 'CENG430L', code: 'CENG430L', title: 'Linux Lab', credits: 1, description: 'Hands-on Linux system administration, shell scripting, process management, and development tools.', category: 'Computer Engineering', year: 3, semester: 1, prerequisites: ['CENG380', 'CENG325'], unlocks: ['CENG450L'] },
    { id: 'EENG447', code: 'EENG447', title: 'Analog Communication Systems', credits: 3, description: 'Amplitude and frequency modulation, noise analysis, superheterodyne receivers, and analog communication theory.', category: 'Electrical Engineering', year: 3, semester: 1, prerequisites: ['MATH310', 'EENG385'], unlocks: ['CENG495', 'EENG467L'] },
    { id: 'CENG435', code: 'CENG435', title: 'Mobile Application Development', credits: 3, description: 'Design and development of mobile applications for iOS and Android platforms using modern frameworks and tools.', category: 'Computer Engineering', year: 3, semester: 1, prerequisites: ['CENG325', 'CSCI300', 'CENG375'], unlocks: ['CENG495'] },
    { id: 'CENG415', code: 'CENG415', title: 'Communication Networks', credits: 3, description: 'Network protocols, TCP/IP stack, routing algorithms, wireless networks, and network security fundamentals.', category: 'Computer Engineering', year: 3, semester: 1, prerequisites: ['CENG250', 'CENG325', 'CSCI250', 'CSCI300'], unlocks: ['CENG455L', 'CENG495'] },
    { id: 'CENG400L', code: 'CENG400L', title: 'Microcontroller Applications Lab', credits: 1, description: 'Hands-on microcontroller programming, sensor interfacing, actuator control, and embedded project development.', category: 'Computer Engineering', year: 3, semester: 1, prerequisites: ['CENG380'], unlocks: [] },
    { id: 'CENG420', code: 'CENG420', title: 'Web Programming and Technologies', credits: 3, description: 'Full-stack web development including HTML/CSS/JavaScript, server-side programming, REST APIs, and databases.', category: 'Computer Engineering', year: 3, semester: 1, prerequisites: ['CENG325', 'CSCI300', 'CENG375'], unlocks: ['CENG495'] },
    { id: 'CENG400', code: 'CENG400', title: 'Computer Organization and Design', credits: 3, description: 'CPU architecture, instruction set design, pipelining, memory hierarchy, I/O systems, and performance optimization.', category: 'Computer Engineering', year: 3, semester: 1, prerequisites: ['CENG335', 'CENG250', 'CENG380'], unlocks: [] },

    // Year 3 - Spring Semester
    { id: 'CENG450L', code: 'CENG450L', title: 'Scripting Languages Lab', credits: 1, description: 'Practical scripting with Python, Bash, and automation tools for system administration and data processing.', category: 'Computer Engineering', year: 3, semester: 2, prerequisites: ['CENG430L'], unlocks: [] },
    { id: 'CENG455L', code: 'CENG455L', title: 'Communication Networks Lab', credits: 1, description: 'Network configuration, packet analysis with Wireshark, routing setup, and network troubleshooting exercises.', category: 'Computer Engineering', year: 3, semester: 2, prerequisites: ['CENG415'], unlocks: [] },
    { id: 'CENG495', code: 'CENG495', title: 'Senior Project', credits: 3, description: 'Capstone design project integrating computer engineering knowledge. Proposal, design, implementation, testing, and presentation.', category: 'Capstone', year: 3, semester: 2, prerequisites: ['CENG420', 'EENG350', 'EENG447', 'CENG435', 'CENG415', 'CENG380', 'CENG375'], unlocks: ['ENGG450'] },
    { id: 'EENG467L', code: 'EENG467L', title: 'Analog Communication Systems Lab', credits: 1, description: 'Laboratory experiments in AM/FM modulation, demodulation, noise measurement, and communication system testing.', category: 'Electrical Engineering', year: 3, semester: 2, prerequisites: ['EENG447'], unlocks: [] },
    { id: 'ENGG450', code: 'ENGG450', title: 'Engineering Ethics and Professional Practice', credits: 3, description: 'Professional ethics, engineering codes of conduct, intellectual property, project management, and leadership. Corequisites: CENG495, ENGG300.', category: 'Engineering Core', year: 3, semester: 2, prerequisites: ['ENGL251'], unlocks: [] },

    // Major Elective Courses
    { id: 'CENG460', code: 'CENG460', title: 'Operating Systems', credits: 3, description: 'Process management, memory management, file systems, concurrency, scheduling, and distributed systems concepts.', category: 'Elective', year: 3, semester: 1, prerequisites: ['CENG380', 'CSCI300'], unlocks: [] },
    { id: 'CENG470', code: 'CENG470', title: 'Data Structures and Analysis of Algorithms', credits: 3, description: 'Advanced data structures including trees, graphs, hash tables, and algorithm analysis including sorting, searching, and complexity.', category: 'Elective', year: 3, semester: 1, prerequisites: ['CENG325', 'CSCI300'], unlocks: [] },
];

export interface OfflineOffering {
    id: string;
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

export const offlineOfferings: OfflineOffering[] = [
    // Foundation courses
    { id: 'off-1', courseId: 'MATH160', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Ahmad Khalil', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'SCI 101' },
    { id: 'off-2', courseId: 'MATH160', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Ahmad Khalil', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'SCI 101' },
    { id: 'off-3', courseId: 'MATH161', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Layla Hassan', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'SCI 102' },
    { id: 'off-4', courseId: 'MATH161', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Layla Hassan', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'SCI 102' },
    { id: 'off-5', courseId: 'PHYS160', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Omar Farooq', dayOfWeek: 'TTh', startTime: '08:00', endTime: '09:30', room: 'SCI 201' },
    { id: 'off-6', courseId: 'PHYS161', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Omar Farooq', dayOfWeek: 'TTh', startTime: '08:00', endTime: '09:30', room: 'SCI 201' },
    { id: 'off-7', courseId: 'ENGL051', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Prof. Sarah Mitchell', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'HUM 110' },
    { id: 'off-8', courseId: 'ENGL101', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Prof. James Roberts', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'HUM 112' },
    { id: 'off-9', courseId: 'ENGL101', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Prof. James Roberts', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'HUM 112' },
    { id: 'off-10', courseId: 'ENGL151', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Prof. Sarah Mitchell', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'HUM 110' },
    { id: 'off-11', courseId: 'CHEM160', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Nadia El-Amin', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'SCI 301' },
    { id: 'off-12', courseId: 'CHEM160', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Nadia El-Amin', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'SCI 301' },

    // Year 1 Fall
    { id: 'off-13', courseId: 'MATH225', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Youssef Mansour', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'ENG 201' },
    { id: 'off-14', courseId: 'PHYS220', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Rania Abdelrahman', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'SCI 205' },
    { id: 'off-15', courseId: 'CULT200', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Fatima Al-Zahrani', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'HUM 201' },
    { id: 'off-16', courseId: 'CULT200', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Fatima Al-Zahrani', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'HUM 201' },
    { id: 'off-17', courseId: 'MATH210', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Layla Hassan', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'ENG 202' },
    { id: 'off-18', courseId: 'ENGG200', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Khalid Nasser', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ENG 100' },
    { id: 'off-19', courseId: 'ENGL201', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Prof. David Anderson', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'HUM 115' },

    // Year 1 Spring
    { id: 'off-20', courseId: 'EENG250', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Hassan Ibrahim', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'ENG 301' },
    { id: 'off-21', courseId: 'CENG250', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 305' },
    { id: 'off-22', courseId: 'MATH270', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Youssef Mansour', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'ENG 201' },
    { id: 'off-23', courseId: 'ENGL251', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Prof. David Anderson', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'HUM 115' },
    { id: 'off-24', courseId: 'CSCI250L', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Amira Saleh', dayOfWeek: 'W', startTime: '14:00', endTime: '16:00', room: 'LAB 101' },
    { id: 'off-25', courseId: 'MATH220', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Layla Hassan', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ENG 202' },
    { id: 'off-26', courseId: 'CSCI250', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Amira Saleh', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 310' },

    // Year 2 Fall
    { id: 'off-27', courseId: 'CSCI300', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Amira Saleh', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 310' },
    { id: 'off-28', courseId: 'EENG300', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Hassan Ibrahim', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 301' },
    { id: 'off-29', courseId: 'ENGG300', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Mona Al-Qasim', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'ENG 100' },
    { id: 'off-30', courseId: 'MATH310', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Youssef Mansour', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ENG 201' },
    { id: 'off-31', courseId: 'CENG335', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ENG 305' },
    { id: 'off-32', courseId: 'CENG325', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Zainab Othman', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 315' },
    { id: 'off-33', courseId: 'EENG301L', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Hassan Ibrahim', dayOfWeek: 'Th', startTime: '15:30', endTime: '17:30', room: 'LAB 201' },

    // Year 2 Spring
    { id: 'off-34', courseId: 'ARAB200', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Samir Haddad', dayOfWeek: 'TTh', startTime: '08:00', endTime: '09:30', room: 'HUM 205' },
    { id: 'off-35', courseId: 'EENG350L', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Walid Khoury', dayOfWeek: 'W', startTime: '14:00', endTime: '16:00', room: 'LAB 202' },
    { id: 'off-36', courseId: 'CENG352L', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'M', startTime: '14:00', endTime: '16:00', room: 'LAB 301' },
    { id: 'off-37', courseId: 'CENG380', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 320' },
    { id: 'off-38', courseId: 'EENG385', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Hassan Ibrahim', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'ENG 301' },
    { id: 'off-39', courseId: 'CENG375', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Zainab Othman', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'ENG 315' },
    { id: 'off-40', courseId: 'EENG350', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Walid Khoury', dayOfWeek: 'TTh', startTime: '13:00', endTime: '14:30', room: 'ENG 302' },

    // Year 3 Fall
    { id: 'off-41', courseId: 'CENG430L', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'T', startTime: '14:00', endTime: '16:00', room: 'LAB 302' },
    { id: 'off-42', courseId: 'EENG447', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Karim Azzam', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'ENG 401' },
    { id: 'off-43', courseId: 'CENG435', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Zainab Othman', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 315' },
    { id: 'off-44', courseId: 'CENG415', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Hana Barakat', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'ENG 410' },
    { id: 'off-45', courseId: 'CENG400L', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'Th', startTime: '14:00', endTime: '16:00', room: 'LAB 302' },
    { id: 'off-46', courseId: 'CENG420', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Amira Saleh', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ENG 310' },
    { id: 'off-47', courseId: 'CENG400', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ENG 305' },
    { id: 'off-48', courseId: 'CENG460', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'MWF', startTime: '14:00', endTime: '15:00', room: 'ENG 320' },
    { id: 'off-49', courseId: 'CENG470', section: 'A', semester: 'Fall', campus: 'Main', instructor: 'Dr. Amira Saleh', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 310' },

    // Year 3 Spring
    { id: 'off-50', courseId: 'CENG450L', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'M', startTime: '14:00', endTime: '16:00', room: 'LAB 302' },
    { id: 'off-51', courseId: 'CENG455L', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Hana Barakat', dayOfWeek: 'W', startTime: '14:00', endTime: '16:00', room: 'LAB 303' },
    { id: 'off-52', courseId: 'CENG495', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Khalid Nasser', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 500' },
    { id: 'off-53', courseId: 'EENG467L', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Karim Azzam', dayOfWeek: 'T', startTime: '14:00', endTime: '16:00', room: 'LAB 201' },
    { id: 'off-54', courseId: 'ENGG450', section: 'A', semester: 'Spring', campus: 'Main', instructor: 'Dr. Mona Al-Qasim', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'ENG 100' },

    // Section B offerings for popular courses
    { id: 'off-55', courseId: 'MATH160', section: 'B', semester: 'Fall', campus: 'Main', instructor: 'Dr. Layla Hassan', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'SCI 105' },
    { id: 'off-56', courseId: 'MATH161', section: 'B', semester: 'Fall', campus: 'Main', instructor: 'Dr. Ahmad Khalil', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'SCI 103' },
    { id: 'off-57', courseId: 'MATH225', section: 'B', semester: 'Fall', campus: 'Main', instructor: 'Dr. Ahmad Khalil', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ENG 203' },
    { id: 'off-58', courseId: 'MATH210', section: 'B', semester: 'Fall', campus: 'Main', instructor: 'Dr. Youssef Mansour', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 204' },
    { id: 'off-59', courseId: 'EENG250', section: 'B', semester: 'Spring', campus: 'Main', instructor: 'Dr. Walid Khoury', dayOfWeek: 'TTh', startTime: '13:00', endTime: '14:30', room: 'ENG 303' },
    { id: 'off-60', courseId: 'CSCI250', section: 'B', semester: 'Spring', campus: 'Main', instructor: 'Dr. Zainab Othman', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 312' },
    { id: 'off-61', courseId: 'CSCI300', section: 'B', semester: 'Fall', campus: 'Main', instructor: 'Dr. Zainab Othman', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ENG 312' },
    { id: 'off-62', courseId: 'CENG380', section: 'B', semester: 'Spring', campus: 'Main', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 322' },
    { id: 'off-63', courseId: 'CENG415', section: 'B', semester: 'Fall', campus: 'Main', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'TTh', startTime: '13:00', endTime: '14:30', room: 'ENG 412' },
    { id: 'off-64', courseId: 'CENG420', section: 'B', semester: 'Fall', campus: 'Main', instructor: 'Dr. Zainab Othman', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 315' },
];
