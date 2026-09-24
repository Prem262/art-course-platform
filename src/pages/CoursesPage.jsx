import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { CourseCard } from '../components/dashboard/CourseCard';

export const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'in-progress' | 'completed'

  const { enrolledCourses, getCourseProgress } = useLearning();

  const filteredCourses = useMemo(() => {
    return (enrolledCourses || []).filter(course => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      const progress = getCourseProgress(course.id);
      if (filterStatus === 'completed') {
        return progress >= 100;
      }
      if (filterStatus === 'in-progress') {
        return progress > 0 && progress < 100;
      }
      return true;
    });
  }, [enrolledCourses, searchTerm, filterStatus, getCourseProgress]);

  return (
    <div>
      {/* Page Header */}
      <div style={{ paddingBottom: 24, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
        <span className="editorial-eyebrow">YOUR PRACTICE</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, marginTop: 6, marginBottom: 8 }}>
          Enrolled Classes
        </h1>
        <p className="text-secondary" style={{ fontSize: 15, maxWidth: 640 }}>
          Your personal studio workspace. Access your active classes, study materials and guided creative practices.
        </p>
      </div>

      {/* Toolbar: Search & Filter Pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div style={{ position: 'relative', width: 320, maxWidth: '100%' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="studio-form-input"
            style={{ paddingLeft: 38, fontSize: 13, height: 40 }}
            placeholder="Search your classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setFilterStatus('all')}
            className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            All Owned ({enrolledCourses?.length || 0})
          </button>
          <button
            onClick={() => setFilterStatus('in-progress')}
            className={`btn ${filterStatus === 'in-progress' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`btn ${filterStatus === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Course Stacked List */}
      {filteredCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 8 }}>
            No enrolled classes match your search
          </h3>
          <p className="text-secondary" style={{ fontSize: 14, marginBottom: 24 }}>
            {searchTerm ? "Try adjusting your search criteria." : "Explore available studio classes to expand your practice."}
          </p>
          <Link to="/explore" className="btn btn-primary">
            <span>Explore Classes to Buy</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="classes-stacked-list">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};
