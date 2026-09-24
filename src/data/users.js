export const mockAdmin = {
  id: "admin-001",
  name: "Admin",
  email: "admin@demo.com",
  avatar: null,
  initials: "AD",
  role: "admin",
  title: "Platform Administrator",
  enrolledSince: "October 2025"
};

export const mockStudents = [
  {
    id: "student-001",
    name: "Student 1",
    email: "student1@demo.com",
    avatar: null,
    initials: "S1",
    role: "student",
    title: "Enrolled Learner",
    enrolledSince: "January 2026",
    status: "Active"
  },
  {
    id: "student-002",
    name: "Student 2",
    email: "student2@demo.com",
    avatar: null,
    initials: "S2",
    role: "student",
    title: "Enrolled Learner",
    enrolledSince: "November 2025",
    status: "Active"
  },
  {
    id: "student-003",
    name: "Student 3",
    email: "student3@demo.com",
    avatar: null,
    initials: "S3",
    role: "student",
    title: "Enrolled Learner",
    enrolledSince: "February 2026",
    status: "In Progress"
  },
  {
    id: "student-004",
    name: "Student 4",
    email: "student4@demo.com",
    avatar: null,
    initials: "S4",
    role: "student",
    title: "Enrolled Learner",
    enrolledSince: "December 2025",
    status: "Completed"
  }
];

export const allMockUsers = [mockAdmin, ...mockStudents];

// Default student for backwards compatibility
export const mockStudent = mockStudents[0];
