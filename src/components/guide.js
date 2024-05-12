import React from "react";
import TimeImage from "../assets/clock.png";
import { useRef, useState } from "react";

const GuideUmum = (props) => {
  const sectionRefs = [useRef(null), useRef(null), useRef(null)]; // Tambahkan lebih banyak useRef sesuai kebutuhan

  // State untuk melacak indeks elemen mana yang akan digulirkan selanjutnya
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [piece, setPiece] = useState(0);

  const handleClick = () => {
    // Gulir ke elemen yang sesuai dengan indeks saat ini
    if (sectionRefs[currentSectionIndex].current) {
      sectionRefs[currentSectionIndex].current.scrollIntoView({
        behavior: "smooth",
      });
    }

    // Perbarui indeks untuk beralih ke elemen berikutnya secara bergantian
    setCurrentSectionIndex((prevIndex) => (prevIndex + 1) % sectionRefs.length);
    setPiece((prevIndex) => prevIndex + 1);
  };
  return (
    <div className=" absolute z-[999999] w-[100%] h-[80rem] bg-[#191919ab] flex justify-start items-start">
      {/* 1 */}
      {piece == 0 && (
        <>
          <div
            className="w-auto h-auto flex flex-col justify-start gap-3 mt-6 px-2 "
            ref={sectionRefs[0]}
          >
            <div className="w-full h-[4rem] bg-white flex items-center rounded-md">
              <div className="w-full h-auto flex justify-center px-3">
                <div className="flex gap-5 justify-between w-full ">
                  <div className="my-auto text-base font-medium leading-6 text-black capitalize">
                    Jadwal {props.tanggalTampil}, {props.lokasi}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[10rem] h-auto pr-10  mx-11">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#fff"
                  stroke="#fff"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="m17 14l-5-5m0 0l-5 5"
                />
              </svg>
            </div>
            <div className=" rounded-xl w-[100%]  h-auto bg-emerald-600  flex  flex-col flex-wrap justify-start p-3 items-start text-white text-sm ">
              <p>
                Anda Dapat Melihat Informasi Mengenai Tanggal dan Lokasi Griya
                Terapi Sehat Terpilih{" "}
              </p>
              <div className="flex justify-start gap-3 w-full h-auto mt-3">
                <button
                  className="flex justify-center item-center text-emerald-600 bg-white w-[4rem] h-auto p-1 rounded-md mt-2"
                  onClick={handleClick}
                >
                  Lanjut
                </button>
                <button
                  className="flex justify-center item-center text-emerald-600 bg-white w-[4rem] h-auto p-1 rounded-md mt-2"
                  onClick={props.handleClose}
                >
                  Lewati
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2 */}
      {piece == 1 && (
        <>
          <div className="w-auto h-auto flex flex-col justify-start gap-3 mt-16 px-2 ">
            <div className="w-full h-[4rem] bg-white flex items-center rounded-md mt-6">
              <div className="px-3 flex justify-start gap-4 w-full text-sm leading-4 capitalize bg-white h-auto text-neutral-950">
                <button className="w-[6rem] h-auto p-2 flex justify-center items-center bg-emerald-500 text-white rounded-md">
                  GTS Kemiling
                </button>
                <button className="w-[6rem] h-auto p-2 flex justify-center items-center bg-emerald-500 text-white rounded-md">
                  GTS Tirtayasa
                </button>
              </div>
            </div>
            <div className="w-[10rem] h-auto pr-10  mx-11" ref={sectionRefs[1]}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#fff"
                  stroke="#fff"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="m17 14l-5-5m0 0l-5 5"
                />
              </svg>
            </div>
            <div className=" rounded-xl w-[100%] h-auto bg-emerald-600  flex flex-wrap justify-start p-3 items-center text-white text-sm ">
              <p>
                Anda Dapat Memilih Lokasi GTS Yang Anda Inginkan Disini. Anda
                Hanya Perlu Menekan Salah Satu Tombol Dari Lokasi GTS Tersebut.
              </p>
              <div className="flex justify-start gap-3 w-full h-auto mt-3">
                <button
                  className="flex justify-center item-center text-emerald-600 bg-white w-[4rem] h-auto p-1 rounded-md mt-2"
                  onClick={handleClick}
                >
                  Lanjut
                </button>
                <button
                  className="flex justify-center item-center text-emerald-600 bg-white w-[4rem] h-auto p-1 rounded-md mt-2"
                  onClick={props.handleClose}
                >
                  Lewati
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* 3 */}
      {piece == 2 && (
        <>
          <div className="w-auto h-auto flex flex-col justify-start gap-3 mt-16 px-2 py-12 ">
            <div className="w-full h-[4rem] bg-white flex items-center rounded-md mt-16">
              <div className="px-3 flex justify-start gap-4 w-full text-sm leading-4 capitalize bg-white h-auto text-neutral-950">
                <button className="w-[6rem] h-auto p-2 flex justify-center items-center bg-emerald-500 text-white rounded-md">
                  Laki - Laki
                </button>
                <button className="w-[6rem] h-auto p-2 flex justify-center items-center bg-emerald-500 text-white rounded-md">
                  Perempuan
                </button>
              </div>
            </div>
            <div className="w-[10rem] h-auto pr-10  mx-11" ref={sectionRefs[2]}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#fff"
                  stroke="#fff"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="m17 14l-5-5m0 0l-5 5"
                />
              </svg>
            </div>
            <div className=" rounded-xl w-[100%] h-auto bg-emerald-600  flex flex-wrap justify-start p-3 items-center text-white text-sm ">
              <p>
                Anda Dapat Memilih Jenis Kelamin Terapis Yang Anda Inginkan
                Disini. Anda Hanya Perlu Menekan Salah Satu Tombol Dari Jenis
                Kelamin Tersebut.
              </p>
              <div className="flex justify-start gap-3 w-full h-auto mt-3">
                <button
                  className="flex justify-center item-center text-emerald-600 bg-white w-[4rem] h-auto p-1 rounded-md mt-2"
                  onClick={handleClick}
                >
                  Lanjut
                </button>
                <button
                  className="flex justify-center item-center text-emerald-600 bg-white w-[4rem] h-auto p-1 rounded-md mt-2"
                  onClick={props.handleClose}
                >
                  Lewati
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* 4 */}
      {piece == 3 && (
        <>
          <div className="w-auto h-auto flex flex-col justify-start gap-3 mt-[14rem] px-2 py-12 ">
            <div className="w-full h-[4rem] bg-white flex items-center rounded-md mt-16">
              <div className="flex flex-col justify-center px-4 py-3  text-sm bg-white rounded-xl shadow-sm w-full">
                <div className="flex gap-2.5 text-black">
                  <img
                    loading="lazy"
                    srcSet="https://www.wellingtonregional.com/sites/wellingtonregional.com/files/doctors_visit_1200x900.jpg"
                    className="shrink-0 aspect-[0.79] w-[90px] h-full rounded-md object-cover bg-cover"
                  />
                  <div className="flex flex-col flex-1 justify-center">
                    <div className="text-sm font-medium">Condoriano</div>

                    <div className="flex gap-2 mt-2.5">
                      <div className="flex  gap-2 w-[11rem] justify-center items-center bg-emerald-100 text-emerald-600 rounded-md p-1 text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#10B981"
                            d="M19 6h-3V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v1H5C3.3 6 2 7.3 2 9v9c0 1.7 1.3 3 3 3h14c1.7 0 3-1.3 3-3V9c0-1.7-1.3-3-3-3m-9-1h4v1h-4zm10 13c0 .6-.4 1-1 1H5c-.6 0-1-.4-1-1v-5.6L8.7 14H15c.1 0 .2 0 .3-.1l4.7-1.6z"
                          />
                        </svg>
                        <div className="flex-1">34 Tahun Pengalaman</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <div className="flex  gap-2 justify-center items-center w-[11rem]  bg-emerald-100 text-emerald-600 rounded-md p-1 text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 28 28"
                        >
                          <path
                            fill="#10B981"
                            d="m12.167 17.802l-.006-.014a8 8 0 0 1-.36-.094l-.009-.003A8 8 0 0 1 8.708 16a8 8 0 1 1 13.257-6.75c.039.413-.3.75-.715.75c-.414 0-.745-.337-.793-.749A6.5 6.5 0 1 0 11.496 16l.04.017q.3.123.616.217A2 2 0 0 1 16 17a2 2 0 0 1-3.833.802m-.986 1.272a9.5 9.5 0 0 1-4.53-3.054A3 3 0 0 0 4 19v.715C4 23.433 8.21 26 14 26s10-2.708 10-6.285V19a3 3 0 0 0-3-3h-3.645a3.5 3.5 0 0 1-6.174 3.074M19 10c0-1.512-.67-2.867-1.731-3.784a5 5 0 1 0-5.624 8.195A3.5 3.5 0 0 1 14 13.5a3.5 3.5 0 0 1 2.356.911A5 5 0 0 0 19 10"
                          />
                        </svg>
                        <div className="flex-1">120 Pasien Ditangani</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col flex-1 justify-end w-full mt-2 text-sm">
                  <div className="flex  gap-2 justify-center bg-emerald-500 text-white border border-solid font-semibold border-emerald-500 rounded-md p-1 text-sm">
                    Laki-laki
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[10rem] h-auto pr-10  mx-11 mt-16">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#fff"
                  stroke="#fff"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="m17 14l-5-5m0 0l-5 5"
                />
              </svg>
            </div>
            <div className=" rounded-xl w-[100%] h-auto bg-emerald-600  flex flex-wrap justify-start p-3 items-center text-white text-sm ">
              <p>
                Anda Dapat Melihat Beberapa Terapis Yang Tersedia Di Lokasi GTS
                Yang Anda Pilih Disini. Anda Dapat Melihat Beberapa Informasi
                Terkait Profil Terapis Disini.
              </p>
              <div
                className="flex justify-start gap-3 w-full h-auto mt-3"
                ref={sectionRefs[3]}
              >
                <button
                  className="flex justify-center item-center text-emerald-600 bg-white w-[4rem] h-auto p-1 rounded-md mt-2"
                  onClick={handleClick}
                >
                  Lanjut
                </button>
                <button
                  className="flex justify-center item-center text-emerald-600 bg-white w-[4rem] h-auto p-1 rounded-md mt-2"
                  onClick={props.handleClose}
                >
                  Lewati
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* 5 */}
      {piece == 4 && (
        <>
          <div className="w-auto h-auto flex flex-col justify-start gap-3 mt-[18rem] px-2 py-12 ">
            <div className="w-full h-[auto] bg-white flex flex-col items-center rounded-md mt-[13rem] py-4">
              <div className="px-3 flex justify-start gap-4 w-full text-base leading-4 capitalize bg-slate-50 h-auto text-neutral-950 ">
                <button className="w-[6rem] h-auto p-2 flex justify-center items-center text-emerald-500 bg-white rounded-lg font-medium">
                  Saat Ini
                </button>
                <button className="w-[6rem] h-auto p-2 flex justify-center items-center bg-emerald-500 text-white rounded-lg font-medium">
                  Kosong
                </button>
                <button className="w-[6rem] h-auto p-2 flex justify-center items-center text-emerald-500 bg-white rounded-lg font-medium">
                  Selesai
                </button>
              </div>
              <div className="flex w-[300px]  h-auto p-4 items-center rounded-xl bg-white shadow-md  justify-between   gap-7 text-emerald-600">
                <div className="w-[50px] h-[50px] flex justify-center items-center p-0 bg-emerald-100 p-3 rounded-md">
                  <img
                    loading="lazy"
                    src={TimeImage}
                    className="shrink-0 my-auto aspect-[0.85] fill-zinc-300 w-[100%] h-[100%]"
                  />
                </div>
                <div className="w-[80%] h-[auto] flex flex-col justify-between items-start p-0 mt-6">
                  <div className="text-black font-medium text[14px]">
                    Pukul 08:00 - 09:00
                  </div>
                  <p className="text-sm text-emerald-600 mt-1">
                    Tidak Ada Pasien
                  </p>
                </div>
              </div>
            </div>
            <div className="w-[10rem] h-auto pr-10  mx-11">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#fff"
                  stroke="#fff"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="m17 14l-5-5m0 0l-5 5"
                />
              </svg>
            </div>
            <div className=" rounded-xl w-[100%] h-auto bg-emerald-600  flex flex-wrap justify-start p-3 items-center text-white text-sm ">
              <p className="flex justify-start flex-wrap">
                Pada Tab <span className="ml-3 font-medium"> Kosong</span>Anda
                Dapat Melihat Beberapa Jadwal Jam Kosong Terapis. Yang Mana
                Dalam Rentang Waktu Yang Ditampilkan, Anda Dapat Datang Ke
                Lokasi GTS Dalam Rentang Waktu Tersebut, Karena Belum Ada Pasien
                Lain Yang Memesan Antrian.
              </p>
              <div
                className="flex justify-start gap-3 w-full h-auto mt-3"
                ref={sectionRefs[4]}
              >
                <button
                  className="flex justify-center item-center text-emerald-600 bg-white w-[4rem] h-auto p-1 rounded-md mt-2"
                  onClick={handleClick}
                >
                  Lanjut
                </button>
                <button
                  className="flex justify-center item-center text-emerald-600 bg-white w-[4rem] h-auto p-1 rounded-md mt-2"
                  onClick={props.handleClose}
                >
                  Lewati
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* 6 */}
      {piece == 5 && (
        <>
          <div className="w-auto h-auto flex flex-col justify-start gap-3 mt-[18rem] px-2 py-12 ">
            <div className="w-full h-[auto] bg-white flex flex-col items-center rounded-md mt-[13rem] py-4">
              <div className="px-3 flex justify-start gap-4 w-full text-base leading-4 capitalize bg-slate-50 h-auto text-neutral-950 ">
                <button className="w-[6rem] h-auto p-2 flex justify-center items-center bg-emerald-500 text-white rounded-lg font-medium">
                  Saat Ini
                </button>
                <button className="w-[6rem] h-auto p-2 flex justify-center items-center text-emerald-500 bg-white rounded-lg font-medium">
                  Kosong
                </button>

                <button className="w-[6rem] h-auto p-2 flex justify-center items-center text-emerald-500 bg-white rounded-lg font-medium">
                  Selesai
                </button>
              </div>
              <div className="flex flex-col justify-center p-4 px-7 bg-white rounded-xl shadow-md w-full">
                <div className="flex gap-2.5 justify-center text-sm font-medium">
                  <img
                    loading="lazy"
                    srcSet="https://www.wellingtonregional.com/sites/wellingtonregional.com/files/doctors_visit_1200x900.jpg"
                    className="shrink-0 aspect-[0.78] w-[100px] h-full object-cover bg-cover rounded-md"
                  />
                  <div className="flex flex-col flex-1">
                    <div className="flex gap-2 text-center text-emerald-600 whitespace-nowrap">
                      <div className="justify-center px-2 py-1 rounded-lg border border-emerald-500 border-solid px-16">
                        Bekam Kering
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-black">Condoriano</div>
                    <div className="mt-1 text-gray-400 text-sm">
                      Pasien : Usopp
                    </div>
                  </div>
                </div>
                <div className="flex gap-0 justify-center mt-4 rounded-xl w-full ">
                  <div className=" flex flex-1 text-sm text-black  gap-4">
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/da0895661014f504f1582d9801e90433fdd0e20311169c3e19d61080d6e7ac6c?"
                      className="shrink-0 aspect-square w-[18px]"
                    />
                    <div>12 Mei 2024</div>
                  </div>
                </div>
                <div className="flex gap-0 justify-center items-start rounded-xl w-full mt-2 ">
                  <div className="flex flex-1 text-sm text-black w-  justify-start">
                    <div className="flex gap-4 ">
                      <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/51f302d9064442e1b1b7d2c592ac690e6da9fc8c29a6a2149936dfdc19d77f6a?"
                        className="shrink-0 aspect-square w-[18px]"
                      />
                      <div>09:00 - 10:30</div>
                    </div>
                  </div>
                  <div className="flex gap-2.5 justify-center self-end px-2 py-1 text-sm font-medium text-center text-yellow-500 whitespace-nowrap rounded-2xl bg-yellow-500 bg-opacity-10">
                    <div className="shrink-0 my-auto w-2 h-2 bg-yellow-500 rounded-full" />
                    <div>Berlangsung</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[10rem] h-auto pr-10  mx-11">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#fff"
                  stroke="#fff"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="m17 14l-5-5m0 0l-5 5"
                />
              </svg>
            </div>
            <div className=" rounded-xl w-[100%] h-auto bg-emerald-600  flex flex-wrap justify-start p-3 items-center text-white text-sm ">
              <p className="flex justify-start flex-wrap">
                Pada Tab <span className="ml-3 font-medium"> Saat Ini</span>Anda
                Dapat Melihat Beberapa Jadwal Jam Yang Sedang Berlangsung Saat
                Ini. Disini Ditampilkan Informasi Terkait Terapis, Pasien, dan
                Jam Terapi Berlangsung
              </p>
              <div
                className="flex justify-start gap-3 w-full h-auto mt-3"
                ref={sectionRefs[5]}
              >
                <button
                  className="flex justify-center item-center text-emerald-600 bg-white w-[4rem] h-auto p-1 rounded-md mt-2"
                  onClick={handleClick}
                >
                  Lanjut
                </button>
                <button
                  className="flex justify-center item-center text-emerald-600 bg-white w-[4rem] h-auto p-1 rounded-md mt-2"
                  onClick={props.handleClose}
                >
                  Lewati
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* 7 */}
      {piece == 6 && (
        <>
          <div className="w-auto h-auto flex flex-col justify-start gap-3 mt-[18rem] px-2 mb-11  ">
            <div className="w-full h-[auto] bg-white flex flex-col items-center rounded-md mt-[13rem] py-4">
              <div className="px-3 flex justify-start gap-4 w-full text-base leading-4 capitalize bg-slate-50 h-auto text-neutral-950 ">
                <button className="w-[6rem] h-auto p-2 flex justify-center items-center text-emerald-500 bg-white rounded-lg font-medium">
                  Saat Ini
                </button>

                <button className="w-[6rem] h-auto p-2 flex justify-center items-center text-emerald-500 bg-white rounded-lg font-medium">
                  Kosong
                </button>
                <button className="w-[6rem] h-auto p-2 flex justify-center items-center bg-emerald-500 text-white rounded-lg font-medium">
                  Selesai
                </button>
              </div>
              <div className="flex flex-col justify-center p-4 px-7 bg-white rounded-xl shadow-md w-full">
                <div className="flex gap-2.5 justify-center text-sm font-medium">
                  <img
                    loading="lazy"
                    srcSet="https://www.wellingtonregional.com/sites/wellingtonregional.com/files/doctors_visit_1200x900.jpg"
                    className="shrink-0 aspect-[0.78] w-[100px] h-full object-cover bg-cover rounded-md"
                  />
                  <div className="flex flex-col flex-1">
                    <div className="flex gap-2 text-center text-emerald-600 whitespace-nowrap">
                      <div className="justify-center px-2 py-1 rounded-lg border border-emerald-500 border-solid px-16">
                        Bekam Kering
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-black">Condoriano</div>
                    <div className="mt-1 text-gray-400 text-sm">
                      Pasien : Usopp
                    </div>
                  </div>
                </div>
                <div className="flex gap-0 justify-center mt-4 rounded-xl w-full ">
                  <div className=" flex flex-1 text-sm text-black  gap-4">
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/da0895661014f504f1582d9801e90433fdd0e20311169c3e19d61080d6e7ac6c?"
                      className="shrink-0 aspect-square w-[18px]"
                    />
                    <div>12 Mei 2024</div>
                  </div>
                </div>
                <div className="flex gap-0 justify-center items-start rounded-xl w-full mt-2 ">
                  <div className="flex flex-1 text-sm text-black w-  justify-start">
                    <div className="flex gap-4 ">
                      <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/51f302d9064442e1b1b7d2c592ac690e6da9fc8c29a6a2149936dfdc19d77f6a?"
                        className="shrink-0 aspect-square w-[18px]"
                      />
                      <div>09:00 - 10:30</div>
                    </div>
                  </div>
                  <div className="flex gap-2.5 justify-center self-end px-2 py-1 text-sm font-medium text-center text-emerald-500 whitespace-nowrap rounded-2xl bg-emerald-500 bg-opacity-10">
                    <div className="shrink-0 my-auto w-2 h-2 bg-emerald-500 rounded-full" />
                    <div>Selesai</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[10rem] h-auto pr-10  mx-11">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#fff"
                  stroke="#fff"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="m17 14l-5-5m0 0l-5 5"
                />
              </svg>
            </div>
            <div className=" rounded-xl w-[100%] h-auto bg-emerald-600  flex flex-wrap justify-start p-3 items-center text-white text-sm ">
              <p className="flex justify-start flex-wrap">
                Pada Tab <span className="ml-3 font-medium"> Saat Ini</span>Anda
                Dapat Melihat Beberapa Jadwal Jam Yang Sudah Selesai. Disini
                Ditampilkan Informasi Terkait Terapis, Pasien, dan Jam Terapi
                Yang Sudah Selesai
              </p>
              <div
                className="flex justify-start gap-3 w-full h-auto mt-3"
                ref={sectionRefs[6]}
              >
                <button
                  className="flex justify-center item-center text-emerald-600 bg-white w-[4rem] h-auto p-1 rounded-md mt-2"
                  onClick={props.handleClose}
                >
                  Lewati
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GuideUmum;
