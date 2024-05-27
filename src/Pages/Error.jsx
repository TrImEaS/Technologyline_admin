import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Error() {
  const navigate = useNavigate()

  return (
    <div className='flex flex-col w-full h-[400px] gap-10 py-7 px-3 justify-center items-center'>
      <div className='z-20 flex flex-col gap-2'>
        <h1 className='text-4xl font-bold'>Error 404</h1>
        <span className='text-xl'>
          Path not found...
        </span>
      </div>

      <div className='flex items-center justify-center z-20'>
        <button 
          onClick={() => navigate('/')}
          className='border-2 border-black py-2 px-4 rounded-lg hover:bg-black hover:text-white duration-500 font-bold'>
          Return to home
        </button>
      </div>
    </div>
  )
}