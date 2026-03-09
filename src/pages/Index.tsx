import { EmployeeSidebar } from '@/components/EmployeeSidebar';
import { EmployeeProfile } from '@/components/EmployeeProfile';

const Index = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <EmployeeSidebar />
      <EmployeeProfile />
    </div>
  );
};

export default Index;
