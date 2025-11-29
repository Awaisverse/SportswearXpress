import { useState } from 'react';

const ProductPage = () => {
  const [selectedColor, setSelectedColor] = useState('Black');
  const [selectedSize, setSelectedSize] = useState('S');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Product data with actual images from Printful
  const product = {
    title: 'Unisex Organic Oversized High Neck T-Shirt',
    brand: 'Stanley/Stella',
    price: 32.95,
    colors: [
      { 
        name: 'Black', 
        hex: '#000000',
        images: [
          'https://files.cdn.printful.com/o/upload/product-catalog-img/satu/satu020/unisex-organic-oversized-high-neck-t-shirt-stanley-stella-satu020-black-1_front',
          'https://files.cdn.printful.com/o/upload/product-catalog-img/satu/satu020/unisex-organic-oversized-high-neck-t-shirt-stanley-stella-satu020-black-2_back',
          'https://files.cdn.printful.com/o/upload/product-catalog-img/satu/satu020/unisex-organic-oversized-high-neck-t-shirt-stanley-stella-satu020-black-3_side'
        ]
      },
      { 
        name: 'White', 
        hex: '#FFFFFF',
        images: [
          'https://files.cdn.printful.com/o/upload/product-catalog-img/satu/satu020/unisex-organic-oversized-high-neck-t-shirt-stanley-stella-satu020-white-1_front',
          'https://files.cdn.printful.com/o/upload/product-catalog-img/satu/satu020/unisex-organic-oversized-high-neck-t-shirt-stanley-stella-satu020-white-2_back',
          'https://files.cdn.printful.com/o/upload/product-catalog-img/satu/satu020/unisex-organic-oversized-high-neck-t-shirt-stanley-stella-satu020-white-3_side'
        ]
      },
      { 
        name: 'Navy', 
        hex: '#1F2A44',
        images: [
          'https://files.cdn.printful.com/o/upload/product-catalog-img/satu/satu020/unisex-organic-oversized-high-neck-t-shirt-stanley-stella-satu020-navy-1_front',
          'https://files.cdn.printful.com/o/upload/product-catalog-img/satu/satu020/unisex-organic-oversized-high-neck-t-shirt-stanley-stella-satu020-navy-2_back',
          'https://files.cdn.printful.com/o/upload/product-catalog-img/satu/satu020/unisex-organic-oversized-high-neck-t-shirt-stanley-stella-satu020-navy-3_side'
        ]
      },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    description: `Sustainable oversized high neck t-shirt made from 100% organic cotton. Stanley/Stella's signature relaxed fit with ribbed collar.`,
    features: [
      '100% organic cotton',
      'Oversized fit',
      'Ribbed high neck',
      'Screen printed design',
      'Responsibly sourced materials'
    ]
  };

  // Get current color's images
  const currentColor = product.colors.find(color => color.name === selectedColor);
  const currentImages = currentColor ? currentColor.images : product.colors[0].images;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-4">
            {currentImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`w-20 h-20 border-2 ${
                  activeImage === index ? 'border-black' : 'border-transparent'
                }`}
              >
                <img
                  src={img}
                  alt={`${selectedColor} t-shirt view ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
          <div className="flex-1">
            <img
              src={currentImages[activeImage]}
              alt={`${selectedColor} ${product.title}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-4">
            <span className="text-sm text-gray-600">{product.brand}</span>
            <h1 className="text-3xl font-bold">{product.title}</h1>
          </div>
          
          <p className="text-2xl mb-6">${product.price}</p>

          {/* Color Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Color: {selectedColor}</h3>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => {
                    setSelectedColor(color.name);
                    setActiveImage(0); // Reset to first image when color changes
                  }}
                  className={`w-10 h-10 rounded-full border-2 ${
                    selectedColor === color.name ? 'border-black' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={`Select color ${color.name}`}
                />
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Size: {selectedSize}</h3>
              <button className="text-sm underline">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border-2 ${
                    selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  aria-label={`Select size ${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border-r hover:bg-gray-100"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 border-l hover:bg-gray-100"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button className="flex-1 bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors">
                Add to Cart - ${(product.price * quantity).toFixed(2)}
              </button>
            </div>
            
            <button className="w-full border-2 border-black bg-white text-black px-8 py-3 hover:bg-gray-100 transition-colors">
              Start Designing
            </button>
          </div>

          {/* Product Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Product Description</h3>
            <p className="mb-4">{product.description}</p>
            <ul className="list-disc pl-6 space-y-1">
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          {/* Shipping Info */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Shipping & Returns</h3>
            <p className="text-sm">Standard shipping: 5-7 business days</p>
            <p className="text-sm">Free returns within 30 days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;