import * as React from "react";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import Paper from "@mui/material/Paper";
import Grow from "@mui/material/Grow";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Link } from "react-router-dom";
import { NavLink } from "react-bootstrap";

export default function Sidebar() {
  const [checked, setChecked] = React.useState(false);

  const handleChange = () => {
    setChecked((prev) => !prev);
  };

  return (
    <>
      <div className="w-100 h-24 bg-emerald-500 flex justify-center items-center z-999 sticky fixed-bottom">
        <nav className="flex gap-7 mb-3 justify-center px-1 py-3 text-sm font-medium capitalize whitespace-nowrap bg-emerald-500 text-white ">
          <Link loading="lazy" to="/" className="flex flex-col">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/fde68c5ea5a5a6ca217a2facf4454ee962ca5e98122ca0e9f776f58c5dfed744?"
              className="self-center aspect-[0.89] fill-white w-[17px]"
            />
            <div className="mt-3">Beranda</div>
          </Link>
          <Link loading="lazy" to="/janji-temu" className="flex flex-col">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/5f737a68aa79a0fb24bc24118bf896fe3ecf6c3c91ab3e070f6a62bf376ccde2?"
              className="self-center w-3.5 aspect-[0.74] fill-white"
            />
            <div className="mt-3">janji Temu</div>
          </Link>
          <Link loading="lazy" to="/tindakan" className="flex flex-col">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/5f737a68aa79a0fb24bc24118bf896fe3ecf6c3c91ab3e070f6a62bf376ccde2?"
              className="self-center w-3.5 aspect-[0.74] fill-white"
            />
            <div className="mt-3">Tindakan</div>
          </Link>
          <Link loading="lazy" to="/terapis" className="flex flex-col">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/9bfee8e3783854d780488f53963d79a024198b6eccd86b3e87d16643f7f5d0f0?"
              className="self-center aspect-[1.11] fill-white w-[21px]"
            />
            <div className="mt-3">Terapis</div>
          </Link>
        </nav>
      </div>
    </>
  );
}
