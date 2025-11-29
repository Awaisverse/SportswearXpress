import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const Test = () => {
  const { addToCart } = useCart(); // ✅ Hook correctly inside the component

  const location = useLocation();
  const navigate = useNavigate();

  const product = location.state?.productData;

  useEffect(() => {
    if (!product) {
      navigate('/');
    }
  }, [product, navigate]);

  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const currentImages = [product?.img];

  if (!product) return null;

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
                  alt={`${product.title} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          <div className="flex-1">
            <img
              src={currentImages[activeImage]}
              alt={`${product.title}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold">{product.title}</h1>
          </div>

          <p className="text-2xl mb-6">${product.price}</p>

          {/* Color Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Color: {selectedColor}</h3>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setActiveImage(0);
                  }}
                  className={`w-10 h-10 rounded-full border-2 ${
                    selectedColor === color ? 'border-black' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Size: {selectedSize}</h3>
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
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border-r hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 border-l hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button 
  onClick={() => {
    addToCart(product, selectedColor, selectedSize, quantity);
    navigate('/cart'); // 👈 Navigate to cart after adding
  }}
  className="flex-1 bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors"
>
  Add to Cart - ${(product.price * quantity).toFixed(2)}
</button>

            </div>

            <button 
  onClick={() => {
    navigate('/CustomizationPage', { 
      state: { 
        productData: product,
        selectedColor,
        selectedSize,
        quantity
      } 
    });
  }}
  className="w-full border-2 border-black bg-white text-black px-8 py-3 hover:bg-gray-100 transition-colors"
>
  Start Designing
</button>
          </div>

          {/* Product Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Product Description</h3>
            <p className="mb-4">{product.description}</p>
          </div>

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

export default Test;
