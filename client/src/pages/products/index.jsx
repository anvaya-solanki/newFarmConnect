import React, { useEffect, useState } from "react";
import ProductCard from "../../components/products/ProductCard";
import { useParams } from "react-router-dom";
import ProductSkeleton from "../../components/skeleton/ProductSkeleton";
import EmptyStateText from "../../components/empty_state/EmptyStateText";
import useProducts from "../../hooks/products/useProducts";
import { removeAllProductfromCart, setUserLocation } from "../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentLocation } from "../../utils/helper/getCurrentLocation";
import NavItem from "../../components/seller_dashboard/NavItem";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { FaMapMarkerAlt, FaListUl } from "react-icons/fa";
import LeafletMap from "../../components/map/LeafletMap";
import ProductMap from "../../components/map/ProductMap";
import { RxCross2 } from "react-icons/rx";
import { toast } from 'react-toastify';

function Product() {
  const { type } = useParams();
  const products_per_page = 50;

  const [deliverableProductData, setDeliverableProductData] = useState([]);
  const [nonDeliverableProductData, setNonDeliverableProductData] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"
  const [mapKey, setMapKey] = useState(0); // Used to force re-render the map component
  const [isMapReady, setIsMapReady] = useState(false); // New state to track map readiness

  const userLocation = useSelector((state) => state.userLocationReducer);

  const [selectedLatitute, setSelectedLatitute] = useState(userLocation[1] || 20.59);
  const [selectedLongitude, setSelectedLongitude] = useState(userLocation[0] || 78.96);

  const [showMap, setShowMap] = useState(false);

  const dispatch = useDispatch();

  const { getProductsByCategory, isLoading } = useProducts();

  const [isReachingEnd, setIsReachingEnd] = useState(false);

  useEffect(() => {
    const getLocInfo = async () => {
      try {
        const userCoordinates = await getCurrentLocation();
        dispatch(setUserLocation(userCoordinates));
      }
      catch (err) {
        console.error("Error getting user location:", err);
        toast.error("Could not get your location. Using default.");
        dispatch(removeAllProductfromCart());
      }
    }
    getLocInfo();
  }, []);

  // Handle map re-render when view mode changes
  useEffect(() => {
    if (viewMode === "map") {
      // Force re-render the map component
      setMapKey(prevKey => prevKey + 1);
      
      // Set map ready immediately since we already have data from list view
      if (deliverableProductData.length > 0 || nonDeliverableProductData.length > 0) {
        console.log("Map ready with existing data:", deliverableProductData.length + nonDeliverableProductData.length, "products");
        setIsMapReady(true);
      } else {
        // If no products, fetch data
        if (!isLoading && !isReachingEnd) {
          console.log("No products in map view, fetching data");
          fetchData();
        }
      }
    }
  }, [viewMode, userLocation]);

  const getProductData = async () => {
    console.log("getProductData called:", { 
      page, 
      isReachingEnd, 
      selectedLatitute, 
      selectedLongitude,
      viewMode,
      hasDeliverableProducts: deliverableProductData.length,
      hasNonDeliverableProducts: nonDeliverableProductData.length
    });
    
    if (!isReachingEnd && selectedLatitute && selectedLongitude) {
      try {
        console.log("Fetching products for page:", page);
        let data = await getProductsByCategory(type, page, products_per_page, selectedLongitude, selectedLatitute);
        
        console.log("Products data received:", {
          deliverable: data.deliverableProducts?.length,
          nonDeliverable: data.nonDeliverableProducts?.length,
          hasMore: data.hasMore
        });
        
        let deliverableProductDetails = data.deliverableProducts || [];
        let nonDeliverableProductDetails = data.nonDeliverableProducts || [];
        
        // Use a callback form for state updates to ensure we're working with the latest state
        setDeliverableProductData(prev => {
          // Create a Set to track IDs we've already added
          const existingIds = new Set(prev.map(p => p._id));
          // Filter out any products we already have to avoid duplicates
          const newProducts = deliverableProductDetails.filter(p => !existingIds.has(p._id));
          return [...prev, ...newProducts];
        });
        
        setNonDeliverableProductData(prev => {
          // Create a Set to track IDs we've already added
          const existingIds = new Set(prev.map(p => p._id));
          // Filter out any products we already have to avoid duplicates
          const newProducts = nonDeliverableProductDetails.filter(p => !existingIds.has(p._id));
          return [...prev, ...newProducts];
        });
        
        // Increment page for next fetch
        setPage(prevPage => prevPage + 1);
        
        // Update reaching end status
        setIsReachingEnd(!data.hasMore);
        
        // Set map as ready when we have data
        if (viewMode === "map") {
          console.log("Setting map ready after receiving data");
          setIsMapReady(true);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
        // Even if there's an error, we should show the map with no products
        if (viewMode === "map") {
          setIsMapReady(true);
        }
      }
    } else {
      console.log("Skipping fetch -", isReachingEnd ? "reached end" : "missing location");
      
      // If we're not fetching products but in map view, still show the map
      if (viewMode === "map") {
        setIsMapReady(true);
      }
    }
  };

  const fetchData = async () => {
    console.log("fetchData called");
    if (!isLoading) {
      await getProductData();
    } else {
      console.log("Skipping fetch - already loading");
    }
  };

  useEffect(() => {
    // Initial fetch
    if (deliverableProductData.length === 0 && nonDeliverableProductData.length === 0) {
      console.log("Initial fetch after component mount");
      fetchData();
    } else {
      console.log("Skipped initial fetch - already have data", {
        deliverable: deliverableProductData.length,
        nonDeliverable: nonDeliverableProductData.length
      });
    }
  }, []);

  useEffect(() => {
    // Reset all states when location changes
    setDeliverableProductData([]);
    setNonDeliverableProductData([]);
    setPage(1);
    setIsReachingEnd(false);
    setIsMapReady(false);
    setMapKey(prev => prev + 1); // Force map re-render
    
    console.log("Location changed, resetting states and fetching new data");
    
    // If in map view, fetch data immediately
    if (viewMode === "map") {
      console.log("In map view, fetching data immediately");
      fetchData();
    }
  }, [userLocation]);

  // Update selected coordinates when userLocation changes
  useEffect(() => {
    if (userLocation && userLocation.length === 2) {
      setSelectedLatitute(userLocation[1]);
      setSelectedLongitude(userLocation[0]);
      console.log("Updated selected coordinates:", userLocation[1], userLocation[0]);
    }
  }, [userLocation]);

  // Removed the page dependency to avoid triggering on page increment
  useEffect(() => {
    if (!isReachingEnd) {
      console.log("Fetch triggered by reaching end status change");
    }
  }, [isReachingEnd]);

  // Toggle between list and map views
  const toggleViewMode = () => {
    setViewMode(prevMode => {
      const newMode = prevMode === "list" ? "map" : "list";
      
      // When switching to map view, ensure we have products
      if (newMode === "map") {
        console.log("Switching to map view");
        
        // Force map rerender
        setMapKey(prevKey => prevKey + 1);
        
        // If we already have products, set map ready immediately
        if (deliverableProductData.length > 0 || nonDeliverableProductData.length > 0) {
          console.log("Setting map ready with existing products");
          setIsMapReady(true);
        } 
        // If no products, force a fetch
        else if (!isLoading && !isReachingEnd) {
          console.log("No products loaded yet, fetching data");
          fetchData();
        }
      }
      
      return newMode;
    });
  };

  // Reset product data when type changes
  useEffect(() => {
    console.log("Product type changed to:", type);
    setDeliverableProductData([]);
    setNonDeliverableProductData([]);
    setPage(1);
    setIsReachingEnd(false);
    
    // Force a fetch with the new product type
    if (type) {
      setTimeout(() => fetchData(), 0);
    }
  }, [type]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      console.log("Product component unmounting, cleaning up");
      setDeliverableProductData([]);
      setNonDeliverableProductData([]);
      setPage(1);
      setIsReachingEnd(false);
    };
  }, []);

  return (
    <>
      {/* View toggle button */}
      <div className="flex justify-center mt-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-red-700 focus:z-10 focus:ring-2 focus:ring-red-700 focus:text-red-700 ${viewMode === "list" ? "bg-red-100 text-red-700" : "text-gray-900"}`}
            onClick={() => viewMode !== "list" && toggleViewMode()}
          >
            <FaListUl className="inline mr-2" /> List View
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-r-lg hover:bg-gray-100 hover:text-red-700 focus:z-10 focus:ring-2 focus:ring-red-700 focus:text-red-700 ${viewMode === "map" ? "bg-red-100 text-red-700" : "text-gray-900"}`}
            onClick={() => viewMode !== "map" && toggleViewMode()}
          >
            <FaMapMarkerAlt className="inline mr-2" /> Map View
          </button>
        </div>
      </div>

      {/* Map view */}
      {viewMode === "map" && (
        <div className="w-11/12 mx-auto mt-4 mb-8">
          {isLoading ? (
            <div className="flex justify-center mt-4">
              <div className="animate-pulse">Loading products...</div>
            </div>
          ) : isMapReady ? (
            <ProductMap 
              key={mapKey}
              deliverableProducts={deliverableProductData}
              nonDeliverableProducts={nonDeliverableProductData}
              userLatitude={selectedLatitute} 
              userLongitude={selectedLongitude}
            />
          ) : (
            <div className="flex justify-center mt-4">
              <div className="animate-pulse">Preparing map...</div>
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="grid gap-4 md:gap-8 my-6 md:my-12 grid-cols-2 lg:grid-cols-4 w-11/12 mx-auto">
          {deliverableProductData &&
            deliverableProductData.length > 0 &&
            deliverableProductData.map((data, index) => (
              <ProductCard data={data} key={index} addOverlay={false} />
            ))}
          {nonDeliverableProductData && nonDeliverableProductData.length > 0 && nonDeliverableProductData.map((data, index) => (
            <ProductCard data={data} key={index} addOverlay={true} />
          ))}
          {isLoading && <ProductSkeleton noOfBoxes={products_per_page} />}
        </div>
      )}

      {!isLoading && isReachingEnd && (
        <EmptyStateText
          marginY={"my-12"}
          text="Oops! It seems like you have reached at the end of the page in this category. Check back later or explore other categories to find what you're looking for!"
        />
      )}

      <NavItem text={"Choose Location"} icon={<FaLocationCrosshairs />} isSelected={true} className={"fixed bottom-0 left-0 mb-2 ml-2 z-20 rounded-full"} onClick={() => {
        setShowMap(true);
      }} />

      {showMap &&
        <div className="mx-auto w-screen h-full fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-30 flex justify-center items-center">
          <div className="absolute opacity-90 bg-black z-30 w-full h-full">

          </div>
          <div className="z-40 w-11/12 h-[90%] relative">
            <div className="absolute bg-red-900 p-2 text-xl rounded-sm right-0 top-0 z-[999] m-2 cursor-pointer text-white" onClick={() => {
              setShowMap(false);
            }}><RxCross2 /></div>
            <div className="absolute bg-red-900 px-3 py-1.5 text-sm font-medium rounded-sm right-0 bottom-0 z-[999] m-2 cursor-pointer text-white">
              {selectedLatitute.toFixed(2)}, {selectedLongitude.toFixed(2)}
            </div>
            <div className="absolute text-red-700 px-3 py-1.5 text-xs font-medium rounded-sm left-[50%] -translate-x-[50%] bottom-0 z-[999] m-2">
              Red Marker: Your Location
            </div>
            <button className="absolute bg-red-900 px-3 py-1.5 font-medium text-sm rounded-sm left-0 bottom-0 z-[999] m-2 cursor-pointer text-white" onClick={() => {
              setShowMap(false);
              // Reset states before updating location
              setDeliverableProductData([]);
              setNonDeliverableProductData([]);
              setPage(1);
              setIsReachingEnd(false);
              setIsMapReady(false);
              // Update location and trigger fetch
              dispatch(setUserLocation([selectedLongitude, selectedLatitute]));
              // Force map re-render
              setMapKey(prev => prev + 1);
              // Trigger immediate fetch
              fetchData();
            }}>Select Location</button>
            <LeafletMap showSearchBox={true} latitude={selectedLatitute} longitude={selectedLongitude} width="w-full" height="h-full" setLatitude={setSelectedLatitute} setLongitude={setSelectedLongitude} />
          </div>
        </div>
      }
    </>
  );
}

export default Product;
