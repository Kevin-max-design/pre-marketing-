import { Outlet } from "react-router";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <div className="min-h-screen bg-[#080B16]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar />
      <Outlet />
    </div>
  );
}
