"use client"

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'

type Props = {}

const page = (props: Props) => {

  return (
    <div className='flex justify-center items-center h-screen'>
          <Loader2 className="h-40 w-40 animate-spin text-white-500 mr-3" /> 
          <p className="text-lg">Please Create a Workflow....</p>
    </div>
  )
}

export default page