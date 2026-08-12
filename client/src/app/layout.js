import "./globals.css";
import { ToastProvider } from "../components/Toast";

export const metadata = {
  title: "AetherGrade | Premium Teacher Portal",
  description: "A high-fidelity academic grading and dashboard portal designed exclusively for educators.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#050714] text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
