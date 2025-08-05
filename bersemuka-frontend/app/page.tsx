'use client';

import { useState } from 'react';

export default function BerseMuka() {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] flex flex-col">
        {/* Login Screen */}
        <div className="flex-1 flex flex-col justify-center px-8 max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold text-[#2D5F4F] text-center mb-2">Login</h1>
          <p className="text-gray-600 text-center mb-8">Welcome back!</p>
          
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-4 bg-white rounded-lg border border-gray-200 text-gray-800"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 bg-white rounded-lg border border-gray-200 text-gray-800"
            />
            <div className="text-right">
              <button className="text-gray-500 text-sm">Forgot Password</button>
            </div>
            <button className="w-full bg-[#2D5F4F] text-white py-4 rounded-lg text-lg font-semibold">
              Login
            </button>
          </div>
          
          <div className="text-center mt-6">
            <span className="text-gray-600">Don't have an account? </span>
            <button className="text-[#2D5F4F] font-semibold">Create Account</button>
          </div>
          
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500">Or continue with</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          
          <div className="flex justify-center space-x-8">
            <button className="text-2xl">G</button>
            <button className="text-2xl text-blue-600">in</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex flex-col">
      {/* Status Bar Simulation */}
      <div className="flex justify-between items-center px-6 pt-3 pb-2 text-black text-sm font-semibold">
        <span>3:14</span>
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
          </div>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.076 13.308-5.076 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.24 0 1 1 0 01-1.415-1.414 5 5 0 017.07 0 1 1 0 01-1.415 1.414zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <div className="w-6 h-3 border border-black rounded-sm">
            <div className="w-full h-full bg-black rounded-sm"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 max-w-md mx-auto w-full">
        {/* Arabic Text */}
        <div className="text-center mb-6">
          <div className="text-2xl text-[#4A90E2] mb-2" style={{fontFamily: 'serif'}}>
            بِرْسَمُكَا
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl font-bold text-[#2D5F4F] text-center mb-12 tracking-[0.2em]">
          BERSEMUKA
        </h1>

        {/* Illustration */}
        <div className="flex justify-center mb-12">
          <div className="relative w-80 h-60">
            {/* Background circle */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E8F4F0] via-[#D4E9E3] to-[#C8E6D0] rounded-full"></div>
            
            {/* People illustrations */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Person 1 - Left (woman with hijab) */}
              <div className="absolute left-8 top-16">
                <div className="w-16 h-20 relative">
                  {/* Body */}
                  <div className="w-12 h-16 bg-[#8B4513] rounded-t-full mx-auto"></div>
                  {/* Head/Hijab */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-[#D2691E] rounded-full"></div>
                  {/* Laptop */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-600 rounded"></div>
                </div>
              </div>

              {/* Person 2 - Center back (man) */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-20 relative">
                  {/* Body */}
                  <div className="w-12 h-16 bg-[#228B22] rounded-t-full mx-auto"></div>
                  {/* Head */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-[#DEB887] rounded-full"></div>
                  {/* Hair */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-[#8B4513] rounded-t-full"></div>
                </div>
              </div>

              {/* Person 3 - Right (woman) */}
              <div className="absolute right-8 top-16">
                <div className="w-16 h-20 relative">
                  {/* Body */}
                  <div className="w-12 h-16 bg-[#DAA520] rounded-t-full mx-auto"></div>
                  {/* Head */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-[#DEB887] rounded-full"></div>
                  {/* Hair */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-[#4B0082] rounded-t-full"></div>
                  {/* Laptop */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-600 rounded"></div>
                </div>
              </div>

              {/* Person 4 - Center front (person in green) */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-20 relative">
                  {/* Body */}
                  <div className="w-12 h-16 bg-[#2D5F4F] rounded-t-full mx-auto"></div>
                  {/* Head */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-[#DEB887] rounded-full"></div>
                  {/* Hair */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-[#8B4513] rounded-t-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-[#2D5F4F] leading-tight">
            Where Growth<br />
            Meets Community
          </h2>
        </div>

        {/* Login Button */}
        <button 
          onClick={() => setShowLogin(true)}
          className="w-full bg-[#2D5F4F] text-white py-4 rounded-lg text-lg font-semibold mb-6 hover:bg-[#1F4A3A] transition-colors"
        >
          Login
        </button>

        {/* Create Account Link */}
        <div className="text-center">
          <span className="text-gray-600">New user? </span>
          <button className="text-[#2D5F4F] font-semibold">
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}