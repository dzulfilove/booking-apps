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
import Loading from "../components/loading";
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
      durasi: "0",
      loading: true,
      lokasi: "GTS Tirtayasa",
      tanggalString: dayjs().locale("id").format("YYYY-MM-DD"),
      dataJanjiLokasi: [],
      dataJanjiLokasiBulan: [],
    };
    this.sectionRef = React.createRef();
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

        let namaDokter = null;
        let fotoDokter = null;

        // Mendapatkan nama dokter dari referensi dokter_ref
        const dokterDoc = await getDoc(janjiData.dokter_ref);
        if (dokterDoc.data() == undefined) {
          console.log(dokterDoc, "dokkterrr");
          namaDokter = "Nama Dokter";
          fotoDokter =
            "https://w7.pngwing.com/pngs/48/259/png-transparent-profile-man-male-photo-face-portrait-illustration-vector-people-blue-thumbnail.png";
        } else {
          namaDokter = dokterDoc.data().nama;
          fotoDokter = dokterDoc.data().foto;
        }
        // Mendapatkan data tindakan dari referensi tindakan_ref
        const tindakanDoc = await getDoc(janjiData.tindakan_ref);

        let tindakanData = null;
        let namaTindakan = null;
        if (tindakanDoc.data() == undefined) {
          console.log(tindakanDoc, "timdakaanan");
          tindakanData = "Tindakan";
          namaTindakan = "Nama Tindakan";
        } else {
          tindakanData = tindakanDoc.data();
          namaTindakan = tindakanData.nama_tindakan;
        }

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
          lokasi: janjiData.lokasi,
        });
      }
      const objekLokasi = processedJanjiList.filter(
        (objek) => objek.lokasi === "GTS Tirtayasa"
      );

      console.log("Trans", processedJanjiList);
      const objekSelesai = objekLokasi.filter(
        (objek) => objek.status === "selesai"
      );
      const objekBerlangsung = objekLokasi.filter(
        (objek) => objek.status === "berlangsung"
      );
      const totalBiaya = objekLokasi.reduce(
        (total, item) => total + item.biaya,
        0
      );
      const jumlahAll = objekLokasi.length;
      const jumlahSelesai = objekSelesai.length;
      const jumlahNow = objekBerlangsung.length;
      console.log(objekLokasi);
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

        // Mendapatkan data tindakan dari referensi tindakan_ref
        // const tindakanDoc = await getDoc(janjiData.tindakan_ref);
        // const tindakanData = tindakanDoc.data();
        // const namaTindakan = tindakanData.nama_tindakan;

        // Mendapatkan durasi dan biaya dari subkoleksi waktu_tindakan di dalam dokumen tindakan
        const waktuTindakanRef = janjiData.waktu_tindakan_ref;
        const waktuTindakanDoc = await getDoc(waktuTindakanRef);
        const waktuTindakanData = waktuTindakanDoc.data();
        const durasi = waktuTindakanData.durasi;
        const biaya = waktuTindakanData.biaya;

        // Menambahkan data janji temu ke dalam list processedJanjiList
        processedJanjiList.push({
          id: doc.id,
          jam_mulai: janjiData.jam_mulai,
          jam_selesai: janjiData.jam_selesai,
          nama_pasien: janjiData.nama_pasien,
          status: janjiData.status,
          tanggal: janjiData.tanggal,
          durasi: durasi,
          biaya: biaya,
          bulan: janjiData.bulan,
          lokasi: janjiData.lokasi,
        });
      }

      console.log("Trans Bulan", processedJanjiList);
      const objekLokasi = processedJanjiList.filter(
        (objek) => objek.lokasi === "GTS Tirtayasa"
      );

      const totalBiaya = objekLokasi.reduce(
        (total, item) => total + item.biaya,
        0
      );

      const totalDurasi = objekLokasi.reduce(
        (total, item) => total + item.durasi,
        0
      );
      const durasi = this.formatDurasi(totalDurasi);
      const jumlahAll = objekLokasi.length;
      console.log(objekLokasi);
      console.log("jumlah bulan", jumlahAll);
      // Setelah semua data diproses, atur state janjis dan kembalikan processedJanjiList
      await new Promise((resolve) => {
        this.setState(
          {
            jumlahBulan: jumlahAll,
            totalBiaya: totalBiaya,
            durasi: durasi,
            loading: false,
            dataJanjiLokasi: processedJanjiList,
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

  handleFilterLokasi = (selectedOption) => {
    const objekLokasi = this.state.dataJanjiLokasi.filter(
      (objek) => objek.lokasi == selectedOption
    );

    const totalBiaya = objekLokasi.reduce(
      (total, item) => total + item.biaya,
      0
    );

    const totalDurasi = objekLokasi.reduce(
      (total, item) => total + item.durasi,
      0
    );
    const durasi = this.formatDurasi(totalDurasi);
    const jumlahAll = objekLokasi.length;

    const objekLokasi2 = this.state.dataJanji.filter(
      (objek) => objek.lokasi == selectedOption
    );

    console.log("Trans", this.state.dataJanji);
    const objekSelesai = objekLokasi2.filter(
      (objek) => objek.status === "selesai"
    );
    const objekBerlangsung = objekLokasi2.filter(
      (objek) => objek.status === "berlangsung"
    );

    const jumlahAll2 = objekLokasi2.length;
    const jumlahSelesai = objekSelesai.length;
    const jumlahNow = objekBerlangsung.length;
    this.setState({
      jumlahBulan: jumlahAll,
      totalBiaya: totalBiaya,
      durasi: durasi,
      jumlahNow: jumlahNow,
      jumlahSelesai: jumlahSelesai,
      jumlahSemua: jumlahAll2,
      lokasi: selectedOption,
    });
  };
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
        <div className="flex flex-col gap-0 h-auto items-center pb-2 font-medium bg-slate-50 w-[100%] mt-1">
          <div className="flex gap-2 self-stretch p-4 w-full justify-between rounded-md items-center flex-col text-center text-white bg-gradient-to-r from-emerald-500 to-emerald-800 h-[27%]">
            <div className="flex justify-start gap-4  mt-3 w-full text-sm leading-4 capitalize  h-auto text-neutral-950 mb-3">
              <button
                className="w-[10rem] h-auto p-2 flex justify-center items-center text-emerald-500 bg-white shadow-md rounded-md"
                style={{
                  backgroundColor:
                    this.state.lokasi == "GTS Kemiling" ? "#10B981" : "white",
                  color:
                    this.state.lokasi == "GTS Kemiling" ? "white" : "#10B981",
                  border:
                    this.state.lokasi == "GTS Kemiling"
                      ? " "
                      : "1px solid #10B981",
                }}
                onClick={() => {
                  this.handleFilterLokasi("GTS Kemiling");
                }}
              >
                GTS Kemiling
              </button>
              <button
                className="w-[10rem] h-auto p-2 flex justify-center items-center text-emerald-500 bg-white shadow-md rounded-md"
                onClick={() => {
                  this.handleFilterLokasi("GTS Tirtayasa");
                }}
                style={{
                  backgroundColor:
                    this.state.lokasi == "GTS Tirtayasa" ? "#10B981" : "white",
                  color:
                    this.state.lokasi == "GTS Tirtayasa" ? "white" : "#10B981",
                  border:
                    this.state.lokasi == "GTS Tirtayasa"
                      ? ""
                      : " 1px solid #10B981",
                }}
              >
                GTS Tirtayasa
              </button>
            </div>
            <div className="flex-auto gap-0 text-lg font-medium">
              Dashboard Admin
            </div>
            <div className="flex justify-between w-full items-end">
              Halo Super Admin !
              <div className="flex  justify-between gap-2 p-2 items-center text-sm bg-white rounded-md  text-emerald-500 mt-3">
                <img
                  loading="lazy"
                  src={userImage}
                  className="shrink-0 my-auto aspect-[0.85] fill-zinc-300 w-[18px]"
                />
                {this.state.lokasi}
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
              <div className="flex    p-1 items-center text-sm  rounded-md  text-white justify-center">
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
              <div className="flex    p-1 items-center text-sm  rounded-md  text-white justify-center">
                {this.state.jumlahNow}
              </div>
              <div className="flex    p-1 items-center text-sm  rounded-md  text-white justify-center">
                Selesai
              </div>
              <div className="flex    p-1 items-center text-sm  rounded-md  text-white justify-center">
                {this.state.jumlahSelesai}
              </div>
            </div>
          </div>
          <div className="w-full px-3 flex h-auto   py-3">
            <div className="flex flex-col gap-2 p-2 w-full justify-center rounded-md items-center text-center mb-2 text-white bg-emerald-600 h-[100%]">
              <div className="flex-auto gap-0 text-lg font-medium flex-col items-start justify-start  p-1  w-[100%] border-b border-b-white ">
                <div className="flex    p-1 items-center text-lg font-medium  rounded-md justify-start  text-white">
                  Capaian Bulan {this.state.bulan}
                </div>
              </div>
              <div className="flex gap-1 text-lg font-medium  items-center justify-between  p-1 w-[100%] ">
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
          <div className="flex flex-col w-[100%]   mt-3 gap-4 justify-start items-center mb-10 rounded-md  ">
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
