import React from "react";
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/": "Dashboard Overview",
  "/vendors": "Vendor Directory",
};

const Navbar = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Vendor Verification Workspace";

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Current Page Context */}
      <div>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        <p className="text-xs text-slate-500 hidden sm:block">
          Enterprise Compliance & Verification Suite
        </p>
      </div>

      {/* User & Workspace Indicator */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span>Production Workspace</span>
        </div>

        {/* Profile indicator */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-200 shadow-sm">
            KV
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-900">Khush Ramgaria</div>
            <div className="text-[10px] text-slate-500">Compliance Officer</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
