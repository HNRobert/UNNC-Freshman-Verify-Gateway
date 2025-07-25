"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 text-center hover-lift">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Identity Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The requested identity does not exist or is not available.
        </p>
        <button
          onClick={() => router.push("/")}
          style={{ backgroundColor: "#fed200" }}
          className="text-gray-700 py-2 px-4 rounded-lg hover-scale hover-glow transition-all duration-300 transform"
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
}
