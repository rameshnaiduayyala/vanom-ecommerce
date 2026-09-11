import React from "react";

export function CartSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: item list skeleton */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-xs animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-52 mb-6" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 py-5 border-b border-border last:border-0">
                <div className="w-5 h-5 bg-gray-200 rounded mt-1 shrink-0" />
                <div className="w-24 h-24 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-7 bg-gray-100 rounded-lg w-28 mt-3" />
                </div>
                <div className="w-20 shrink-0">
                  <div className="h-5 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
            <div className="pt-4 flex justify-end">
              <div className="h-6 bg-gray-200 rounded w-40" />
            </div>
          </div>
        </div>

        {/* Right: summary skeleton */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-xs animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-40" />
            <div className="h-11 bg-gray-300 rounded-full" />
            <div className="pt-2 space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3.5 bg-gray-200 rounded w-28" />
                  <div className="h-3.5 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-border">
              <div className="h-16 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
