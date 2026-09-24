import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { courseService } from '../services/courseService';

export const ExploreCoursesPage = () => {
  const navigate = useNavigate();
  const { isCourseEnrolled, buyCourse } = useLearning();

  const [searchQuery, setSearchQuery] = useState('');
  const [purchaseSuccessToast, setPurchaseSuccessToast] = useState('');

  const allCourses = courseService.getAllCatalogCourses();

  const filteredCourses = useMemo(() => {
    return allCourses.filter(course => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [allCourses, searchQuery]);

  const handleBuyCourse = (course) => {
    buyCourse(course.id);
    setPurchaseSuccessToast(`You are now enrolled in "${course.title}". Welcome to the studio!`);
    setTimeout(() => setPurchaseSuccessToast(''), 4000);
  };

  const handleGoToCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ paddingBottom: 24, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
        <span className="editorial-eyebrow">STUDIO CATALOG</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, marginTop: 6, marginBottom: 8 }}>
          Explore Studio Classes
        </h1>
        <p className="text-secondary" style={{ fontSize: 15, maxWidth: 640 }}>
          Expand your artistic observation and technique with our four core creative disciplines. Classes you have already acquired are marked as Owned.
        </p>
      </div>

      {/* Purchase Notification Banner */}
      {purchaseSuccessToast && (
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
          <span>{purchaseSuccessToast}</span>
        </div>
      )}

      {/* Search Input */}
      <div style={{ position: 'relative', width: 340, maxWidth: '100%', marginBottom: 36 }}>
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          className="studio-form-input"
          style={{ paddingLeft: 38, fontSize: 13, height: 40 }}
          placeholder="Search classes, instructors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Classes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 32, marginBottom: 60 }}>
        {filteredCourses.map((course) => {
          const isOwned = isCourseEnrolled(course.id);
          const formattedNumber = `${course.number || '01'} /`;

          return (
            <div
              key={course.id}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Artwork Thumbnail */}
                <div style={{ height: 180, overflow: 'hidden', borderBottom: '1px solid var(--border)', position: 'relative' }}>
                  <img
                    src={course.image || "/images/painting.jpg"}
                    alt={course.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isOwned && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: '#111111',
                        color: '#FFFFFF',
                        padding: '4px 10px',
                        fontSize: 10,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-xs)'
                      }}
                    >
                      Enrolled
                    </span>
                  )}
                </div>

                <div style={{ padding: '24px 24px 16px 24px' }}>
                  <span className="editorial-eyebrow" style={{ fontSize: 11, marginBottom: 6, display: 'block' }}>
                    {formattedNumber} {course.mode || "ONLINE · OFFLINE"}
                  </span>

                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, marginBottom: 8, color: 'var(--text-main)' }}>
                    {course.title}
                  </h3>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                    {course.description}
                  </p>

                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Instructor: {course.instructor}</span>
                    <span>{course.totalLessons} Lessons</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div style={{ padding: '16px 24px 24px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', display: 'block' }}>
                    {isOwned ? "Access Status" : "Tuition"}
                  </span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-main)', fontWeight: 600 }}>
                    {isOwned ? "Enrolled" : course.priceFormatted}
                  </span>
                </div>

                {isOwned ? (
                  <button
                    onClick={() => handleGoToCourse(course.id)}
                    className="btn btn-secondary"
                    style={{ fontSize: 12, padding: '8px 14px' }}
                  >
                    <span>Step Inside</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuyCourse(course)}
                    className="btn btn-primary"
                    style={{ fontSize: 12, padding: '8px 16px' }}
                  >
                    <span>Enroll Now</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
