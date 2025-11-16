import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBell, FaChevronDown, FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

const DashboardNavbar = ({
  title,
  profileName,
  profileInitial,
  onLogout,
  notifications,
  unreadCount,
  loadingNotifications,
  onBellClick,
  onMarkAllRead,
  onNotificationClick,
  onNotificationDelete,
  notificationDropdownOpen,
  notificationDropdownRef,
  notificationButtonRef,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  profileRoute,
  bellBadgeLimit = 9,
  emptyState,
  testIds = {},
}) => {
  const {
    container: containerTestId = "dashboard-header",
    title: titleTestId = "dashboard-title",
    headerControls: headerControlsTestId = "header-controls-container",
    bellButton: bellButtonTestId = "notification-bell-button",
    bellIcon: bellIconTestId = "notification-bell-icon",
    bellBadge: bellBadgeTestId = "notification-badge",
    notificationsWrapper: notificationsWrapperTestId = "notification-dropdown",
    notificationsTitle: notificationsTitleTestId = "notification-dropdown-title",
    markAllReadButton: markAllReadButtonTestId = "mark-all-read-button",
    profileButton: profileButtonTestId = "user-profile-dropdown-button",
    profileAvatar: profileAvatarTestId = "user-avatar",
    profileName: profileNameTestId = "user-name-display",
    profileMenu: profileMenuTestId = "user-dropdown-menu",
    profileLink: profileLinkTestId = "dropdown-profile-link",
    logoutButton: logoutButtonTestId = "dropdown-logout-button",
  } = testIds;

  return (
    <header
      className="bg-white shadow-sm h-20 flex items-center justify-between px-8 border-b"
      data-testid={containerTestId}
    >
      <h1 className="text-xl font-semibold text-gray-800" data-testid={titleTestId}>
        {title}
      </h1>

      <div className="flex items-center gap-6" data-testid={headerControlsTestId}>
        <div className="relative" ref={notificationDropdownRef}>
          <button
            ref={notificationButtonRef}
            onClick={onBellClick}
            className="relative text-gray-500 hover:text-gray-800 transition-colors"
            data-testid={bellButtonTestId}
          >
            <FaBell size={22} data-testid={bellIconTestId} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                <span data-testid={bellBadgeTestId}>
                  {unreadCount > bellBadgeLimit ? `${bellBadgeLimit}+` : unreadCount}
                </span>
              </span>
            )}
          </button>

          {notificationDropdownOpen && (
            <div
              className="absolute top-full right-0 mt-3 w-96 bg-white rounded-lg shadow-xl z-20 overflow-hidden border max-h-96 flex flex-col"
              data-testid={notificationsWrapperTestId}
            >
              <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <h3 className="font-semibold text-gray-800" data-testid={notificationsTitleTestId}>
                  Notifications
                </h3>
                {unreadCount > 0 && onMarkAllRead && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-base text-blue-600 hover:text-blue-800 font-medium"
                    data-testid={markAllReadButtonTestId}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {loadingNotifications ? (
                  <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {emptyState ?? (
                      <>
                        <FaBell size={32} className="mx-auto mb-2 text-gray-300" />
                        <p>No notifications yet</p>
                      </>
                    )}
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}
                      onClick={() => onNotificationClick?.(notification)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="text-base text-gray-800 font-medium">
                            {notification.message}
                          </p>
                          {notification.complaint && (
                            <p className="text-xs text-gray-500 mt-1">
                              ID: {`CC${notification.complaint._id?.slice(-6).toUpperCase()}`}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()} {" "}
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        {onNotificationDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNotificationDelete(notification);
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef} data-testid="user-profile-dropdown">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            data-testid={profileButtonTestId}
          >
            <div
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg"
              data-testid={profileAvatarTestId}
            >
              {profileInitial}
            </div>
            <span className="font-semibold text-gray-700 hidden md:block" data-testid={profileNameTestId}>
              {profileName}
            </span>
            <FaChevronDown
              size={12}
              className={`text-gray-500 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute top-full right-0 mt-3 w-48 bg-white rounded-lg shadow-xl z-10 overflow-hidden border"
              data-testid={profileMenuTestId}
            >
              <Link
                to={profileRoute}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                data-testid={profileLinkTestId}
              >
                <FaUserCircle />
                Profile
              </Link>
              <button
                onClick={onLogout}
                className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                data-testid={logoutButtonTestId}
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
