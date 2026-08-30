import React, { useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import gsap from 'gsap';

export default function DashboardLayout({ children, onSearch, onOpenCreateModal, notificationCount = 2 }) {
  const contentRef = useRef(null);

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
      <Sidebar onOpenCreateModal={onOpenCreateModal} />

      {/* Main Right Content Section */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Header Navbar */}
        <Navbar
          onSearch={onSearch}
          onOpenCreateModal={onOpenCreateModal}
          notificationCount={notificationCount}
        />

        {/* Dynamic Page Content */}
        <main ref={contentRef} className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
