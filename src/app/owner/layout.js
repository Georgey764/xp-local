import Sidebar from "./components/Sidebar";

export const metadata = {
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function OwnerLayout({ children }) {
  return (
    /* 1. Use h-screen to lock the height to the viewport. 
       2. overflow-hidden prevents the whole page from bouncing/scrolling.
       3. Use semantic variables for background and text. */
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans antialiased">
      {/* Sidebar is now inside a fixed-height container */}
      <Sidebar />

      {/* 4. main handles its own scrolling. flex-1 takes remaining width. */}
      <main className="flex-1 h-full overflow-y-auto p-8 lg:p-12 custom-scrollbar">
        <div className="max-w-4xl mx-auto animate-in">{children}</div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideIn { 
          from { opacity: 0; transform: translateY(8px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-in { animation: slideIn 0.4s ease-out forwards; }
        
        /* 5. Optional: Slim themed scrollbar for the content area */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: var(--color-border); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: var(--color-primary); 
          opacity: 0.5;
        }
      `,
        }}
      />
    </div>
  );
}
