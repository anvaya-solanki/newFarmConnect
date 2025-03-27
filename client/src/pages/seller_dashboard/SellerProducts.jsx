import React, { useState, useEffect } from "react";
import Spinner from "../../components/loading/Spinner";
import { notify } from "../../utils/helper/notification";
import { useDispatch } from "react-redux";
import { editProductDetails } from "../../redux/actions";
import { Link, useNavigate } from "react-router-dom";
import TableSkeleton from "../../components/skeleton/TableSkeleton";
import EmptyStateText from "../../components/empty_state/EmptyStateText";
import Heading from "../../components/heading/Heading";
import useProducts from "../../hooks/products/useProducts";

function SellerProducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getSellerProducts, deleteProduct } = useProducts();

  const [isDeleting, setIsDeleting] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); 
  const [isDataUpdated, setIsDataUpdated] = useState(false);
  const [isDataFetching, setIsDataFetching] = useState(true);
  const [indexOfProduct, setIndexOfProduct] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");

  const getProducts = async () => {
    let productData = await getSellerProducts();
    setData(productData);
    setFilteredData(productData); 
    setIsDataFetching(false);
  };

  useEffect(() => {
    setIsDataUpdated(false);
    getProducts();
  }, [isDataUpdated]);

  const handleDelete = async (productId, index) => {
    if (!isDeleting) {
      setIndexOfProduct(index);
      setIsDeleting(true);
      await deleteProduct(productId);
      setIsDataUpdated(true);
      setIndexOfProduct(-1);
      setIsDeleting(false);
    } else {
      notify("Please wait", "info");
    }
  };

  useEffect(() => {
    const filtered = data.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  return (
    <>
      {/* Table Header */}
      <Heading text={"Your Products"} textAlign="text-left" />

      {/* Search Bar */}
      <div className="w-full flex flex-col gap-2 md:flex-row items-center justify-between px-4">
        <div className="mt-1 relative w-full md:w-96">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
            placeholder="Search for products..."
          />
        </div>
        <Link to="add" className="w-full md:w-fit text-center">
          <div className="text-md py-2 px-4 text-white rounded cursor-pointer bg-sky-700">
            <i className="fa-regular fa-plus mr-2"></i>Add Product
          </div>
        </Link>
      </div>

      {/* Table */}
      <div className="flex flex-col overflow-x-auto w-full">
        <div className="min-w-full py-2">
          {isDataFetching ? (
            <TableSkeleton />
          ) : filteredData.length === 0 ? (
            <EmptyStateText text="No matching products found." />
          ) : (
            <table className="text-center text-sm font-light w-full">
              <thead className="border-b font-medium bg-gray-100">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Shelf Life</th>
                  <th className="px-6 py-4">Quantity Left</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Delivery Radius</th>
                  <th className="px-6 py-4">Minimum Order Quantity</th>
                  <th className="px-6 py-4">Measuring Unit</th>
                  <th className="px-6 py-4">Price Per Unit</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Operation</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-neutral-100">
                    <td className="px-6 py-4 font-medium">{index + 1}</td>
                    <td className="px-6 py-2">
                      <img src={item.image} alt="Image" loading="lazy" />
                    </td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4">{item.shelfLife}</td>
                    <td className="px-6 py-4">
                      {item.quantity} {item.measuringUnit}
                    </td>
                    <td className="px-6 py-4 cursor-pointer text-sky-700">
                      {item.location.coordinates[1].toFixed(4)},{" "}
                      {item.location.coordinates[0].toFixed(4)}
                    </td>
                    <td className="px-6 py-4">{item.deliveryRadius} km</td>
                    <td className="px-6 py-4">
                      {item.minimumOrderQuantity} {item.measuringUnit}
                    </td>
                    <td className="px-6 py-4">{item.measuringUnit}</td>
                    <td className="px-6 py-4">
                      Rs. {item.pricePerUnit}/{item.measuringUnit}
                    </td>
                    <td className="px-6 py-4">{item.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <div
                          className="text-md py-2 px-4 text-white bg-sky-700 rounded cursor-pointer"
                          onClick={() => {
                            dispatch(editProductDetails(item));
                            navigate(`edit`);
                          }}
                        >
                          <i className="fa-regular fa-pen-to-square mr-2"></i>Edit
                        </div>
                        <div
                          className="text-md py-2 px-4 text-white bg-rose-700 rounded cursor-pointer"
                          onClick={() => handleDelete(item._id, index)}
                        >
                          {indexOfProduct === index ? (
                            <Spinner width="w-5" color="#ffffff" />
                          ) : (
                            <i className="fa-regular fa-trash-can"></i>
                          )}
                          <span className="ml-1">Delete</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default SellerProducts;
