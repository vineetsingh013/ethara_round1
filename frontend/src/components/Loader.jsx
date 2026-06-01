import React from 'react';

export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader-container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="loader" />
        <div className="loader-brand">IMS</div>
        <div className="loader-text">{text}</div>
      </div>
    </div>
  );
}
