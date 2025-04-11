// import React from "react";

// const FormHeading = ({ type, isSignInForm }) => {
//   return (
//     <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
//       {isSignInForm?"Sign In to":"Create"}{" "}
//       <span
//         className={`${type === "seller" ? "text-green-700" : "text-blue-600"}`}
//       >
//         {type === "user" ? "User" : "Seller"}
//       </span>{" "}
//       account
//     </h2>
//   );
// };

// export default FormHeading;
import React from "react";

const FormHeading = ({ type, isSignInForm }) => {
  // Choose the display label and color based on account type
  const getAccountLabel = (type) => {
    if (type === "admin") return "Admin";
    if (type === "seller") return "Seller";
    return "User";
  };

  const getTextColor = (type) => {
    if (type === "admin") return "text-purple-700";
    if (type === "seller") return "text-green-700";
    return "text-blue-600";
  };

  return (
    <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
      {isSignInForm ? "Sign In to" : "Create"}{" "}
      <span className={getTextColor(type)}>
        {getAccountLabel(type)}
      </span>{" "}
      account
    </h2>
  );
};

export default FormHeading;
