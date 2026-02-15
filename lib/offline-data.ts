/**
 * Embedded offline course and offering data.
 *
 * This is the fallback dataset used when no server (EXPO_PUBLIC_DOMAIN) is
 * configured. It contains the full Computer Engineering AND Electrical Engineering
 * curriculum with prerequisites, unlocks, corequisites, and section offerings.
 */
import type { CourseWithPrereqs } from '@shared/schema';

// Complete course catalog — grouped by academic year and semester
export const offlineCourses: CourseWithPrereqs[] = [
    // Foundation Courses (Year 0) - Shared
    { id: 'MATH160', code: 'MATH160', title: 'Pre-Calculus', credits: 3, description: 'Foundational mathematics covering algebraic functions, trigonometry, and analytic geometry.', category: 'Foundation', year: 0, semester: 1, major: 'shared', prerequisites: [], unlocks: ['MATH225', 'MATH210', 'ENGG200'], corequisites: [] },
    { id: 'MATH161', code: 'MATH161', title: 'Calculus I', credits: 3, description: 'Introduction to limits, derivatives, and integrals.', category: 'Foundation', year: 0, semester: 1, major: 'shared', prerequisites: [], unlocks: ['MATH225', 'MATH210', 'EENG250'], corequisites: [] },
    { id: 'PHYS160', code: 'PHYS160', title: 'Physics I', credits: 3, description: 'Classical mechanics including kinematics, dynamics, energy.', category: 'Foundation', year: 0, semester: 1, major: 'shared', prerequisites: [], unlocks: ['PHYS220', 'EENG250'], corequisites: [] },
    { id: 'PHYS161', code: 'PHYS161', title: 'Physics II', credits: 3, description: 'Electricity and magnetism, electric fields, circuits.', category: 'Foundation', year: 0, semester: 2, major: 'shared', prerequisites: [], unlocks: ['PHYS220', 'EENG250'], corequisites: [] },
    { id: 'ENGL051', code: 'ENGL051', title: 'English Foundation', credits: 3, description: 'Foundational English language skills.', category: 'Foundation', year: 0, semester: 1, major: 'shared', prerequisites: [], unlocks: ['MATH225', 'EENG250'], corequisites: [] },
    { id: 'ENGL101', code: 'ENGL101', title: 'English Composition I', credits: 3, description: 'Development of writing skills.', category: 'Foundation', year: 0, semester: 1, major: 'shared', prerequisites: [], unlocks: ['PHYS220', 'CSCI250L', 'CSCI250'], corequisites: [] },
    { id: 'ENGL151', code: 'ENGL151', title: 'English Composition II', credits: 3, description: 'Advanced writing skills.', category: 'Foundation', year: 0, semester: 2, major: 'shared', prerequisites: [], unlocks: ['ENGL201'], corequisites: [] },
    { id: 'CHEM160', code: 'CHEM160', title: 'General Chemistry', credits: 3, description: 'Fundamentals of chemistry.', category: 'Foundation', year: 0, semester: 2, major: 'shared', prerequisites: [], unlocks: ['ENGG200'], corequisites: [] },

    // Year 1 - Fall Semester (Shared)
    { id: 'MATH225', code: 'MATH225', title: 'Linear Algebra with Applications', credits: 3, description: 'Vectors, matrices, determinants.', category: 'Mathematics', year: 1, semester: 1, major: 'shared', prerequisites: ['MATH160', 'ENGL051', 'MATH161'], unlocks: ['ENGG300', 'EENG385', 'EENG460'], corequisites: [] },
    { id: 'PHYS220', code: 'PHYS220', title: 'Physics for Engineers', credits: 3, description: 'Advanced physics topics.', category: 'Science', year: 1, semester: 1, major: 'shared', prerequisites: ['PHYS161', 'ENGL101', 'PHYS160'], unlocks: ['EENG388', 'EENG435'], corequisites: ['MATH210'] },
    { id: 'CULT200', code: 'CULT200', title: 'Introduction to Arab-Islamic Civilization', credits: 3, description: 'Survey of Arab-Islamic history.', category: 'General Education', year: 1, semester: 1, major: 'shared', prerequisites: [], unlocks: [], corequisites: [] },
    { id: 'MATH210', code: 'MATH210', title: 'Calculus II', credits: 3, description: 'Continuation of calculus.', category: 'Mathematics', year: 1, semester: 1, major: 'shared', prerequisites: ['MATH161', 'MATH160'], unlocks: ['MATH270', 'MATH220', 'MATH310', 'EENG460'], corequisites: [] },
    { id: 'ENGG200', code: 'ENGG200', title: 'Introduction to Engineering', credits: 3, description: 'Overview of engineering disciplines.', category: 'Engineering Core', year: 1, semester: 1, major: 'shared', prerequisites: ['MATH160', 'CHEM160'], unlocks: ['EENG350'], corequisites: [] },
    { id: 'ENGL201', code: 'ENGL201', title: 'Composition and Research Skills', credits: 3, description: 'Academic and technical communication.', category: 'General Education', year: 1, semester: 1, major: 'shared', prerequisites: ['ENGL151'], unlocks: ['ENGL251', 'ENGG300', 'MATH310'], corequisites: [] },

    // Year 1 - Spring Semester
    { id: 'EENG250', code: 'EENG250', title: 'Electric Circuits I', credits: 3, description: 'Analysis of resistive circuits.', category: 'Electrical Engineering', year: 1, semester: 2, major: 'shared', prerequisites: ['PHYS161', 'PHYS160', 'MATH161', 'MATH160', 'ENGL051'], unlocks: ['EENG300', 'EENG301L', 'EENG350L', 'EENG350', 'CENG380', 'CENG250'], corequisites: ['ENGG200', 'MATH210'] },
    { id: 'MATH270', code: 'MATH270', title: 'Ordinary Differential Equations', credits: 3, description: 'First and second order ODEs.', category: 'Mathematics', year: 1, semester: 2, major: 'shared', prerequisites: ['MATH210'], unlocks: ['EENG385', 'EENG388', 'EENG435'], corequisites: ['MATH225'] },
    { id: 'ENGL251', code: 'ENGL251', title: 'Communication Skills', credits: 3, description: 'Oral and written communication skills.', category: 'General Education', year: 1, semester: 2, major: 'shared', prerequisites: ['ENGL201'], unlocks: ['ENGG450', 'EENG410', 'EENG495'], corequisites: [] },
    { id: 'CSCI250L', code: 'CSCI250L', title: 'Introduction to Programming Lab', credits: 1, description: 'Hands-on programming laboratory.', category: 'Computer Science', year: 1, semester: 2, major: 'shared', prerequisites: ['ENGL101'], unlocks: ['CSCI300'], corequisites: ['CSCI250'] },
    { id: 'MATH220', code: 'MATH220', title: 'Calculus III', credits: 3, description: 'Multivariable calculus.', category: 'Mathematics', year: 1, semester: 2, major: 'shared', prerequisites: ['MATH210'], unlocks: ['ENGG300', 'EENG388'], corequisites: [] },
    { id: 'CSCI250', code: 'CSCI250', title: 'Introduction to Programming', credits: 3, description: 'Introduction to programming using C/C++.', category: 'Computer Science', year: 1, semester: 2, major: 'shared', prerequisites: ['ENGL101'], unlocks: ['CSCI300', 'CENG335', 'CENG380', 'CENG415', 'EENG482'], corequisites: ['CSCI250L'] },

    // CENG Year 1 Spring specific
    { id: 'CENG250', code: 'CENG250', title: 'Digital Logic I', credits: 3, description: 'Boolean algebra, combinational logic design.', category: 'Computer Engineering', year: 1, semester: 2, major: 'shared', prerequisites: [], unlocks: ['CENG335', 'CENG352L', 'CENG380', 'EENG350', 'CENG415', 'CENG400'], corequisites: ['EENG250'] },

    // Year 2 - Fall Semester
    { id: 'CSCI300', code: 'CSCI300', title: 'Intermediate Programming with Objects', credits: 3, description: 'OOP concepts.', category: 'Computer Science', year: 2, semester: 1, major: 'CENG', prerequisites: ['CSCI250L', 'CSCI250'], unlocks: ['CENG325', 'CENG375', 'CENG435', 'CENG415', 'CENG420', 'CENG460', 'CENG470'], corequisites: [] },
    { id: 'EENG300', code: 'EENG300', title: 'Electric Circuits II', credits: 3, description: 'AC circuit analysis.', category: 'Electrical Engineering', year: 2, semester: 1, major: 'shared', prerequisites: ['EENG250'], unlocks: ['EENG350L', 'EENG385', 'EENG350', 'EENG365', 'EENG388', 'EENG440', 'EENG435', 'EENG410', 'EENG460'], corequisites: ['EENG301L'] },
    { id: 'ENGG300', code: 'ENGG300', title: 'Engineering Economics', credits: 3, description: 'Time value of money, economic analysis.', category: 'Engineering Core', year: 2, semester: 1, major: 'shared', prerequisites: ['ENGL201', 'MATH225'], unlocks: ['ENGG450'], corequisites: ['MATH220'] },
    { id: 'MATH310', code: 'MATH310', title: 'Probability & Statistics', credits: 3, description: 'Probability theory, random variables.', category: 'Mathematics', year: 2, semester: 1, major: 'shared', prerequisites: ['MATH210', 'ENGL201'], unlocks: ['EENG447', 'EENG435L', 'EENG435', 'EENG482'], corequisites: [] },
    { id: 'EENG301L', code: 'EENG301L', title: 'Electric Circuits Lab', credits: 1, description: 'Lab experiments in electric circuits.', category: 'Electrical Engineering', year: 2, semester: 1, major: 'shared', prerequisites: ['EENG250'], unlocks: ['EENG350L', 'CENG352L'], corequisites: ['EENG300'] },

    // CENG Year 2 Fall specific
    { id: 'CENG335', code: 'CENG335', title: 'Digital Logic II', credits: 3, description: 'Advanced sequential logic design.', category: 'Computer Engineering', year: 2, semester: 1, major: 'CENG', prerequisites: ['CSCI250', 'CENG250'], unlocks: ['CENG380', 'CENG400'], corequisites: [] },
    { id: 'CENG325', code: 'CENG325', title: 'Software Applications and Design', credits: 3, description: 'Software design principles.', category: 'Computer Engineering', year: 2, semester: 1, major: 'CENG', prerequisites: ['CSCI300'], unlocks: ['CENG375', 'CENG430L', 'CENG435', 'CENG415', 'CENG420', 'CENG470'], corequisites: ['CSCI300'] },

    // EENG Year 1 Fall specific (MENG225 is Year 1 Fall in plan)
    { id: 'MENG225', code: 'MENG225', title: 'Engineering Drawing & CAD', credits: 3, description: 'Fundamentals of engineering graphics.', category: 'Engineering Core', year: 1, semester: 1, major: 'EENG', prerequisites: [], unlocks: [], corequisites: [] },

    // Year 2 - Spring Semester
    { id: 'ARAB200', code: 'ARAB200', title: 'Arabic Language and Literature', credits: 3, description: 'Study of Arabic language.', category: 'General Education', year: 2, semester: 2, major: 'shared', prerequisites: [], unlocks: [], corequisites: [] },
    { id: 'EENG350L', code: 'EENG350L', title: 'Electronic Circuits I Lab', credits: 1, description: 'Lab experiments in electronic circuits.', category: 'Electrical Engineering', year: 2, semester: 2, major: 'shared', prerequisites: ['EENG300', 'EENG250', 'EENG301L'], unlocks: ['EENG410L', 'EENG410'], corequisites: ['EENG350'] },
    { id: 'EENG385', code: 'EENG385', title: 'Signals and Systems', credits: 3, description: 'Continuous and discrete-time signals.', category: 'Electrical Engineering', year: 2, semester: 2, major: 'shared', prerequisites: ['MATH225', 'EENG300'], unlocks: ['EENG447', 'EENG435L', 'EENG435'], corequisites: ['MATH310', 'MATH270'] },
    { id: 'EENG350', code: 'EENG350', title: 'Electronic Circuits I', credits: 3, description: 'Semiconductor physics, diodes, BJTs.', category: 'Electrical Engineering', year: 2, semester: 2, major: 'shared', prerequisites: ['ENGG200', 'CENG250', 'EENG300', 'EENG250'], unlocks: ['CENG495', 'EENG400L', 'EENG400', 'EENG410L', 'EENG410'], corequisites: ['EENG350L'] },

    // CENG Year 2 Spring specific
    { id: 'CENG352L', code: 'CENG352L', title: 'Digital Logic Circuits Lab', credits: 1, description: 'Hands-on digital logic design lab.', category: 'Computer Engineering', year: 2, semester: 2, major: 'CENG', prerequisites: ['CENG250', 'EENG301L'], unlocks: ['CENG380'], corequisites: [] },
    { id: 'CENG380', code: 'CENG380', title: 'Microprocessors and Microcontrollers', credits: 3, description: 'Microprocessor architecture.', category: 'Computer Engineering', year: 2, semester: 2, major: 'shared', prerequisites: ['CENG250', 'CENG335', 'EENG250', 'CSCI250'], unlocks: ['CENG430L', 'CENG400L', 'CENG400', 'CENG495', 'CENG460'], corequisites: ['CENG352L'] },
    { id: 'CENG375', code: 'CENG375', title: 'Introduction to Database Systems', credits: 3, description: 'Relational databases.', category: 'Computer Engineering', year: 2, semester: 2, major: 'CENG', prerequisites: ['CENG325', 'CSCI300'], unlocks: ['CENG435', 'CENG420', 'CENG495'], corequisites: [] },

    // EENG Year 2 Spring specific
    { id: 'EENG365', code: 'EENG365', title: 'Electrical Wiring and Installation', credits: 3, description: 'Residential and industrial wiring.', category: 'Electrical Engineering', year: 2, semester: 2, major: 'EENG', prerequisites: ['EENG300'], unlocks: [], corequisites: [] },
    { id: 'EENG388', code: 'EENG388', title: 'Electromagnetic Fields and Waves', credits: 3, description: 'Vector analysis, electrostatics.', category: 'Electrical Engineering', year: 2, semester: 2, major: 'EENG', prerequisites: ['MATH270', 'PHYS220', 'MATH220', 'EENG300'], unlocks: ['EENG440', 'EENG460'], corequisites: [] },

    // Year 3 - Fall Semester (CENG)
    { id: 'CENG430L', code: 'CENG430L', title: 'Linux Lab', credits: 1, description: 'Hands-on Linux system administration.', category: 'Computer Engineering', year: 3, semester: 1, major: 'CENG', prerequisites: ['CENG380', 'CENG325'], unlocks: ['CENG450L'], corequisites: [] },
    { id: 'EENG447', code: 'EENG447', title: 'Analog Communication Systems', credits: 3, description: 'Amplitude and frequency modulation.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'CENG', prerequisites: ['MATH310', 'EENG385'], unlocks: ['CENG495', 'EENG467L'], corequisites: ['EENG467L'] },
    { id: 'CENG435', code: 'CENG435', title: 'Mobile Application Development', credits: 3, description: 'Design and development of mobile apps.', category: 'Computer Engineering', year: 3, semester: 1, major: 'CENG', prerequisites: ['CENG325', 'CSCI300', 'CENG375'], unlocks: ['CENG495'], corequisites: [] },
    { id: 'CENG415', code: 'CENG415', title: 'Communication Networks', credits: 3, description: 'Network protocols, TCP/IP.', category: 'Computer Engineering', year: 3, semester: 1, major: 'CENG', prerequisites: ['CENG250', 'CENG325', 'CSCI250', 'CSCI300'], unlocks: ['CENG455L', 'CENG495'], corequisites: [] },
    { id: 'CENG400L', code: 'CENG400L', title: 'Microcontroller Applications Lab', credits: 1, description: 'Hands-on microcontroller programming.', category: 'Computer Engineering', year: 3, semester: 1, major: 'shared', prerequisites: ['CENG380'], unlocks: [], corequisites: [] },
    { id: 'CENG420', code: 'CENG420', title: 'Web Programming and Technologies', credits: 3, description: 'Full-stack web development.', category: 'Computer Engineering', year: 3, semester: 1, major: 'CENG', prerequisites: ['CENG325', 'CSCI300', 'CENG375'], unlocks: ['CENG495'], corequisites: [] },
    { id: 'CENG400', code: 'CENG400', title: 'Computer Organization and Design', credits: 3, description: 'CPU architecture.', category: 'Computer Engineering', year: 3, semester: 1, major: 'CENG', prerequisites: ['CENG335', 'CENG250', 'CENG380'], unlocks: [], corequisites: [] },

    // Year 3 - Fall Semester (EENG)
    { id: 'EENG440', code: 'EENG440', title: 'Electric Machines I', credits: 3, description: 'Magnetic circuits, transformers, DC machines.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'EENG', prerequisites: ['EENG300', 'EENG388'], unlocks: ['EENG491', 'EENG495', 'EENG482', 'EENG491L'], corequisites: [] },
    { id: 'EENG435L', code: 'EENG435L', title: 'Control Systems Lab', credits: 1, description: 'Experiments in control system analysis.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'EENG', prerequisites: ['MATH310', 'EENG385'], unlocks: [], corequisites: ['EENG435'] },
    { id: 'EENG435', code: 'EENG435', title: 'Control Systems', credits: 3, description: 'Feedback control systems.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'EENG', prerequisites: ['PHYS220', 'MATH270', 'MATH225', 'MATH310', 'EENG300', 'EENG385'], unlocks: ['EENG495'], corequisites: ['EENG435L'] },
    { id: 'EENG400L', code: 'EENG400L', title: 'Electronic Circuits II Lab', credits: 1, description: 'Advanced electronic circuit design lab.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'EENG', prerequisites: ['EENG350'], unlocks: [], corequisites: ['EENG400'] },
    { id: 'EENG400', code: 'EENG400', title: 'Electronic Circuits II', credits: 3, description: 'Differential amplifiers, feedback, oscillators.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'EENG', prerequisites: ['EENG350'], unlocks: ['EENG495'], corequisites: ['EENG400L'] },
    { id: 'EENG410L', code: 'EENG410L', title: 'Power Electronics I Lab', credits: 1, description: 'Experiments with power electronic converters.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'EENG', prerequisites: ['EENG350L', 'EENG350'], unlocks: [], corequisites: ['EENG410'] },
    { id: 'EENG410', code: 'EENG410', title: 'Power Electronics I', credits: 3, description: 'Power semiconductor devices, converters.', category: 'Electrical Engineering', year: 3, semester: 1, major: 'EENG', prerequisites: ['EENG300', 'ENGL251', 'EENG350L', 'EENG350'], unlocks: ['EENG495'], corequisites: ['EENG410L'] },

    // Year 3 - Spring Semester (CENG)
    { id: 'CENG450L', code: 'CENG450L', title: 'Scripting Languages Lab', credits: 1, description: 'Practical scripting with Python, Bash.', category: 'Computer Engineering', year: 3, semester: 2, major: 'CENG', prerequisites: ['CENG430L'], unlocks: [], corequisites: [] },
    { id: 'CENG455L', code: 'CENG455L', title: 'Communication Networks Lab', credits: 1, description: 'Network configuration.', category: 'Computer Engineering', year: 3, semester: 2, major: 'CENG', prerequisites: ['CENG415'], unlocks: [], corequisites: [] },
    { id: 'CENG495', code: 'CENG495', title: 'Senior Project', credits: 3, description: 'Capstone design project.', category: 'Capstone', year: 3, semester: 2, major: 'CENG', prerequisites: ['CENG420', 'EENG350', 'EENG447', 'CENG435', 'CENG415', 'CENG380', 'CENG375'], unlocks: ['ENGG450'], corequisites: [] },
    { id: 'EENG467L', code: 'EENG467L', title: 'Analog Communication Systems Lab', credits: 1, description: 'Laboratory experiments in AM/FM modulation.', category: 'Electrical Engineering', year: 3, semester: 2, major: 'CENG', prerequisites: ['EENG447'], unlocks: [], corequisites: ['EENG447'] },
    { id: 'ENGG450', code: 'ENGG450', title: 'Engineering Ethics and Professional Practice', credits: 3, description: 'Professional ethics.', category: 'Engineering Core', year: 3, semester: 2, major: 'shared', prerequisites: ['ENGL251'], unlocks: [], corequisites: ['ENGG300', 'CENG495', 'EENG495'] },

    // Year 3 - Spring Semester (EENG)
    { id: 'EENG491', code: 'EENG491', title: 'Electric Machines II', credits: 3, description: 'Synchronous machines.', category: 'Electrical Engineering', year: 3, semester: 2, major: 'EENG', prerequisites: ['EENG440'], unlocks: [], corequisites: ['EENG491L'] },
    { id: 'EENG495', code: 'EENG495', title: 'Senior Project', credits: 3, description: 'Capstone design project in electrical engineering.', category: 'Capstone', year: 3, semester: 2, major: 'EENG', prerequisites: ['ENGL251', 'CENG335', 'EENG440', 'EENG435', 'EENG410', 'CENG380', 'EENG400'], unlocks: ['ENGG450'], corequisites: ['EENG491'] },
    { id: 'EENG460', code: 'EENG460', title: 'Introduction to Power Systems', credits: 3, description: 'Power generation and transmission.', category: 'Electrical Engineering', year: 3, semester: 2, major: 'EENG', prerequisites: ['MATH225', 'MATH210', 'EENG388', 'EENG300'], unlocks: [], corequisites: ['ENGL251'] },
    { id: 'EENG491L', code: 'EENG491L', title: 'Electric Machines II Lab', credits: 1, description: 'Lab experiments with machines.', category: 'Electrical Engineering', year: 3, semester: 2, major: 'EENG', prerequisites: ['EENG440'], unlocks: [], corequisites: ['EENG491'] },

    // Electives
    { id: 'CENG460', code: 'CENG460', title: 'Operating Systems', credits: 3, description: 'Process management, OS concepts.', category: 'Elective', year: 3, semester: 1, major: 'CENG', prerequisites: ['CENG380', 'CSCI300'], unlocks: [], corequisites: [] },
    { id: 'CENG470', code: 'CENG470', title: 'Data Structures and Analysis of Algorithms', credits: 3, description: 'Advanced data structures.', category: 'Elective', year: 3, semester: 1, major: 'CENG', prerequisites: ['CENG325', 'CSCI300'], unlocks: [], corequisites: [] },
    { id: 'EENG482', code: 'EENG482', title: 'Electrical Systems Simulation', credits: 3, description: 'Simulation of electrical systems.', category: 'Elective', year: 3, semester: 2, major: 'EENG', prerequisites: ['CSCI250', 'MATH310', 'EENG440'], unlocks: [], corequisites: ['EENG435', 'EENG491'] },
];

/** Shape of an offering record for offline use (matches server schema) */
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

// Section offerings keyed by course — includes A and B sections for popular courses
export const offlineOfferings: OfflineOffering[] = [
    // Foundation courses
    { id: 'off-1', courseId: 'MATH160', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Ahmad Khalil', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'SCI 101' },
    { id: 'off-2', courseId: 'MATH160', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Ahmad Khalil', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'SCI 101' },
    { id: 'off-3', courseId: 'MATH161', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Layla Hassan', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'SCI 102' },
    { id: 'off-4', courseId: 'MATH161', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Layla Hassan', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'SCI 102' },
    { id: 'off-5', courseId: 'PHYS160', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Omar Farooq', dayOfWeek: 'TTh', startTime: '08:00', endTime: '09:30', room: 'SCI 201' },
    { id: 'off-6', courseId: 'PHYS161', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Omar Farooq', dayOfWeek: 'TTh', startTime: '08:00', endTime: '09:30', room: 'SCI 201' },
    { id: 'off-7', courseId: 'ENGL051', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Prof. Sarah Mitchell', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'HUM 110' },
    { id: 'off-8', courseId: 'ENGL101', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Prof. James Roberts', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'HUM 112' },
    { id: 'off-9', courseId: 'ENGL101', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Prof. James Roberts', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'HUM 112' },
    { id: 'off-10', courseId: 'ENGL151', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Prof. Sarah Mitchell', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'HUM 110' },
    { id: 'off-11', courseId: 'CHEM160', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Nadia El-Amin', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'SCI 301' },
    { id: 'off-12', courseId: 'CHEM160', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Nadia El-Amin', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'SCI 301' },

    // Year 1 Fall
    { id: 'off-13', courseId: 'MATH225', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Youssef Mansour', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'ENG 201' },
    { id: 'off-14', courseId: 'PHYS220', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Rania Abdelrahman', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'SCI 205' },
    { id: 'off-15', courseId: 'CULT200', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Fatima Al-Zahrani', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'HUM 201' },
    { id: 'off-16', courseId: 'CULT200', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Fatima Al-Zahrani', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'HUM 201' },
    { id: 'off-17', courseId: 'MATH210', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Layla Hassan', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'ENG 202' },
    { id: 'off-18', courseId: 'ENGG200', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Khalid Nasser', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ENG 100' },
    { id: 'off-19', courseId: 'ENGL201', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Prof. David Anderson', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'HUM 115' },

    // Year 1 Spring
    { id: 'off-20', courseId: 'EENG250', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Hassan Ibrahim', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'ENG 301' },
    { id: 'off-21', courseId: 'CENG250', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 305' },
    { id: 'off-22', courseId: 'MATH270', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Youssef Mansour', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'ENG 201' },
    { id: 'off-23', courseId: 'ENGL251', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Prof. David Anderson', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'HUM 115' },
    { id: 'off-24', courseId: 'CSCI250L', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Amira Saleh', dayOfWeek: 'W', startTime: '14:00', endTime: '16:00', room: 'LAB 101' },
    { id: 'off-25', courseId: 'MATH220', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Layla Hassan', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ENG 202' },
    { id: 'off-26', courseId: 'CSCI250', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Amira Saleh', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 310' },

    // Year 2 Fall
    { id: 'off-27', courseId: 'CSCI300', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Amira Saleh', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 310' },
    { id: 'off-28', courseId: 'EENG300', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Hassan Ibrahim', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 301' },
    { id: 'off-29', courseId: 'ENGG300', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Mona Al-Qasim', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'ENG 100' },
    { id: 'off-30', courseId: 'MATH310', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Youssef Mansour', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ENG 201' },
    { id: 'off-31', courseId: 'CENG335', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ENG 305' },
    { id: 'off-32', courseId: 'CENG325', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Zainab Othman', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 315' },
    { id: 'off-33', courseId: 'EENG301L', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Hassan Ibrahim', dayOfWeek: 'Th', startTime: '15:30', endTime: '17:30', room: 'LAB 201' },

    // Year 2 Spring
    { id: 'off-34', courseId: 'ARAB200', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Samir Haddad', dayOfWeek: 'TTh', startTime: '08:00', endTime: '09:30', room: 'HUM 205' },
    { id: 'off-35', courseId: 'EENG350L', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Walid Khoury', dayOfWeek: 'W', startTime: '14:00', endTime: '16:00', room: 'LAB 202' },
    { id: 'off-36', courseId: 'CENG352L', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'M', startTime: '14:00', endTime: '16:00', room: 'LAB 301' },
    { id: 'off-37', courseId: 'CENG380', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 320' },
    { id: 'off-38', courseId: 'EENG385', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Hassan Ibrahim', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'ENG 301' },
    { id: 'off-39', courseId: 'CENG375', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Zainab Othman', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'ENG 315' },
    { id: 'off-40', courseId: 'EENG350', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Walid Khoury', dayOfWeek: 'TTh', startTime: '13:00', endTime: '14:30', room: 'ENG 302' },

    // Year 3 Fall
    { id: 'off-41', courseId: 'CENG430L', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'T', startTime: '14:00', endTime: '16:00', room: 'LAB 302' },
    { id: 'off-42', courseId: 'EENG447', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Karim Azzam', dayOfWeek: 'MWF', startTime: '08:00', endTime: '09:00', room: 'ENG 401' },
    { id: 'off-43', courseId: 'CENG435', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Ibrahim Zaher', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 315' },
    { id: 'off-44', courseId: 'CENG415', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Hana Barakat', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'ENG 410' },
    { id: 'off-45', courseId: 'CENG400L', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'Th', startTime: '14:00', endTime: '16:00', room: 'LAB 302' },
    { id: 'off-46', courseId: 'CENG420', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Amira Saleh', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ENG 310' },
    { id: 'off-47', courseId: 'CENG400', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ENG 305' },
    { id: 'off-48', courseId: 'CENG460', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'MWF', startTime: '14:00', endTime: '15:00', room: 'ENG 320' },
    { id: 'off-49', courseId: 'CENG470', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Amira Saleh', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 310' },

    // Year 3 Spring
    { id: 'off-50', courseId: 'CENG450L', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'M', startTime: '14:00', endTime: '16:00', room: 'LAB 302' },
    { id: 'off-51', courseId: 'CENG455L', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Hana Barakat', dayOfWeek: 'W', startTime: '14:00', endTime: '16:00', room: 'LAB 303' },
    { id: 'off-52', courseId: 'CENG495', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Khalid Nasser', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 500' },
    { id: 'off-53', courseId: 'EENG467L', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Karim Azzam', dayOfWeek: 'T', startTime: '14:00', endTime: '16:00', room: 'LAB 201' },
    { id: 'off-54', courseId: 'ENGG450', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Mona Al-Qasim', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'ENG 100' },

    // Section B offerings (Nabatieh)
    { id: 'off-55', courseId: 'MATH160', section: 'B', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Layla Hassan', dayOfWeek: 'TTh', startTime: '10:00', endTime: '11:30', room: 'SCI 105' },
    { id: 'off-56', courseId: 'MATH161', section: 'B', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Ahmad Khalil', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'SCI 103' },
    { id: 'off-57', courseId: 'MATH225', section: 'B', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Ahmad Khalil', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ENG 203' },
    { id: 'off-58', courseId: 'MATH210', section: 'B', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Youssef Mansour', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 204' },
    { id: 'off-59', courseId: 'EENG250', section: 'B', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Walid Khoury', dayOfWeek: 'TTh', startTime: '13:00', endTime: '14:30', room: 'ENG 303' },
    { id: 'off-60', courseId: 'CSCI250', section: 'B', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Zainab Othman', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 312' },
    { id: 'off-61', courseId: 'CSCI300', section: 'B', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Zainab Othman', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ENG 312' },
    { id: 'off-62', courseId: 'CENG380', section: 'B', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Tariq Al-Rashid', dayOfWeek: 'TTh', startTime: '14:00', endTime: '15:30', room: 'ENG 322' },
    { id: 'off-63', courseId: 'CENG415', section: 'B', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Bilal Mahmoud', dayOfWeek: 'TTh', startTime: '13:00', endTime: '14:30', room: 'ENG 412' },
    { id: 'off-64', courseId: 'CENG420', section: 'B', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Zainab Othman', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 315' },

    // EENG Specific Offerings (Nabatieh)
    { id: 'off-e1', courseId: 'MENG225', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Engineering', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 105' },
    { id: 'off-e2', courseId: 'EENG365', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Volt', dayOfWeek: 'TTh', startTime: '11:00', endTime: '12:30', room: 'ENG 305' },
    { id: 'off-e3', courseId: 'EENG388', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Waves', dayOfWeek: 'MWF', startTime: '13:00', endTime: '14:00', room: 'ENG 306' },
    { id: 'off-e4', courseId: 'EENG440', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Power', dayOfWeek: 'MWF', startTime: '10:00', endTime: '11:00', room: 'ENG 405' },
    { id: 'off-e5', courseId: 'EENG435', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Control', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 406' },
    { id: 'off-e6', courseId: 'EENG400', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Circuit', dayOfWeek: 'MWF', startTime: '14:00', endTime: '15:00', room: 'ENG 407' },
    { id: 'off-e7', courseId: 'EENG410', section: 'A', semester: 'Fall', campus: 'Nabatieh', instructor: 'Dr. Energy', dayOfWeek: 'TTh', startTime: '13:00', endTime: '14:30', room: 'ENG 408' },
    { id: 'off-e8', courseId: 'EENG491', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Motor', dayOfWeek: 'MWF', startTime: '09:00', endTime: '10:00', room: 'ENG 410' },
    { id: 'off-e9', courseId: 'EENG495', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Project', dayOfWeek: 'TTh', startTime: '09:00', endTime: '10:30', room: 'ENG 505' },
    { id: 'off-e10', courseId: 'EENG460', section: 'A', semester: 'Spring', campus: 'Nabatieh', instructor: 'Dr. Grid', dayOfWeek: 'MWF', startTime: '11:00', endTime: '12:00', room: 'ENG 412' },
];
