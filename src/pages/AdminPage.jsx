import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  RotateCcw,
  X,
  Edit3,
  UserMinus,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { courseService } from '../services/courseService';
import { UserAvatar } from '../components/common/UserAvatar';

export const AdminPage = () => {
  const { user } = useAuth();
  const {
    adminStudentsList,
    adminPlatformStats,
    adminUpdateLesson,
    adminCompleteCourse,
    adminResetCourse,
    adminResetStudent,
    removeCourseAccess,
    grantCourseAccess
  } = useLearning();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalTab, setModalTab] = useState('access'); // 'access' | 'progress'
  const [successToast, setSuccessToast] = useState('');

  const allCatalogCourses = courseService.getAllCatalogCourses();

  const showToast = (message) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  // Filter students based on search and status
  const filteredStudents = useMemo(() => {
    return adminStudentsList.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.title.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'completed') return student.overallProgress === 100;
      if (statusFilter === 'active') return student.overallProgress > 0 && student.overallProgress < 100;
      return true;
    });
  }, [adminStudentsList, searchQuery, statusFilter]);

  // Admin action: Revoke / Remove Course Access
  const handleRemoveCourseAccess = (courseId) => {
    if (!selectedStudent) return;
    const course = courseService.getCourseById(courseId);
    removeCourseAccess(courseId, selectedStudent.id);
    showToast(`Removed access to "${course?.title || courseId}" for ${selectedStudent.name}.`);
  };

  // Admin action: Grant Course Access
  const handleGrantCourseAccess = (courseId) => {
    if (!selectedStudent) return;
    const course = courseService.getCourseById(courseId);
    grantCourseAccess(courseId, selectedStudent.id);
    showToast(`Granted access to "${course?.title || courseId}" for ${selectedStudent.name}.`);
  };

  // Handle modal action: set complete
  const handleMarkCourseComplete = (courseId) => {
    if (!selectedStudent) return;
    adminCompleteCourse(selectedStudent.id, courseId);
    const course = courseService.getCourseById(courseId);
    showToast(`Marked ${course?.title || 'class'} as completed.`);
  };

  // Handle modal action: reset course
  const handleResetCourse = (courseId) => {
    if (!selectedStudent) return;
    adminResetCourse(selectedStudent.id, courseId);
    const course = courseService.getCourseById(courseId);
    showToast(`Reset progress for ${course?.title || 'class'} to 0%.`);
  };

  // Handle modal action: reset all
  const handleResetAllForStudent = () => {
    if (!selectedStudent) return;
    if (window.confirm(`Reset ALL class progress to 0% for ${selectedStudent.name}?`)) {
      adminResetStudent(selectedStudent.id);
      showToast(`Reset all progress for ${selectedStudent.name}.`);
    }
  };

  // Handle modal action: toggle individual lesson
  const handleToggleLesson = (courseId, lessonId, currentPct) => {
    if (!selectedStudent) return;
    const newPct = currentPct >= 100 ? 0 : 100;
    adminUpdateLesson(selectedStudent.id, courseId, lessonId, newPct);
    showToast(`Updated lesson progress to ${newPct}%.`);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ paddingBottom: 24, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
        <span className="editorial-eyebrow">ADMINISTRATION</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, marginTop: 6, marginBottom: 8 }}>
          Student Practice Manager
        </h1>
        <p className="text-secondary" style={{ fontSize: 15, maxWidth: 640 }}>
          Manage student enrollments, grant or revoke class access, and inspect individual practice progress.
        </p>
      </div>

      {/* Success notification toast */}
      {successToast && (
        <div
          style={{
            backgroundColor: 'var(--success-bg)',
            borderColor: 'var(--success-border)',
            color: 'var(--success)',
            border: '1px solid var(--success-border)',
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderRadius: 'var(--radius-xs)'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* High-level Platform KPIs */}
      <div className="editorial-stats-row" style={{ marginBottom: 40 }}>
        <div className="editorial-stat-item">
          <span className="editorial-stat-num">{adminPlatformStats.totalStudents}</span>
          <span className="editorial-stat-label">Registered Students</span>
        </div>

        <div className="editorial-stat-divider" />

        <div className="editorial-stat-item">
          <span className="editorial-stat-num">{adminPlatformStats.activeStudents}</span>
          <span className="editorial-stat-label">Active Learners</span>
        </div>

        <div className="editorial-stat-divider" />

        <div className="editorial-stat-item">
          <span className="editorial-stat-num">{adminPlatformStats.completedStudents}</span>
          <span className="editorial-stat-label">Completed All</span>
        </div>

        <div className="editorial-stat-divider" />

        <div className="editorial-stat-item">
          <span className="editorial-stat-num">{adminPlatformStats.averageProgress}%</span>
          <span className="editorial-stat-label">Avg. Studio Progress</span>
        </div>
      </div>

      {/* Toolbar: Search & Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div style={{ position: 'relative', width: 300, maxWidth: '100%' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="studio-form-input"
            style={{ paddingLeft: 38, fontSize: 13, height: 38 }}
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setStatusFilter('all')}
            className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            All Students ({adminStudentsList.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`btn ${statusFilter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`btn ${statusFilter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Enrolled Classes</th>
              <th>Lessons Completed</th>
              <th>Overall Progress</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => {
              const currentEnrolled = student.enrolledCoursesCount || 0;

              return (
                <tr key={student.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <UserAvatar name={student.name} initials={student.initials} size="sm" />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{student.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{student.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {currentEnrolled} of {allCatalogCourses.length} classes
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: 13 }}>
                      {student.totalLessonsCompleted} / {student.totalLessonsCurriculum} lessons
                    </span>
                  </td>

                  <td style={{ minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 2, backgroundColor: 'var(--border)' }}>
                        <div
                          style={{
                            width: `${student.overallProgress}%`,
                            height: '100%',
                            backgroundColor: student.overallProgress >= 100 ? 'var(--success)' : 'var(--primary)'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, minWidth: 32 }}>
                        {student.overallProgress}%
                      </span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        student.overallProgress === 100
                          ? 'badge-success'
                          : student.overallProgress > 0
                          ? 'badge-warning'
                          : 'badge-muted'
                      }`}
                    >
                      {student.overallProgress === 100
                        ? 'Completed'
                        : student.overallProgress > 0
                        ? 'In Progress'
                        : 'Unstarted'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setModalTab('access');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '6px 14px', fontSize: 12 }}
                    >
                      <Edit3 size={13} />
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Student Management Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <UserAvatar name={selectedStudent.name} initials={selectedStudent.initials} size="md" />
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 2 }}>
                    {selectedStudent.name}
                  </h3>
                  <span className="text-secondary" style={{ fontSize: 12 }}>
                    {selectedStudent.email} · Enrolled since {selectedStudent.enrolledSince}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="btn btn-ghost"
                style={{ padding: 6 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
              <button
                onClick={() => setModalTab('access')}
                style={{
                  padding: '8px 16px',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontWeight: 600,
                  borderBottom: modalTab === 'access' ? '2px solid var(--primary)' : '2px solid transparent',
                  color: modalTab === 'access' ? 'var(--text-main)' : 'var(--text-secondary)'
                }}
              >
                Class Access ({selectedStudent.enrolledCourseIds?.length || 0})
              </button>

              <button
                onClick={() => setModalTab('progress')}
                style={{
                  padding: '8px 16px',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontWeight: 600,
                  borderBottom: modalTab === 'progress' ? '2px solid var(--primary)' : '2px solid transparent',
                  color: modalTab === 'progress' ? 'var(--text-main)' : 'var(--text-secondary)'
                }}
              >
                Progress Overrides
              </button>
            </div>

            {/* TAB 1: Course Access (Grant / Revoke) */}
            {modalTab === 'access' && (
              <div>
                <p className="text-secondary" style={{ fontSize: 13, marginBottom: 20 }}>
                  Grant or revoke access to studio classes for this student.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {allCatalogCourses.map((course) => {
                    const isEnrolled = (selectedStudent.enrolledCourseIds || []).includes(course.id);

                    return (
                      <div
                        key={course.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 18px',
                          border: '1px solid var(--border)',
                          backgroundColor: isEnrolled ? 'var(--surface)' : 'var(--surface-alt)'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{course.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            {course.totalLessons} Lessons · {course.priceFormatted}
                          </div>
                        </div>

                        {isEnrolled ? (
                          <button
                            onClick={() => handleRemoveCourseAccess(course.id)}
                            className="btn btn-secondary"
                            style={{ color: 'var(--error)', borderColor: 'var(--border)', fontSize: 11, padding: '6px 12px' }}
                          >
                            <UserMinus size={13} />
                            <span>Revoke Access</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGrantCourseAccess(course.id)}
                            className="btn btn-primary"
                            style={{ fontSize: 11, padding: '6px 12px' }}
                          >
                            <UserPlus size={13} />
                            <span>Grant Access</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Progress Controls */}
            {modalTab === 'progress' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span className="text-secondary" style={{ fontSize: 13 }}>
                    Override lesson states or reset progress.
                  </span>
                  <button
                    onClick={handleResetAllForStudent}
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: '6px 12px', color: 'var(--error)' }}
                  >
                    <RotateCcw size={12} />
                    <span>Reset All to 0%</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {selectedStudent.coursesProgress.map((cp) => {
                    const course = courseService.getCourseById(cp.courseId);
                    if (!course) return null;

                    return (
                      <div key={cp.courseId} style={{ border: '1px solid var(--border)', padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{course.title}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>
                              ({cp.progress}%)
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleMarkCourseComplete(course.id)}
                              className="btn btn-secondary"
                              style={{ fontSize: 11, padding: '4px 10px' }}
                            >
                              Set 100%
                            </button>
                            <button
                              onClick={() => handleResetCourse(course.id)}
                              className="btn btn-secondary"
                              style={{ fontSize: 11, padding: '4px 10px' }}
                            >
                              Reset
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                          {course.lessons.map((lesson) => {
                            const studentProgressMap = useLearning().allStudentsProgress?.[selectedStudent.id]?.[course.id] || {};
                            const lessonPct = studentProgressMap[lesson.id] || 0;
                            const isDone = lessonPct >= 100;

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => handleToggleLesson(course.id, lesson.id, lessonPct)}
                                style={{
                                  padding: '6px 10px',
                                  fontSize: 11,
                                  textAlign: 'left',
                                  border: '1px solid var(--border)',
                                  backgroundColor: isDone ? 'var(--surface-alt)' : '#FFFFFF',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  borderRadius: 'var(--radius-xs)'
                                }}
                              >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {lesson.order}. {lesson.title}
                                </span>
                                <span style={{ fontWeight: 600, color: isDone ? 'var(--success)' : 'var(--text-muted)' }}>
                                  {isDone ? '✓' : '○'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
