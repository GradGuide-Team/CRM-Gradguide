import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { GraduationCap, BarChart3, Users, Filter, FileBarChart, LogOut } from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { logout, user } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'funnel', label: 'Funnel View', icon: Filter },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 shadow-elegant z-30 border-r border-white/10">
      <div className="flex items-center px-6 py-6 border-b border-white/10">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">GradGuide CRM</h2>
          <p className="text-xs text-blue-200">Application Team</p>
        </div>
      </div>
      
      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id || (item.id === 'students' && activeSection === 'student-detail');

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:from-blue-600 hover:to-purple-700"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="px-3 py-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {user?.email || 'Team counselor'}
                </p>
                <p className="text-xs text-blue-200">Application Team</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-blue-100 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
