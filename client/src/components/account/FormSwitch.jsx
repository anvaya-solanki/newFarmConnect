// import React, { useEffect } from "react";

// const FormSwitch = ({type, isSignInForm, setIsSignInForm}) => {

//   return (
//     <p className="text-sm text-center font-medium text-gray-500 dark:text-gray-400">
//       {isSignInForm?"Don’t have an account yet?":"Already have an account?"}{" "}
//       <a
//         className={`font-medium ${
//           type === "seller" ? "text-green-700" : "text-blue-600"
//         } hover:underline cursor-pointer`}
//         onClick={() => setIsSignInForm((prev)=>!prev)}
//       >
//         {isSignInForm?"Create an account":"Sign In"}
//       </a>
//     </p>
//   );
// };

// export default FormSwitch;
import React from "react";

const FormSwitch = ({ type, isSignInForm, setIsSignInForm }) => {
  const getTextColor = (type) => {
    if (type === "admin") return "text-purple-700";
    if (type === "seller") return "text-green-700";
    return "text-blue-600";
  };

  return (
    <p className="text-sm text-center font-medium text-gray-500 dark:text-gray-400">
      {isSignInForm
        ? "Don’t have an account yet?"
        : "Already have an account?"}{" "}
      <a
        className={`font-medium ${getTextColor(type)} hover:underline cursor-pointer`}
        onClick={() => setIsSignInForm((prev) => !prev)}
      >
        {isSignInForm ? "Create an account" : "Sign In"}
      </a>
    </p>
  );
};

export default FormSwitch;
