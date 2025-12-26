import Sidebar from "./components/Sidebar";

export default function OwnerLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[oklch(99%_0.005_60)] text-[oklch(20%_0.05_260)] font-sans antialiased">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto animate-in">{children}</div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: slideIn 0.4s ease-out forwards; }
      `,
        }}
      />
    </div>
  );
}
