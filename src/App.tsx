import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';

function App() {
  return (
    <main className="min-h-[100dvh] w-full flex flex-col justify-center items-center bg-[#FAF9F8] text-black antialiased relative">
      {/* Decorative luxury logo header for larger screens */}
      <header className="hidden md:flex flex-col items-center gap-1.5 mb-8 select-none text-center">
        <h1 className="font-serif text-3xl font-light tracking-[0.25em] text-neutral-900 uppercase">
          Sindur Models
        </h1>
        <div className="h-[1px] w-12 bg-neutral-300 my-1" />
        <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">
          Official Casting Call
        </span>
      </header>

      {/* Main Form Centerpiece */}
      <Home />

      {/* Footer */}
      <footer className="w-full text-center py-6 md:mt-8 flex flex-col gap-2 items-center select-none">
        <div className="flex items-center gap-1.5 justify-center">
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">Casting Support:</span>
          <a
            href="https://wa.me/919400902360"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-black font-bold uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer"
          >
            Chat WhatsApp
          </a>
        </div>
        <p className="text-[9px] font-semibold tracking-[0.25em] text-neutral-400 uppercase">
          &copy; {new Date().getFullYear()} Sindur Models. All Rights Reserved.
        </p>
      </footer>

      {/* Toast Notification Provider */}
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'font-sans text-sm font-semibold tracking-wide border border-neutral-100 rounded-xl shadow-md px-4 py-3 bg-white text-black',
          duration: 4000,
          success: {
            iconTheme: {
              primary: '#000000',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </main>
  );
}

export default App;
