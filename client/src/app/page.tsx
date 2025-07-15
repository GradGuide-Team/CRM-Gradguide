"use client";
import { withAuth } from '@/wrapper/authWrappet'
import React from 'react'

const Dashboard = () => {
  return (
    <div className='bg-white min-h-screen w-full'>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add some content to see the white background */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Card 1</h2>
          <p className="text-gray-600">Some content here</p>
        </div>
      </div>
    </div>
  )
}
export default withAuth(Dashboard)
