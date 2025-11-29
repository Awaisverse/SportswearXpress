import React, { useState } from 'react';
import { FaExternalLinkAlt, FaDownload, FaMagic, FaPalette, FaUpload, FaImage } from 'react-icons/fa';

const SimpleCanvaIntegration = ({ canvasRef, currentDesign }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Export current design as image and open in Canva
  const exportToCanva = async () => {
    setIsLoading(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not found');
      }

      // Convert canvas to image
      const imageData = canvas.toDataURL('image/png');
      
      // Download the image first
      const link = document.createElement('a');
      link.download = 'design-for-canva.png';
      link.href = imageData;
      link.click();

      // Open Canva in new tab
      const canvaUrl = 'https://www.canva.com/design/create?type=DESIGN&template=blank';
      window.open(canvaUrl, '_blank');
      
      // Show instructions
      setTimeout(() => {
        alert('Design downloaded! Please:\n1. Open Canva in the new tab\n2. Upload the downloaded image\n3. Continue editing with Canva\'s tools');
      }, 1000);
      
    } catch (error) {
      console.error('Error exporting to Canva:', error);
      alert('Failed to export design. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Download design for manual upload to Canva
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
      
      alert('Design downloaded! You can now upload it to Canva manually.');
      
    } catch (error) {
      console.error('Error downloading design:', error);
      alert('Failed to download design. Please try again.');
    }
  };

  // Use Canva AI features (redirect to Canva)
  const useCanvaAI = () => {
    const aiUrl = 'https://www.canva.com/ai/';
    window.open(aiUrl, '_blank');
  };

  // Browse Canva templates
  const browseTemplates = () => {
    const templatesUrl = 'https://www.canva.com/templates/';
    window.open(templatesUrl, '_blank');
  };

  // Open Canva with specific template
  const openCanvaWithTemplate = (templateType) => {
    const templateUrls = {
      't-shirt': 'https://www.canva.com/templates/search/t-shirt-designs/',
      'logo': 'https://www.canva.com/templates/search/logos/',
      'social': 'https://www.canva.com/templates/search/social-media/',
      'business': 'https://www.canva.com/templates/search/business/',
      'blank': 'https://www.canva.com/design/create?type=DESIGN&template=blank'
    };
    
    const url = templateUrls[templateType] || templateUrls.blank;
    window.open(url, '_blank');
  };

  // Generate design with Canva AI
  const generateWithAI = (prompt) => {
    const aiUrl = `https://www.canva.com/ai/?prompt=${encodeURIComponent(prompt)}`;
    window.open(aiUrl, '_blank');
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
          Export to Canva (Auto Download)
        </button>

        {/* Download for Canva */}
        <button
          onClick={downloadForCanva}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
        >
          <FaDownload className="mr-2" />
          Download Design for Canva
        </button>

        {/* Quick Templates */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Quick Templates:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => openCanvaWithTemplate('t-shirt')}
              className="p-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors text-xs"
            >
              T-Shirt Designs
            </button>
            <button
              onClick={() => openCanvaWithTemplate('logo')}
              className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
            >
              Logo Templates
            </button>
            <button
              onClick={() => openCanvaWithTemplate('social')}
              className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs"
            >
              Social Media
            </button>
            <button
              onClick={() => openCanvaWithTemplate('business')}
              className="p-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-xs"
            >
              Business Cards
            </button>
          </div>
        </div>

        {/* AI Generation */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">AI Generation:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => generateWithAI('t-shirt design with custom text')}
              className="p-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded hover:from-green-600 hover:to-teal-600 transition-all text-xs"
            >
              T-Shirt Design
            </button>
            <button
              onClick={() => generateWithAI('logo design')}
              className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded hover:from-purple-600 hover:to-pink-600 transition-all text-xs"
            >
              Logo Design
            </button>
          </div>
        </div>

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
          Browse All Templates
        </button>

        {/* Info */}
        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
          <p className="mb-2"><strong>How it works:</strong></p>
          <ul className="space-y-1">
            <li>• Export your design as an image</li>
            <li>• Upload to Canva for advanced editing</li>
            <li>• Use Canva's AI tools for enhancement</li>
            <li>• Access thousands of professional templates</li>
            <li>• No API key required for basic features</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded">
          <p className="font-medium mb-1">💡 Pro Tips:</p>
          <ul className="space-y-1">
            <li>• Use "Export to Canva" for automatic download + Canva opening</li>
            <li>• Use "Download Design" if you want to save manually</li>
            <li>• Try AI generation for inspiration</li>
            <li>• Browse templates for professional designs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleCanvaIntegration; 