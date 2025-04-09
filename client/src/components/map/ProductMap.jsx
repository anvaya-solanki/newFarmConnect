import React, { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Popup,
  Marker,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/actions";
import pin from '../../assets/pin.png';
import { toast } from 'react-toastify';

function ProductMap({
  width = "w-full",
  height = "h-[500px]",
  deliverableProducts = [],
  nonDeliverableProducts = [],
  userLatitude,
  userLongitude,
  zoom = 10
}) {
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [hoveredMarkerPosition, setHoveredMarkerPosition] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isPinned, setIsPinned] = useState(false);
  const mapRef = useRef(null);
  const dispatch = useDispatch();

  const deliverableIcon = new L.Icon({
    iconUrl: pin,
    iconSize: [20, 30],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const nonDeliverableIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const handleAddToCart = (product) => {
    try {
      // Ensure price and quantity are numbers
      const pricePerUnit = Number(product.pricePerUnit);
      const minQty = Number(product.minimumOrderQuantity) || 1;
      const totalPrice = pricePerUnit * minQty;
      
      // Make sure we have valid numbers
      if (isNaN(pricePerUnit) || isNaN(minQty) || isNaN(totalPrice)) {
        console.error("Invalid price calculation:", {
          pricePerUnit,
          minQty,
          product
        });
        toast.error("Error calculating price. Please try again.");
        return;
      }
      
      const cartProduct = {
        _id: product._id,
        name: product.name,
        image: product.image,
        brand: product.brand,
        sellerId: product.sellerId,
        pricePerUnit: pricePerUnit,
        currentPrice: totalPrice,
        unit: product.measuringUnit,
        qty: minQty,
        totalPrice: totalPrice,
        minimumOrderQuantity: minQty,
        stocksLeft: Number(product.quantity) || 0
      };
      dispatch(addToCart(cartProduct));
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error("Failed to add product to cart");
    }
  };

  // Debug logging
  console.log('ProductMap render:', {
    deliverableProducts: deliverableProducts.length,
    nonDeliverableProducts: nonDeliverableProducts.length,
    hasUserLocation: Boolean(userLatitude && userLongitude),
    userLocation: [userLatitude, userLongitude]
  });
  
  // Check for missing location data in products
  const productsWithMissingLocation = [
    ...deliverableProducts.filter(p => !p.location || !p.location.coordinates || p.location.coordinates.length !== 2),
    ...nonDeliverableProducts.filter(p => !p.location || !p.location.coordinates || p.location.coordinates.length !== 2)
  ];
  
  if (productsWithMissingLocation.length > 0) {
    console.log('Products with missing location data:', productsWithMissingLocation);
  }
  
  // Ensure we only use products with valid location data
  const validDeliverableProducts = deliverableProducts.filter(
    product => product?.location?.coordinates && product.location.coordinates.length === 2
  );
  
  const validNonDeliverableProducts = nonDeliverableProducts.filter(
    product => product?.location?.coordinates && product.location.coordinates.length === 2
  );
  
  console.log('Valid products for map:', {
    deliverable: validDeliverableProducts.length,
    nonDeliverable: validNonDeliverableProducts.length
  });

  return (
    <div className="relative" style={{ zIndex: 10 }}>
      <MapContainer
        className={`${width} ${height} rounded-lg shadow-md`}
        center={[userLatitude || 20.59, userLongitude || 78.96]}
        zoom={zoom}
        scrollWheelZoom={true}
        ref={mapRef}
        style={{ zIndex: 10 }}
      >
        <GetMapRef setMapRef={(map) => { mapRef.current = map; }} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLatitude && userLongitude && (
          <Marker
            position={[userLatitude, userLongitude]}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Deliverable product markers */}
        {validDeliverableProducts.map((product) => (
          <Marker
            key={product._id}
            position={[product.location.coordinates[1], product.location.coordinates[0]]}
            icon={deliverableIcon}
            eventHandlers={{
              mouseover: (e) => {
                if (!isPinned) {
                  setHoveredProduct(product);
                  
                  // Get pixel position on screen
                  if (mapRef.current) {
                    const map = mapRef.current;
                    const pixelPosition = map.latLngToContainerPoint([
                      product.location.coordinates[1], 
                      product.location.coordinates[0]
                    ]);
                    setHoveredMarkerPosition(pixelPosition);
                  }
                }
              },
              mouseout: () => {
                if (!isPinned) {
                  setHoveredProduct(null);
                  setHoveredMarkerPosition(null);
                }
              },
              click: (e) => {
                setHoveredProduct(product);
                
                // Get pixel position on screen
                if (mapRef.current) {
                  const map = mapRef.current;
                  const pixelPosition = map.latLngToContainerPoint([
                    product.location.coordinates[1], 
                    product.location.coordinates[0]
                  ]);
                  setHoveredMarkerPosition(pixelPosition);
                }
                setIsPinned(true);
              }
            }}
          />
        ))}

        {/* Non-deliverable product markers */}
        {validNonDeliverableProducts.map((product) => (
          <Marker
            key={product._id}
            position={[product.location.coordinates[1], product.location.coordinates[0]]}
            icon={nonDeliverableIcon}
            eventHandlers={{
              mouseover: (e) => {
                if (!isPinned) {
                  setHoveredProduct(product);
                  
                  // Get pixel position on screen
                  if (mapRef.current) {
                    const map = mapRef.current;
                    const pixelPosition = map.latLngToContainerPoint([
                      product.location.coordinates[1], 
                      product.location.coordinates[0]
                    ]);
                    setHoveredMarkerPosition(pixelPosition);
                  }
                }
              },
              mouseout: () => {
                if (!isPinned) {
                  setHoveredProduct(null);
                  setHoveredMarkerPosition(null);
                }
              },
              click: (e) => {
                setHoveredProduct(product);
                
                // Get pixel position on screen
                if (mapRef.current) {
                  const map = mapRef.current;
                  const pixelPosition = map.latLngToContainerPoint([
                    product.location.coordinates[1], 
                    product.location.coordinates[0]
                  ]);
                  setHoveredMarkerPosition(pixelPosition);
                }
                setIsPinned(true);
              }
            }}
          />
        ))}
      </MapContainer>

      {/* Custom product info overlay */}
      {hoveredProduct && hoveredMarkerPosition && (
        <div 
          className="absolute bg-white p-3 rounded-lg shadow-lg w-64 max-w-xs"
          style={{
            left: hoveredMarkerPosition.x,
            top: hoveredMarkerPosition.y - 45,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'auto',
            zIndex: 40
          }}
        >
          <button 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => {
              setIsPinned(false);
              setHoveredProduct(null);
              setHoveredMarkerPosition(null);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <img
            src={hoveredProduct.image}
            alt={hoveredProduct.name}
            className="w-full h-32 object-cover object-center rounded-md"
          />
          <h3 className="font-semibold mt-2">{hoveredProduct.name}</h3>
          <p className="text-sm text-gray-600">Brand: {hoveredProduct.brand}</p>
          <p className="text-sm font-semibold text-red-500">
            Rs.{hoveredProduct.pricePerUnit}/{hoveredProduct.measuringUnit}
          </p>
          <p className="text-xs text-gray-500">
            Min Order: {hoveredProduct.minimumOrderQuantity || 1} {hoveredProduct.measuringUnit}
          </p>
          {validDeliverableProducts.some(p => p._id === hoveredProduct._id) ? (
            <>  
              <div className="flex items-center justify-between mt-2 mb-2">
                <span className="text-sm">Quantity:</span>
                <div className="flex items-center border rounded-md">
                  <button 
                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuantity(prev => Math.max(hoveredProduct.minimumOrderQuantity || 1, prev - 1));
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={hoveredProduct.minimumOrderQuantity || 1}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= (hoveredProduct.minimumOrderQuantity || 1)) {
                        setQuantity(val);
                      }
                    }}
                    className="w-12 text-center border-0 focus:outline-none"
                  />
                  <button 
                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuantity(prev => prev + 1);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Ensure price and quantity are numbers
                  const pricePerUnit = Number(hoveredProduct.pricePerUnit);
                  const qty = Number(quantity);
                  const totalPrice = pricePerUnit * qty;
                  
                  // Make sure we have valid numbers
                  if (isNaN(pricePerUnit) || isNaN(qty) || isNaN(totalPrice)) {
                    console.error("Invalid price calculation:", {
                      pricePerUnit,
                      qty,
                      product: hoveredProduct
                    });
                    toast.error("Error calculating price. Please try again.");
                    return;
                  }
                  
                  const cartProduct = {
                    _id: hoveredProduct._id,
                    name: hoveredProduct.name,
                    image: hoveredProduct.image,
                    brand: hoveredProduct.brand,
                    sellerId: hoveredProduct.sellerId,
                    pricePerUnit: pricePerUnit,
                    currentPrice: totalPrice,
                    unit: hoveredProduct.measuringUnit,
                    qty: qty,
                    totalPrice: totalPrice,
                    minimumOrderQuantity: Number(hoveredProduct.minimumOrderQuantity) || 1,
                    stocksLeft: Number(hoveredProduct.quantity) || 0
                  };
                  dispatch(addToCart(cartProduct));
                  toast.success(`${quantity} ${hoveredProduct.name} added to cart!`);
                  setIsPinned(false);
                  setHoveredProduct(null);
                  setHoveredMarkerPosition(null);
                }}
                className="mt-2 w-full bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Add to Cart
              </button>
            </>
          ) : (
            <p className="text-xs text-red-500 font-semibold mt-2">
              Not available for delivery
            </p>
          )}
        </div>
      )}

      {/* No products message */}
      {validDeliverableProducts.length === 0 && validNonDeliverableProducts.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg text-center"
          style={{ zIndex: 40 }}
        >
          <p className="font-medium text-gray-700">No products available in this area.</p>
          <p className="text-sm text-gray-500 mt-1">Try changing your location or switching to list view.</p>
          <p className="text-xs text-gray-400 mt-2">
            Debug info: Total products: {deliverableProducts.length + nonDeliverableProducts.length}, 
            Valid products: {validDeliverableProducts.length + validNonDeliverableProducts.length}
          </p>
        </div>
      )}
    </div>
  );
}

// Function to get map reference
function GetMapRef({ setMapRef }) {
  const map = useMap();
  React.useEffect(() => {
    setMapRef(map);
  }, [map, setMapRef]);
  return null;
}

export default ProductMap; 