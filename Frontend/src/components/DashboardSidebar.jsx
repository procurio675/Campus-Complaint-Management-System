import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

// Mobile: Hidden by default, shown when isOpen prop is true
const defaultClasses = "w-64 h-screen bg-white shadow-xl border-r flex flex-col fixed z-30";

const DashboardSidebar = ({
  portalLabel = "Portal",
  logoInitials = "CCR",
  logoRoute = "/",
  navItems = [],
  footerContent = null,
  className = "",
  testIds = {},
  isOpen = false,
  onClose,
}) => {
  const navigate = useNavigate();

  const {
    container: containerTestId,
    logoButton: logoButtonTestId,
    logoMark: logoMarkTestId,
    portalLabel: portalLabelTestId,
    nav: navTestId,
  } = testIds;

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`${defaultClasses} ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } transition-transform duration-300 ease-in-out ${className}`.trim()}
        data-testid={containerTestId}
      >
        <div className="p-4 sm:p-6">
          <button
            type="button"
            onClick={() => navigate(logoRoute)}
            className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 focus:outline-none group touch-manipulation"
            aria-label={`Go to ${portalLabel.toLowerCase()}`}
            data-testid={logoButtonTestId}
          >
            <div
              className="bg-blue-600 h-10 w-10 sm:h-11 sm:w-11 rounded-full text-white font-black text-base sm:text-lg tracking-tight flex items-center justify-center shadow-md"
              data-testid={logoMarkTestId}
            >
              {logoInitials}
            </div>
            <span
              className="text-gray-500 text-xs sm:text-sm font-semibold group-hover:text-gray-700 transition-colors"
              data-testid={portalLabelTestId}
            >
              {portalLabel}
            </span>
          </button>

          <nav className="flex flex-col gap-1.5 sm:gap-2" data-testid={navTestId}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact ?? true}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all touch-manipulation ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
                  } ${item.className ?? ""}`.trim()
                }
                data-testid={item.testId}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="font-medium text-sm sm:text-base">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {footerContent && (
          <div className="mt-auto w-full border-t p-3 sm:p-4 text-xs sm:text-sm text-gray-500">
            {footerContent}
          </div>
        )}
      </aside>
    </>
  );
};

export default DashboardSidebar;
