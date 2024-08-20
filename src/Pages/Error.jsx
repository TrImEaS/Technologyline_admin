import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Error() {
  const navigate = useNavigate()

  return (
    <div className='flex flex-col w-[400px] h-[400px] justify-center mt-10 rounded-xl gap-10 shadow-lg shadow-white border-white border px-3 items-center text-white'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-4xl font-bold'>Error 404</h1>
        <span className='text-xl'>
          Path not found...
        </span>
      </div>

      <div className='flex items-center justify-center z-20'>
        <button 
          onClick={() => navigate('/admin/page/')}
          className='border-2 border-white py-2 px-4 rounded-lg hover:bg-black hover:text-white duration-500 font-bold'>
          Return to home
        </button>
      </div>
    </div>
  )
}