'use client';

import { useState, useEffect } from 'react';
import { Modal } from 'antd';
import Image from 'next/image';

const PamfletModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal
      title="Informasi"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
    >
      <div className="relative w-full h-[500px]">
        <Image
          src="/pamflet-fix.jpg"
          alt="Pamflet Informasi"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
    </Modal>
  );
};

export default PamfletModal; 