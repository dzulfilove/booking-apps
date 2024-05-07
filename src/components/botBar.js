import { useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import "../styles/navbar.css";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

function BotBar() {
  const navRef = useRef();
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  let login = false;
  if (isLoggedIn) {
    login = true;
  }
  const showNavbar = () => {
    navRef.current.classList.toggle("responsive_nav");
  };

  const logout = () => {
    sessionStorage.removeItem("isLoggedIn");
    Swal.fire(
      {
        icon: "success",
        title: "Berhasil",
        text: "Berhasil Logout ",
        showConfirmButton: false,
        timer: 1500,
      },
      () => {}
    );
    window.location.href = "/home";
  };
  return (
    <header className="w-6 h-6 p-3 flex justify-center items-center rounded-md ">
      <nav ref={navRef} className="bg-emerald-600 text-white ">
        {login == false && (
          <>
            <Link
              loading="lazy"
              to="/masuk"
              onClick={showNavbar}
              className="flex justify-start items-center gap-4 w-[15rem] text-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="white"
                  fill-rule="evenodd"
                  d="M9.586 11L7.05 8.464L8.464 7.05l4.95 4.95l-4.95 4.95l-1.414-1.414L9.586 13H3v-2zM11 3h8c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2h-8v-2h8V5h-8z"
                />
              </svg>
              <div>Masuk Sebagai Admin</div>
            </Link>
            <Link
              loading="lazy"
              to="/home"
              onClick={showNavbar}
              className="flex justify-start items-center gap-4 w-[8rem]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <g fill="white">
                  <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06z" />
                  <path d="m12 5.432l8.159 8.159q.045.044.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198l.091-.086z" />
                </g>
              </svg>
              <div>Beranda</div>
            </Link>
          </>
        )}
        {login == true && (
          <>
            <Link
              loading="lazy"
              to="/dashboard"
              onClick={showNavbar}
              className="flex justify-start items-center gap-4 w-[8rem]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#fff"
                  d="M3 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zm0 8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zm10 0a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1zm1-17a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"
                />
              </svg>
              <div>Dashboard</div>
            </Link>
            <Link
              loading="lazy"
              to="/home"
              onClick={showNavbar}
              className="flex justify-start items-center gap-4 w-[8rem]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <g fill="white">
                  <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06z" />
                  <path d="m12 5.432l8.159 8.159q.045.044.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198l.091-.086z" />
                </g>
              </svg>
              <div>Beranda</div>
            </Link>
            <Link
              loading="lazy"
              onClick={showNavbar}
              to="/janji-temu"
              className="flex justify-start items-center gap-4 w-[8rem]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="white"
                  d="m18.13 12l1.26-1.26c.44-.44 1-.68 1.61-.74V9l-6-6H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h6v-1.87l.13-.13H5V5h7v7zM14 4.5l5.5 5.5H14zm5.13 9.33l2.04 2.04L15.04 22H13v-2.04zm3.72.36l-.98.98l-2.04-2.04l.98-.98c.19-.2.52-.2.72 0l1.32 1.32c.2.2.2.53 0 .72"
                />
              </svg>
              <div>janji Temu</div>
            </Link>
            <Link
              loading="lazy"
              onClick={showNavbar}
              to="/tindakan"
              className="flex justify-start items-center gap-4 w-[8rem]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="-2 -2 24 24"
              >
                <path
                  fill="white"
                  d="M7 12.917v.583a4.5 4.5 0 1 0 9 0v-1.67a3.001 3.001 0 1 1 2 0v1.67a6.5 6.5 0 1 1-13 0v-.583A6.002 6.002 0 0 1 0 7V2a2 2 0 0 1 2-2h1a1 1 0 1 1 0 2H2v5a4 4 0 1 0 8 0V2H9a1 1 0 1 1 0-2h1a2 2 0 0 1 2 2v5a6.002 6.002 0 0 1-5 5.917M17 10a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
                />
              </svg>
              <div>Tindakan</div>
            </Link>
            <Link
              loading="lazy"
              onClick={showNavbar}
              to="/terapis"
              className="flex justify-start items-center gap-4 w-[8rem]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 26 26"
              >
                <path
                  fill="white"
                  d="M13 0c-2.1 0-3.357.32-4.156.719c-.4.2-.684.41-.875.625a2 2 0 0 0-.313.531a1 1 0 0 0-.062.25l-.532 6.844c-.007.042.007.11 0 .156L7 9.813A1.003 1.003 0 0 0 7 10c0 3.3 2.7 6 6 6s6-2.7 6-6v-.156a1.003 1.003 0 0 0 0-.031l-.594-7.688a1 1 0 0 0-.062-.25s-.121-.316-.313-.531c-.191-.216-.475-.426-.875-.625C16.357.319 15.1 0 13 0m0 16c-6.6 0-12 3.106-12 5.906V26h24v-4.094c0-2.66-4.882-5.59-11.031-5.875A14.294 14.294 0 0 0 13 16m0-14c1.9 0 2.849.3 3.25.5c.134.067.15.093.188.125l.406 5.125C15.924 7.806 14.67 8 13 8s-2.923-.194-3.844-.25l.406-5.125c.037-.032.054-.058.188-.125c.401-.2 1.35-.5 3.25-.5m-.813 1v1.188H11v1.625h1.188V7h1.624V5.812H15V4.188h-1.188V3zM10 18.25L12.563 24H3v-2.094c0-.745 2.55-2.927 7-3.656m6 0c4.45.73 7 2.911 7 3.656V24h-9.563z"
                />
              </svg>
              <div>Terapis</div>
            </Link>

            <button
              loading="lazy"
              onClick={logout}
              className="flex justify-start items-center gap-4 w-[8rem] text-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="white"
                  d="M4 12a1 1 0 0 0 1 1h7.59l-2.3 2.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l4-4a1 1 0 0 0 .21-.33a1 1 0 0 0 0-.76a1 1 0 0 0-.21-.33l-4-4a1 1 0 1 0-1.42 1.42l2.3 2.29H5a1 1 0 0 0-1 1M17 2H7a3 3 0 0 0-3 3v3a1 1 0 0 0 2 0V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3a1 1 0 0 0-2 0v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3"
                />
              </svg>
              <div>Logout</div>
            </button>
          </>
        )}

        <button className="nav-btn nav-close-btn" onClick={showNavbar}>
          <FaTimes />
        </button>
      </nav>
      <button className="nav-btn" onClick={showNavbar}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 48 48"
        >
          <path
            fill="#fff"
            stroke="#fff"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="4"
            d="M7.95 11.95h32m-32 12h32m-32 12h32"
          />
        </svg>
      </button>
    </header>
  );
}

export default BotBar;
