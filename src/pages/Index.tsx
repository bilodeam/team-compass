import { EmployeeSidebar } from '@/components/EmployeeSidebar';
import { EmployeeProfile } from '@/components/EmployeeProfile';
import { StoreProvider } from '@/store/useStore';

const Index = () => {
  return (
    <StoreProvider>
      <div className="flex min-h-screen w-full bg-background">
        <EmployeeSidebar />
        <EmployeeProfile />
      </div>
    </StoreProvider>
  );
};

export default Index;
