import React from 'react';
import Viewer from 'react-viewer';
// import 'react-viewer/dist/index.css';

// FileViewer wraps react-viewer for image sets and falls back to an iframe
// for PDF documents. It is not a simple modal; the underlying library offers
// drag/zoom/scale/rotate controls and is responsive by default.
//
// Props:
//   open      - boolean visibility
//   files     - array of urls (images or pdfs)
//   index     - starting index
//   onClose   - called when viewer should close
//   onPrev    - optional callback when prev nav pressed
//   onNext    - optional callback when next nav pressed

const FileViewer = ({ open, files = [], index = 0, onClose = () => {}, onPrev = () => {}, onNext = () => {} }) => {
  if (!open || files.length === 0) return null;

  const imageFiles = files.filter(f => !f.toLowerCase().endsWith('.pdf'));
  const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

  return (
    <> 
      {imageFiles.length > 0 && (
        <Viewer
          visible={open}
          onClose={onClose}
          images={imageFiles.map(src => ({ src }))}
          activeIndex={index >= imageFiles.length ? 0 : index}
          drag={true}
          zoomable={true}
          scalable={true}
          rotatable={true}
          changeable={true}
          onChange={i => {
            onPrev();
            // react-viewer doesn't expose prev/next directly, so
            // we call the callbacks when the index changes signifying navigation.
          }}
        />
      )}

      {open && pdfFiles.length > 0 && (
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
              width: '90%',
              height: '90%',
              background: 'white',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
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
            <iframe
              src={pdfFiles[index >= pdfFiles.length ? 0 : index]}
              title="pdf-viewer"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FileViewer;
