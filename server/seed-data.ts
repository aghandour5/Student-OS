export interface SeedCourse {
  id: string;
  code: string;
  title: string;
  credits: number;
  description: string;
  category: string;
  year: number;
  semester: number;
  major: string; // 'CENG', 'EENG', or 'shared'
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
  // Foundation Courses (Year 0) - Shared
  { id: 'MATH160', code: 'MATH160', title: 'Pre-Calculus', credits: 3, description: 'Foundational mathematics covering algebraic functions, trigonometry, and analytic geometry. Required for entry into calculus and engineering courses.', category: 'Foundation', year: 0, semester: 1, major: 'shared' },
  { id: 'MATH161', code: 'MATH161', title: 'Calculus I', credits: 3, description: 'Introduction to limits, derivatives, and integrals. Covers single-variable calculus with applications in science and engineering.', category: 'Foundation', year: 0, semester: 1, major: 'shared' },
  { id: 'PHYS160', code: 'PHYS160', title: 'Physics I', credits: 3, description: 'Classical mechanics including kinematics, dynamics, energy, momentum, and rotational motion.', category: 'Foundation', year: 0, semester: 1, major: 'shared' },
  { id: 'PHYS161', code: 'PHYS161', title: 'Physics II', credits: 3, description: 'Electricity and magnetism, electric fields, circuits, electromagnetic waves, and optics.', category: 'Foundation', year: 0, semester: 2, major: 'shared' },
  { id: 'ENGL051', code: 'ENGL051', title: 'English Foundation', credits: 3, description: 'Foundational English language skills including reading comprehension, grammar, and basic writing.', category: 'Foundation', year: 0, semester: 1, major: 'shared' },
  { id: 'ENGL101', code: 'ENGL101', title: 'English Composition I', credits: 3, description: 'Development of writing skills with emphasis on essay structure, argumentation, and research methods.', category: 'Foundation', year: 0, semester: 1, major: 'shared' },
  { id: 'ENGL151', code: 'ENGL151', title: 'English Composition II', credits: 3, description: 'Advanced writing skills covering critical analysis, literary interpretation, and academic discourse.', category: 'Foundation', year: 0, semester: 2, major: 'shared' },
  { id: 'CHEM160', code: 'CHEM160', title: 'General Chemistry', credits: 3, description: 'Fundamentals of chemistry including atomic structure, bonding, stoichiometry, and thermodynamics.', category: 'Foundation', year: 0, semester: 2, major: 'shared' },

  // Shared Engineering/Math/GenEd Courses
  { id: 'MATH225', code: 'MATH225', title: 'Linear Algebra with Applications', credits: 3, description: 'Vectors, matrices, determinants, eigenvalues, linear transformations, and applications to engineering problems.', category: 'Mathematics', year: 1, semester: 1, major: 'shared' },
  { id: 'PHYS220', code: 'PHYS220', title: 'Physics for Engineers', credits: 3, description: 'Advanced physics topics for engineering students including waves, thermodynamics, and modern physics. Corequisites: MATH210.', category: 'Science', year: 1, semester: 1, major: 'shared' },
  { id: 'CULT200', code: 'CULT200', title: 'Introduction to Arab-Islamic Civilization', credits: 3, description: 'Survey of Arab-Islamic history, culture, contributions to science and philosophy, and contemporary issues.', category: 'General Education', year: 1, semester: 1, major: 'shared' },
  { id: 'MATH210', code: 'MATH210', title: 'Calculus II', credits: 3, description: 'Continuation of calculus covering integration techniques, sequences, series, Taylor polynomials, and parametric equations.', category: 'Mathematics', year: 1, semester: 1, major: 'shared' },
  { id: 'ENGG200', code: 'ENGG200', title: 'Introduction to Engineering', credits: 3, description: 'Overview of engineering disciplines, problem-solving methodology, engineering design process, and professional skills.', category: 'Engineering Core', year: 1, semester: 1, major: 'shared' },
  { id: 'ENGL201', code: 'ENGL201', title: 'Composition and Research Skills', credits: 3, description: 'Development of advanced writing and research skills with emphasis on academic and technical communication.', category: 'General Education', year: 1, semester: 1, major: 'shared' },
  { id: 'EENG250', code: 'EENG250', title: 'Electric Circuits I', credits: 3, description: 'Analysis of resistive circuits, Kirchhoff\'s laws, Thevenin/Norton theorems, and operational amplifiers. Corequisites: ENGG200, MATH210.', category: 'Electrical Engineering', year: 1, semester: 2, major: 'shared' },
  { id: 'MATH270', code: 'MATH270', title: 'Ordinary Differential Equations', credits: 3, description: 'First and second order ODEs, Laplace transforms, systems of differential equations, and applications. Corequisites: MATH225.', category: 'Mathematics', year: 1, semester: 2, major: 'shared' },
  { id: 'ENGL251', code: 'ENGL251', title: 'Communication Skills', credits: 3, description: 'Oral and written communication skills for professional contexts including presentations, reports, and technical writing.', category: 'General Education', year: 1, semester: 2, major: 'shared' },
  { id: 'CSCI250L', code: 'CSCI250L', title: 'Introduction to Programming Lab', credits: 1, description: 'Hands-on programming laboratory complementing CSCI250. Practice with coding exercises and small projects.', category: 'Computer Science', year: 1, semester: 2, major: 'shared' },
  { id: 'MATH220', code: 'MATH220', title: 'Calculus III', credits: 3, description: 'Multivariable calculus including partial derivatives, multiple integrals, vector calculus, and applications.', category: 'Mathematics', year: 1, semester: 2, major: 'shared' },
  { id: 'CSCI250', code: 'CSCI250', title: 'Introduction to Programming', credits: 3, description: 'Introduction to programming using C/C++. Covers variables, control structures, functions, arrays, and basic data structures.', category: 'Computer Science', year: 1, semester: 2, major: 'shared' },
  { id: 'EENG300', code: 'EENG300', title: 'Electric Circuits II', credits: 3, description: 'AC circuit analysis, frequency response, filters, resonance, and two-port networks. Corequisites: EENG301L.', category: 'Electrical Engineering', year: 2, semester: 1, major: 'shared' },
  { id: 'ENGG300', code: 'ENGG300', title: 'Engineering Economics', credits: 3, description: 'Time value of money, economic analysis of engineering projects, cost estimation, and financial decision-making. Corequisites: MATH220.', category: 'Engineering Core', year: 2, semester: 1, major: 'shared' },
  { id: 'MATH310', code: 'MATH310', title: 'Probability & Statistics for Scientists & Engineers', credits: 3, description: 'Probability theory, random variables, distributions, hypothesis testing, regression analysis, and applications.', category: 'Mathematics', year: 2, semester: 1, major: 'shared' },
  { id: 'EENG301L', code: 'EENG301L', title: 'Electric Circuits Lab', credits: 1, description: 'Laboratory experiments in electric circuit analysis, measurements, and instrumentation. Corequisites: EENG300.', category: 'Electrical Engineering', year: 2, semester: 1, major: 'shared' },
  { id: 'ARAB200', code: 'ARAB200', title: 'Arabic Language and Literature', credits: 3, description: 'Study of Arabic language, grammar, composition, and selected works from classical and modern Arabic literature.', category: 'General Education', year: 2, semester: 2, major: 'shared' },
  { id: 'EENG350L', code: 'EENG350L', title: 'Electronic Circuits I Lab', credits: 1, description: 'Laboratory experiments in electronic circuit design, transistor circuits, and amplifier measurements. Corequisites: EENG350.', category: 'Electrical Engineering', year: 2, semester: 2, major: 'shared' },
  { id: 'EENG385', code: 'EENG385', title: 'Signals and Systems', credits: 3, description: 'Continuous and discrete-time signals, Fourier analysis, Laplace and Z-transforms, and system theory. Corequisites: MATH310, MATH270.', category: 'Electrical Engineering', year: 2, semester: 2, major: 'shared' },
  { id: 'EENG350', code: 'EENG350', title: 'Electronic Circuits I', credits: 3, description: 'Semiconductor physics, diodes, BJTs, MOSFETs, and basic amplifier design and analysis. Corequisites: EENG350L.', category: 'Electrical Engineering', year: 2, semester: 2, major: 'shared' },
  { id: 'ENGG450', code: 'ENGG450', title: 'Engineering Ethics and Professional Practice', credits: 3, description: 'Professional ethics, engineering codes of conduct, intellectual property, project management, and leadership. Corequisites: ENGG300.', category: 'Engineering Core', year: 3, semester: 2, major: 'shared' },

  // Computer Engineering (CENG) Specific
  { id: 'CENG250', code: 'CENG250', title: 'Digital Logic I', credits: 3, description: 'Boolean algebra, combinational logic design, truth tables, Karnaugh maps, and basic sequential circuits. Corequisites: EENG250.', category: 'Computer Engineering', year: 1, semester: 2, major: 'shared' },
  { id: 'CSCI300', code: 'CSCI300', title: 'Intermediate Programming with Objects', credits: 3, description: 'Object-oriented programming concepts including classes, inheritance, polymorphism, and design patterns using Java/C++.', category: 'Computer Science', year: 2, semester: 1, major: 'CENG' },
  { id: 'CENG335', code: 'CENG335', title: 'Digital Logic II', credits: 3, description: 'Advanced sequential logic design, finite state machines, VHDL/Verilog, and FPGA implementation.', category: 'Computer Engineering', year: 2, semester: 1, major: 'shared' },
  { id: 'CENG325', code: 'CENG325', title: 'Software Applications and Design', credits: 3, description: 'Software design principles, UML modeling, design patterns, and software development lifecycle. Corequisites: CSCI300.', category: 'Computer Engineering', year: 2, semester: 1, major: 'CENG' },
  { id: 'CENG352L', code: 'CENG352L', title: 'Digital Logic Circuits Lab', credits: 1, description: 'Hands-on digital logic design laboratory with breadboard prototyping and FPGA implementation.', category: 'Computer Engineering', year: 2, semester: 2, major: 'shared' },
  { id: 'CENG380', code: 'CENG380', title: 'Microprocessors and Microcontrollers', credits: 3, description: 'Microprocessor architecture, assembly language programming, embedded systems, and interfacing with peripherals. Corequisites: CENG352L.', category: 'Computer Engineering', year: 2, semester: 2, major: 'shared' },
  { id: 'CENG375', code: 'CENG375', title: 'Introduction to Database Systems', credits: 3, description: 'Relational databases, SQL, normalization, ER modeling, query optimization, and database application development.', category: 'Computer Engineering', year: 2, semester: 2, major: 'CENG' },
  { id: 'CENG430L', code: 'CENG430L', title: 'Linux Lab', credits: 1, description: 'Hands-on Linux system administration, shell scripting, process management, and development tools.', category: 'Computer Engineering', year: 3, semester: 1, major: 'CENG' },
  { id: 'CENG435', code: 'CENG435', title: 'Mobile Application Development', credits: 3, description: 'Design and development of mobile applications for iOS and Android platforms using modern frameworks and tools.', category: 'Computer Engineering', year: 3, semester: 1, major: 'CENG' },
  { id: 'CENG415', code: 'CENG415', title: 'Communication Networks', credits: 3, description: 'Network protocols, TCP/IP stack, routing algorithms, wireless networks, and network security fundamentals.', category: 'Computer Engineering', year: 3, semester: 1, major: 'CENG' },
  { id: 'CENG400L', code: 'CENG400L', title: 'Microcontroller Applications Lab', credits: 1, description: 'Hands-on microcontroller programming, sensor interfacing, actuator control, and embedded project development.', category: 'Computer Engineering', year: 3, semester: 1, major: 'shared' },
  { id: 'CENG420', code: 'CENG420', title: 'Web Programming and Technologies', credits: 3, description: 'Full-stack web development including HTML/CSS/JavaScript, server-side programming, REST APIs, and databases.', category: 'Computer Engineering', year: 3, semester: 1, major: 'CENG' },
  { id: 'CENG400', code: 'CENG400', title: 'Computer Organization and Design', credits: 3, description: 'CPU architecture, instruction set design, pipelining, memory hierarchy, I/O systems, and performance optimization.', category: 'Computer Engineering', year: 3, semester: 1, major: 'CENG' },
  { id: 'CENG450L', code: 'CENG450L', title: 'Scripting Languages Lab', credits: 1, description: 'Practical scripting with Python, Bash, and automation tools for system administration and data processing.', category: 'Computer Engineering', year: 3, semester: 2, major: 'CENG' },
  { id: 'CENG455L', code: 'CENG455L', title: 'Communication Networks Lab', credits: 1, description: 'Network configuration, packet analysis with Wireshark, routing setup, and network troubleshooting exercises.', category: 'Computer Engineering', year: 3, semester: 2, major: 'CENG' },
  { id: 'CENG495', code: 'CENG495', title: 'Senior Project', credits: 3, description: 'Capstone design project integrating computer engineering knowledge. Proposal, design, implementation, testing, and presentation.', category: 'Capstone', year: 3, semester: 2, major: 'CENG' },
  { id: 'CENG460', code: 'CENG460', title: 'Operating Systems', credits: 3, description: 'Process management, memory management, file systems, concurrency, scheduling, and distributed systems concepts.', category: 'Elective', year: 3, semester: 1, major: 'CENG' },
  { id: 'CENG470', code: 'CENG470', title: 'Data Structures and Analysis of Algorithms', credits: 3, description: 'Advanced data structures including trees, graphs, hash tables, and algorithm analysis including sorting, searching, and complexity.', category: 'Elective', year: 3, semester: 1, major: 'CENG' },

  // Electrical Engineering (EENG) Specific
  { id: 'MENG225', code: 'MENG225', title: 'Engineering Drawing & CAD', credits: 3, description: 'Fundamentals of engineering graphics, orthographic projection, and computer-aided design.', category: 'Engineering Core', year: 1, semester: 1, major: 'EENG' },
  { id: 'EENG365', code: 'EENG365', title: 'Electrical Wiring and Installation', credits: 3, description: 'Residential and industrial wiring, codes, safety, lighting design, and power distribution.', category: 'Electrical Engineering', year: 2, semester: 2, major: 'EENG' },
  { id: 'EENG388', code: 'EENG388', title: 'Electromagnetic Fields and Waves', credits: 3, description: 'Vector analysis, electrostatics, magnetostatics, Maxwell\'s equations, and wave propagation.', category: 'Electrical Engineering', year: 2, semester: 2, major: 'EENG' },

  // Year 3 Fall EENG
  { id: 'EENG440', code: 'EENG440', title: 'Electric Machines I', credits: 3, description: 'Magnetic circuits, transformers, DC machines, and induction motors.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'EENG' },
  { id: 'EENG435L', code: 'EENG435L', title: 'Control Systems Lab', credits: 1, description: 'Experiments in control system analysis and design. Corequisites: EENG435.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'EENG' },
  { id: 'EENG435', code: 'EENG435', title: 'Control Systems', credits: 3, description: 'Feedback control systems, stability analysis, root locus, and frequency response methods.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'EENG' },
  { id: 'EENG400L', code: 'EENG400L', title: 'Electronic Circuits II Lab', credits: 1, description: 'Advanced electronic circuit design and testing. Corequisites: EENG400.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'EENG' },
  { id: 'EENG400', code: 'EENG400', title: 'Electronic Circuits II', credits: 3, description: 'Differential amplifiers, feedback, oscillators, and power amplifiers.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'EENG' },
  { id: 'EENG410L', code: 'EENG410L', title: 'Power Electronics I Lab', credits: 1, description: 'Experiments with power electronic converters and motor drives. Corequisites: EENG410.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'EENG' },
  { id: 'EENG410', code: 'EENG410', title: 'Power Electronics I', credits: 3, description: 'Power semiconductor devices, AC-DC, DC-DC, and DC-AC converters.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'EENG' },

  // Year 3 Spring EENG
  { id: 'EENG491', code: 'EENG491', title: 'Electric Machines II', credits: 3, description: 'Synchronous machines, special motors, and transient analysis.', category: 'Electrical Engineering', year: 3, semester: 2, major: 'EENG' },
  { id: 'EENG495', code: 'EENG495', title: 'Senior Project', credits: 3, description: 'Capstone design project in electrical engineering.', category: 'Capstone', year: 3, semester: 2, major: 'EENG' },
  { id: 'EENG460', code: 'EENG460', title: 'Introduction to Power Systems', credits: 3, description: 'Power generation, transmission, distribution, and load flow analysis.', category: 'Electrical Engineering', year: 3, semester: 2, major: 'EENG' },
  { id: 'EENG491L', code: 'EENG491L', title: 'Electric Machines II Lab', credits: 1, description: 'Laboratory experiments with synchronous machines and special motors.', category: 'Electrical Engineering', year: 3, semester: 2, major: 'EENG' },

  // Elective EENG
  { id: 'EENG482', code: 'EENG482', title: 'Electrical Systems Simulation', credits: 3, description: 'Simulation of electrical and power systems using industry-standard software.', category: 'Elective', year: 3, semester: 2, major: 'EENG' },
];

export const seedPrerequisites: SeedPrerequisite[] = [
  // ... (Previous prereqs) ...
  // Year 1 Fall prerequisites
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

  // Year 1 Spring
  { courseId: 'EENG250', requiresCourseId: 'PHYS161' },
  { courseId: 'EENG250', requiresCourseId: 'PHYS160' },
  { courseId: 'EENG250', requiresCourseId: 'MATH161' },
  { courseId: 'EENG250', requiresCourseId: 'MATH160' },
  { courseId: 'EENG250', requiresCourseId: 'ENGL051' },
  { courseId: 'MATH270', requiresCourseId: 'MATH210' },
  { courseId: 'ENGL251', requiresCourseId: 'ENGL201' },
  { courseId: 'MATH220', requiresCourseId: 'MATH210' },
  { courseId: 'CSCI250', requiresCourseId: 'ENGL101' },
  { courseId: 'CSCI250L', requiresCourseId: 'ENGL101' },

  // Year 2 Fall
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
  { courseId: 'CENG325', requiresCourseId: 'CSCI300' }, // CENG specific

  // Year 2 Spring
  { courseId: 'EENG365', requiresCourseId: 'EENG300' }, // EENG
  { courseId: 'EENG388', requiresCourseId: 'MATH270' }, // EENG
  { courseId: 'EENG388', requiresCourseId: 'PHYS220' }, // EENG
  { courseId: 'EENG388', requiresCourseId: 'MATH220' }, // EENG
  { courseId: 'EENG388', requiresCourseId: 'EENG300' }, // EENG
  { courseId: 'EENG350L', requiresCourseId: 'EENG300' },
  { courseId: 'EENG350L', requiresCourseId: 'EENG250' },
  { courseId: 'EENG350L', requiresCourseId: 'EENG301L' },
  { courseId: 'EENG385', requiresCourseId: 'MATH225' },
  { courseId: 'EENG385', requiresCourseId: 'EENG300' },
  { courseId: 'CENG352L', requiresCourseId: 'CENG250' },
  { courseId: 'CENG352L', requiresCourseId: 'EENG301L' },
  { courseId: 'EENG350', requiresCourseId: 'ENGG200' },
  { courseId: 'EENG350', requiresCourseId: 'CENG250' },
  { courseId: 'EENG350', requiresCourseId: 'EENG300' },
  { courseId: 'EENG350', requiresCourseId: 'EENG250' },
  { courseId: 'CENG380', requiresCourseId: 'CENG250' },
  { courseId: 'CENG380', requiresCourseId: 'CENG335' },
  { courseId: 'CENG380', requiresCourseId: 'EENG250' },
  { courseId: 'CENG380', requiresCourseId: 'CSCI250' },

  // Year 3 Fall EENG
  { courseId: 'EENG440', requiresCourseId: 'EENG300' },
  { courseId: 'EENG440', requiresCourseId: 'EENG388' },
  { courseId: 'CENG400L', requiresCourseId: 'CENG380' },
  { courseId: 'EENG435L', requiresCourseId: 'MATH310' },
  { courseId: 'EENG435L', requiresCourseId: 'EENG385' },
  { courseId: 'EENG435', requiresCourseId: 'PHYS220' },
  { courseId: 'EENG435', requiresCourseId: 'MATH270' },
  { courseId: 'EENG435', requiresCourseId: 'MATH225' },
  { courseId: 'EENG435', requiresCourseId: 'MATH310' },
  { courseId: 'EENG435', requiresCourseId: 'EENG300' },
  { courseId: 'EENG435', requiresCourseId: 'EENG385' },
  { courseId: 'EENG400L', requiresCourseId: 'EENG350' },
  { courseId: 'EENG400', requiresCourseId: 'EENG350' },
  { courseId: 'EENG410L', requiresCourseId: 'EENG350L' },
  { courseId: 'EENG410L', requiresCourseId: 'EENG350' },
  { courseId: 'EENG410', requiresCourseId: 'EENG300' },
  { courseId: 'EENG410', requiresCourseId: 'ENGL251' },
  { courseId: 'EENG410', requiresCourseId: 'EENG350L' },
  { courseId: 'EENG410', requiresCourseId: 'EENG350' },

  // Year 3 Spring EENG
  { courseId: 'EENG491', requiresCourseId: 'EENG440' },
  { courseId: 'EENG495', requiresCourseId: 'ENGL251' },
  { courseId: 'EENG495', requiresCourseId: 'CENG335' },
  { courseId: 'EENG495', requiresCourseId: 'EENG440' },
  { courseId: 'EENG495', requiresCourseId: 'EENG435' },
  { courseId: 'EENG495', requiresCourseId: 'EENG410' },
  { courseId: 'EENG495', requiresCourseId: 'CENG380' },
  { courseId: 'EENG495', requiresCourseId: 'EENG400' },
  { courseId: 'EENG460', requiresCourseId: 'MATH225' },
  { courseId: 'EENG460', requiresCourseId: 'MATH210' },
  { courseId: 'EENG460', requiresCourseId: 'EENG388' },
  { courseId: 'EENG460', requiresCourseId: 'EENG300' },
  { courseId: 'ENGG450', requiresCourseId: 'ENGL251' },
  { courseId: 'EENG491L', requiresCourseId: 'EENG440' },
  { courseId: 'EENG482', requiresCourseId: 'CSCI250' },
  { courseId: 'EENG482', requiresCourseId: 'MATH310' },
  { courseId: 'EENG482', requiresCourseId: 'EENG440' },

  // CENG Specific Prereqs (kept from original)
  { courseId: 'CENG375', requiresCourseId: 'CENG325' },
  { courseId: 'CENG375', requiresCourseId: 'CSCI300' },
  { courseId: 'CENG430L', requiresCourseId: 'CENG380' },
  { courseId: 'CENG430L', requiresCourseId: 'CENG325' },
  { courseId: 'CENG435', requiresCourseId: 'CENG325' },
  { courseId: 'CENG435', requiresCourseId: 'CSCI300' },
  { courseId: 'CENG435', requiresCourseId: 'CENG375' },
  { courseId: 'CENG415', requiresCourseId: 'CENG250' },
  { courseId: 'CENG415', requiresCourseId: 'CENG325' },
  { courseId: 'CENG415', requiresCourseId: 'CSCI250' },
  { courseId: 'CENG415', requiresCourseId: 'CSCI300' },
  { courseId: 'CENG420', requiresCourseId: 'CENG325' },
  { courseId: 'CENG420', requiresCourseId: 'CSCI300' },
  { courseId: 'CENG420', requiresCourseId: 'CENG375' },
  { courseId: 'CENG400', requiresCourseId: 'CENG335' },
  { courseId: 'CENG400', requiresCourseId: 'CENG250' },
  { courseId: 'CENG400', requiresCourseId: 'CENG380' },
  { courseId: 'CENG450L', requiresCourseId: 'CENG430L' },
  { courseId: 'CENG455L', requiresCourseId: 'CENG415' },
  { courseId: 'CENG495', requiresCourseId: 'CENG420' },
  { courseId: 'CENG495', requiresCourseId: 'EENG350' },
  { courseId: 'CENG495', requiresCourseId: 'CENG435' },
  { courseId: 'CENG495', requiresCourseId: 'CENG415' },
  { courseId: 'CENG495', requiresCourseId: 'CENG380' },
  { courseId: 'CENG495', requiresCourseId: 'CENG375' },
  { courseId: 'CENG460', requiresCourseId: 'CENG380' },
  { courseId: 'CENG460', requiresCourseId: 'CSCI300' },
  { courseId: 'CENG470', requiresCourseId: 'CENG325' },
  { courseId: 'CENG470', requiresCourseId: 'CSCI300' },
];

export const seedOfferings: SeedOffering[] = [
  // Offerings for all shared/CENG courses (renaming Main -> Nabatieh)
  { courseId: 'MATH160', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Ahmad Khalil', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'SCI 101' },
  { courseId: 'MATH160', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Ahmad Khalil', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'SCI 101' },
  { courseId: 'MATH161', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Layla Hassan', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'SCI 102' },
  { courseId: 'MATH161', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Layla Hassan', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'SCI 102' },
  { courseId: 'PHYS160', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Omar Farooq', dayOfWeek: 'TTh', startTime: '08:00', endTime: '09:30', room: 'SCI 201' },
  { courseId: 'PHYS161', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Omar Farooq', dayOfWeek: 'TTh', startTime: '08:00', endTime: '09:30', room: 'SCI 201' },
  { courseId: 'ENGL051', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Prof. Sarah Mitchell', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'HUM 110' },
  { courseId: 'ENGL101', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Prof. James Roberts', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'HUM 112' },
  { courseId: 'ENGL101', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Prof. James Roberts', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'HUM 112' },
  { courseId: 'ENGL151', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Prof. Sarah Mitchell', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'HUM 110' },
  { courseId: 'CHEM160', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Nadia El-Amin', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'SCI 301' },
  { courseId: 'CHEM160', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Nadia El-Amin', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'SCI 301' },

  // Offerings for EENG specific
  { courseId: 'MENG225', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Engineering', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 105' },
  { courseId: 'EENG365', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Volt', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ENG 305' },
  { courseId: 'EENG388', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Waves', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ENG 306' },
  { courseId: 'EENG440', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Power', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'ENG 405' },
  { courseId: 'EENG435', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Control', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 406' },
  { courseId: 'EENG400', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Circuit', dayOfWeek: 'MWF', startTime: '14:00', endTime: '15:00', room: 'ENG 407' },
  { courseId: 'EENG410', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Energy', dayOfWeek: 'TTh', startTime: '13:00', endTime: '14:30', room: 'ENG 408' },
  { courseId: 'EENG491', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Motor', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 410' },
  { courseId: 'EENG495', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Project', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 505' },
  { courseId: 'EENG460', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Grid', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'ENG 412' },
];
