import React from "react";
import { Tabs, Tab } from "react-bootstrap";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import userImage from "../assets/user.png";
import { Component } from "react";
import { db, dbImage } from "../config/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
class DashboardAdmin extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      dataList: [],
      tanggal: dayjs().locale("id"),
      dataJanji: [],
      jumlahNow: 0,
      jumlahSelesai: 0,
      jumlahSemua: 0,
      bulan: "",
      totalBiaya: 0,
      jumlahBulan: 0,
      durasi: "",
      tanggalString: dayjs().locale("id").format("YYYY-MM-DD"),
    };
  }

  componentDidMount() {
    this.getAllJanji();
    this.formatTanggal();
    this.getAllJanjiBulan();
  }
  formatTanggal = () => {
    const tanggal = this.state.tanggalString;
    const bulan = this.formatBulan(dayjs(tanggal).locale("id").format("MMMM"));
    const hasil =
      ", " +
      tanggal.substring(8, 10) +
      " " +
      bulan +
      " " +
      tanggal.substring(0, 4);
    console.log("tanggal", hasil);
    this.getAllJanjiBulan(bulan);
    this.setState({ bulan: bulan });
  };
  formatBulan = (bulanInggris) => {
    // Objek untuk memetakan nama bulan dalam bahasa Inggris ke bahasa Indonesia
    const namaBulan = {
      January: "Januari",
      February: "Februari",
      March: "Maret",
      April: "April",
      May: "Mei",
      June: "Juni",
      July: "Juli",
      August: "Agustus",
      September: "September",
      October: "Oktober",
      November: "November",
      December: "Desember",
    };

    // Mengembalikan nama bulan dalam bahasa Indonesia berdasarkan nama bulan dalam bahasa Inggris
    return namaBulan[bulanInggris];
  };
  formatRupiah(biaya) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(biaya);
  }

  getAllJanji = async () => {
    try {
      const janjiCollection = collection(db, "janji_temu");

      const processedJanjiList = [];
      const tanggal = this.state.tanggalString;
      const q = query(janjiCollection, where("tanggal", "==", tanggal));

      const querySnapshot = await getDocs(q);

      for (const doc of querySnapshot.docs) {
        const janjiData = doc.data();

        // Mendapatkan nama dokter dari referensi dokter_ref
        const dokterDoc = await getDoc(janjiData.dokter_ref);
        const namaDokter = dokterDoc.data().nama;
        const fotoDokter = dokterDoc.data().foto;

        // Mendapatkan data tindakan dari referensi tindakan_ref
        const tindakanDoc = await getDoc(janjiData.tindakan_ref);
        const tindakanData = tindakanDoc.data();
        const namaTindakan = tindakanData.nama_tindakan;

        // Mendapatkan durasi dan biaya dari subkoleksi waktu_tindakan di dalam dokumen tindakan
        const waktuTindakanRef = janjiData.waktu_tindakan_ref;
        const waktuTindakanDoc = await getDoc(waktuTindakanRef);
        const waktuTindakanData = waktuTindakanDoc.data();
        const durasi = waktuTindakanData.durasi;
        const biaya = waktuTindakanData.biaya;

        // Menambahkan data janji temu ke dalam list processedJanjiList
        processedJanjiList.push({
          id: doc.id,
          dokter: namaDokter,
          jam_mulai: janjiData.jam_mulai,
          jam_selesai: janjiData.jam_selesai,
          nama_pasien: janjiData.nama_pasien,
          status: janjiData.status,
          tanggal: janjiData.tanggal,
          tindakan: namaTindakan,
          durasi: durasi,
          biaya: biaya,
          foto: fotoDokter,
          bulan: janjiData.bulan,
        });
      }

      console.log("Trans", processedJanjiList);
      const objekSelesai = processedJanjiList.filter(
        (objek) => objek.status === "selesai"
      );
      const objekBerlangsung = processedJanjiList.filter(
        (objek) => objek.status === "berlangsung"
      );
      const totalBiaya = processedJanjiList.reduce(
        (total, item) => total + item.biaya,
        0
      );
      const jumlahAll = processedJanjiList.length;
      const jumlahSelesai = objekSelesai.length;
      const jumlahNow = objekBerlangsung.length;
      console.log(processedJanjiList);
      console.log("jumlah", jumlahAll);
      // Setelah semua data diproses, atur state janjis dan kembalikan processedJanjiList
      await new Promise((resolve) => {
        this.setState(
          {
            dataJanji: processedJanjiList,
            jumlahNow: jumlahNow,
            jumlahSelesai: jumlahSelesai,
            jumlahSemua: jumlahAll,
          },
          resolve
        );
      });

      return processedJanjiList;
    } catch (error) {
      console.error("Error fetching processed janji data:", error);
    }
  };

  getAllJanjiBulan = async (bulan) => {
    try {
      const janjiCollection = collection(db, "janji_temu");

      const processedJanjiList = [];

      const q = query(janjiCollection, where("bulan", "==", bulan));

      const querySnapshot = await getDocs(q);

      for (const doc of querySnapshot.docs) {
        const janjiData = doc.data();

        // Mendapatkan nama dokter dari referensi dokter_ref
        const dokterDoc = await getDoc(janjiData.dokter_ref);
        const namaDokter = dokterDoc.data().nama;
        const fotoDokter = dokterDoc.data().foto;

        // Mendapatkan data tindakan dari referensi tindakan_ref
        const tindakanDoc = await getDoc(janjiData.tindakan_ref);
        const tindakanData = tindakanDoc.data();
        const namaTindakan = tindakanData.nama_tindakan;

        // Mendapatkan durasi dan biaya dari subkoleksi waktu_tindakan di dalam dokumen tindakan
        const waktuTindakanRef = janjiData.waktu_tindakan_ref;
        const waktuTindakanDoc = await getDoc(waktuTindakanRef);
        const waktuTindakanData = waktuTindakanDoc.data();
        const durasi = waktuTindakanData.durasi;
        const biaya = waktuTindakanData.biaya;

        // Menambahkan data janji temu ke dalam list processedJanjiList
        processedJanjiList.push({
          id: doc.id,
          dokter: namaDokter,
          jam_mulai: janjiData.jam_mulai,
          jam_selesai: janjiData.jam_selesai,
          nama_pasien: janjiData.nama_pasien,
          status: janjiData.status,
          tanggal: janjiData.tanggal,
          tindakan: namaTindakan,
          durasi: durasi,
          biaya: biaya,
          foto: fotoDokter,
          bulan: janjiData.bulan,
        });
      }

      console.log("Trans", processedJanjiList);
      const objekSelesai = processedJanjiList.filter(
        (objek) => objek.status === "selesai"
      );
      const objekBerlangsung = processedJanjiList.filter(
        (objek) => objek.status === "berlangsung"
      );
      const totalBiaya = processedJanjiList.reduce(
        (total, item) => total + item.biaya,
        0
      );

      const totalDurasi = processedJanjiList.reduce(
        (total, item) => total + item.durasi,
        0
      );
      const durasi = this.formatDurasi(totalDurasi);
      const jumlahAll = processedJanjiList.length;
      console.log(processedJanjiList);
      console.log("jumlah bulan", jumlahAll);
      // Setelah semua data diproses, atur state janjis dan kembalikan processedJanjiList
      await new Promise((resolve) => {
        this.setState(
          {
            jumlahBulan: jumlahAll,
            totalBiaya: totalBiaya,
            durasi: durasi,
          },
          resolve
        );
      });

      return processedJanjiList;
    } catch (error) {
      console.error("Error fetching processed janji data:", error);
    }
  };

  // Fungsi untuk mengonversi durasi menjadi format jam atau menit
  formatDurasi(durasi) {
    if (durasi < 60) {
      return durasi + " menit";
    } else if (durasi === 60) {
      return "1 jam";
    } else {
      const jam = Math.floor(durasi / 60);
      const menit = durasi % 60;
      if (menit === 0) {
        return jam + " jam";
      } else {
        return jam + " jam " + menit + " menit";
      }
    }
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
        <div className="flex flex-col gap-0 h-[100%] items-center pb-3 font-medium bg-slate-50 w-[100%] mt-6">
          <div className="flex gap-2 self-stretch p-4 w-full justify-between rounded-md items-center flex-col text-center text-white bg-gradient-to-r from-emerald-500 to-emerald-800 h-[27%]">
            <div className="flex-auto gap-0 text-lg font-medium">
              Dashboard Admin
            </div>
            <div className="flex justify-between w-full items-end">
              Halo Super Admin !
              <div className="flex  justify-between gap-2 p-2 items-center text-sm bg-white rounded-md  text-emerald-500">
                <img
                  loading="lazy"
                  src={userImage}
                  className="shrink-0 my-auto aspect-[0.85] fill-zinc-300 w-[18px]"
                />
                Admin
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3 self-stretch p-2 w-full justify-center rounded-md items-center text-center text-white bg-emerald-500 h-[27%]">
            <div
              className="flex-auto gap-0 text-lg font-medium flex-col items-center justify-start  h-[7rem]"
              style={{ borderRight: "1px solid white" }}
            >
              <div className="flex    p-1 items-center text-lg font-medium  rounded-md justify-center  text-white">
                Hari Ini
              </div>
              <div className="flex    p-1 items-center text-xs  rounded-md  text-white justify-center">
                Pasien Aktif
              </div>
              <div className="flex    p-1 items-center text-4xl  rounded-md  text-white justify-center">
                {this.state.jumlahSemua}
              </div>
            </div>
            <div
              className="flex-auto gap-0 text-lg font-medium flex-col items-center justify-start  h-[7rem]"
              style={{ borderLeft: "1px solid white" }}
            >
              <div className="flex    p-1 items-center text-sm  rounded-md  text-white justify-center">
                Berlangsung
              </div>
              <div className="flex    p-1 items-center text-xs  rounded-md  text-white justify-center">
                {this.state.jumlahNow}
              </div>
              <div className="flex    p-1 items-center text-sm  rounded-md  text-white justify-center">
                Selesai
              </div>
              <div className="flex    p-1 items-center text-xs  rounded-md  text-white justify-center">
                {this.state.jumlahSelesai}
              </div>
            </div>
          </div>
          <div className="w-full px-3 flex h-auto   py-3">
            <div className="flex gap-2h- p-2 w-full justify-center rounded-md items-center text-center mb-2 text-white bg-emerald-600 h-[100%]">
              <div className="flex-auto gap-0 text-lg font-medium flex-col items-start justify-start  p-1  w-[45%]">
                <div className="flex    p-1 items-center text-lg font-medium  rounded-md justify-start  text-white">
                  Bulan {this.state.bulan}
                </div>
                <div className="flex   font-normal p-1 items-center text-sm  rounded-md  text-slate-200 justify-start">
                  Capaian
                </div>
              </div>
              <div className="flex gap-1 text-lg font-medium  items-center justify-between  p-1 w-[55%] ">
                <div className="flex flex-col items-center justify-start gap-1">
                  <div className="flex    p-1 items-center text-sm  rounded-md  text-white justify-center">
                    Pasien
                  </div>
                  <div className="flex    p-1 items-center text-sm  rounded-md  text-white justify-center">
                    {this.state.jumlahBulan}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-start gap-1">
                  <div className="flex    p-1 items-center text-sm  rounded-md  text-white justify-center">
                    Durasi
                  </div>
                  <div className="flex    p-1 items-center text-sm  rounded-md  text-white justify-center">
                    {this.state.durasi}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-start gap-1">
                  <div className="flex    p-1 items-center text-sm  rounded-md  text-white justify-center">
                    Pendapatan
                  </div>
                  <div className="flex    p-1 items-center text-sm  rounded-md  text-white justify-center">
                    {this.formatRupiah(this.state.totalBiaya)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-[100%] h-[100%] mt-3 gap-4 justify-start items-center mb-4 overflow-y-scroll rounded-md ">
            <div className="flex gap-4 justify-center p-4 bg-white w-[90%] rounded-lg cursor-pointer shadow-md">
              <div className="flex justify-center items-center p-3.5 bg-emerald-100 rounded-lg h-[50px] w-[50px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#10B981"
                    d="M19 19H5V8h14m-3-7v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1V1m-1 11h-5v5h5z"
                  />
                </svg>
              </div>
              <div
                onClick={() => {
                  window.location.href = `/janji-temu/`;
                }}
                className="flex flex-col flex-1 justify-center my-auto"
              >
                <div className="mt-1 text-base font-medium leading-6 text-black">
                  Janji Hari Ini
                </div>
                <div className="mt-1 text-xs text-slate-500">Lihat Detail</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center p-4 bg-white w-[90%] rounded-lg cursor-pointer shadow-md">
              <div className="flex justify-center items-center p-3.5 bg-emerald-100 rounded-lg h-[50px] w-[50px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#10B981"
                    d="M3 13h2v-2H3zm0 4h2v-2H3zm0-8h2V7H3zm4 4h14v-2H7zm0 4h14v-2H7zM7 7v2h14V7zm-4 6h2v-2H3zm0 4h2v-2H3zm0-8h2V7H3zm4 4h14v-2H7zm0 4h14v-2H7zM7 7v2h14V7z"
                  />
                </svg>
              </div>
              <div
                onClick={() => {
                  window.location.href = `/janji-temu/bulan`;
                }}
                className="flex flex-col flex-1 justify-center my-auto"
              >
                <div className="mt-1 text-base font-medium leading-6 text-black">
                  Janji Bulan Ini
                </div>
                <div className="mt-1 text-xs text-slate-500">Lihat Detail</div>
              </div>
            </div>
          </div>
          {/* <button
            onClick={this.handleAdd}
            className="justify-center p-2 w-full text-sm text-center text-white bg-emerald-500 rounded-lg max-w-[320px]"
          >
            Tambah
          </button> */}
        </div>
      </div>
    );
  }
}

export default DashboardAdmin;
