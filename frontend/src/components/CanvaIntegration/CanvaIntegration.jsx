import React, { useState } from 'react';
import { FaExternalLinkAlt, FaDownload, FaUpload, FaMagic, FaPalette } from 'react-icons/fa';

const CanvaIntegration = ({ canvasRef, currentDesign }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [canvaUrl, setCanvaUrl] = useState(null);

  // Canva API Configuration
  const CANVA_API_KEY = process.env.REACT_APP_CANVA_API_KEY || 'your_canva_api_key';
  const CANVA_BRAND_KIT_ID = process.env.REACT_APP_CANVA_BRAND_KIT_ID || 'your_brand_kit_id';

  // Export current design to Canva
  const exportToCanva = async () => {
    setIsLoading(true);
    try {
      // Get canvas data
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not found');
      }

      // Convert canvas to image
      const imageData = canvas.toDataURL('image/png');
      
      // Prepare design data for Canva
      const designData = {
        brandKitId: CANVA_BRAND_KIT_ID,
        design: {
          type: 'custom',
          elements: currentDesign?.elements || [],
          canvas: {
            width: canvas.width,
            height: canvas.height,
            background: currentDesign?.background || '#ffffff'
          }
        }
      };

      // Call Canva API to create design
      const response = await fetch('https://api.canva.com/v1/designs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CANVA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(designData)
      });

      if (!response.ok) {
        throw new Error('Failed to create Canva design');
      }

      const data = await response.json();
      setCanvaUrl(data.editUrl);
      
      // Open Canva in new tab
      window.open(data.editUrl, '_blank');
      
    } catch (error) {
      console.error('Error exporting to Canva:', error);
      alert('Failed to export to Canva. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Import design from Canva
  const importFromCanva = async () => {
    setIsLoading(true);
    try {
      // This would require Canva webhook or user to provide design URL
      const canvaDesignUrl = prompt('Please paste your Canva design URL:');
      
      if (!canvaDesignUrl) {
        setIsLoading(false);
        return;
      }

      // Extract design ID from URL
      const designId = canvaDesignUrl.split('/').pop();
      
      // Fetch design from Canva API
      const response = await fetch(`https://api.canva.com/v1/designs/${designId}`, {
        headers: {
          'Authorization': `Bearer ${CANVA_API_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Canva design');
      }

      const design = await response.json();
      
      // Convert Canva design to your format
      const convertedDesign = convertCanvaToLocalFormat(design);
      
      // Apply to canvas
      applyDesignToCanvas(convertedDesign);
      
    } catch (error) {
      console.error('Error importing from Canva:', error);
      alert('Failed to import from Canva. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert Canva design format to local format
  const convertCanvaToLocalFormat = (canvaDesign) => {
    const elements = canvaDesign.elements?.map(element => {
      switch (element.type) {
        case 'text':
          return {
            id: element.id,
            type: 'text',
            text: element.text,
            x: element.x,
            y: element.y,
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            color: element.color,
            bold: element.bold,
            italic: element.italic,
            underline: element.underline
          };
        case 'shape':
          return {
            id: element.id,
            type: 'shape',
            shapeType: element.shapeType,
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
            fillColor: element.fillColor,
            strokeColor: element.strokeColor,
            strokeWidth: element.strokeWidth
          };
        case 'image':
          return {
            id: element.id,
            type: 'image',
            src: element.src,
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
            opacity: element.opacity
          };
        default:
          return null;
      }
    }).filter(Boolean);

    return {
      elements,
      background: canvaDesign.canvas?.background || '#ffffff',
      width: canvaDesign.canvas?.width || 800,
      height: canvaDesign.canvas?.height || 600
    };
  };

  // Apply imported design to canvas
  const applyDesignToCanvas = (design) => {
    // This would need to be implemented based on your canvas system
    console.log('Applying design to canvas:', design);
    // You would typically call a function to redraw the canvas with new elements
  };

  // Use Canva AI features (redirect to Canva)
  const useCanvaAI = () => {
    const aiUrl = 'https://www.canva.com/ai/';
    window.open(aiUrl, '_blank');
  };

  // Open Canva templates
  const openCanvaTemplates = () => {
    const templatesUrl = 'https://www.canva.com/templates/';
    window.open(templatesUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FaExternalLinkAlt className="mr-2 text-blue-600" />
        Canva Integration
      </h3>
      
      <div className="space-y-3">
        {/* Export to Canva */}
        <button
          onClick={exportToCanva}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <FaExternalLinkAlt className="mr-2" />
          )}
          Export to Canva for Advanced Editing
        </button>

        {/* Import from Canva */}
        <button
          onClick={importFromCanva}
          disabled={isLoading}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          <FaUpload className="mr-2" />
          Import from Canva
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
          onClick={openCanvaTemplates}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-4 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 flex items-center justify-center"
        >
          <FaPalette className="mr-2" />
          Browse Canva Templates
        </button>

        {/* Info */}
        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
          <p className="mb-2"><strong>How it works:</strong></p>
          <ul className="space-y-1">
            <li>• Export your design to Canva for advanced editing</li>
            <li>• Use Canva's AI features for image enhancement</li>
            <li>• Import designs back to continue customizing</li>
            <li>• Access thousands of professional templates</li>
          </ul>
        </div>

        {canvaUrl && (
          <div className="text-xs text-blue-600 mt-2">
            <a href={canvaUrl} target="_blank" rel="noopener noreferrer" className="underline">
              Open in Canva
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvaIntegration; 