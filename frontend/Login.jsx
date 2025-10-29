import { useState } from "react";
// We import the icons, but remove the missing 'Button' component
import { Users, Shield, GraduationCap, Building } from "lucide-react";
// We update the import path to be explicit (.jsx)
import { LoginForm } from "./LoginForm.jsx";

export function Login({ onLogin }) {
  const [loginRole, setLoginRole] = useState(null);

  if (loginRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <LoginForm
          role={loginRole}
          onLogin={onLogin}
          onBack={() => setLoginRole(null)}
        />
      </div>
    );
  }

  // Base classes for all buttons
  const buttonBaseClasses = "w-full h-14 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-4 py-2";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              {/* Assuming 'bg-primary' is blue-600 and 'text-primary-foreground' is white */}
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Campus Complaint Resolve
          </h1>
        </div>

        <div className="space-y-3">
          {/* Replaced <Button> with <button> and applied Tailwind classes */}
          <button
            onClick={() => setLoginRole("admin")}
            className={`${buttonBaseClasses} bg-blue-600 text-white hover:bg-blue-700`}
          >
            <Shield className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium text-lg">Login as Admin</div>
            </div>
          </button>

          {/* Replaced <Button> with <button> and applied Tailwind classes for 'outline' variant */}
          <button
            onClick={() => setLoginRole("student")}
            className={`${buttonBaseClasses} bg-blue-600 text-white hover:bg-blue-700`}
          >
            <GraduationCap className="mr-3 h-5 w-5 text-white" />
            <div className="text-left">
              <div className="font-medium text-lg">Login as Student</div>
              
            </div>
          </button>

          {/* Replaced <Button> with <button> and applied Tailwind classes for 'outline' variant */}
          <button
            onClick={() => setLoginRole("committee")}
            className={`${buttonBaseClasses} bg-blue-600 text-white hover:bg-blue-700`}
          >
            <Building className="mr-3 h-5 w-5 text-white" />
            <div className="text-left">
              <div className="font-medium text-lg text-white">Login as Committee</div>
              
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
