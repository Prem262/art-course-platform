// Initial progress benchmark for all students across the 4 art courses
export const initialStudentsProgress = {
  // Student 1 (Default active student)
  "student-001": {
    "course-1": {
      "lesson-1": 100,
      "lesson-2": 100,
      "lesson-3": 60,
      "lesson-4": 0,
      "lesson-5": 0,
      "lesson-6": 0,
      "lesson-7": 0,
      "lesson-8": 0,
      "lesson-9": 0,
      "lesson-10": 0
    },
    "course-2": {
      "lesson-1": 100,
      "lesson-2": 40,
      "lesson-3": 0,
      "lesson-4": 0,
      "lesson-5": 0,
      "lesson-6": 0,
      "lesson-7": 0,
      "lesson-8": 0,
      "lesson-9": 0,
      "lesson-10": 0
    },
    "course-3": {
      "lesson-1": 100,
      "lesson-2": 0,
      "lesson-3": 0,
      "lesson-4": 0,
      "lesson-5": 0,
      "lesson-6": 0,
      "lesson-7": 0,
      "lesson-8": 0,
      "lesson-9": 0,
      "lesson-10": 0
    },
    "course-4": {
      "lesson-1": 0,
      "lesson-2": 0,
      "lesson-3": 0,
      "lesson-4": 0,
      "lesson-5": 0,
      "lesson-6": 0,
      "lesson-7": 0,
      "lesson-8": 0,
      "lesson-9": 0,
      "lesson-10": 0
    }
  },

  // Student 2 (Advanced practitioner)
  "student-002": {
    "course-1": {
      "lesson-1": 100,
      "lesson-2": 100,
      "lesson-3": 100,
      "lesson-4": 100,
      "lesson-5": 100,
      "lesson-6": 100,
      "lesson-7": 100,
      "lesson-8": 100,
      "lesson-9": 75,
      "lesson-10": 0
    },
    "course-2": {
      "lesson-1": 100,
      "lesson-2": 100,
      "lesson-3": 100,
      "lesson-4": 100,
      "lesson-5": 100,
      "lesson-6": 90,
      "lesson-7": 0,
      "lesson-8": 0,
      "lesson-9": 0,
      "lesson-10": 0
    },
    "course-3": {
      "lesson-1": 100,
      "lesson-2": 100,
      "lesson-3": 100,
      "lesson-4": 80,
      "lesson-5": 0,
      "lesson-6": 0,
      "lesson-7": 0,
      "lesson-8": 0,
      "lesson-9": 0,
      "lesson-10": 0
    },
    "course-4": {
      "lesson-1": 0,
      "lesson-2": 0,
      "lesson-3": 0,
      "lesson-4": 0,
      "lesson-5": 0,
      "lesson-6": 0,
      "lesson-7": 0,
      "lesson-8": 0,
      "lesson-9": 0,
      "lesson-10": 0
    }
  },

  // Student 3 (Beginner)
  "student-003": {
    "course-1": {
      "lesson-1": 100,
      "lesson-2": 50,
      "lesson-3": 0,
      "lesson-4": 0,
      "lesson-5": 0,
      "lesson-6": 0,
      "lesson-7": 0,
      "lesson-8": 0,
      "lesson-9": 0,
      "lesson-10": 0
    },
    "course-2": {
      "lesson-1": 25,
      "lesson-2": 0,
      "lesson-3": 0,
      "lesson-4": 0,
      "lesson-5": 0,
      "lesson-6": 0,
      "lesson-7": 0,
      "lesson-8": 0,
      "lesson-9": 0,
      "lesson-10": 0
    },
    "course-3": {
      "lesson-1": 0,
      "lesson-2": 0,
      "lesson-3": 0,
      "lesson-4": 0,
      "lesson-5": 0,
      "lesson-6": 0,
      "lesson-7": 0,
      "lesson-8": 0,
      "lesson-9": 0,
      "lesson-10": 0
    },
    "course-4": {
      "lesson-1": 0,
      "lesson-2": 0,
      "lesson-3": 0,
      "lesson-4": 0,
      "lesson-5": 0,
      "lesson-6": 0,
      "lesson-7": 0,
      "lesson-8": 0,
      "lesson-9": 0,
      "lesson-10": 0
    }
  },

  // Student 4 (Studio Graduate)
  "student-004": {
    "course-1": {
      "lesson-1": 100,
      "lesson-2": 100,
      "lesson-3": 100,
      "lesson-4": 100,
      "lesson-5": 100,
      "lesson-6": 100,
      "lesson-7": 100,
      "lesson-8": 100,
      "lesson-9": 100,
      "lesson-10": 100
    },
    "course-2": {
      "lesson-1": 100,
      "lesson-2": 100,
      "lesson-3": 100,
      "lesson-4": 100,
      "lesson-5": 100,
      "lesson-6": 100,
      "lesson-7": 100,
      "lesson-8": 100,
      "lesson-9": 100,
      "lesson-10": 100
    },
    "course-3": {
      "lesson-1": 100,
      "lesson-2": 100,
      "lesson-3": 100,
      "lesson-4": 100,
      "lesson-5": 100,
      "lesson-6": 100,
      "lesson-7": 100,
      "lesson-8": 100,
      "lesson-9": 100,
      "lesson-10": 100
    },
    "course-4": {
      "lesson-1": 100,
      "lesson-2": 100,
      "lesson-3": 100,
      "lesson-4": 100,
      "lesson-5": 100,
      "lesson-6": 100,
      "lesson-7": 100,
      "lesson-8": 100,
      "lesson-9": 100,
      "lesson-10": 100
    }
  }
};

export const initialProgressData = {
  courseProgress: initialStudentsProgress["student-001"],
  savedTimeSeconds: {
    "course-1": {
      "lesson-3": 820
    },
    "course-2": {
      "lesson-2": 450
    }
  },
  lastWatchedLesson: {
    "course-1": "lesson-3",
    "course-2": "lesson-2"
  },
  recentActivity: [
    {
      id: "act-1",
      type: "completed",
      courseId: "course-1",
      courseTitle: "Painting",
      lessonId: "lesson-2",
      lessonTitle: "Understanding Colour",
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      timeAgoText: "2 hours ago"
    },
    {
      id: "act-2",
      type: "watched",
      courseId: "course-1",
      courseTitle: "Painting",
      lessonId: "lesson-3",
      lessonTitle: "Working with Water",
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
      timeAgoText: "Yesterday"
    },
    {
      id: "act-3",
      type: "completed",
      courseId: "course-3",
      courseTitle: "Zentangle",
      lessonId: "lesson-1",
      lessonTitle: "Introduction to Zentangle",
      timestamp: Date.now() - 48 * 60 * 60 * 1000,
      timeAgoText: "2 days ago"
    },
    {
      id: "act-4",
      type: "completed",
      courseId: "course-2",
      courseTitle: "Botanical Art",
      lessonId: "lesson-1",
      lessonTitle: "Introduction to Botanical Art",
      timestamp: Date.now() - 72 * 60 * 60 * 1000,
      timeAgoText: "3 days ago"
    }
  ]
};
