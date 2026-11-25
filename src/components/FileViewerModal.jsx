import React, { useState } from 'react';

// simple modal that can display an image or a PDF and provides basic
// navigation/zoom controls when given a list of files
const FileViewerModal = ({
  open,
  files = [],
  index = 0,
  onClose = () => {},
  onPrev = () => {},
  onNext = () => {},
}) => {
  const [zoom, setZoom] = useState(1);

  if (!open || files.length === 0) return null;

  const url = files[index];
  const isPdf = url.toLowerCase().endsWith('.pdf');

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
  const resetZoom = () => setZoom(1);

  const zoomButtonStyle = {
    background: 'rgba(0,0,0,0.3)',
    border: 'none',
    color: 'white',
    padding: '6px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 16,
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '90%',
          height: '90%',
          background: 'white',
          borderRadius: 8,
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => {
            resetZoom();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'transparent',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            zIndex: 1001,
          }}
        >
          ×
        </button>
        {!isPdf && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              gap: 8,
              zIndex: 1001,
            }}
          >
            <button onClick={handleZoomIn} style={zoomButtonStyle}>+</button>
            <button onClick={handleZoomOut} style={zoomButtonStyle}>-</button>
          </div>
        )}
        {isPdf ? (
          <iframe
            src={url}
            title="pdf-viewer"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <img
            src={url}
            alt="preview"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transform: `scale(${zoom})`,
              transition: 'transform 0.2s',
            }}
          />
        )}
        {files.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 32px',
              boxSizing: 'border-box',
            }}
          >
            <button
              onClick={onPrev}
              disabled={index === 0}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 4,
                cursor: index === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              ‹ Prev
            </button>
            <button
              onClick={onNext}
              disabled={index === files.length - 1}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 4,
                cursor: index === files.length - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Next ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewerModal;
