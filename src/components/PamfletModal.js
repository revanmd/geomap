'use client';

import { useState } from 'react';
import Image from 'next/image';

const PamfletModal = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{zIndex:9999999}}>
      <div className="bg-white rounded-lg p-6 max-w-[800px] w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Informasi</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="relative w-full h-[500px]">
          <Image
            src="/pamflet-iari.png"
            alt="Pamflet Informasi"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default PamfletModal; 