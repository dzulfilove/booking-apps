import React from "react";
import { Link } from "react-router-dom";

import Swal from "sweetalert2";
class Welcome extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      email: "",
      password: "",
      username: "",
      isSignUpActive: false,
    };
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          overflowX: "hidden",
        }}
      >
        <div className="flex flex-col items-center px-4 py-6 mx-auto w-full font-semibold text-white bg-emerald-500 border border-black border-solid leading-[120%] max-w-[480px]">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/4faa4496040e47dfddb6b05e71e5c4c7de16e60903f067f97ae3263b63352552?"
            className="aspect-[1.03] w-[38px]"
          />
          <div className="mt-5 text-2xl tracking-tighter text-center">
            Selamat Datang
          </div>
          <div className="self-stretch mt-5 text-base leading-5 text-center text-white capitalize">
            Selamat datang di Booking Schedule App
          </div>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/045cf4d9d9deb386ed00b0e99691358c84c9c4b2eb1b0dc7963e4677db46a168?"
            className="mt-12 w-full aspect-square max-w-[280px]"
          />
          <Link
            to="/masuk"
            className="flex justify-center items-center self-stretch p-2.5 mt-6 text-base text-white capitalize whitespace-nowrap rounded-lg bg-emerald-500 border border-solid border-white "
          >
            Masuk Sebagai Admin
          </Link>
          <Link
            to="/home"
            className="flex justify-center items-center self-stretch p-2.5 mt-2 text-base text-emerald-600 capitalize whitespace-nowrap rounded-lg bg-slate-50"
          >
            Masuk Sebagai Pasien
          </Link>
        </div>
      </div>
    );
  }
}

export default Welcome;
