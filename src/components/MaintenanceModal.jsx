'use client';

import { Modal } from 'antd';

export default function MaintenanceModal() {
  return (
    <Modal
      open={true}
      footer={false}
      closable={false}
      closeIcon={false}
      maskClosable={false}
      centered
      zIndex={9999999}
      className="modal-margin"
    >
      <div className="text-lg font-semibold text-center text-black">
        System is under maintenance
      </div>
    </Modal>
  );
} 