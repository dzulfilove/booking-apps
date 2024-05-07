import React from "react";
import "../styles/loading.css"; // Import CSS modules
import { MutatingDots } from "react-loader-spinner";
const Loading = () => {
  return (
    <>
      <div className="w-[100%] h-[100%] flex justify-center items-center flex-col bg-emerald-500 text-white font-medium text-lg">
        <MutatingDots
          visible={true}
          height="100"
          width="100"
          color="#fff"
          secondaryColor="#fff"
          radius="12.5"
          ariaLabel="mutating-dots-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
        <p>Mohon Tunggu Sebentar</p>
      </div>
    </>
  );
};

export default Loading;
