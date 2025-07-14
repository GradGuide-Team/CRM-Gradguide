import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Layout({ children, activeSection, onSectionChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={onSectionChange} />
      <div className="ml-64 flex-1">
        {children}
      </div>
    </div>
  );
}
