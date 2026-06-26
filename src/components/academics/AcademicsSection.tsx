import KPIDashboard from './KPIDashboard';
import CourseLedger from './CourseLedger';

export default function AcademicsSection() {
  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gradient-primary mb-1">Academic Performance</h1>
        <p className="text-sm text-text-secondary">Track your grades, credits, and academic standing in real-time.</p>
      </div>
      <KPIDashboard />
      <CourseLedger />
    </div>
  );
}
