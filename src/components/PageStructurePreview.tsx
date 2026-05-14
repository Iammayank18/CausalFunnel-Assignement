import React from 'react';

export function PageStructurePreview() {
  return (
    <div className="w-full bg-slate-50 flex flex-col pointer-events-none min-h-[1400px]">
      {/* Navbar Wireframe */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-12 justify-between shrink-0 shadow-sm">
        <div className="w-32 h-6 bg-slate-200 rounded-md" />
        <div className="flex gap-8">
          <div className="w-16 h-4 bg-slate-100 rounded" />
          <div className="w-16 h-4 bg-slate-100 rounded" />
          <div className="w-16 h-4 bg-slate-100 rounded" />
          <div className="w-24 h-8 bg-indigo-100 rounded-md -mt-2" />
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-1 max-h-[600px] bg-slate-50 flex flex-col items-center justify-center py-24 px-8 border-b border-slate-200">
        <div className="w-3/4 max-w-3xl h-14 bg-slate-200 rounded-xl mb-8" />
        <div className="w-1/2 max-w-xl h-6 bg-slate-100 rounded-lg mb-4" />
        <div className="w-2/5 max-w-md h-6 bg-slate-100 rounded-lg mb-12" />
        <div className="flex gap-4">
          <div className="w-40 h-12 bg-indigo-500 rounded-lg shadow-sm" />
          <div className="w-40 h-12 bg-white border border-slate-200 rounded-lg shadow-sm" />
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 px-12 bg-white flex flex-col items-center border-b border-slate-200">
        <div className="w-48 h-8 bg-slate-200 rounded-lg mb-16" />
        <div className="grid grid-cols-3 gap-12 w-full max-w-5xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl mb-6" />
              <div className="w-32 h-5 bg-slate-200 rounded mb-4" />
              <div className="w-full h-3 bg-slate-100 rounded mb-2" />
              <div className="w-full h-3 bg-slate-100 rounded mb-2" />
              <div className="w-4/5 h-3 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Big Image/Content Section */}
      <div className="py-24 px-12 bg-slate-50 flex items-center justify-center gap-16 border-b border-slate-200">
        <div className="flex-1 max-w-lg space-y-4">
          <div className="w-3/4 h-8 bg-slate-200 rounded-lg mb-6" />
          <div className="w-full h-4 bg-slate-100 rounded" />
          <div className="w-full h-4 bg-slate-100 rounded" />
          <div className="w-5/6 h-4 bg-slate-100 rounded" />
        </div>
        <div className="w-1/2 max-w-xl h-80 bg-slate-200 rounded-2xl shadow-sm" />
      </div>

      {/* Footer Wireframe */}
      <div className="h-64 bg-slate-900 mt-auto px-12 py-16 flex justify-between">
        <div className="w-48 h-8 bg-slate-800 rounded-md" />
        <div className="flex gap-16">
          <div className="space-y-4">
            <div className="w-24 h-4 bg-slate-700 rounded mb-6" />
            <div className="w-20 h-3 bg-slate-800 rounded" />
            <div className="w-20 h-3 bg-slate-800 rounded" />
          </div>
          <div className="space-y-4">
            <div className="w-24 h-4 bg-slate-700 rounded mb-6" />
            <div className="w-20 h-3 bg-slate-800 rounded" />
            <div className="w-20 h-3 bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
