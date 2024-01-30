import React from 'react';
import Modal from 'react-modal';
import '../components/App.css';

const StockModal = ({ isOpen, onRequestClose, image, quantity }) => {
  return (
    <Modal className="small-modal" isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2>Stock</h2>
      <img src={image} alt="Stock" />
      <p>Quantité: {quantity}</p>
    </Modal>
  );
};

export default StockModal;