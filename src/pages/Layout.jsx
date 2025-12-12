
import React from 'react';
import { Toaster } from 'sonner';

export default function Layout({ children, currentPageName }) {
  const isBoardPage = currentPageName === 'Board' || currentPageName === 'BrachosBoard';

  return (
    <div dir="rtl" className={`font-rubik ${isBoardPage ? 'h-screen w-screen overflow-hidden' : ''}`}>
      {/* Google Fonts Import - Rubik only for now */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet" />
      
      <style>{`
        :root {
          --color-primary: #0f2557;
          --color-secondary: #c7a44a;
          --color-accent: #f8f4e5;
          --color-dark: #051124;
        }
        
        html, body {
          direction: rtl;
          font-family: 'Rubik', sans-serif; /* Fallback to sans-serif if Rubik fails */
          background-color: var(--color-dark);
          color: var(--color-accent);
          margin: 0;
          padding: 0;
        }

        #root {
          ${isBoardPage ? `
            width: 100vw;
            height: 100vh;
            overflow: hidden;
          ` : ''}
        }

        /* .hebrew-font class might not be needed if David Libre is removed or loaded globally */
        .hebrew-font {
          /* font-family: 'David Libre', serif; */ /* Commented out for now */
        }
        
        .prayer-time-box {
          transition: all 0.3s ease;
        }
        .prayer-time-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.3);
          margin: 0 4px;
        }
        .active-dot {
          background-color: var(--color-secondary);
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: var(--color-secondary);
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .ltr-direction {
          direction: ltr;
          unicode-bidi: isolate;
          display: inline-block;
        }
      `}</style>
      
      {isBoardPage ? (
        <div className="board-styles">
          {children}
        </div>
      ) : (
        <div className="admin-layout p-4">
          {children}
        </div>
        )}
        <Toaster position="top-center" richColors />
        </div>
        );
        }
