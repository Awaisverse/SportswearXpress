import React, { useState } from 'react';
import { FaMagic, FaImage, FaPalette, FaDownload, FaPlus, FaSpinner, FaCog, FaEye } from 'react-icons/fa';

const AICanvasIntegration = ({ canvasRef, currentDesign, onAddElement }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedDesigns, setGeneratedDesigns] = useState([]);
  const [showSpecifications, setShowSpecifications] = useState(false);
  
  // Design specifications state
  const [designSpecs, setDesignSpecs] = useState({
    type: 'flower',
    size: 'medium',
    colors: ['#ff6b6b', '#3742fa', '#2ed573'],
    style: 'modern',
    complexity: 'medium',
    orientation: 'center',
    background: 'transparent'
  });

  // Available design types
  const designTypes = [
    { value: 'flower', label: '🌸 Flower', icon: '🌸' },
    { value: 'butterfly', label: '🦋 Butterfly', icon: '🦋' },
    { value: 'heart', label: '❤️ Heart', icon: '❤️' },
    { value: 'star', label: '⭐ Star', icon: '⭐' },
    { value: 'circle', label: '⭕ Circle', icon: '⭕' },
    { value: 'triangle', label: '🔺 Triangle', icon: '🔺' },
    { value: 'diamond', label: '💎 Diamond', icon: '💎' },
    { value: 'hexagon', label: '⬡ Hexagon', icon: '⬡' },
    { value: 'logo', label: '🏢 Logo', icon: '🏢' },
    { value: 'abstract', label: '🎨 Abstract', icon: '🎨' }
  ];

  // Size options
  const sizeOptions = [
    { value: 'small', label: 'Small (100x100)', width: 100, height: 100 },
    { value: 'medium', label: 'Medium (200x200)', width: 200, height: 200 },
    { value: 'large', label: 'Large (300x300)', width: 300, height: 300 },
    { value: 'custom', label: 'Custom Size', width: 250, height: 250 }
  ];

  // Style options
  const styleOptions = [
    { value: 'modern', label: 'Modern', colors: ['#ff6b6b', '#3742fa', '#2ed573'] },
    { value: 'vintage', label: 'Vintage', colors: ['#8b4513', '#daa520', '#cd853f'] },
    { value: 'minimalist', label: 'Minimalist', colors: ['#000000', '#ffffff', '#cccccc'] },
    { value: 'colorful', label: 'Colorful', colors: ['#ff6b6b', '#ffa502', '#2ed573', '#3742fa', '#ff4757'] },
    { value: 'pastel', label: 'Pastel', colors: ['#ffb3ba', '#baffc9', '#bae1ff', '#ffffba'] },
    { value: 'dark', label: 'Dark', colors: ['#2f3542', '#57606f', '#747d8c', '#a4b0be'] }
  ];

  // Complexity options
  const complexityOptions = [
    { value: 'simple', label: 'Simple', detail: 'Basic shapes and colors' },
    { value: 'medium', label: 'Medium', detail: 'Moderate detail and patterns' },
    { value: 'complex', label: 'Complex', detail: 'Detailed patterns and multiple elements' }
  ];

  // Generate SVG based on specifications
  const generateSVG = (specs) => {
    const { type, size, colors, style, complexity, orientation } = specs;
    const sizeObj = sizeOptions.find(s => s.value === size);
    const width = sizeObj?.width || 200;
    const height = sizeObj?.height || 200;
    
    let svgContent = '';
    
    switch (type) {
      case 'flower':
        svgContent = generateFlowerSVG(width, height, colors, complexity);
        break;
      case 'butterfly':
        svgContent = generateButterflySVG(width, height, colors, complexity);
        break;
      case 'heart':
        svgContent = generateHeartSVG(width, height, colors, complexity);
        break;
      case 'star':
        svgContent = generateStarSVG(width, height, colors, complexity);
        break;
      case 'circle':
        svgContent = generateCircleSVG(width, height, colors, complexity);
        break;
      case 'triangle':
        svgContent = generateTriangleSVG(width, height, colors, complexity);
        break;
      case 'diamond':
        svgContent = generateDiamondSVG(width, height, colors, complexity);
        break;
      case 'hexagon':
        svgContent = generateHexagonSVG(width, height, colors, complexity);
        break;
      case 'logo':
        svgContent = generateLogoSVG(width, height, colors, complexity);
        break;
      case 'abstract':
        svgContent = generateAbstractSVG(width, height, colors, complexity);
        break;
      default:
        svgContent = generateFlowerSVG(width, height, colors, complexity);
    }
    
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  // SVG generation functions
  const generateFlowerSVG = (width, height, colors, complexity) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const petalCount = complexity === 'complex' ? 12 : complexity === 'medium' ? 8 : 6;
    const petalSize = Math.min(width, height) * 0.15;
    
    let petals = '';
    for (let i = 0; i < petalCount; i++) {
      const angle = (i * 360) / petalCount;
      const x = centerX + Math.cos(angle * Math.PI / 180) * petalSize;
      const y = centerY + Math.sin(angle * Math.PI / 180) * petalSize;
      const color = colors[i % colors.length];
      petals += `<circle cx="${x}" cy="${y}" r="${petalSize * 0.8}" fill="${color}"/>`;
    }
    
    const centerColor = colors[0];
    const stemColor = '#00ff00';
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
        ${petals}
        <circle cx="${centerX}" cy="${centerY}" r="${petalSize * 0.6}" fill="${centerColor}"/>
        <rect x="${centerX - 2}" y="${centerY + petalSize * 0.6}" width="4" height="${height * 0.3}" fill="${stemColor}"/>
        ${complexity === 'complex' ? `<rect x="${centerX - 8}" y="${centerY + petalSize * 0.6 + height * 0.3}" width="16" height="4" fill="${stemColor}"/>` : ''}
      </svg>
    `;
  };

  const generateButterflySVG = (width, height, colors, complexity) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const wingSize = Math.min(width, height) * 0.3;
    const color1 = colors[0];
    const color2 = colors[1] || colors[0];
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
        <ellipse cx="${centerX - wingSize * 0.8}" cy="${centerY}" rx="${wingSize}" ry="${wingSize * 0.6}" fill="${color1}"/>
        <ellipse cx="${centerX + wingSize * 0.8}" cy="${centerY}" rx="${wingSize}" ry="${wingSize * 0.6}" fill="${color1}"/>
        <ellipse cx="${centerX - wingSize * 0.4}" cy="${centerY - wingSize * 0.3}" rx="${wingSize * 0.5}" ry="${wingSize * 0.3}" fill="${color2}"/>
        <ellipse cx="${centerX + wingSize * 0.4}" cy="${centerY - wingSize * 0.3}" rx="${wingSize * 0.5}" ry="${wingSize * 0.3}" fill="${color2}"/>
        <rect x="${centerX - 1}" y="${centerY - wingSize * 0.8}" width="2" height="${wingSize * 1.6}" fill="black"/>
        <ellipse cx="${centerX}" cy="${centerY + wingSize * 0.8}" rx="2" ry="4" fill="black"/>
      </svg>
    `;
  };

  const generateHeartSVG = (width, height, colors, complexity) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.3;
    const color = colors[0];
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
        <path d="M ${centerX} ${centerY + size * 0.3} C ${centerX - size} ${centerY - size * 0.5} ${centerX - size} ${centerY + size * 0.5} ${centerX} ${centerY + size} C ${centerX + size} ${centerY + size * 0.5} ${centerX + size} ${centerY - size * 0.5} ${centerX} ${centerY + size * 0.3} Z" fill="${color}"/>
      </svg>
    `;
  };

  const generateStarSVG = (width, height, colors, complexity) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) * 0.3;
    const innerRadius = outerRadius * 0.4;
    const points = complexity === 'complex' ? 10 : complexity === 'medium' ? 8 : 5;
    const color = colors[0];
    
    let path = '';
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      path += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
    }
    path += 'Z';
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
        <path d="${path}" fill="${color}"/>
      </svg>
    `;
  };

  const generateCircleSVG = (width, height, colors, complexity) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    const color = colors[0];
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${color}"/>
        ${complexity === 'complex' ? `<circle cx="${centerX}" cy="${centerY}" r="${radius * 0.6}" fill="${colors[1] || color}"/>` : ''}
        ${complexity === 'complex' ? `<circle cx="${centerX}" cy="${centerY}" r="${radius * 0.3}" fill="${colors[2] || color}"/>` : ''}
      </svg>
    `;
  };

  const generateTriangleSVG = (width, height, colors, complexity) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.3;
    const color = colors[0];
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
        <path d="M ${centerX} ${centerY - size} L ${centerX - size} ${centerY + size} L ${centerX + size} ${centerY + size} Z" fill="${color}"/>
      </svg>
    `;
  };

  const generateDiamondSVG = (width, height, colors, complexity) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.3;
    const color = colors[0];
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
        <path d="M ${centerX} ${centerY - size} L ${centerX + size} ${centerY} L ${centerX} ${centerY + size} L ${centerX - size} ${centerY} Z" fill="${color}"/>
      </svg>
    `;
  };

  const generateHexagonSVG = (width, height, colors, complexity) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    const color = colors[0];
    
    let path = '';
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      path += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
    }
    path += 'Z';
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
        <path d="${path}" fill="${color}"/>
      </svg>
    `;
  };

  const generateLogoSVG = (width, height, colors, complexity) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.2;
    const color = colors[0];
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
        <rect x="${centerX - size}" y="${centerY - size}" width="${size * 2}" height="${size * 2}" fill="${color}"/>
        <text x="${centerX}" y="${centerY + size * 0.3}" text-anchor="middle" fill="white" font-family="Arial" font-size="${size * 0.8}" font-weight="bold">BRAND</text>
      </svg>
    `;
  };

  const generateAbstractSVG = (width, height, colors, complexity) => {
    const color1 = colors[0];
    const color2 = colors[1] || colors[0];
    const color3 = colors[2] || colors[0];
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
        <circle cx="${width * 0.3}" cy="${height * 0.3}" r="${Math.min(width, height) * 0.2}" fill="${color1}"/>
        <rect x="${width * 0.5}" y="${height * 0.2}" width="${width * 0.3}" height="${height * 0.3}" fill="${color2}"/>
        <polygon points="${width * 0.7},${height * 0.7} ${width * 0.9},${height * 0.5} ${width * 0.8},${height * 0.9}" fill="${color3}"/>
      </svg>
    `;
  };

  // Generate design based on specifications
  const generateDesignFromSpecs = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate SVG based on specifications
      const svgData = generateSVG(designSpecs);
      
      // Create design element
      const design = {
        id: `ai-generated-${Date.now()}`,
        type: 'image',
        src: svgData,
        x: 100,
        y: 100,
        width: designSpecs.size === 'custom' ? 250 : sizeOptions.find(s => s.value === designSpecs.size)?.width || 200,
        height: designSpecs.size === 'custom' ? 250 : sizeOptions.find(s => s.value === designSpecs.size)?.height || 200,
        opacity: 1,
        isAIGenerated: true,
        prompt: `Custom ${designSpecs.type} design with ${designSpecs.style} style`,
        specifications: { ...designSpecs }
      };
      
      // Add to canvas
      if (onAddElement) {
        onAddElement(design);
      }
      
      // Add to generated designs list
      setGeneratedDesigns(prev => [...prev, design]);
      
      return design;
      
    } catch (error) {
      console.error('Error generating design:', error);
      alert('Failed to generate design. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate design based on prompt (legacy function)
  const generateDesign = async (designPrompt) => {
    setIsGenerating(true);
    
    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Determine design type based on prompt
      let designType = 'abstract';
      const promptLower = designPrompt.toLowerCase();
      
      if (promptLower.includes('flower') || promptLower.includes('floral') || promptLower.includes('rose') || promptLower.includes('tulip')) {
        designType = 'flower';
      } else if (promptLower.includes('logo') || promptLower.includes('brand') || promptLower.includes('company')) {
        designType = 'logo';
      } else if (promptLower.includes('t-shirt') || promptLower.includes('shirt') || promptLower.includes('clothing')) {
        designType = 't-shirt';
      } else if (promptLower.includes('geometric') || promptLower.includes('shape') || promptLower.includes('star')) {
        designType = 'star';
      } else if (promptLower.includes('butterfly') || promptLower.includes('insect') || promptLower.includes('wing')) {
        designType = 'butterfly';
      } else if (promptLower.includes('heart') || promptLower.includes('love') || promptLower.includes('romantic')) {
        designType = 'heart';
      }
      
      // Use current specifications but override type
      const specs = { ...designSpecs, type: designType };
      const svgData = generateSVG(specs);
      
      const design = {
        id: `ai-generated-${Date.now()}`,
        type: 'image',
        src: svgData,
        x: 100,
        y: 100,
        width: sizeOptions.find(s => s.value === specs.size)?.width || 200,
        height: sizeOptions.find(s => s.value === specs.size)?.height || 200,
        opacity: 1,
        isAIGenerated: true,
        prompt: designPrompt,
        specifications: specs
      };
      
      // Add to canvas
      if (onAddElement) {
        onAddElement(design);
      }
      
      // Add to generated designs list
      setGeneratedDesigns(prev => [...prev, design]);
      
      return design;
      
    } catch (error) {
      console.error('Error generating design:', error);
      alert('Failed to generate design. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick generate buttons
  const quickGenerate = (prompt) => {
    setPrompt(prompt);
    generateDesign(prompt);
  };

  // Generate custom design
  const handleCustomGenerate = () => {
    if (prompt.trim()) {
      generateDesign(prompt);
    } else {
      alert('Please enter a design prompt');
    }
  };

  // Add text design
  const addTextDesign = (text, style = {}) => {
    const textDesign = {
      id: `ai-text-${Date.now()}`,
      type: 'text',
      text: text,
      x: 150,
      y: 150,
      fontSize: style.fontSize || 36,
      fontFamily: style.fontFamily || 'Arial Black',
      color: style.color || '#000000',
      bold: style.bold || false,
      italic: style.italic || false,
      underline: style.underline || false,
      isAIGenerated: true,
      prompt: `Text: ${text}`
    };
    
    if (onAddElement) {
      onAddElement(textDesign);
    }
    
    setGeneratedDesigns(prev => [...prev, textDesign]);
  };

  // Add shape design
  const addShapeDesign = (shapeType, style = {}) => {
    const shapeDesign = {
      id: `ai-shape-${Date.now()}`,
      type: 'shape',
      shapeType: shapeType,
      x: 100,
      y: 100,
      width: style.width || 150,
      height: style.height || 150,
      fillColor: style.fillColor || '#ff6b6b',
      strokeColor: style.strokeColor || '#ff4757',
      strokeWidth: style.strokeWidth || 2,
      isAIGenerated: true,
      prompt: `${shapeType} shape`
    };
    
    if (onAddElement) {
      onAddElement(shapeDesign);
    }
    
    setGeneratedDesigns(prev => [...prev, shapeDesign]);
  };

  // Update specifications
  const updateSpecs = (key, value) => {
    setDesignSpecs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update colors when style changes
  const handleStyleChange = (style) => {
    const selectedStyle = styleOptions.find(s => s.value === style);
    if (selectedStyle) {
      setDesignSpecs(prev => ({
        ...prev,
        style: style,
        colors: selectedStyle.colors
      }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FaMagic className="mr-2 text-purple-600" />
        AI Design Generator
      </h3>
      
      <div className="space-y-4">
        {/* Specifications Panel */}
        <div>
          <button
            onClick={() => setShowSpecifications(!showSpecifications)}
            className="w-full flex items-center justify-between p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <span className="font-medium flex items-center">
              <FaCog className="mr-2" />
              Design Specifications
            </span>
            <FaEye className={`transition-transform duration-200 ${showSpecifications ? 'rotate-180' : ''}`} />
          </button>
          
          {showSpecifications && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3 animate-slideDown">
              {/* Design Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Design Type:</label>
                <select
                  value={designSpecs.type}
                  onChange={(e) => updateSpecs('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {designTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size:</label>
                <select
                  value={designSpecs.size}
                  onChange={(e) => updateSpecs('size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {sizeOptions.map(size => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style:</label>
                <select
                  value={designSpecs.style}
                  onChange={(e) => handleStyleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {styleOptions.map(style => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Complexity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Complexity:</label>
                <select
                  value={designSpecs.complexity}
                  onChange={(e) => updateSpecs('complexity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {complexityOptions.map(complexity => (
                    <option key={complexity.value} value={complexity.value}>
                      {complexity.label} - {complexity.detail}
                    </option>
                  ))}
                </select>
              </div>

              {/* Colors Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Colors:</label>
                <div className="flex space-x-2">
                  {designSpecs.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Generate from Specifications */}
              <button
                onClick={generateDesignFromSpecs}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isGenerating ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaMagic className="mr-2" />
                )}
                Generate from Specifications
              </button>
            </div>
          )}
        </div>

        {/* Custom Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or describe your design:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., flower design, geometric logo, abstract art..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleCustomGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isGenerating ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaMagic className="mr-2" />
              )}
              Generate
            </button>
          </div>
        </div>

        {/* Quick Generate Buttons */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Generate:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => quickGenerate('flower design')}
              disabled={isGenerating}
              className="p-2 bg-pink-100 text-pink-700 rounded hover:bg-pink-200 transition-colors text-xs disabled:bg-gray-100 disabled:text-gray-400"
            >
              🌸 Flower Design
            </button>
            <button
              onClick={() => quickGenerate('butterfly design')}
              disabled={isGenerating}
              className="p-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-xs disabled:bg-gray-100 disabled:text-gray-400"
            >
              🦋 Butterfly
            </button>
            <button
              onClick={() => quickGenerate('heart design')}
              disabled={isGenerating}
              className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs disabled:bg-gray-100 disabled:text-gray-400"
            >
              ❤️ Heart Design
            </button>
            <button
              onClick={() => quickGenerate('geometric logo')}
              disabled={isGenerating}
              className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs disabled:bg-gray-100 disabled:text-gray-400"
            >
              🔷 Geometric Logo
            </button>
            <button
              onClick={() => quickGenerate('abstract art')}
              disabled={isGenerating}
              className="p-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors text-xs disabled:bg-gray-100 disabled:text-gray-400"
            >
              🎨 Abstract Art
            </button>
            <button
              onClick={() => quickGenerate('t-shirt design')}
              disabled={isGenerating}
              className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs disabled:bg-gray-100 disabled:text-gray-400"
            >
              👕 T-Shirt Design
            </button>
          </div>
        </div>

        {/* Text Designs */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Text Designs:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addTextDesign('LOVE', { fontSize: 48, color: '#ff6b6b', bold: true })}
              className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs"
            >
              ❤️ LOVE
            </button>
            <button
              onClick={() => addTextDesign('PEACE', { fontSize: 42, color: '#3742fa', bold: true })}
              className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
            >
              ☮️ PEACE
            </button>
            <button
              onClick={() => addTextDesign('FASHION', { fontSize: 36, color: '#ffa502', bold: true })}
              className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors text-xs"
            >
              👗 FASHION
            </button>
            <button
              onClick={() => addTextDesign('MUSIC', { fontSize: 40, color: '#2ed573', bold: true })}
              className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs"
            >
              🎵 MUSIC
            </button>
          </div>
        </div>

        {/* Shape Designs */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Shape Designs:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => addShapeDesign('circle', { fillColor: '#ff6b6b' })}
              className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs"
            >
              ⭕ Circle
            </button>
            <button
              onClick={() => addShapeDesign('star', { fillColor: '#ffa502' })}
              className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors text-xs"
            >
              ⭐ Star
            </button>
            <button
              onClick={() => addShapeDesign('heart', { fillColor: '#ff6b6b' })}
              className="p-2 bg-pink-100 text-pink-700 rounded hover:bg-pink-200 transition-colors text-xs"
            >
              ❤️ Heart
            </button>
            <button
              onClick={() => addShapeDesign('diamond', { fillColor: '#3742fa' })}
              className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
            >
              💎 Diamond
            </button>
            <button
              onClick={() => addShapeDesign('hexagon', { fillColor: '#2ed573' })}
              className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs"
            >
              ⬡ Hexagon
            </button>
            <button
              onClick={() => addShapeDesign('triangle', { fillColor: '#ff6348' })}
              className="p-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors text-xs"
            >
              🔺 Triangle
            </button>
          </div>
        </div>

        {/* Generated Designs History */}
        {generatedDesigns.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Recently Generated ({generatedDesigns.length}):
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {generatedDesigns.slice(-3).map((design) => (
                <div key={design.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <span className="truncate">
                    {design.prompt || `${design.type} design`}
                  </span>
                  <span className="text-gray-500">
                    {design.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
          <p className="mb-2"><strong>AI Design Generator:</strong></p>
          <ul className="space-y-1">
            <li>• Set detailed specifications for custom designs</li>
            <li>• Choose from multiple design types and styles</li>
            <li>• Control size, colors, complexity, and style</li>
            <li>• Generate designs based on text prompts</li>
            <li>• All designs are added directly to canvas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AICanvasIntegration; 