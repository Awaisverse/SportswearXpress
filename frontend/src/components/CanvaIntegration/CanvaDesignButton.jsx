import React, { useEffect, useRef } from 'react';
import { FaExternalLinkAlt, FaMagic, FaPalette, FaDownload } from 'react-icons/fa';

const CanvaDesignButton = ({ canvasRef, currentDesign }) => {
  const canvaButtonRef = useRef(null);

  useEffect(() => {
    // Load Canva Design Button script
    const script = document.createElement('script');
    script.src = 'https://sdk.canva.com/designbutton/v1.js';
    script.async = true;
    script.onload = initializeCanvaButton;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeCanvaButton = () => {
    if (window.CanvaDesignButton && canvaButtonRef.current) {
      window.CanvaDesignButton.create({
        container: canvaButtonRef.current,
        brandKit: {
          id: process.env.REACT_APP_CANVA_BRAND_KIT_ID || 'your_brand_kit_id'
        },
        design: {
          type: 'custom',
          elements: currentDesign?.elements || [],
          canvas: {
            width: 800,
            height: 600,
            background: currentDesign?.background || '#ffffff'
          }
        },
        onDesignOpen: (designId) => {
          console.log('Design opened in Canva:', designId);
        },
        onDesignSave: (designId) => {
          console.log('Design saved in Canva:', designId);
          // You could implement webhook to get the updated design
        }
      });
    }
  };

  // Export current design as image and open in Canva
  const exportToCanva = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not found');
      }

      // Convert canvas to image
      const imageData = canvas.toDataURL('image/png');
      
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.download = 'design.png';
      link.href = imageData;
      link.click();

      // Open Canva with the image
      const canvaUrl = `https://www.canva.com/design/create?type=DESIGN&template=blank&image=${encodeURIComponent(imageData)}`;
      window.open(canvaUrl, '_blank');
      
    } catch (error) {
      console.error('Error exporting to Canva:', error);
      alert('Failed to export to Canva. Please try again.');
    }
  };

  // Use Canva AI features
  const useCanvaAI = () => {
    const aiUrl = 'https://www.canva.com/ai/';
    window.open(aiUrl, '_blank');
  };

  // Browse Canva templates
  const browseTemplates = () => {
    const templatesUrl = 'https://www.canva.com/templates/';
    window.open(templatesUrl, '_blank');
  };

  // Download design for Canva
  const downloadForCanva = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not found');
      }

      const imageData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'design-for-canva.png';
      link.href = imageData;
      link.click();
      
    } catch (error) {
      console.error('Error downloading design:', error);
      alert('Failed to download design. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FaExternalLinkAlt className="mr-2 text-blue-600" />
        Canva Integration
      </h3>
      
      <div className="space-y-3">
        {/* Canva Design Button */}
        <div ref={canvaButtonRef} className="w-full">
          {/* Canva button will be inserted here */}
        </div>

        {/* Export to Canva */}
        <button
          onClick={exportToCanva}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
        >
          <FaExternalLinkAlt className="mr-2" />
          Export to Canva for Advanced Editing
        </button>

        {/* Download for Canva */}
        <button
          onClick={downloadForCanva}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
        >
          <FaDownload className="mr-2" />
          Download Design for Canva
        </button>

        {/* Use Canva AI */}
        <button
          onClick={useCanvaAI}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 flex items-center justify-center"
        >
          <FaMagic className="mr-2" />
          Use Canva AI Features
        </button>

        {/* Browse Templates */}
        <button
          onClick={browseTemplates}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-4 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 flex items-center justify-center"
        >
          <FaPalette className="mr-2" />
          Browse Canva Templates
        </button>

        {/* Info */}
        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
          <p className="mb-2"><strong>Canva Integration Features:</strong></p>
          <ul className="space-y-1">
            <li>• Export designs to Canva for advanced editing</li>
            <li>• Use Canva's AI tools for image enhancement</li>
            <li>• Access thousands of professional templates</li>
            <li>• Download designs to upload to Canva manually</li>
            <li>• Seamless workflow between platforms</li>
          </ul>
        </div>

        {/* Setup Instructions */}
        <div className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded">
          <p className="font-medium mb-1">Setup Required:</p>
          <p>1. Get Canva API key from <a href="https://www.canva.com/developers/" target="_blank" rel="noopener noreferrer" className="underline">Canva Developers</a></p>
          <p>2. Add REACT_APP_CANVA_BRAND_KIT_ID to your .env file</p>
        </div>
      </div>
    </div>
  );
};

export default CanvaDesignButton; 