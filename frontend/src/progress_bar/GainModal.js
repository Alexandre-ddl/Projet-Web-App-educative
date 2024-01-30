
import '../components/App.css';
import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import Modal from 'react-modal';

const GainModal = ({ isOpen, onRequestClose, stockImage, gainImage, quantity, onTransfer }) => {
  const [showGainImage, setShowGainImage] = useState(false);

  useEffect(() => {
    if (showGainImage) {
      const stockImg = document.getElementById('stockImage');
      const gainImg = document.getElementById('gainImage');

      if (stockImg && gainImg) { // Vérifiez si les éléments existent avant d'accéder à leurs propriétés
        gsap.to(stockImg, {
          x: gainImg.offsetLeft,
          y: gainImg.offsetTop,
          width: gainImg.offsetWidth,
          height: gainImg.offsetHeight,
          duration: 1,
          onComplete: () => {
            onTransfer(); // Appeler la fonction de transfert après l'animation
          },
        });
      }
    }
  }, [showGainImage, stockImage, gainImage, onTransfer]);

  const handleTransferClick = () => {
    setShowGainImage(true);
  };

  return (
    <Modal className="small-modal" isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2>Quantité Gagnée</h2>
      <img id="stockImage" src={stockImage} alt="Stock" />
      <p>Quantité: {quantity}</p>
      {!showGainImage && <button onClick={handleTransferClick}>Transférer</button>}
    </Modal>
  );
};

export default GainModal;
