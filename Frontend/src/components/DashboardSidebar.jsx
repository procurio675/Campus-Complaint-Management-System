import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const defaultClasses = "w-64 h-screen bg-white shadow-xl border-r flex flex-col fixed";

const DashboardSidebar = ({
  portalLabel = "Portal",
  logoInitials = "CCR",
  logoRoute = "/",
  navItems = [],
  footerContent = null,
  className = "",
  testIds = {},
}) => {
  const navigate = useNavigate();

  const {
    container: containerTestId,
    logoButton: logoButtonTestId,
    logoMark: logoMarkTestId,
    portalLabel: portalLabelTestId,
    nav: navTestId,
  } = testIds;

  return (
    <aside
      className={`${defaultClasses} ${className}`.trim()}
      data-testid={containerTestId}
    >
      <div className="p-6">
        <button
          type="button"
          onClick={() => navigate(logoRoute)}
          className="flex items-center gap-3 mb-8 focus:outline-none group"
          aria-label={`Go to ${portalLabel.toLowerCase()}`}
          data-testid={logoButtonTestId}
        >
          <div
            className="bg-blue-600 h-11 w-11 rounded-full text-white font-black text-lg tracking-tight flex items-center justify-center shadow-md"
            data-testid={logoMarkTestId}
          >
            {logoInitials}
          </div>
          <span
            className="text-gray-500 text-sm font-semibold group-hover:text-gray-700 transition-colors"
            data-testid={portalLabelTestId}
          >
            {portalLabel}
          </span>
        </button>

        <nav className="flex flex-col gap-2" data-testid={navTestId}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact ?? true}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                } ${item.className ?? ""}`.trim()
              }
              data-testid={item.testId}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {footerContent && (
        <div className="mt-auto w-full border-t p-4 text-sm text-gray-500">
          {footerContent}
        </div>
      )}
    </aside>
  );
};

export default DashboardSidebar;
