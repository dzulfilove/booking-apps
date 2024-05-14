import React from "react";
import "../styles/loading.css"; // Import CSS modules
import { MutatingDots } from "react-loader-spinner";
const Loading = () => {
  return (
    <>
      <div className="w-[100%] h-[100%] flex justify-center items-center flex-col text-emerald-500 bg-white font-medium text-lg">
        <MutatingDots
          visible={true}
          height="100"
          width="100"
          color="#10b981"
          secondaryColor="#10b981"
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
