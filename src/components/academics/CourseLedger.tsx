import { useState, useMemo } from 'react';
import { Plus, Search, ArrowUpDown, Trash2, X, Filter, GraduationCap } from 'lucide-react';
import { useCourses } from '../../context/AcademicContext';
import type { Course } from '../../types';


interface CourseFormData {
  name: string;
  credits: string;
  percentage: string;
  gpa: string;
  semester: string;
}

const SEMESTERS = ['Fall 2024', 'Spring 2025', 'Fall 2025', 'Spring 2026'];

export default function CourseLedger() {
  const { courses, addCourse, deleteCourse } = useCourses();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [sortField, setSortField] = useState<keyof Course>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [form, setForm] = useState<CourseFormData>({
    name: '',
    credits: '',
    percentage: '',
    gpa: '',
    semester: SEMESTERS[0],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({});

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }

    if (semesterFilter !== 'All') {
      result = result.filter(c => c.semester === semesterFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [courses, searchQuery, semesterFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Course) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CourseFormData, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Course name is required';
    if (!form.credits || Number(form.credits) <= 0) newErrors.credits = 'Valid credits required';
    if (!form.percentage || Number(form.percentage) < 0 || Number(form.percentage) > 100) {
      newErrors.percentage = 'Percentage must be 0-100';
    }
    if (!form.gpa || Number(form.gpa) < 0 || Number(form.gpa) > 4) {
      newErrors.gpa = 'GPA must be 0-4.0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    addCourse({
      name: form.name.trim(),
      credits: Number(form.credits),
      percentage: Number(form.percentage),
      gpa: Number(form.gpa),
      semester: form.semester,
    });
    setForm({ name: '', credits: '', percentage: '', gpa: '', semester: SEMESTERS[0] });
    setDrawerOpen(false);
    setErrors({});
  };

  const getGradeColor = (percentage: number): string => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 80) return '#14b8a6';
    if (percentage >= 70) return '#f59e0b';
    if (percentage >= 60) return '#f97316';
    return '#f43f5e';
  };

  const allSemesters = ['All', ...Array.from(new Set(courses.map(c => c.semester)))];

  return (
    <div className="animate-enter animate-enter-delay-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <GraduationCap size={18} className="text-primary-glow" />
          <h2 className="text-lg font-semibold text-text-primary">Course Ledger</h2>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          Add Course
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-tertiary" />
          <select
            value={semesterFilter}
            onChange={e => setSemesterFilter(e.target.value)}
            className="input-field w-40 py-2"
          >
            {allSemesters.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                    Course <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">
                  <button onClick={() => handleSort('semester')} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                    Semester <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="text-center px-4 py-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">
                  <button onClick={() => handleSort('credits')} className="flex items-center gap-1 hover:text-text-primary transition-colors mx-auto">
                    Credits <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="text-center px-4 py-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">
                  <button onClick={() => handleSort('percentage')} className="flex items-center gap-1 hover:text-text-primary transition-colors mx-auto">
                    % <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="text-center px-4 py-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">
                  <button onClick={() => handleSort('gpa')} className="flex items-center gap-1 hover:text-text-primary transition-colors mx-auto">
                    GPA <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="text-right px-4 py-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary text-sm">
                    {courses.length === 0 ? 'No courses logged yet. Add your first course to begin tracking.' : 'No courses match your filters.'}
                  </td>
                </tr>
              ) : (
                filteredCourses.map(course => (
                  <tr key={course.id} className="border-b border-border hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-text-primary">{course.name}</span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{course.semester}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{course.credits}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold" style={{ color: getGradeColor(course.percentage) }}>
                        {course.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold" style={{ color: getGradeColor(course.percentage) }}>
                        {course.gpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="p-1.5 rounded-md hover:bg-rose-500/10 text-text-tertiary hover:text-rose-400 transition-colors"
                        title="Delete course"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative glass-strong rounded-t-2xl sm:rounded-2xl w-full sm:w-[480px] max-h-[90vh] overflow-y-auto animate-enter">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">Add New Course</h3>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-md hover:bg-white/5 text-text-tertiary transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Course Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Advanced Algorithms"
                />
                {errors.name && <span className="text-xs text-rose-400 mt-1 block">{errors.name}</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Credits</label>
                  <input
                    type="number"
                    value={form.credits}
                    onChange={e => setForm(prev => ({ ...prev, credits: e.target.value }))}
                    className="input-field"
                    placeholder="3"
                    min="0"
                    step="0.5"
                  />
                  {errors.credits && <span className="text-xs text-rose-400 mt-1 block">{errors.credits}</span>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Semester</label>
                  <select
                    value={form.semester}
                    onChange={e => setForm(prev => ({ ...prev, semester: e.target.value }))}
                    className="input-field"
                  >
                    {SEMESTERS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Percentage (%)</label>
                  <input
                    type="number"
                    value={form.percentage}
                    onChange={e => setForm(prev => ({ ...prev, percentage: e.target.value }))}
                    className="input-field"
                    placeholder="85"
                    min="0"
                    max="100"
                  />
                  {errors.percentage && <span className="text-xs text-rose-400 mt-1 block">{errors.percentage}</span>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">GPA (4.0)</label>
                  <input
                    type="number"
                    value={form.gpa}
                    onChange={e => setForm(prev => ({ ...prev, gpa: e.target.value }))}
                    className="input-field"
                    placeholder="3.5"
                    min="0"
                    max="4"
                    step="0.01"
                  />
                  {errors.gpa && <span className="text-xs text-rose-400 mt-1 block">{errors.gpa}</span>}
                </div>
              </div>
              <div className="pt-2">
                <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Plus size={16} />
                  Add Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
