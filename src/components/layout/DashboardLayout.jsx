import React, { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ProfileModal from '../profile/ProfileModal';
import gsap from 'gsap';

export default function DashboardLayout({ 
  children, 
  onSearch, 
  onOpenCreateModal, 
  notifications = [], 
  notificationCount = 0,
  onClearNotifications,
  onNotificationClick
}) {
  const contentRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // GSAP Stagger Entrance for main view content
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [children]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100">
      
      {/* Fixed Sidebar */}
      <Sidebar 
        onOpenCreateModal={onOpenCreateModal} 
        onOpenProfileModal={() => setIsProfileOpen(true)}
      />

      {/* Main Right Content Section */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Header Navbar */}
        <Navbar
          onSearch={onSearch}
          onOpenCreateModal={onOpenCreateModal}
          notifications={notifications}
          notificationCount={notificationCount}
          onClearNotifications={onClearNotifications}
          onNotificationClick={onNotificationClick}
        />

        {/* Dynamic Page Content */}
        <main ref={contentRef} className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Profile Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

    </div>
  );
}
