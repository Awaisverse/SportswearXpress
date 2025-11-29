import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, 
  FaSave, 
  FaDownload, 
  FaUndo, 
  FaRedo, 
  FaTrash, 
  FaPlus, 
  FaMinus,
  FaChevronDown,
  FaBold,
  FaItalic,
  FaUnderline,
  FaMousePointer
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { 
  calculateCustomizationPrice, 
  calculateTotalPrice, 
  getPrintQualityOptions,
  formatPrice 
} from '../services/pricingService';
import 'react-toastify/dist/ReactToastify.css';
import DesignChatbot from '../components/DesignChatbot/DesignChatbot';
import AICanvasIntegration from '../components/CanvaIntegration/AICanvasIntegration';

const Customization = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Canvas and design state
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Design elements state
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Library state
  const [textLibrary, setTextLibrary] = useState([]);
  const [shapeLibrary, setShapeLibrary] = useState([]);
  const [imageLibrary, setImageLibrary] = useState([]);
  const [showLibrariesPanel, setShowLibrariesPanel] = useState(false);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState(null);
  
  // Tool states
  const [activeTool, setActiveTool] = useState('select');
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [textUnderline, setTextUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [textOpacity, setTextOpacity] = useState(1);
  const [textShadow, setTextShadow] = useState(false);
  const [textShadowColor, setTextShadowColor] = useState('#000000');
  const [textShadowBlur, setTextShadowBlur] = useState(2);
  const [textShadowOffsetX, setTextShadowOffsetX] = useState(1);
  const [textShadowOffsetY, setTextShadowOffsetY] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  
  // UI states
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [showShapesPanel, setShowShapesPanel] = useState(false);
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  
  // Double-click drag state
  const [isDoubleClickDragging, setIsDoubleClickDragging] = useState(false);
  const [doubleClickDragStart, setDoubleClickDragStart] = useState({ x: 0, y: 0 });
  
  // Customization pricing
  const [customizationPrice, setCustomizationPrice] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [pricingBreakdown, setPricingBreakdown] = useState({
    totalPrice: 0,
    elementCount: 0,
    elementBreakdown: [],
    printQualitySummary: {}
  });

  // Available fonts
  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
    'Courier New', 'Impact', 'Comic Sans MS', 'Tahoma', 'Trebuchet MS',
    'Arial Black', 'Bookman Old Style', 'Century Gothic', 'Franklin Gothic Medium',
    'Garamond', 'Lucida Console', 'Lucida Sans Unicode', 'Palatino Linotype',
    'Webdings', 'Wingdings', 'MS Sans Serif', 'MS Serif'
  ];

  // Available shapes
  const shapes = [
    { name: 'Rectangle', type: 'rect', icon: '⬜' },
    { name: 'Circle', type: 'circle', icon: '⭕' },
    { name: 'Triangle', type: 'triangle', icon: '🔺' },
    { name: 'Line', type: 'line', icon: '➖' },
    { name: 'Star', type: 'star', icon: '⭐' },
    { name: 'Heart', type: 'heart', icon: '❤️' },
    { name: 'Diamond', type: 'diamond', icon: '💎' },
    { name: 'Hexagon', type: 'hexagon', icon: '⬡' },
    { name: 'Oval', type: 'oval', icon: '⬭' },
    { name: 'Arrow', type: 'arrow', icon: '➡️' },
    { name: 'Cross', type: 'cross', icon: '➕' },
    { name: 'Wave', type: 'wave', icon: '〰️' }
  ];

  // Shape properties
  const [shapeOpacity, setShapeOpacity] = useState(1);
  const [shapeShadow, setShapeShadow] = useState(false);
  const [shapeShadowColor, setShapeShadowColor] = useState('#000000');
  const [shapeShadowBlur, setShapeShadowBlur] = useState(2);
  const [shapeShadowOffsetX, setShapeShadowOffsetX] = useState(1);
  const [shapeShadowOffsetY, setShapeShadowOffsetY] = useState(1);
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [gradientType, setGradientType] = useState('linear');
  const [gradientStartColor, setGradientStartColor] = useState('#ffffff');
  const [gradientEndColor, setGradientEndColor] = useState('#000000');
  const [gradientAngle, setGradientAngle] = useState(0);
  
  // Shape text properties
  const [shapeText, setShapeText] = useState('');
  const [shapeTextColor, setShapeTextColor] = useState('#000000');
  const [shapeTextSize, setShapeTextSize] = useState(16);
  const [shapeTextFont, setShapeTextFont] = useState('Arial');
  const [shapeTextBold, setShapeTextBold] = useState(false);
  const [shapeTextItalic, setShapeTextItalic] = useState(false);
  const [shapeFillType, setShapeFillType] = useState('filled'); // 'filled' or 'transparent'

  // Image properties
  const [imageOpacity, setImageOpacity] = useState(1);
  const [imageBrightness, setImageBrightness] = useState(100);
  const [imageContrast, setImageContrast] = useState(100);
  const [imageSaturation, setImageSaturation] = useState(100);
  const [imageBlur, setImageBlur] = useState(0);
  const [imageSepia, setImageSepia] = useState(0);
  const [imageGrayscale, setImageGrayscale] = useState(0);
  const [imageHueRotate, setImageHueRotate] = useState(0);
  const [imageFlipHorizontal, setImageFlipHorizontal] = useState(false);
  const [imageFlipVertical, setImageFlipVertical] = useState(false);
  const [imageRotation, setImageRotation] = useState(0);

  // Print quality options
  const [printQualityOptions] = useState(getPrintQualityOptions());
  const [selectedPrintQuality, setSelectedPrintQuality] = useState('dtg');

  // Alignment guides state
  const [alignmentGuides, setAlignmentGuides] = useState({
    horizontal: [],
    vertical: []
  });
  const [showAlignmentGuides, setShowAlignmentGuides] = useState(true);
  const [showPricingSummary, setShowPricingSummary] = useState(false);

  // Canva integration state
  const [showCanvaPanel, setShowCanvaPanel] = useState(false);

  // Add AI-generated element to canvas
  const addAIElement = (aiElement) => {
    // Add unique ID if not present
    const elementWithId = {
      ...aiElement,
      id: aiElement.id || Date.now(),
      selected: false,
      printQuality: selectedPrintQuality
    };

    // Add to elements array
    setElements([...elements, elementWithId]);
    
    // Add to appropriate library based on type
    if (elementWithId.type === 'text') {
      const libraryItem = {
        elementId: elementWithId.id,
        text: elementWithId.text,
        fontSize: elementWithId.fontSize,
        fontFamily: elementWithId.fontFamily,
        color: elementWithId.color,
        bold: elementWithId.bold,
        italic: elementWithId.italic,
        underline: elementWithId.underline,
        printQuality: elementWithId.printQuality,
        width: elementWithId.width,
        height: elementWithId.height,
        createdAt: new Date()
      };
      setTextLibrary([...textLibrary, libraryItem]);
    } else if (elementWithId.type === 'shape') {
      const libraryItem = {
        elementId: elementWithId.id,
        shapeType: elementWithId.shapeType,
        fillColor: elementWithId.fillColor,
        strokeColor: elementWithId.strokeColor,
        strokeWidth: elementWithId.strokeWidth,
        width: elementWithId.width,
        height: elementWithId.height,
        hasText: elementWithId.hasText || false,
        shapeText: elementWithId.shapeText || '',
        printQuality: elementWithId.printQuality,
        createdAt: new Date()
      };
      setShapeLibrary([...shapeLibrary, libraryItem]);
    } else if (elementWithId.type === 'image') {
      const libraryItem = {
        elementId: elementWithId.id,
        name: `AI Generated ${elementWithId.prompt || 'Design'}`,
        src: elementWithId.src,
        width: elementWithId.width,
        height: elementWithId.height,
        printQuality: elementWithId.printQuality,
        createdAt: new Date()
      };
      setImageLibrary([...imageLibrary, libraryItem]);
    }

    // Redraw canvas with new element
    redrawCanvas();
    saveToHistory();
    updateCustomizationPrice();
    
    // Show success message
    toast.success(`AI-generated ${elementWithId.type} added to canvas!`);
  };

  useEffect(() => {
    fetchProduct();
    // Load libraries from localStorage
    const savedTextLibrary = localStorage.getItem('textLibrary');
    const savedShapeLibrary = localStorage.getItem('shapeLibrary');
    const savedImageLibrary = localStorage.getItem('imageLibrary');
    
    if (savedTextLibrary) {
      setTextLibrary(JSON.parse(savedTextLibrary));
    }
    if (savedShapeLibrary) {
      setShapeLibrary(JSON.parse(savedShapeLibrary));
    }
    if (savedImageLibrary) {
      setImageLibrary(JSON.parse(savedImageLibrary));
    }
  }, [productId]);

  // Restore canvas elements from libraries when canvas is initialized
  useEffect(() => {
    if (product && canvas && ctx) {
      // Only restore once when canvas is first initialized
      const hasRestored = localStorage.getItem('hasRestoredElements');
      if (!hasRestored) {
        restoreElementsFromLibraries();
        localStorage.setItem('hasRestoredElements', 'true');
      }
    }
  }, [product, canvas, ctx]);

  // Clear the restoration flag when component unmounts or product changes
  useEffect(() => {
    return () => {
      localStorage.removeItem('hasRestoredElements');
    };
  }, [productId]);

  const restoreElementsFromLibraries = () => {
    if (!canvas || !ctx) return;
    
    // Clear existing elements
    setElements([]);
    
    // Restore elements from libraries
    const restoredElements = [];
    
    // Restore text elements (excluding shape text which will be handled with shapes)
    textLibrary.forEach(libraryItem => {
      if (!libraryItem.isShapeText) { // Only restore standalone text elements
        const element = {
          id: libraryItem.elementId,
          type: 'text',
          text: libraryItem.text,
          x: 100 + Math.random() * 50, // Random position to avoid overlap
          y: 100 + Math.random() * 50,
          fontSize: libraryItem.fontSize,
          fontFamily: libraryItem.fontFamily,
          color: libraryItem.color,
          bold: libraryItem.bold,
          italic: libraryItem.italic,
          underline: libraryItem.underline,
          printQuality: libraryItem.printQuality,
          width: libraryItem.width,
          height: libraryItem.height,
          selected: false
        };
        restoredElements.push(element);
      }
    });
    
    // Restore shape elements (including their text)
    shapeLibrary.forEach(libraryItem => {
      const element = {
        id: libraryItem.elementId,
        type: 'shape',
        shapeType: libraryItem.shapeType,
        x: 150 + Math.random() * 50,
        y: 150 + Math.random() * 50,
        width: libraryItem.width || 100,
        height: libraryItem.height || 100,
        fillColor: libraryItem.fillColor,
        strokeColor: libraryItem.strokeColor,
        strokeWidth: libraryItem.strokeWidth,
        opacity: libraryItem.opacity,
        fillType: libraryItem.fillType || 'filled',
        printQuality: libraryItem.printQuality,
        // Shape text properties
        hasText: libraryItem.hasText || false,
        shapeText: libraryItem.shapeText || '',
        shapeTextColor: libraryItem.shapeTextColor || '#000000',
        shapeTextSize: libraryItem.shapeTextSize || 16,
        shapeTextFont: libraryItem.shapeTextFont || 'Arial',
        shapeTextBold: libraryItem.shapeTextBold || false,
        shapeTextItalic: libraryItem.shapeTextItalic || false,
        selected: false
      };
      restoredElements.push(element);
    });
    
    // Restore image elements
    imageLibrary.forEach(libraryItem => {
      const element = {
        id: libraryItem.elementId,
        type: 'image',
        src: libraryItem.src,
        x: 200 + Math.random() * 50,
        y: 200 + Math.random() * 50,
        width: libraryItem.width || 100,
        height: libraryItem.height || 100,
        printQuality: libraryItem.printQuality,
        selected: false
      };
      restoredElements.push(element);
    });
    
    setElements(restoredElements);
    
    // Redraw canvas with restored elements
    setTimeout(() => {
      redrawCanvas();
      updateCustomizationPrice();
    }, 100);
  };

  useEffect(() => {
    if (product && canvasRef.current) {
      initializeCanvas();
    }
  }, [product]);

  // Global mouse up handler for drag operations
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        saveToHistory();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Save libraries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('textLibrary', JSON.stringify(textLibrary));
  }, [textLibrary]);

  useEffect(() => {
    localStorage.setItem('shapeLibrary', JSON.stringify(shapeLibrary));
  }, [shapeLibrary]);

  useEffect(() => {
    localStorage.setItem('imageLibrary', JSON.stringify(imageLibrary));
  }, [imageLibrary]);

  // Update pricing whenever elements change
  useEffect(() => {
    const previousPrice = customizationPrice;
    updateCustomizationPrice();
    
    // Show notification if price changed significantly
    if (Math.abs(customizationPrice - previousPrice) > 0.01 && previousPrice > 0) {
      const priceChange = customizationPrice - previousPrice;
      const changeText = priceChange > 0 ? `+$${priceChange.toFixed(2)}` : `-$${Math.abs(priceChange).toFixed(2)}`;
      toast.info(`Price updated: ${changeText}`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [elements, textLibrary, shapeLibrary, imageLibrary]);

  // Handle clicking outside pricing summary dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPricingSummary && !event.target.closest('.pricing-summary-container')) {
        setShowPricingSummary(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPricingSummary]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Delete key to delete selected element
      if (event.key === 'Delete' && selectedElement) {
        event.preventDefault();
        deleteSelectedElement();
      }
      
      // Ctrl+Z for undo
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        undo();
      }
      
      // Ctrl+Y for redo
      if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement]);

  const fetchProduct = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/v1/products/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.product);
        setBasePrice(data.product.price);
        setCustomizationPrice(data.product.price);
      } else {
        toast.error('Failed to fetch product');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to fetch product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const initializeCanvas = () => {
    const canvasElement = canvasRef.current;
    const context = canvasElement.getContext('2d');
    
    // Set canvas size
    canvasElement.width = 800;
    canvasElement.height = 600;
    
    setCanvas(canvasElement);
    setCtx(context);
    
    // Load product image
    if (product && product.images && product.images[0]) {
      const img = new Image();
      img.onload = () => {
        // Calculate aspect ratio to fit image properly
        const maxWidth = 800;
        const maxHeight = 600;
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;
        
        // Center the image
        const x = (800 - width) / 2;
        const y = (600 - height) / 2;
        
        context.drawImage(img, x, y, width, height);
        
        // Save initial state
        saveToHistory();
      };
      img.src = product.images[0];
    }
  };

  const saveToHistory = () => {
    if (canvas) {
      const imageData = canvas.toDataURL();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      loadFromHistory(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      loadFromHistory(newIndex);
    }
  };

  const loadFromHistory = (index) => {
    if (history[index] && canvas) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[index];
    }
  };

  const addText = () => {
    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }

    const newElement = {
      id: Date.now(),
      type: 'text',
      text: text,
      x: 100,
      y: 100,
      fontSize: fontSize,
      fontFamily: fontFamily,
      color: textColor,
      bold: textBold,
      italic: textItalic,
      underline: textUnderline,
      align: textAlign,
      opacity: textOpacity,
      shadow: textShadow,
      shadowColor: textShadowColor,
      shadowBlur: textShadowBlur,
      shadowOffsetX: textShadowOffsetX,
      shadowOffsetY: textShadowOffsetY,
      printQuality: selectedPrintQuality,
      selected: false
    };

    // Calculate text dimensions for pricing - always calculate actual text width
    let textWidth, textHeight;
    if (ctx) {
      ctx.font = `${textBold ? 'bold ' : ''}${textItalic ? 'italic ' : ''}${fontSize}px ${fontFamily}`;
      const metrics = ctx.measureText(text);
      textWidth = metrics.width;
      textHeight = fontSize;
    } else {
      // Fallback dimensions - more accurate calculation
      const avgCharWidth = fontSize * 0.6; // Average character width
      textWidth = text.length * avgCharWidth;
      textHeight = fontSize;
    }
    
    newElement.width = textWidth;
    newElement.height = textHeight;

    // Add to elements array
    setElements([...elements, newElement]);
    
    // Add to text library
    const libraryItem = {
      elementId: newElement.id,
      text: newElement.text,
      fontSize: newElement.fontSize,
      fontFamily: newElement.fontFamily,
      color: newElement.color,
      bold: newElement.bold,
      italic: newElement.italic,
      underline: newElement.underline,
      printQuality: newElement.printQuality,
      width: newElement.width,
      height: newElement.height,
      createdAt: new Date()
    };
    setTextLibrary([...textLibrary, libraryItem]);
    
    drawText(newElement);
    setText('');
    setShowTextPanel(false);
    saveToHistory();
    updateCustomizationPrice();
  };

  const drawText = (element) => {
    if (!ctx) return;
    
    // Save context state
    ctx.save();
    
    // Set text alignment
    ctx.textAlign = element.align || 'left';
    
    // Set global alpha for opacity
    ctx.globalAlpha = element.opacity || 1;
    
    // Build font string
    let fontStyle = '';
    if (element.italic) fontStyle += 'italic ';
    if (element.bold) fontStyle += 'bold ';
    fontStyle += `${element.fontSize}px ${element.fontFamily}`;
    ctx.font = fontStyle;
    
    // Set text color
    ctx.fillStyle = element.color;
    
    // Set shadow if enabled
    if (element.shadow) {
      ctx.shadowColor = element.shadowColor || '#000000';
      ctx.shadowBlur = element.shadowBlur || 2;
      ctx.shadowOffsetX = element.shadowOffsetX || 1;
      ctx.shadowOffsetY = element.shadowOffsetY || 1;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // Draw the text
    ctx.fillText(element.text, element.x, element.y);
    
    // Draw underline if enabled
    if (element.underline) {
      const metrics = ctx.measureText(element.text);
      const textWidth = metrics.width;
      const underlineY = element.y + 2;
      
      ctx.strokeStyle = element.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(element.x, underlineY);
      ctx.lineTo(element.x + textWidth, underlineY);
      ctx.stroke();
    }
    
    // Draw selection indicator if element is selected
    if (element.selected) {
      // Reset shadow for selection box
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        element.x - 2, 
        element.y - 2, 
        element.width + 4, 
        element.height + 4
      );
      ctx.setLineDash([]);
      
      // Draw resize handles
      const handleSize = 6;
      const handles = [
        { x: element.x - 2, y: element.y - 2 }, // nw
        { x: element.x + element.width / 2, y: element.y - 2 }, // n
        { x: element.x + element.width + 2, y: element.y - 2 }, // ne
        { x: element.x - 2, y: element.y + element.height / 2 }, // w
        { x: element.x + element.width + 2, y: element.y + element.height / 2 }, // e
        { x: element.x - 2, y: element.y + element.height + 2 }, // sw
        { x: element.x + element.width / 2, y: element.y + element.height + 2 }, // s
        { x: element.x + element.width + 2, y: element.y + element.height + 2 } // se
      ];
      
      ctx.fillStyle = '#3B82F6';
      handles.forEach(handle => {
        ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
      });
    }
    
    // Restore context state
    ctx.restore();
  };

  const addShape = (shapeType) => {
    const newElement = {
      id: Date.now(),
      type: 'shape',
      shapeType: shapeType,
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      fillColor: backgroundColor,
      strokeColor: strokeColor,
      strokeWidth: strokeWidth,
      opacity: shapeOpacity,
      fillType: shapeFillType,
      shadow: shapeShadow,
      shadowColor: shapeShadowColor,
      shadowBlur: shapeShadowBlur,
      shadowOffsetX: shapeShadowOffsetX,
      shadowOffsetY: shapeShadowOffsetY,
      gradientEnabled: gradientEnabled,
      gradientType: gradientType,
      gradientStartColor: gradientStartColor,
      gradientEndColor: gradientEndColor,
      gradientAngle: gradientAngle,
      printQuality: selectedPrintQuality,
      // Shape text properties
      hasText: shapeText.trim() !== '',
      shapeText: shapeText,
      shapeTextColor: shapeTextColor,
      shapeTextSize: shapeTextSize,
      shapeTextFont: shapeTextFont,
      shapeTextBold: shapeTextBold,
      shapeTextItalic: shapeTextItalic,
      selected: false
    };

    // Add to elements array
    setElements([...elements, newElement]);
    
    // Add to shape library
    const libraryItem = {
      elementId: newElement.id,
      shapeType: newElement.shapeType,
      fillColor: newElement.fillColor,
      strokeColor: newElement.strokeColor,
      strokeWidth: newElement.strokeWidth,
      opacity: newElement.opacity,
      fillType: newElement.fillType,
      printQuality: newElement.printQuality,
      width: newElement.width,
      height: newElement.height,
      // Shape text properties
      hasText: newElement.hasText,
      shapeText: newElement.shapeText,
      shapeTextColor: newElement.shapeTextColor,
      shapeTextSize: newElement.shapeTextSize,
      shapeTextFont: newElement.shapeTextFont,
      shapeTextBold: newElement.shapeTextBold,
      shapeTextItalic: newElement.shapeTextItalic,
      createdAt: new Date()
    };
    setShapeLibrary([...shapeLibrary, libraryItem]);
    
    // If shape has text, also add to text library separately with a unique ID
    if (shapeText.trim() !== '') {
      const textLibraryItem = {
        elementId: Date.now() + '_shape_text', // Unique ID for shape text
        text: shapeText,
        fontSize: shapeTextSize,
        fontFamily: shapeTextFont,
        color: shapeTextColor,
        bold: shapeTextBold,
        italic: shapeTextItalic,
        underline: false,
        printQuality: selectedPrintQuality,
        width: shapeText.length * shapeTextSize * 0.6,
        height: shapeTextSize,
        isShapeText: true, // Flag to identify this as shape text
        parentShapeId: newElement.id, // Reference to parent shape
        createdAt: new Date()
      };
      setTextLibrary([...textLibrary, textLibraryItem]);
    }
    
    drawShape(newElement);
    setShowShapesPanel(false);
    saveToHistory();
    updateCustomizationPrice();
    
    // Clear shape text after adding
    setShapeText('');
  };

  const drawShape = (element) => {
    if (!ctx) return;
    
    // Save context state
    ctx.save();
    
    // Set global alpha for opacity
    ctx.globalAlpha = element.opacity || 1;
    
    // Set shadow if enabled
    if (element.shadow) {
      ctx.shadowColor = element.shadowColor || '#000000';
      ctx.shadowBlur = element.shadowBlur || 2;
      ctx.shadowOffsetX = element.shadowOffsetX || 1;
      ctx.shadowOffsetY = element.shadowOffsetY || 1;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // Create gradient if enabled
    let fillStyle = element.fillColor;
    if (element.gradientEnabled) {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      const radius = Math.max(element.width, element.height) / 2;
      
      if (element.gradientType === 'radial') {
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radius
        );
        gradient.addColorStop(0, element.gradientStartColor);
        gradient.addColorStop(1, element.gradientEndColor);
        fillStyle = gradient;
      } else {
        const angle = (element.gradientAngle || 0) * Math.PI / 180;
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX - Math.cos(angle) * radius;
        const y2 = centerY - Math.sin(angle) * radius;
        
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, element.gradientStartColor);
        gradient.addColorStop(1, element.gradientEndColor);
        fillStyle = gradient;
      }
    }
    
    ctx.beginPath();
    ctx.strokeStyle = element.strokeColor;
    ctx.lineWidth = element.strokeWidth;
    
    // Set fill style based on fill type
    if (element.fillType === 'transparent') {
      ctx.fillStyle = 'transparent';
    } else {
      ctx.fillStyle = fillStyle;
    }
    
    switch (element.shapeType) {
      case 'rect':
        ctx.rect(element.x, element.y, element.width, element.height);
        break;
      case 'circle':
        ctx.arc(element.x + element.width/2, element.y + element.height/2, element.width/2, 0, 2 * Math.PI);
        break;
      case 'triangle':
        ctx.moveTo(element.x + element.width/2, element.y);
        ctx.lineTo(element.x, element.y + element.height);
        ctx.lineTo(element.x + element.width, element.y + element.height);
        ctx.closePath();
        break;
      case 'line':
        ctx.moveTo(element.x, element.y);
        ctx.lineTo(element.x + element.width, element.y + element.height);
        break;
      case 'star':
        drawStar(ctx, element.x + element.width/2, element.y + element.height/2, 5, element.width/2, element.width/4);
        break;
      case 'heart':
        drawHeart(ctx, element.x + element.width/2, element.y + element.height/2, element.width/2);
        break;
      case 'diamond':
        ctx.moveTo(element.x + element.width/2, element.y);
        ctx.lineTo(element.x + element.width, element.y + element.height/2);
        ctx.lineTo(element.x + element.width/2, element.y + element.height);
        ctx.lineTo(element.x, element.y + element.height/2);
        ctx.closePath();
        break;
      case 'hexagon':
        drawHexagon(ctx, element.x + element.width/2, element.y + element.height/2, element.width/2);
        break;
      case 'oval':
        ctx.ellipse(element.x + element.width/2, element.y + element.height/2, element.width/2, element.height/2, 0, 0, 2 * Math.PI);
        break;
      case 'arrow':
        drawArrow(ctx, element.x, element.y, element.x + element.width, element.y + element.height, element.strokeWidth);
        break;
      case 'cross':
        const centerX = element.x + element.width/2;
        const centerY = element.y + element.height/2;
        const size = Math.min(element.width, element.height) / 2;
        ctx.moveTo(centerX - size, centerY);
        ctx.lineTo(centerX + size, centerY);
        ctx.moveTo(centerX, centerY - size);
        ctx.lineTo(centerX, centerY + size);
        break;
      case 'wave':
        drawWave(ctx, element.x, element.y, element.width, element.height);
        break;
      default:
        ctx.restore();
        return;
    }
    
    // Fill and stroke the shape
    if (element.fillType !== 'transparent') {
    ctx.fill();
    }
    ctx.stroke();
    
    // Draw text within shape if it has text
    if (element.hasText && element.shapeText) {
      // Reset shadow for text
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Set text properties
      let fontStyle = '';
      if (element.shapeTextItalic) fontStyle += 'italic ';
      if (element.shapeTextBold) fontStyle += 'bold ';
      fontStyle += `${element.shapeTextSize}px ${element.shapeTextFont}`;
      ctx.font = fontStyle;
      ctx.fillStyle = element.shapeTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Calculate text position (center of shape)
      const textX = element.x + element.width / 2;
      const textY = element.y + element.height / 2;
      
      // Draw the text
      ctx.fillText(element.shapeText, textX, textY);
    }
    
    // Draw selection indicator if element is selected
    if (element.selected) {
      // Reset shadow for selection box
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        element.x - 2, 
        element.y - 2, 
        element.width + 4, 
        element.height + 4
      );
      ctx.setLineDash([]);
      
      // Draw resize handles
      const handleSize = 6;
      const handles = [
        { x: element.x - 2, y: element.y - 2 }, // nw
        { x: element.x + element.width / 2, y: element.y - 2 }, // n
        { x: element.x + element.width + 2, y: element.y - 2 }, // ne
        { x: element.x - 2, y: element.y + element.height / 2 }, // w
        { x: element.x + element.width + 2, y: element.y + element.height / 2 }, // e
        { x: element.x - 2, y: element.y + element.height + 2 }, // sw
        { x: element.x + element.width / 2, y: element.y + element.height + 2 }, // s
        { x: element.x + element.width + 2, y: element.y + element.height + 2 } // se
      ];
      
      ctx.fillStyle = '#3B82F6';
      handles.forEach(handle => {
        ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
      });
    }
    
    // Restore context state
    ctx.restore();
  };

  // Helper functions for drawing complex shapes
  const drawStar = (ctx, centerX, centerY, points, outerRadius, innerRadius) => {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
  };

  const drawHeart = (ctx, centerX, centerY, size) => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + size * 0.3);
    ctx.bezierCurveTo(
      centerX, centerY, 
      centerX - size, centerY, 
      centerX - size, centerY + size * 0.3
    );
    ctx.bezierCurveTo(
      centerX - size, centerY + size * 0.6, 
      centerX, centerY + size * 0.8, 
      centerX, centerY + size * 0.8
    );
    ctx.bezierCurveTo(
      centerX, centerY + size * 0.8, 
      centerX + size, centerY + size * 0.6, 
      centerX + size, centerY + size * 0.3
    );
    ctx.bezierCurveTo(
      centerX + size, centerY, 
      centerX, centerY, 
      centerX, centerY + size * 0.3
    );
  };

  const drawHexagon = (ctx, centerX, centerY, radius) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
  };

  const drawArrow = (ctx, x1, y1, x2, y2, lineWidth) => {
    const headLength = lineWidth * 3;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    
    ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
  };

  const drawWave = (ctx, x, y, width, height) => {
    const frequency = 0.02;
    const amplitude = height / 4;
    
    ctx.beginPath();
    ctx.moveTo(x, y + height / 2);
    
    for (let i = 0; i <= width; i += 2) {
      const waveY = y + height / 2 + Math.sin(i * frequency) * amplitude;
      ctx.lineTo(x + i, waveY);
    }
  };

  const addImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newElement = {
          id: Date.now(),
          type: 'image',
          src: e.target.result,
          x: 200,
          y: 200,
          width: img.width,
          height: img.height,
          opacity: imageOpacity,
          brightness: imageBrightness,
          contrast: imageContrast,
          saturation: imageSaturation,
          blur: imageBlur,
          sepia: imageSepia,
          grayscale: imageGrayscale,
          hueRotate: imageHueRotate,
          flipHorizontal: imageFlipHorizontal,
          flipVertical: imageFlipVertical,
          rotation: imageRotation,
          printQuality: selectedPrintQuality,
          selected: false
        };

        // Add to elements array
        setElements([...elements, newElement]);
        
        // Add to image library
        const libraryItem = {
          elementId: newElement.id,
          src: newElement.src,
          name: file.name || `Image_${Date.now()}`,
          printQuality: newElement.printQuality,
          width: newElement.width,
          height: newElement.height,
          createdAt: new Date()
        };
        setImageLibrary([...imageLibrary, libraryItem]);
        
        drawImage(newElement);
        saveToHistory();
        updateCustomizationPrice();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const drawImage = (element) => {
    if (!ctx) return;
    
    // Save context state
    ctx.save();
    
    // Set global alpha for opacity
    ctx.globalAlpha = element.opacity || 1;
    
    // Apply transformations
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    
    ctx.translate(centerX, centerY);
    
    // Apply rotation
    if (element.rotation) {
      ctx.rotate((element.rotation * Math.PI) / 180);
    }
    
    // Apply flip transformations
    const scaleX = element.flipHorizontal ? -1 : 1;
    const scaleY = element.flipVertical ? -1 : 1;
    ctx.scale(scaleX, scaleY);
    
    // Translate back to draw at correct position
    ctx.translate(-centerX, -centerY);
    
    // Apply CSS filters using canvas operations
    if (element.brightness !== 100 || element.contrast !== 100 || element.saturation !== 100 || 
        element.blur > 0 || element.sepia > 0 || element.grayscale > 0 || element.hueRotate !== 0) {
      
      // Create a temporary canvas for applying filters
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = element.width;
      tempCanvas.height = element.height;
      
      // Draw image to temp canvas
      const img = new Image();
      img.onload = () => {
        tempCtx.drawImage(img, 0, 0, element.width, element.height);
        
        // Apply brightness and contrast
        if (element.brightness !== 100 || element.contrast !== 100) {
          const imageData = tempCtx.getImageData(0, 0, element.width, element.height);
          const data = imageData.data;
          const brightness = element.brightness / 100;
          const contrast = element.contrast / 100;
          
          for (let i = 0; i < data.length; i += 4) {
            data[i] = ((data[i] / 255 - 0.5) * contrast + 0.5) * 255 * brightness;
            data[i + 1] = ((data[i + 1] / 255 - 0.5) * contrast + 0.5) * 255 * brightness;
            data[i + 2] = ((data[i + 2] / 255 - 0.5) * contrast + 0.5) * 255 * brightness;
          }
          tempCtx.putImageData(imageData, 0, 0);
        }
        
        // Apply grayscale
        if (element.grayscale > 0) {
          const imageData = tempCtx.getImageData(0, 0, element.width, element.height);
          const data = imageData.data;
          const factor = element.grayscale / 100;
          
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = data[i] * (1 - factor) + gray * factor;
            data[i + 1] = data[i + 1] * (1 - factor) + gray * factor;
            data[i + 2] = data[i + 2] * (1 - factor) + gray * factor;
          }
          tempCtx.putImageData(imageData, 0, 0);
        }
        
        // Apply sepia
        if (element.sepia > 0) {
          const imageData = tempCtx.getImageData(0, 0, element.width, element.height);
          const data = imageData.data;
          const factor = element.sepia / 100;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const tr = (r * 0.393) + (g * 0.769) + (b * 0.189);
            const tg = (r * 0.349) + (g * 0.686) + (b * 0.168);
            const tb = (r * 0.272) + (g * 0.534) + (b * 0.131);
            
            data[i] = r * (1 - factor) + tr * factor;
            data[i + 1] = g * (1 - factor) + tg * factor;
            data[i + 2] = b * (1 - factor) + tb * factor;
          }
          tempCtx.putImageData(imageData, 0, 0);
        }
        
        // Draw the processed image to main canvas
        ctx.drawImage(tempCanvas, element.x, element.y, element.width, element.height);
        
        // Draw selection indicator if element is selected
        if (element.selected) {
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(
            element.x - 2, 
            element.y - 2, 
            element.width + 4, 
            element.height + 4
          );
          ctx.setLineDash([]);
          
          // Draw resize handles
          const handleSize = 6;
          const handles = [
            { x: element.x - 2, y: element.y - 2 }, // nw
            { x: element.x + element.width / 2, y: element.y - 2 }, // n
            { x: element.x + element.width + 2, y: element.y - 2 }, // ne
            { x: element.x - 2, y: element.y + element.height / 2 }, // w
            { x: element.x + element.width + 2, y: element.y + element.height / 2 }, // e
            { x: element.x - 2, y: element.y + element.height + 2 }, // sw
            { x: element.x + element.width / 2, y: element.y + element.height + 2 }, // s
            { x: element.x + element.width + 2, y: element.y + element.height + 2 } // se
          ];
          
          ctx.fillStyle = '#3B82F6';
          handles.forEach(handle => {
            ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
          });
        }
      };
      img.src = element.src;
    } else {
      // Draw image without filters
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, element.x, element.y, element.width, element.height);
        
        // Draw selection indicator if element is selected
        if (element.selected) {
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(
            element.x - 2, 
            element.y - 2, 
            element.width + 4, 
            element.height + 4
          );
          ctx.setLineDash([]);
          
          // Draw resize handles
          const handleSize = 6;
          const handles = [
            { x: element.x - 2, y: element.y - 2 }, // nw
            { x: element.x + element.width / 2, y: element.y - 2 }, // n
            { x: element.x + element.width + 2, y: element.y - 2 }, // ne
            { x: element.x - 2, y: element.y + element.height / 2 }, // w
            { x: element.x + element.width + 2, y: element.y + element.height / 2 }, // e
            { x: element.x - 2, y: element.y + element.height + 2 }, // sw
            { x: element.x + element.width / 2, y: element.y + element.height + 2 }, // s
            { x: element.x + element.width + 2, y: element.y + element.height + 2 } // se
          ];
          
          ctx.fillStyle = '#3B82F6';
          handles.forEach(handle => {
            ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
          });
        }
      };
      img.src = element.src;
    }
    
    // Restore context state
    ctx.restore();
  };

  const selectElement = (x, y) => {
    // Find element at position (check in reverse order to select top-most element)
    let selectedElement = null;
    
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      let isHit = false;
      
      if (element.type === 'text') {
        // For text, we need to measure the text bounds
        ctx.font = `${element.fontSize}px ${element.fontFamily}`;
        const metrics = ctx.measureText(element.text);
        const textWidth = metrics.width;
        const textHeight = element.fontSize;
        
        isHit = x >= element.x && x <= element.x + textWidth &&
                y >= element.y - textHeight && y <= element.y;
      } else if (element.type === 'shape') {
        isHit = x >= element.x && x <= element.x + element.width &&
                y >= element.y && y <= element.y + element.height;
      } else if (element.type === 'image') {
        isHit = x >= element.x && x <= element.x + element.width &&
                y >= element.y && y <= element.y + element.height;
      }
      
      if (isHit) {
        selectedElement = element;
        break;
      }
    }
    
    setSelectedElement(selectedElement);
    setElements(elements.map(el => ({ ...el, selected: el.id === selectedElement?.id })));
    
    // Calculate alignment guides for selected element
    calculateAlignmentGuides(selectedElement, elements);
  };

  const handleMouseDown = (event) => {
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    
    // Handle middle mouse button or space + left click for panning
    if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
      return;
    }
    
    // Check if clicking on a resize handle of selected element
    if (selectedElement) {
      const handle = getResizeHandle(x, y, selectedElement);
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle);
        setResizeStart({ x, y });
        setResizeStartSize({ 
          width: selectedElement.width || 0, 
          height: selectedElement.height || 0 
        });
        return;
      }
    }
    
    // Check if clicking on an element
    const clickedElement = elements.find(el => {
      if (el.type === 'text') {
        ctx.font = `${el.fontSize}px ${el.fontFamily}`;
        const metrics = ctx.measureText(el.text);
        const textWidth = metrics.width;
        const textHeight = el.fontSize;
        
        return x >= el.x && x <= el.x + textWidth &&
               y >= el.y - textHeight && y <= el.y;
      } else {
        return x >= el.x && x <= el.x + (el.width || 0) &&
               y >= el.y && y <= el.y + (el.height || 0);
      }
    });
    
    if (clickedElement) {
      setSelectedElement(clickedElement);
      setElements(elements.map(el => ({ ...el, selected: el.id === clickedElement.id })));
      
      // Only start dragging if double-click dragging is enabled for this element
      if (isDoubleClickDragging && clickedElement.id === selectedElement?.id) {
        setIsDragging(true);
        setDragStart({ x, y });
        setDragOffset({ 
          x: x - clickedElement.x, 
          y: y - clickedElement.y 
        });
      }
    } else {
      // Clicked on empty space, deselect and disable double-click dragging
      setSelectedElement(null);
      setElements(elements.map(el => ({ ...el, selected: false })));
      setIsDoubleClickDragging(false);
      
      // Clear alignment guides
      setAlignmentGuides({ horizontal: [], vertical: [] });
    }
  };

  const handleMouseMove = (event) => {
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    
    // Handle panning
    if (isPanning) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: event.clientX, y: event.clientY });
      return;
    }
    
    // Handle resizing
    if (isResizing && selectedElement && resizeHandle) {
      const deltaX = x - resizeStart.x;
      const deltaY = y - resizeStart.y;
      
      let newWidth = resizeStartSize.width;
      let newHeight = resizeStartSize.height;
      let newX = selectedElement.x;
      let newY = selectedElement.y;
      
      // Calculate new size and position based on resize handle
      switch (resizeHandle) {
        case 'nw':
          newWidth = Math.max(20, resizeStartSize.width - deltaX);
          newHeight = Math.max(20, resizeStartSize.height - deltaY);
          newX = selectedElement.x + resizeStartSize.width - newWidth;
          newY = selectedElement.y + resizeStartSize.height - newHeight;
          break;
        case 'n':
          newHeight = Math.max(20, resizeStartSize.height - deltaY);
          newY = selectedElement.y + resizeStartSize.height - newHeight;
          break;
        case 'ne':
          newWidth = Math.max(20, resizeStartSize.width + deltaX);
          newHeight = Math.max(20, resizeStartSize.height - deltaY);
          newY = selectedElement.y + resizeStartSize.height - newHeight;
          break;
        case 'w':
          newWidth = Math.max(20, resizeStartSize.width - deltaX);
          newX = selectedElement.x + resizeStartSize.width - newWidth;
          break;
        case 'e':
          newWidth = Math.max(20, resizeStartSize.width + deltaX);
          break;
        case 'sw':
          newWidth = Math.max(20, resizeStartSize.width - deltaX);
          newHeight = Math.max(20, resizeStartSize.height + deltaY);
          newX = selectedElement.x + resizeStartSize.width - newWidth;
          break;
        case 's':
          newHeight = Math.max(20, resizeStartSize.height + deltaY);
          break;
        case 'se':
          newWidth = Math.max(20, resizeStartSize.width + deltaX);
          newHeight = Math.max(20, resizeStartSize.height + deltaY);
          break;
      }
      
      // Keep element within canvas bounds
      newX = Math.max(0, Math.min(canvas.width - newWidth, newX));
      newY = Math.max(0, Math.min(canvas.height - newHeight, newY));
      
      const updatedElement = { 
        ...selectedElement, 
        x: newX, 
        y: newY, 
        width: newWidth, 
        height: newHeight 
      };
      
      setSelectedElement(updatedElement);
      setElements(elements.map(el => 
        el.id === selectedElement.id ? updatedElement : el
      ));
      
      redrawCanvas();
      return;
    }
    
    // Handle dragging
    if (isDragging && selectedElement) {
      // Update element position
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      
      // Keep element within canvas bounds
      const clampedX = Math.max(0, Math.min(canvas.width - (selectedElement.width || 0), newX));
      const clampedY = Math.max(selectedElement.fontSize || 0, Math.min(canvas.height, newY));
      
      const updatedElement = { ...selectedElement, x: clampedX, y: clampedY };
      setSelectedElement(updatedElement);
      
      // Update elements array
      setElements(elements.map(el => 
        el.id === selectedElement.id ? updatedElement : el
      ));
      
      // Calculate alignment guides
      calculateAlignmentGuides(updatedElement, elements);
      
      // Redraw canvas with new position
      redrawCanvas();
      return;
    }
    
    // Handle hover detection
    const hoveredElement = elements.find(el => {
      if (el.type === 'text') {
        ctx.font = `${el.fontSize}px ${el.fontFamily}`;
        const metrics = ctx.measureText(el.text);
        const textWidth = metrics.width;
        const textHeight = el.fontSize;
        
        return x >= el.x && x <= el.x + textWidth &&
               y >= el.y - textHeight && y <= el.y;
      } else {
        return x >= el.x && x <= el.x + (el.width || 0) &&
               y >= el.y && y <= el.y + (el.height || 0);
      }
    });
    
    setHoveredElement(hoveredElement);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      saveToHistory();
    }
    if (isPanning) {
      setIsPanning(false);
    }
    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      saveToHistory();
    }
  };

  // Handle wheel zoom
  const handleWheel = (event) => {
    // Prevent zoom on trackpad gestures (2-finger drag)
    if (event.deltaMode === 1) { // Line scroll
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(3, zoom * delta));
      setZoom(newZoom);
    } else if (Math.abs(event.deltaY) > 10) { // Only zoom on significant wheel movement
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(3, zoom * delta));
      setZoom(newZoom);
    }
  };

  // Reset view to default
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const deleteSelectedElement = () => {
    if (selectedElement) {
      const updatedElements = elements.filter(el => el.id !== selectedElement.id);
      setElements(updatedElements);
      
      // Also remove from appropriate library
      switch (selectedElement.type) {
                case 'text':
          setTextLibrary(prevLibrary => prevLibrary.filter(item => item.elementId !== selectedElement.id));
                  break;
                case 'shape':
          setShapeLibrary(prevLibrary => prevLibrary.filter(item => item.elementId !== selectedElement.id));
          // Also remove any associated shape text from text library
          setTextLibrary(prevLibrary => prevLibrary.filter(item => item.parentShapeId !== selectedElement.id));
                  break;
                case 'image':
          setImageLibrary(prevLibrary => prevLibrary.filter(item => item.elementId !== selectedElement.id));
                  break;
              }
      
      setSelectedElement(null);
      
      // Clear alignment guides
      setAlignmentGuides({ horizontal: [], vertical: [] });
      
      // Redraw canvas with the updated elements array
      setTimeout(() => {
        redrawCanvas();
      }, 10);
      
      saveToHistory();
      updateCustomizationPrice();
      toast.success(`${selectedElement.type} element removed from canvas and library`);
    }
  };

  const redrawCanvas = () => {
    if (!ctx || !canvas) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw product image
    if (product && product.images && product.images[0]) {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 600;
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;
        const x = (800 - width) / 2;
        const y = (600 - height) / 2;
        ctx.drawImage(img, x, y, width, height);
        
        // Redraw all elements
        elements.forEach(element => {
          switch (element.type) {
            case 'text':
              drawText(element);
              break;
            case 'shape':
              drawShape(element);
              break;
            case 'image':
              drawImage(element);
              break;
          }
        });
        
        // Draw alignment guides
        drawAlignmentGuides();
      };
      img.src = product.images[0];
    }
  };

  // Draw alignment guides
  const drawAlignmentGuides = () => {
    if (!ctx || !showAlignmentGuides) return;
    
    ctx.save();
    
    // Set guide line style
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = 0.8;
    
    // Draw horizontal guides
    alignmentGuides.horizontal.forEach(guide => {
      ctx.beginPath();
      ctx.moveTo(guide.startX, guide.y);
      ctx.lineTo(guide.endX, guide.y);
      ctx.stroke();
    });
    
    // Draw vertical guides
    alignmentGuides.vertical.forEach(guide => {
      ctx.beginPath();
      ctx.moveTo(guide.x, guide.startY);
      ctx.lineTo(guide.x, guide.endY);
      ctx.stroke();
    });
    
    ctx.restore();
  };

  const updateCustomizationPrice = () => {
    // Calculate price based on pixel coverage and element types
    let totalPrice = basePrice;
    let elementBreakdown = [];
    
    // Calculate price for each element in the library (which represents elements on canvas)
    const allLibraryElements = [
      ...textLibrary.map(item => ({ ...item, type: 'text' })),
      ...shapeLibrary.map(item => ({ ...item, type: 'shape' })),
      ...imageLibrary.map(item => ({ ...item, type: 'image' }))
    ];
    
    allLibraryElements.forEach(element => {
      let elementPrice = 0;
      
      // Base prices
      switch (element.type) {
        case 'text':
          elementPrice = 5; // Base text price
          break;
        case 'shape':
          elementPrice = 7; // Base shape price
          break;
        case 'image':
          elementPrice = 7; // Base image price
          break;
        default:
          elementPrice = 5;
      }
      
      // Calculate pixel coverage (for shapes and images)
      if (element.type === 'shape' || element.type === 'image') {
        const pixelArea = (element.width || 100) * (element.height || 100);
        const pixelPrice = Math.ceil(pixelArea / 100) * 1; // $1 per 10x10 pixels (100 pixels)
        elementPrice += pixelPrice;
      }
      
      // Add print quality multiplier
      const printQualityMultipliers = {
        embroidery: 2.5,
        dtg: 1.0,
        sublimation: 1.8,
        screen: 1.2,
        plastisol: 1.5,
        htv: 1.3
      };

      const printMultiplier = printQualityMultipliers[element.printQuality] || 1.0;
      elementPrice *= printMultiplier;
      
      elementBreakdown.push({
        elementId: element.elementId,
        type: element.type,
        basePrice: element.type === 'text' ? 5 : 7,
        pixelPrice: (element.type === 'shape' || element.type === 'image') ? 
          Math.ceil(((element.width || 100) * (element.height || 100)) / 100) * 1 : 0,
        printQuality: element.printQuality,
        printMultiplier: printMultiplier,
        totalPrice: elementPrice
      });
      
      totalPrice += elementPrice;
    });
    
    setCustomizationPrice(totalPrice - basePrice); // Only the customization cost
    setPricingBreakdown({
      totalPrice: totalPrice,
      elementCount: allLibraryElements.length,
      elementBreakdown: elementBreakdown,
      printQualitySummary: {}
    });
  };

  const downloadDesign = () => {
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `custom-${product?.name || 'design'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const addToCart = () => {
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }

    const customizedProduct = {
      ...product,
      customization: {
        elements: elements,
        imageData: canvas.toDataURL(),
        price: customizationPrice
      }
    };

    // Add to cart logic here
    toast.success('Customized product added to cart!');
  };

  // Helper functions for resize handles
  const getResizeHandle = (x, y, element) => {
    if (!element) return null;
    
    const handleSize = 8;
    const handles = {
      'nw': { x: element.x, y: element.y },
      'n': { x: element.x + element.width / 2, y: element.y },
      'ne': { x: element.x + element.width, y: element.y },
      'w': { x: element.x, y: element.y + element.height / 2 },
      'e': { x: element.x + element.width, y: element.y + element.height / 2 },
      'sw': { x: element.x, y: element.y + element.height },
      's': { x: element.x + element.width / 2, y: element.y + element.height },
      'se': { x: element.x + element.width, y: element.y + element.height }
    };
    
    for (const [handle, pos] of Object.entries(handles)) {
      if (x >= pos.x - handleSize && x <= pos.x + handleSize &&
          y >= pos.y - handleSize && y <= pos.y + handleSize) {
        return handle;
      }
    }
    
    return null;
  };

  // Double-click handler
  const handleDoubleClick = (event) => {
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    
    // Find element at position
    const clickedElement = elements.find(el => {
      if (el.type === 'text') {
        ctx.font = `${el.fontSize}px ${el.fontFamily}`;
        const metrics = ctx.measureText(el.text);
        const textWidth = metrics.width;
        const textHeight = el.fontSize;
        
        return x >= el.x && x <= el.x + textWidth &&
               y >= el.y - textHeight && y <= el.y;
      } else {
        return x >= el.x && x <= el.x + (el.width || 0) &&
               y >= el.y && y <= el.y + (el.height || 0);
      }
    });
    
    if (clickedElement) {
      // Enable double-click dragging for this element
      setIsDoubleClickDragging(true);
      setDoubleClickDragStart({ x, y });
      setSelectedElement(clickedElement);
      setElements(elements.map(el => ({ ...el, selected: el.id === clickedElement.id })));
    }
  };

  // Library management functions
  const deleteFromShapeLibrary = (elementId) => {
    // Remove from shape library
    setShapeLibrary(prevLibrary => prevLibrary.filter(item => item.elementId !== elementId));
    
    // Remove from canvas elements
    const updatedElements = elements.filter(element => element.id !== elementId);
    setElements(updatedElements);
    
    // Also remove any associated shape text from text library
    setTextLibrary(prevLibrary => prevLibrary.filter(item => item.parentShapeId !== elementId));
    
    // Clear selection if deleted element was selected
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(null);
      // Clear alignment guides
      setAlignmentGuides({ horizontal: [], vertical: [] });
    }
    
    // Redraw canvas
    redrawCanvas();
    saveToHistory();
    updateCustomizationPrice();
    toast.success('Shape element removed from library and canvas');
  };

  const deleteFromTextLibrary = (elementId) => {
    // Remove from text library
    setTextLibrary(textLibrary.filter(item => item.elementId !== elementId));
    
    // Remove from canvas elements
    const updatedElements = elements.filter(element => element.id !== elementId);
    setElements(updatedElements);
    
    // Clear selection if deleted element was selected
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(null);
    }
    
    // Redraw canvas
    redrawCanvas();
    saveToHistory();
    updateCustomizationPrice();
    toast.success('Text element removed from library and canvas');
  };

  const deleteFromImageLibrary = (elementId) => {
    // Remove from image library
    setImageLibrary(imageLibrary.filter(item => item.elementId !== elementId));
    
    // Remove from canvas elements
    const updatedElements = elements.filter(element => element.id !== elementId);
    setElements(updatedElements);
    
    // Clear selection if deleted element was selected
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(null);
    }
    
    // Redraw canvas
    redrawCanvas();
    saveToHistory();
    updateCustomizationPrice();
    toast.success('Image element removed from library and canvas');
  };

  const addElementFromLibrary = (libraryItem, type) => {
    let newElement;
    
    switch (type) {
      case 'text':
        newElement = {
          id: Date.now(),
          type: 'text',
          text: libraryItem.text,
          x: 100,
          y: 100,
          fontSize: libraryItem.fontSize,
          fontFamily: libraryItem.fontFamily,
          color: libraryItem.color,
          bold: libraryItem.bold,
          italic: libraryItem.italic,
          underline: libraryItem.underline,
          printQuality: libraryItem.printQuality,
          width: libraryItem.width,
          height: libraryItem.height,
          selected: false
        };
        break;
        
      case 'shape':
        newElement = {
          id: Date.now(),
          type: 'shape',
          shapeType: libraryItem.shapeType,
          x: 150,
          y: 150,
          width: libraryItem.width || 100,
          height: libraryItem.height || 100,
          fillColor: libraryItem.fillColor,
          strokeColor: libraryItem.strokeColor,
          strokeWidth: libraryItem.strokeWidth,
          opacity: libraryItem.opacity,
          fillType: libraryItem.fillType || 'filled',
          printQuality: libraryItem.printQuality,
          // Shape text properties
          hasText: libraryItem.hasText || false,
          shapeText: libraryItem.shapeText || '',
          shapeTextColor: libraryItem.shapeTextColor || '#000000',
          shapeTextSize: libraryItem.shapeTextSize || 16,
          shapeTextFont: libraryItem.shapeTextFont || 'Arial',
          shapeTextBold: libraryItem.shapeTextBold || false,
          shapeTextItalic: libraryItem.shapeTextItalic || false,
          selected: false
        };
        break;
        
      case 'image':
        newElement = {
          id: Date.now(),
          type: 'image',
          src: libraryItem.src,
          x: 200,
          y: 200,
          width: libraryItem.width || 100,
          height: libraryItem.height || 100,
          printQuality: libraryItem.printQuality,
          selected: false
        };
        break;
        
      default:
        return;
    }
    
    setElements([...elements, newElement]);
    redrawCanvas();
    saveToHistory();
    updateCustomizationPrice();
    toast.success(`${type} element added from library`);
  };

  // Update libraries when elements change
  useEffect(() => {
    // Update text library when elements change
    elements.forEach(element => {
      if (element.type === 'text' && !element.isShapeText) {
        const existingTextIndex = textLibrary.findIndex(item => item.elementId === element.id);
        if (existingTextIndex !== -1) {
          // Only update if there are actual changes
          const existingText = textLibrary[existingTextIndex];
          const hasChanges = 
            existingText.text !== element.text ||
            existingText.fontSize !== element.fontSize ||
            existingText.fontFamily !== element.fontFamily ||
            existingText.color !== element.color ||
            existingText.bold !== element.bold ||
            existingText.italic !== element.italic ||
            existingText.underline !== element.underline ||
            existingText.width !== element.width ||
            existingText.height !== element.height;
          
          if (hasChanges) {
            setTextLibrary(prevLibrary => {
              const updatedLibrary = [...prevLibrary];
              updatedLibrary[existingTextIndex] = {
                ...updatedLibrary[existingTextIndex],
                text: element.text,
                fontSize: element.fontSize,
                fontFamily: element.fontFamily,
                color: element.color,
                bold: element.bold,
                italic: element.italic,
                underline: element.underline,
                width: element.width,
                height: element.height
              };
              return updatedLibrary;
            });
          }
        }
      }
    });

    // Update shape library when elements change
    elements.forEach(element => {
      if (element.type === 'shape') {
        const existingShapeIndex = shapeLibrary.findIndex(item => item.elementId === element.id);
        if (existingShapeIndex !== -1) {
          // Only update if there are actual changes
          const existingShape = shapeLibrary[existingShapeIndex];
          const hasChanges = 
            existingShape.fillColor !== element.fillColor ||
            existingShape.strokeColor !== element.strokeColor ||
            existingShape.strokeWidth !== element.strokeWidth ||
            existingShape.opacity !== element.opacity ||
            existingShape.fillType !== element.fillType ||
            existingShape.width !== element.width ||
            existingShape.height !== element.height ||
            existingShape.hasText !== element.hasText ||
            existingShape.shapeText !== element.shapeText ||
            existingShape.shapeTextColor !== element.shapeTextColor ||
            existingShape.shapeTextSize !== element.shapeTextSize ||
            existingShape.shapeTextFont !== element.shapeTextFont ||
            existingShape.shapeTextBold !== element.shapeTextBold ||
            existingShape.shapeTextItalic !== element.shapeTextItalic;
          
          if (hasChanges) {
            setShapeLibrary(prevLibrary => {
              const updatedLibrary = [...prevLibrary];
              updatedLibrary[existingShapeIndex] = {
                ...updatedLibrary[existingShapeIndex],
                fillColor: element.fillColor,
                strokeColor: element.strokeColor,
                strokeWidth: element.strokeWidth,
                opacity: element.opacity,
                fillType: element.fillType,
                width: element.width,
                height: element.height,
                hasText: element.hasText,
                shapeText: element.shapeText,
                shapeTextColor: element.shapeTextColor,
                shapeTextSize: element.shapeTextSize,
                shapeTextFont: element.shapeTextFont,
                shapeTextBold: element.shapeTextBold,
                shapeTextItalic: element.shapeTextItalic
              };
              return updatedLibrary;
            });
          }
        }
      }
      
      // Update image library when elements change
      if (element.type === 'image') {
        const existingImageIndex = imageLibrary.findIndex(item => item.elementId === element.id);
        if (existingImageIndex !== -1) {
          // Only update if there are actual changes
          const existingImage = imageLibrary[existingImageIndex];
          const hasChanges = 
            existingImage.width !== element.width ||
            existingImage.height !== element.height ||
            existingImage.opacity !== element.opacity ||
            existingImage.rotation !== element.rotation ||
            existingImage.printQuality !== element.printQuality;
          
          if (hasChanges) {
            setImageLibrary(prevLibrary => {
              const updatedLibrary = [...prevLibrary];
              updatedLibrary[existingImageIndex] = {
                ...updatedLibrary[existingImageIndex],
                width: element.width,
                height: element.height,
                opacity: element.opacity,
                rotation: element.rotation,
                printQuality: element.printQuality
              };
              return updatedLibrary;
            });
          }
        }
      }
    });
  }, [elements]);

  // Update text library when shape text changes
  useEffect(() => {
    elements.forEach(element => {
      if (element.type === 'shape' && element.hasText) {
        // Find existing shape text in text library
        setTextLibrary(prevLibrary => {
          const existingTextIndex = prevLibrary.findIndex(item => item.parentShapeId === element.id);
          
          if (existingTextIndex !== -1) {
            // Only update if there are actual changes
            const existingText = prevLibrary[existingTextIndex];
            const hasChanges = 
              existingText.text !== element.shapeText ||
              existingText.fontSize !== element.shapeTextSize ||
              existingText.fontFamily !== element.shapeTextFont ||
              existingText.color !== element.shapeTextColor ||
              existingText.bold !== element.shapeTextBold ||
              existingText.italic !== element.shapeTextItalic;
            
            if (hasChanges) {
              const updatedLibrary = [...prevLibrary];
              updatedLibrary[existingTextIndex] = {
                ...updatedLibrary[existingTextIndex],
                text: element.shapeText,
                fontSize: element.shapeTextSize,
                fontFamily: element.shapeTextFont,
                color: element.shapeTextColor,
                bold: element.shapeTextBold,
                italic: element.shapeTextItalic,
                width: element.shapeText.length * element.shapeTextSize * 0.6,
                height: element.shapeTextSize
              };
              return updatedLibrary;
            }
          } else if (element.shapeText.trim() !== '') {
            // Add new shape text to library
            const textLibraryItem = {
              elementId: Date.now() + '_shape_text',
              text: element.shapeText,
              fontSize: element.shapeTextSize,
              fontFamily: element.shapeTextFont,
              color: element.shapeTextColor,
              bold: element.shapeTextBold,
              italic: element.shapeTextItalic,
              underline: false,
              printQuality: element.printQuality,
              width: element.shapeText.length * element.shapeTextSize * 0.6,
              height: element.shapeTextSize,
              isShapeText: true, // Flag to identify this as shape text
              parentShapeId: element.id, // Reference to parent shape
              createdAt: new Date()
            };
            return [...prevLibrary, textLibraryItem];
          }
          return prevLibrary;
        });
      }
    });
  }, [elements]);

  // Calculate alignment guides
  const calculateAlignmentGuides = (selectedElement, allElements) => {
    if (!selectedElement || !showAlignmentGuides) {
      setAlignmentGuides({ horizontal: [], vertical: [] });
      return;
    }

    const tolerance = 5; // pixels tolerance for alignment
    const guides = { horizontal: [], vertical: [] };
    
    // Get selected element bounds
    const selectedBounds = getElementBounds(selectedElement);
    
    allElements.forEach(element => {
      if (element.id === selectedElement.id) return;
      
      const elementBounds = getElementBounds(element);
      
      // Check horizontal alignment (same Y position)
      if (Math.abs(selectedBounds.top - elementBounds.top) <= tolerance) {
        guides.horizontal.push({
          y: selectedBounds.top,
          startX: Math.min(selectedBounds.left, elementBounds.left) - 10,
          endX: Math.max(selectedBounds.right, elementBounds.right) + 10,
          type: 'top'
        });
      }
      if (Math.abs(selectedBounds.bottom - elementBounds.bottom) <= tolerance) {
        guides.horizontal.push({
          y: selectedBounds.bottom,
          startX: Math.min(selectedBounds.left, elementBounds.left) - 10,
          endX: Math.max(selectedBounds.right, elementBounds.right) + 10,
          type: 'bottom'
        });
      }
      if (Math.abs(selectedBounds.centerY - elementBounds.centerY) <= tolerance) {
        guides.horizontal.push({
          y: selectedBounds.centerY,
          startX: Math.min(selectedBounds.left, elementBounds.left) - 10,
          endX: Math.max(selectedBounds.right, elementBounds.right) + 10,
          type: 'center'
        });
      }
      
      // Check vertical alignment (same X position)
      if (Math.abs(selectedBounds.left - elementBounds.left) <= tolerance) {
        guides.vertical.push({
          x: selectedBounds.left,
          startY: Math.min(selectedBounds.top, elementBounds.top) - 10,
          endY: Math.max(selectedBounds.bottom, elementBounds.bottom) + 10,
          type: 'left'
        });
      }
      if (Math.abs(selectedBounds.right - elementBounds.right) <= tolerance) {
        guides.vertical.push({
          x: selectedBounds.right,
          startY: Math.min(selectedBounds.top, elementBounds.top) - 10,
          endY: Math.max(selectedBounds.bottom, elementBounds.bottom) + 10,
          type: 'right'
        });
      }
      if (Math.abs(selectedBounds.centerX - elementBounds.centerX) <= tolerance) {
        guides.vertical.push({
          x: selectedBounds.centerX,
          startY: Math.min(selectedBounds.top, elementBounds.top) - 10,
          endY: Math.max(selectedBounds.bottom, elementBounds.bottom) + 10,
          type: 'center'
        });
      }
    });
    
    // Remove duplicate guides
    guides.horizontal = removeDuplicateGuides(guides.horizontal, 'y');
    guides.vertical = removeDuplicateGuides(guides.vertical, 'x');
    
    setAlignmentGuides(guides);
  };

  // Get element bounds
  const getElementBounds = (element) => {
    let bounds = {
      left: element.x,
      top: element.y,
      right: element.x + (element.width || 0),
      bottom: element.y + (element.height || 0),
      centerX: element.x + (element.width || 0) / 2,
      centerY: element.y + (element.height || 0) / 2
    };
    
    // Special handling for text elements
    if (element.type === 'text') {
      if (ctx) {
        ctx.font = `${element.fontSize}px ${element.fontFamily}`;
        const metrics = ctx.measureText(element.text);
        bounds.right = element.x + metrics.width;
        bounds.bottom = element.y;
        bounds.centerX = element.x + metrics.width / 2;
        bounds.centerY = element.y - element.fontSize / 2;
      }
    }
    
    return bounds;
  };

  // Remove duplicate guides
  const removeDuplicateGuides = (guides, key) => {
    const seen = new Set();
    return guides.filter(guide => {
      const value = Math.round(guide[key]);
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"
              >
                <FaArrowLeft className="mr-2" />
                Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Customize {product?.name}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right bg-gray-50 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-500">Base Price</p>
                <p className="text-lg font-semibold text-gray-900">${basePrice}</p>
              </div>
              <div className="text-right bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600">Customization</p>
                <p className="text-lg font-semibold text-blue-700">${customizationPrice}</p>
                {pricingBreakdown.elementCount > 0 && (
                  <p className="text-xs text-blue-500">{pricingBreakdown.elementCount} elements</p>
                )}
              </div>
              <div className="text-right bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <p className="text-sm text-green-600">Total Price</p>
                <p className="text-lg font-semibold text-green-700">${basePrice + customizationPrice}</p>
              </div>
              
              {/* Pricing Summary Button */}
              <div className="relative pricing-summary-container">
              <button
                  onClick={() => setShowPricingSummary(!showPricingSummary)}
                  className={`px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center ${
                    pricingBreakdown.elementCount > 0 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-gray-400 text-white hover:bg-gray-500'
                  }`}
                >
                  <span className="mr-2">💰</span>
                  Pricing Summary
                  {pricingBreakdown.elementCount > 0 && (
                    <span className="ml-2 bg-white text-purple-600 text-xs font-bold px-2 py-1 rounded-full">
                      {pricingBreakdown.elementCount}
                    </span>
                  )}
                  <FaChevronDown className={`ml-2 transition-transform duration-200 ${showPricingSummary ? 'rotate-180' : ''}`} />
              </button>
                
                {/* Pricing Summary Dropdown */}
                {showPricingSummary && (
                  <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing Breakdown</h3>
                    
                    {/* Base Price */}
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Base Product Price</span>
                        <span className="font-semibold text-gray-900">${basePrice}</span>
                      </div>
                    </div>
                    
                    {/* Customization Costs */}
                    {pricingBreakdown.elementCount > 0 ? (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Customization Elements:</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {pricingBreakdown.elementBreakdown.map((item, index) => (
                            <div key={item.elementId} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-blue-800 capitalize">{item.type}</span>
                                <div className="text-xs text-blue-600">
                                  Base: ${item.basePrice} + Pixels: ${item.pixelPrice} × {item.printQuality} ({item.printMultiplier}x)
                                </div>
                              </div>
                              <span className="font-semibold text-blue-900">${item.totalPrice}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-blue-600">No customization elements added yet</span>
                      </div>
                    )}
                    
                    {/* Total */}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span className="text-gray-900">Total Price</span>
                        <span className="text-green-700">${basePrice + customizationPrice}</span>
                      </div>
                    </div>
                    
                    {/* Pricing Criteria */}
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">💰 Pricing Criteria:</h4>
                      <div className="text-xs text-yellow-700 space-y-1">
                        <div>• <strong>Text:</strong> $5 base + print quality multiplier</div>
                        <div>• <strong>Shapes:</strong> $7 base + pixel coverage ($1/100px) + print quality</div>
                        <div>• <strong>Images:</strong> $7 base + pixel coverage ($1/100px) + print quality</div>
                        <div>• <strong>Print Quality Multipliers:</strong></div>
                        <div className="ml-2">
                          <div>• DTG: 1.0x | Screen: 1.2x | HTV: 1.3x</div>
                          <div>• Plastisol: 1.5x | Sublimation: 1.8x | Embroidery: 2.5x</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={addToCart}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen pt-16">
        {/* Left Sidebar - Tools */}
        <div className="w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto custom-scrollbar">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Design Tools</h2>
            
            {/* Zoom Controls */}
            <div className="mb-6 bg-gray-50 p-3 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Canvas Controls</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                  className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaMinus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaPlus className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={resetView}
                  className="bg-blue-100 text-blue-700 px-2 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-xs"
                >
                  Reset
                </button>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <button
                  onClick={() => setShowAlignmentGuides(!showAlignmentGuides)}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors duration-200 ${
                    showAlignmentGuides 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showAlignmentGuides ? 'Hide' : 'Show'} Alignment Guides
                </button>
              </div>
            </div>

            {/* Text Tool */}
            <div className="mb-6">
              <button
                onClick={() => setShowTextPanel(!showTextPanel)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  showTextPanel 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="font-medium">Text</span>
                <FaChevronDown className={`transition-transform duration-200 ${showTextPanel ? 'rotate-180' : ''}`} />
              </button>
              
              {showTextPanel && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3 animate-slideDown">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      min="8"
                      max="72"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {fonts.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                  <select
                    value={selectedPrintQuality}
                    onChange={(e) => setSelectedPrintQuality(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {printQualityOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name} (+${option.samplePrice})
                      </option>
                    ))}
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTextBold(!textBold)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        textBold ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <FaBold />
                    </button>
                    <button
                      onClick={() => setTextItalic(!textItalic)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        textItalic ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <FaItalic />
                    </button>
                    <button
                      onClick={() => setTextUnderline(!textUnderline)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        textUnderline ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <FaUnderline />
                    </button>
                  </div>
                  <button
                    onClick={addText}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Add Text
                  </button>
                </div>
              )}
            </div>

            {/* Shapes Tool */}
            <div className="mb-6">
              <button
                onClick={() => setShowShapesPanel(!showShapesPanel)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  showShapesPanel 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="font-medium">Shapes</span>
                <FaChevronDown className={`transition-transform duration-200 ${showShapesPanel ? 'rotate-180' : ''}`} />
              </button>
              
              {showShapesPanel && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3 animate-slideDown">
                  <div className="grid grid-cols-3 gap-2">
                    {shapes.map(shape => (
                      <button
                        key={shape.type}
                        onClick={() => addShape(shape.type)}
                        className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 flex flex-col items-center space-y-1"
                      >
                        <span className="text-2xl">{shape.icon}</span>
                        <span className="text-xs text-gray-600">{shape.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-1/2 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="w-1/2 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(Number(e.target.value))}
                      className="w-full"
                    />
                    <select
                      value={shapeFillType}
                      onChange={(e) => setShapeFillType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="filled">Filled</option>
                      <option value="transparent">Transparent</option>
                    </select>
                    <select
                      value={selectedPrintQuality}
                      onChange={(e) => setSelectedPrintQuality(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {printQualityOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.name} (+${option.samplePrice})
                        </option>
                      ))}
                    </select>
                    
                    {/* Shape Text Controls */}
                    <div className="border-t pt-3 mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Shape Text</h4>
                      <input
                        type="text"
                        value={shapeText}
                        onChange={(e) => setShapeText(e.target.value)}
                        placeholder="Add text to shape..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      />
                      {shapeText.trim() !== '' && (
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <input
                              type="color"
                              value={shapeTextColor}
                              onChange={(e) => setShapeTextColor(e.target.value)}
                              className="w-1/2 h-10 border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <input
                              type="number"
                              value={shapeTextSize}
                              onChange={(e) => setShapeTextSize(Number(e.target.value))}
                              min="8"
                              max="48"
                              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <select
                            value={shapeTextFont}
                            onChange={(e) => setShapeTextFont(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {fonts.map(font => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setShapeTextBold(!shapeTextBold)}
                              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                                shapeTextBold ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              <FaBold />
                            </button>
                            <button
                              onClick={() => setShapeTextItalic(!shapeTextItalic)}
                              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                                shapeTextItalic ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              <FaItalic />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image Tool */}
            <div className="mb-6">
              <button
                onClick={() => setShowImagePanel(!showImagePanel)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  showImagePanel 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="font-medium">Images</span>
                <FaChevronDown className={`transition-transform duration-200 ${showImagePanel ? 'rotate-180' : ''}`} />
              </button>
              
              {showImagePanel && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3 animate-slideDown">
                  <label className="block">
                    <span className="sr-only">Choose image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={addImage}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </label>
                  <select
                    value={selectedPrintQuality}
                    onChange={(e) => setSelectedPrintQuality(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {printQualityOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name} (+${option.samplePrice})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Libraries Panel */}
            <div className="mb-6">
              <button
                onClick={() => setShowLibrariesPanel(!showLibrariesPanel)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  showLibrariesPanel 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="font-medium">Libraries</span>
                <FaChevronDown className={`transition-transform duration-200 ${showLibrariesPanel ? 'rotate-180' : ''}`} />
              </button>
              
              {showLibrariesPanel && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-4 animate-slideDown">
                  {/* Text Library */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Text Library ({textLibrary.length})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {textLibrary.map((item) => (
                        <div key={item.elementId} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: item.color }}>
                              {item.text}
                              {item.isShapeText && (
                                <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1 rounded">
                                  Shape Text
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.fontFamily} {item.fontSize}px
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            {!item.isShapeText && (
                              <button
                                onClick={() => addElementFromLibrary(item, 'text')}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Add to canvas"
                              >
                                <FaPlus className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteFromTextLibrary(item.elementId)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete from library"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {textLibrary.length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-2">No text elements in library</p>
                      )}
                    </div>
                  </div>

                  {/* Shape Library */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Shape Library ({shapeLibrary.length})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {shapeLibrary.map((item) => (
                        <div key={item.elementId} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.shapeType}
                              {item.hasText && (
                                <span className="ml-1 text-xs bg-green-100 text-green-700 px-1 rounded">
                                  Has Text
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              Fill: {item.fillColor} | Stroke: {item.strokeColor}
                              {item.hasText && (
                                <span className="block">Text: "{item.shapeText}"</span>
                              )}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => addElementFromLibrary(item, 'shape')}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Add to canvas"
                            >
                              <FaPlus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteFromShapeLibrary(item.elementId)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete from library"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {shapeLibrary.length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-2">No shape elements in library</p>
                      )}
                    </div>
                  </div>

                  {/* Image Library */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Image Library ({imageLibrary.length})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {imageLibrary.map((item) => (
                        <div key={item.elementId} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.printQuality}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => addElementFromLibrary(item, 'image')}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Add to canvas"
                            >
                              <FaPlus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteFromImageLibrary(item.elementId)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete from library"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {imageLibrary.length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-2">No image elements in library</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

              {/* Canva Integration Panel */}
              <div className="mb-6">
                <button
                  onClick={() => setShowCanvaPanel(!showCanvaPanel)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                    showCanvaPanel 
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="font-medium">AI Design Generator</span>
                  <FaChevronDown className={`transition-transform duration-200 ${showCanvaPanel ? 'rotate-180' : ''}`} />
                </button>
                
                {showCanvaPanel && (
                  <div className="mt-3 animate-slideDown">
                    <AICanvasIntegration 
                      canvasRef={canvasRef}
                      currentDesign={{
                        elements: elements,
                        background: backgroundColor
                      }}
                      onAddElement={addAIElement}
                    />
                  </div>
                )}
              </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                  historyIndex <= 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <FaUndo className="mr-2" />
                Undo
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                  historyIndex >= history.length - 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <FaRedo className="mr-2" />
                Redo
              </button>
              <button
                onClick={deleteSelectedElement}
                disabled={!selectedElement}
                className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                  !selectedElement 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                <FaTrash className="mr-2" />
                Delete
              </button>
              <button
                onClick={downloadDesign}
                className="w-full flex items-center justify-center p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <FaDownload className="mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Container */}
          <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
            {/* Canvas Boundary */}
            <div className="relative bg-white shadow-2xl rounded-lg border-4 border-gray-300 overflow-hidden canvas-container">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                onDoubleClick={handleDoubleClick}
                className="block transition-all duration-300"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transformOrigin: 'center',
                  cursor: isPanning ? 'grabbing' : isDragging ? 'grabbing' : isResizing ? 'nw-resize' : 'crosshair'
                }}
              />
              
              {/* Canvas Overlay for Visual Feedback */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transformOrigin: 'center'
                }}
              >
                {/* Element Selection Indicators */}
                {elements.map(element => {
                  if (element.selected) {
                    if (element.type === 'text') {
                      return (
                        <div
                          key={element.id}
                          className="absolute element-selected"
                          style={{
                            left: element.x - 4,
                            top: element.y - element.fontSize - 4,
                            width: 'calc(100% + 8px)',
                            height: element.fontSize + 8
                          }}
                        />
                      );
                    } else {
                      return (
                        <div
                          key={element.id}
                          className="absolute element-selected"
                          style={{
                            left: element.x - 4,
                            top: element.y - 4,
                            width: (element.width || 0) + 8,
                            height: (element.height || 0) + 8
                          }}
                        />
                      );
                    }
                  }
                  return null;
                })}
              </div>
            </div>
            
            {/* Canvas Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                <span>🖱️ Click to select • 🖱️ Double-click to drag • 🔄 Drag corners to resize</span>
                <span>⌨️ Ctrl + Drag to pan • 🖱️ Scroll to zoom • ⌨️ Delete to remove • Ctrl+Z/Y to undo/redo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-white shadow-lg border-l border-gray-200 overflow-y-auto custom-scrollbar">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties</h2>
            
            {selectedElement ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Selected: {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                    <span>X: {Math.round(selectedElement.x)}</span>
                    <span>Y: {Math.round(selectedElement.y)}</span>
                    {selectedElement.width && <span>Width: {Math.round(selectedElement.width)}</span>}
                    {selectedElement.height && <span>Height: {Math.round(selectedElement.height)}</span>}
                  </div>
                </div>
                
                {/* Element-specific properties */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                      <input
                        type="text"
                        value={selectedElement.text}
                        onChange={(e) => {
                          const newText = e.target.value;
                          let newWidth = selectedElement.width;
                          let newHeight = selectedElement.height;
                          
                          // Recalculate text dimensions
                          if (ctx) {
                            ctx.font = `${selectedElement.bold ? 'bold ' : ''}${selectedElement.italic ? 'italic ' : ''}${selectedElement.fontSize}px ${selectedElement.fontFamily}`;
                            const metrics = ctx.measureText(newText);
                            newWidth = metrics.width;
                            newHeight = selectedElement.fontSize;
                          } else {
                            // Fallback calculation
                            const avgCharWidth = selectedElement.fontSize * 0.6;
                            newWidth = newText.length * avgCharWidth;
                            newHeight = selectedElement.fontSize;
                          }
                          
                          const updatedElement = { 
                            ...selectedElement, 
                            text: newText,
                            width: newWidth,
                            height: newHeight
                          };
                          setSelectedElement(updatedElement);
                          setElements(elements.map(el => 
                            el.id === selectedElement.id ? updatedElement : el
                          ));
                          redrawCanvas();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <input
                          type="color"
                          value={selectedElement.color}
                          onChange={(e) => {
                            const updatedElement = { ...selectedElement, color: e.target.value };
                            setSelectedElement(updatedElement);
                            setElements(elements.map(el => 
                              el.id === selectedElement.id ? updatedElement : el
                            ));
                            redrawCanvas();
                          }}
                          className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                        <input
                          type="number"
                          value={selectedElement.fontSize}
                          onChange={(e) => {
                            const newFontSize = Number(e.target.value);
                            let newWidth = selectedElement.width;
                            let newHeight = newFontSize;
                            
                            // Recalculate text dimensions
                            if (ctx) {
                              ctx.font = `${selectedElement.bold ? 'bold ' : ''}${selectedElement.italic ? 'italic ' : ''}${newFontSize}px ${selectedElement.fontFamily}`;
                              const metrics = ctx.measureText(selectedElement.text);
                              newWidth = metrics.width;
                            } else {
                              // Fallback calculation
                              const avgCharWidth = newFontSize * 0.6;
                              newWidth = selectedElement.text.length * avgCharWidth;
                            }
                            
                            const updatedElement = { 
                              ...selectedElement, 
                              fontSize: newFontSize,
                              width: newWidth,
                              height: newHeight
                            };
                            setSelectedElement(updatedElement);
                            setElements(elements.map(el => 
                              el.id === selectedElement.id ? updatedElement : el
                            ));
                            redrawCanvas();
                          }}
                          min="8"
                          max="72"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                      <select
                        value={selectedElement.fontFamily}
                        onChange={(e) => {
                          const newFontFamily = e.target.value;
                          let newWidth = selectedElement.width;
                          
                          // Recalculate text dimensions
                          if (ctx) {
                            ctx.font = `${selectedElement.bold ? 'bold ' : ''}${selectedElement.italic ? 'italic ' : ''}${selectedElement.fontSize}px ${newFontFamily}`;
                            const metrics = ctx.measureText(selectedElement.text);
                            newWidth = metrics.width;
                          } else {
                            // Fallback calculation
                            const avgCharWidth = selectedElement.fontSize * 0.6;
                            newWidth = selectedElement.text.length * avgCharWidth;
                          }
                          
                          const updatedElement = { 
                            ...selectedElement, 
                            fontFamily: newFontFamily,
                            width: newWidth
                          };
                          setSelectedElement(updatedElement);
                          setElements(elements.map(el => 
                            el.id === selectedElement.id ? updatedElement : el
                          ));
                          redrawCanvas();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {fonts.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Text Style</label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const newBold = !selectedElement.bold;
                            let newWidth = selectedElement.width;
                            
                            // Recalculate text dimensions
                            if (ctx) {
                              ctx.font = `${newBold ? 'bold ' : ''}${selectedElement.italic ? 'italic ' : ''}${selectedElement.fontSize}px ${selectedElement.fontFamily}`;
                              const metrics = ctx.measureText(selectedElement.text);
                              newWidth = metrics.width;
                            } else {
                              // Fallback calculation
                              const avgCharWidth = selectedElement.fontSize * 0.6;
                              newWidth = selectedElement.text.length * avgCharWidth;
                            }
                            
                            const updatedElement = { 
                              ...selectedElement, 
                              bold: newBold,
                              width: newWidth
                            };
                            setSelectedElement(updatedElement);
                            setElements(elements.map(el => 
                              el.id === selectedElement.id ? updatedElement : el
                            ));
                            redrawCanvas();
                          }}
                          className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                            selectedElement.bold ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <FaBold />
                        </button>
                        <button
                          onClick={() => {
                            const newItalic = !selectedElement.italic;
                            let newWidth = selectedElement.width;
                            
                            // Recalculate text dimensions
                            if (ctx) {
                              ctx.font = `${selectedElement.bold ? 'bold ' : ''}${newItalic ? 'italic ' : ''}${selectedElement.fontSize}px ${selectedElement.fontFamily}`;
                              const metrics = ctx.measureText(selectedElement.text);
                              newWidth = metrics.width;
                            } else {
                              // Fallback calculation
                              const avgCharWidth = selectedElement.fontSize * 0.6;
                              newWidth = selectedElement.text.length * avgCharWidth;
                            }
                            
                            const updatedElement = { 
                              ...selectedElement, 
                              italic: newItalic,
                              width: newWidth
                            };
                            setSelectedElement(updatedElement);
                            setElements(elements.map(el => 
                              el.id === selectedElement.id ? updatedElement : el
                            ));
                            redrawCanvas();
                          }}
                          className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                            selectedElement.italic ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <FaItalic />
                        </button>
                        <button
                          onClick={() => {
                            const updatedElement = { ...selectedElement, underline: !selectedElement.underline };
                            setSelectedElement(updatedElement);
                            setElements(elements.map(el => 
                              el.id === selectedElement.id ? updatedElement : el
                            ));
                            redrawCanvas();
                          }}
                          className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                            selectedElement.underline ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <FaUnderline />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedElement.type === 'shape' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                        <input
                          type="number"
                          value={Math.round(selectedElement.width)}
                          onChange={(e) => {
                            const newWidth = Number(e.target.value);
                            const updatedElement = { ...selectedElement, width: newWidth };
                            setSelectedElement(updatedElement);
                            setElements(elements.map(el => 
                              el.id === selectedElement.id ? updatedElement : el
                            ));
                            redrawCanvas();
                            // Price will be updated automatically via useEffect
                          }}
                          min="10"
                          max="800"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Pixels: {Math.round(selectedElement.width)} × {Math.round(selectedElement.height)} = {Math.round(selectedElement.width * selectedElement.height)}px
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                        <input
                          type="number"
                          value={Math.round(selectedElement.height)}
                          onChange={(e) => {
                            const newHeight = Number(e.target.value);
                            const updatedElement = { ...selectedElement, height: newHeight };
                            setSelectedElement(updatedElement);
                            setElements(elements.map(el => 
                              el.id === selectedElement.id ? updatedElement : el
                            ));
                            redrawCanvas();
                            // Price will be updated automatically via useEffect
                          }}
                          min="10"
                          max="600"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Coverage: ${Math.ceil((selectedElement.width * selectedElement.height) / 100)} (${Math.ceil((selectedElement.width * selectedElement.height) / 100)} × $1/100px)
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fill Color</label>
                        <input
                          type="color"
                          value={selectedElement.fillColor}
                          onChange={(e) => {
                            const updatedElement = { ...selectedElement, fillColor: e.target.value };
                            setSelectedElement(updatedElement);
                            setElements(elements.map(el => 
                              el.id === selectedElement.id ? updatedElement : el
                            ));
                            redrawCanvas();
                          }}
                          className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stroke Color</label>
                        <input
                          type="color"
                          value={selectedElement.strokeColor}
                          onChange={(e) => {
                            const updatedElement = { ...selectedElement, strokeColor: e.target.value };
                            setSelectedElement(updatedElement);
                            setElements(elements.map(el => 
                              el.id === selectedElement.id ? updatedElement : el
                            ));
                            redrawCanvas();
                          }}
                          className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fill Type</label>
                      <select
                        value={selectedElement.fillType || 'filled'}
                        onChange={(e) => {
                          const updatedElement = { ...selectedElement, fillType: e.target.value };
                          setSelectedElement(updatedElement);
                          setElements(elements.map(el => 
                            el.id === selectedElement.id ? updatedElement : el
                          ));
                          redrawCanvas();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="filled">Filled</option>
                        <option value="transparent">Transparent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stroke Width</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={selectedElement.strokeWidth}
                        onChange={(e) => {
                          const updatedElement = { ...selectedElement, strokeWidth: Number(e.target.value) };
                          setSelectedElement(updatedElement);
                          setElements(elements.map(el => 
                            el.id === selectedElement.id ? updatedElement : el
                          ));
                          redrawCanvas();
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opacity</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedElement.opacity || 1}
                        onChange={(e) => {
                          const updatedElement = { ...selectedElement, opacity: Number(e.target.value) };
                          setSelectedElement(updatedElement);
                          setElements(elements.map(el => 
                            el.id === selectedElement.id ? updatedElement : el
                          ));
                          redrawCanvas();
                        }}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Shape Text Properties */}
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Shape Text</h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                        <input
                          type="text"
                          value={selectedElement.shapeText || ''}
                          onChange={(e) => {
                            const updatedElement = { 
                              ...selectedElement, 
                              shapeText: e.target.value,
                              hasText: e.target.value.trim() !== ''
                            };
                            setSelectedElement(updatedElement);
                            setElements(elements.map(el => 
                              el.id === selectedElement.id ? updatedElement : el
                            ));
                            redrawCanvas();
                          }}
                          placeholder="Add text to shape..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      {(selectedElement.shapeText || selectedElement.hasText) && (
                        <div className="space-y-2 mt-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                              <input
                                type="color"
                                value={selectedElement.shapeTextColor || '#000000'}
                                onChange={(e) => {
                                  const updatedElement = { ...selectedElement, shapeTextColor: e.target.value };
                                  setSelectedElement(updatedElement);
                                  setElements(elements.map(el => 
                                    el.id === selectedElement.id ? updatedElement : el
                                  ));
                                  redrawCanvas();
                                }}
                                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Text Size</label>
                              <input
                                type="number"
                                value={selectedElement.shapeTextSize || 16}
                                onChange={(e) => {
                                  const updatedElement = { ...selectedElement, shapeTextSize: Number(e.target.value) };
                                  setSelectedElement(updatedElement);
                                  setElements(elements.map(el => 
                                    el.id === selectedElement.id ? updatedElement : el
                                  ));
                                  redrawCanvas();
                                }}
                                min="8"
                                max="48"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Text Font</label>
                            <select
                              value={selectedElement.shapeTextFont || 'Arial'}
                              onChange={(e) => {
                                const updatedElement = { ...selectedElement, shapeTextFont: e.target.value };
                                setSelectedElement(updatedElement);
                                setElements(elements.map(el => 
                                  el.id === selectedElement.id ? updatedElement : el
                                ));
                                redrawCanvas();
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {fonts.map(font => (
                                <option key={font} value={font}>{font}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const updatedElement = { ...selectedElement, shapeTextBold: !selectedElement.shapeTextBold };
                                setSelectedElement(updatedElement);
                                setElements(elements.map(el => 
                                  el.id === selectedElement.id ? updatedElement : el
                                ));
                                redrawCanvas();
                              }}
                              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                                selectedElement.shapeTextBold ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              <FaBold />
                            </button>
                            <button
                              onClick={() => {
                                const updatedElement = { ...selectedElement, shapeTextItalic: !selectedElement.shapeTextItalic };
                                setSelectedElement(updatedElement);
                                setElements(elements.map(el => 
                                  el.id === selectedElement.id ? updatedElement : el
                                ));
                                redrawCanvas();
                              }}
                              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                                selectedElement.shapeTextItalic ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              <FaItalic />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedElement.type === 'image' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opacity</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedElement.opacity || 1}
                        onChange={(e) => {
                          const updatedElement = { ...selectedElement, opacity: Number(e.target.value) };
                          setSelectedElement(updatedElement);
                          setElements(elements.map(el => 
                            el.id === selectedElement.id ? updatedElement : el
                          ));
                          redrawCanvas();
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                        <input
                          type="number"
                          value={Math.round(selectedElement.width)}
                          onChange={(e) => {
                            const newWidth = Number(e.target.value);
                            const updatedElement = { ...selectedElement, width: newWidth };
                            setSelectedElement(updatedElement);
                            setElements(elements.map(el => 
                              el.id === selectedElement.id ? updatedElement : el
                            ));
                            redrawCanvas();
                            // Price will be updated automatically via useEffect
                          }}
                          min="10"
                          max="800"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Pixels: {Math.round(selectedElement.width)} × {Math.round(selectedElement.height)} = {Math.round(selectedElement.width * selectedElement.height)}px
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                        <input
                          type="number"
                          value={Math.round(selectedElement.height)}
                          onChange={(e) => {
                            const newHeight = Number(e.target.value);
                            const updatedElement = { ...selectedElement, height: newHeight };
                            setSelectedElement(updatedElement);
                            setElements(elements.map(el => 
                              el.id === selectedElement.id ? updatedElement : el
                            ));
                            redrawCanvas();
                            // Price will be updated automatically via useEffect
                          }}
                          min="10"
                          max="600"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Coverage: ${Math.ceil((selectedElement.width * selectedElement.height) / 100)} (${Math.ceil((selectedElement.width * selectedElement.height) / 100)} × $1/100px)
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rotation</label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={selectedElement.rotation || 0}
                        onChange={(e) => {
                          const updatedElement = { ...selectedElement, rotation: Number(e.target.value) };
                          setSelectedElement(updatedElement);
                          setElements(elements.map(el => 
                            el.id === selectedElement.id ? updatedElement : el
                          ));
                          redrawCanvas();
                        }}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 text-center mt-1">
                        {selectedElement.rotation || 0}°
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FaMousePointer className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select an element to edit its properties</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      <DesignChatbot />
    </>
  );
};

export default Customization; 
          