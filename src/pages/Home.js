import React, { Component } from "react";
import Slider from "react-slick";
import Swal from "sweetalert2";
import "../styles/homepage.css";
import dayjs, { Dayjs } from "dayjs";

import Select from "react-tailwindcss-select";
import Box from "@mui/material/Box";
import { Form } from "react-bootstrap";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Tabs, Tab } from "react-bootstrap";
import Sidebar from "../components/menu";
import TimeImage from "../assets/clock.png";
import Loading from "../components/loading";
import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import BotBar from "../components/botBar";
import Paper from "@mui/material/Paper";
import Fade from "@mui/material/Fade";
import Guide from "../components/guide";
class HomePage extends Component {
  constructor(props) {
    super(props);
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    let login = false;
    if (isLoggedIn) {
      login = true;
    }
    this.state = {
      // sudah terpakai
      dokterHadir: [],
      jenisKelamin: null,
      dokterHadirLakilaki: [],
      dokterHadirPerempuan: [],
      janjiSaatIni: [],
      janjiSudahSelesai: [],
      tanggal: dayjs().locale("id"),
      tanggalTampil: "",
      tanggalString: dayjs().locale("id").format("YYYY-MM-DD"),
      // belum terpakai
      dataList: [],
      isLogin: login,
      dataRegistrasi: {},
      kd_dokter: "",
      dokterTerpilih: {},
      catatan: "",
      trigger: false,
      no_rkm: "",
      isBayar: false,
      value: "tab2",
      loading: false,
      dataSelesai: [],
      dataJanji: [],
      dataKosong: [],
      checked: false,
    };
  }

  handleTab = (newValue) => {
    this.setState({ value: newValue });
  };
  handleMenu = () => {
    this.setState({ checked: true });
  };
  componentDidMount() {
    this.getAllKehadiran();
    this.getAllJanjiSaatIni();
    this.getAllJanjiSudahSelesai();
    this.formatTanggal();
  }
  formatTanggal = () => {
    const tanggal = this.state.tanggalString;
    const hari = this.formatHari(dayjs(tanggal).locale("id").format("dddd"));
    const bulan = this.formatBulan(dayjs(tanggal).locale("id").format("MMMM"));
    const hasil =
      hari +
      ", " +
      tanggal.substring(8, 10) +
      " " +
      bulan +
      " " +
      tanggal.substring(0, 4);
    console.log("tanggal", hasil);
    this.setState({ tanggalTampil: hasil });
  };

  sortirBerdasarkanJamKeluar(arrayObjek) {
    // Menggunakan metode sort() untuk melakukan pengurutan
    arrayObjek.sort((a, b) => {
      // Memisahkan jam dan menit dari string jamKeluar pada setiap objek
      let [jamAInt, menitAInt] = a.jam_selesai.split(":").map(Number);
      let [jamBInt, menitBInt] = b.jam_selesai.split(":").map(Number);

      // Membandingkan jam keluar dari dua objek
      if (jamAInt !== jamBInt) {
        return jamAInt - jamBInt;
      } else {
        return menitAInt - menitBInt;
      }
    });

    return arrayObjek;
  }
  getAllJanjiSaatIni = async () => {
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
          jam_mulai: janjiData.jam_mulai,
          jam_selesai: janjiData.jam_selesai,
          nama_pasien: janjiData.nama_pasien,
          status: janjiData.status,
          tanggal: janjiData.tanggal,
          durasi: durasi,
          biaya: biaya,
          namaDokter: namaDokter,
          fotoDokter: fotoDokter,
          namaTindakan: namaTindakan,
        });
      }

      console.log({ janji: processedJanjiList });

      // Setelah semua data diproses, atur state janjis dan kembalikan processedJanjiList

      const hasilTransformasi = processedJanjiList.map((objek) => {
        // Mengubah format tanggal dan menambahkan nama hari dalam bahasa Indonesia
        const hari = this.formatHari(
          dayjs(objek.tanggal).locale("id").format("dddd")
        );
        // Mengubah format bulan dan menambahkan nama bulan dalam bahasa Indonesia
        const bulan = this.formatBulan(
          dayjs(objek.tanggal).locale("id").format("MMMM")
        );
        return {
          ...objek,
          tanggal:
            hari +
            ", " +
            objek.tanggal.substring(8, 10) +
            " " +
            bulan +
            " " +
            objek.tanggal.substring(0, 4),
        };
      });
      console.log("Trans", hasilTransformasi);
      const objekSelesai = hasilTransformasi.filter(
        (objek) => objek.status === "selesai"
      );
      const objekBerlangsung = hasilTransformasi.filter(
        (objek) => objek.status === "berlangsung"
      );

      const hasilSortir = this.sortirBerdasarkanJamKeluar(hasilTransformasi);
      this.cekJamKosong(hasilSortir);

      // console.log(rentangWaktu, "waktuuuuu");
      await new Promise((resolve) => {
        this.setState(
          {
            dataJanji: processedJanjiList,
            janjiSaatIni: objekBerlangsung,
            dataSelesai: objekSelesai,
          },
          resolve
        );
      });

      return processedJanjiList;
    } catch (error) {
      console.error("Error fetching processed janji data:", error);
    }
  };
  getAllKehadiran = async () => {
    try {
      const currentDate = new Date();

      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0"); //
      const formattedDate = `${year}-${month}-${day}`;

      const kehadiranCollection = collection(db, "kehadirans");
      const querySnapshot = await getDocs(
        query(kehadiranCollection, where("tanggal", "==", formattedDate))
      );

      const kehadiranList = [];
      for (const doc of querySnapshot.docs) {
        const kehadiranData = doc.data();

        // Mendapatkan nama dokter dari referensi dokter_ref
        const dokterDoc = await getDoc(kehadiranData.dokter_ref);
        const foto = dokterDoc.data().foto;
        const namaDokter = dokterDoc.data().nama;
        const jenisKelamin = dokterDoc.data().jenis_kelamin;
        const pengalaman = dokterDoc.data().pengalaman;
        const umur = dokterDoc.data().umur;

        kehadiranList.push({
          id: doc.id,
          foto: foto,
          nama: namaDokter,
          jenis_kelamin: jenisKelamin,
          pengalaman: pengalaman,
          umur: umur,
        });
      }

      await new Promise((resolve) => {
        this.setState({ dokterHadir: kehadiranList }, resolve);
      });
    } catch (error) {
      console.error("Error fetching kehadiran:", error);
      throw error;
    }
  };

  cekJamKosong = (array) => {
    const waktuRentang = this.generateWaktuRentang();
    const arrayAwal = [{ id: "1", jam_mulai: "07:00", jam_selesai: "07:55" }];
    let arrayObjekAwal = [];

    if (array.length == 0) {
      arrayObjekAwal = arrayAwal;
    } else {
      arrayObjekAwal = array;
    }
    console.log("dataaa", array);
    const arrayObjekBaru = [];
    const sisajam = [];
    let currentStart = 0;
    let currentEnd = 0;
    for (let i = 0; i < arrayObjekAwal.length; i++) {
      const obj = arrayObjekAwal[i];
      const startIndex = waktuRentang.indexOf(obj.jam_masuk);
      const endIndex = waktuRentang.indexOf(obj.jam_keluar);
      if (startIndex !== -1 && endIndex !== -1) {
        arrayObjekBaru.push({
          id: obj.id,
          jam_masuk: obj.jam_mulai,
          jam_keluar: obj.jam_selesai,
        });
        sisajam.push(...waktuRentang.slice(currentEnd, startIndex));
        currentStart = startIndex;
        currentEnd = endIndex + 1;
      }
    }
    sisajam.push(...waktuRentang.slice(currentEnd));
    const sortedSisaJam = sisajam.sort(
      (a, b) => new Date(`1970-01-01T${a}:00`) - new Date(`1970-01-01T${b}:00`)
    );
    const sisaJamObjek = sortedSisaJam.reduce((acc, curr, index, arr) => {
      if (index % 2 === 0 && index < arr.length - 1) {
        acc.push({ jam_masuk: curr, jam_keluar: arr[index + 1] });
      }
      return acc;
    }, []);
    const jamTerakhir = arrayObjekAwal[arrayObjekAwal.length - 1].jam_selesai;
    let index = 0;

    for (let i = 0; i < sisajam.length; i++) {
      if (sisajam[i] == jamTerakhir) {
        index = i;
      }
    }

    let hasil = [];

    for (index; index < sisajam.length; index++) {
      console.log("index", index);
      let jamMasuk = jamTerakhir;

      jamMasuk = sisajam[index];

      let jamKeluar = this.tambahSatuJam(jamMasuk);

      for (let j = 0; j < sisajam.length; j++) {
        if (jamKeluar == sisajam[j]) {
          index = j - 1;
        }
      }
      console.log(jamMasuk, "Masuk");
      console.log(jamKeluar, "keluar");

      hasil.push({
        jam_mulai: jamMasuk,
        jam_selesai: jamKeluar,
      });
      const cekJam = this.cekJamLebihBesar(
        jamKeluar,
        sisajam[sisajam.length - 1]
      );
      if (cekJam == true || index == sisajam.length - 1) {
        console.log("keluarahah", jamKeluar);
        console.log(sisajam[sisajam.length - 1]);
        break;
      }
    }
    this.setState({ dataKosong: hasil });

    // console.log(arrayObjekBaru);
    console.log(hasil);
  };
  generateWaktuRentang() {
    const waktuRentang = [];
    const startJam = 8;
    const endJam = 20;

    for (let jam = startJam; jam <= endJam; jam++) {
      for (let menit = 0; menit < 60; menit += 5) {
        const jamStr = String(jam).padStart(2, "0");
        const menitStr = String(menit).padStart(2, "0");
        waktuRentang.push(`${jamStr}:${menitStr}`);
      }
    }

    return waktuRentang;
  }
  cekJamLebihBesar(jamA, jamB) {
    // Memisahkan jam dan menit dari string jamA dan jamB
    let [jamAInt, menitAInt] = jamA.split(":").map(Number);
    let [jamBInt, menitBInt] = jamB.split(":").map(Number);

    // Memeriksa apakah jam A lebih besar dari jam B
    if (jamAInt > jamBInt || (jamAInt === jamBInt && menitAInt > menitBInt)) {
      return true;
    } else {
      return false;
    }
  }
  tambahSatuJam(jamMulai) {
    const [jam, menit] = jamMulai.split(":").map(Number);
    const waktuMulai = new Date();
    waktuMulai.setHours(jam);
    waktuMulai.setMinutes(menit);
    // Tambahkan durasi ke waktuMulai
    const waktuSelesai = new Date(waktuMulai.getTime() + 60 * 60000); // Konversi durasi dari menit ke milidetik

    // Format waktuSelesai ke dalam string "HH:mm"
    let jamSelesai = `${String(waktuSelesai.getHours()).padStart(
      2,
      "0"
    )}:${String(waktuSelesai.getMinutes()).padStart(2, "0")}`;
    const cek = this.cekJamLebihBesar(jamSelesai, "21:00");
    if (cek == true) {
      jamSelesai = "21:00";
    }
    return jamSelesai;
  }

  formatHari = (hariInggris) => {
    // Objek untuk memetakan nama hari dalam bahasa Inggris ke bahasa Indonesia
    const namaHari = {
      Monday: "Senin",
      Tuesday: "Selasa",
      Wednesday: "Rabu",
      Thursday: "Kamis",
      Friday: "Jumat",
      Saturday: "Sabtu",
      Sunday: "Minggu",
    };

    // Mengembalikan nama hari dalam bahasa Indonesia berdasarkan nama hari dalam bahasa Inggris
    return namaHari[hariInggris];
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
  getAllJanjiSudahSelesai = async () => {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const janjiTemuCollection = collection(db, "janji_temu");
      const querySnapshot = await getDocs(
        query(
          janjiTemuCollection,
          where("tanggal", "==", formattedDate),
          where("status", "==", "selesai")
        )
      );

      const janjiSudahSelesaiList = [];
      for (const doc of querySnapshot.docs) {
        const janjiTemuData = doc.data();

        // Ambil data dari referensi dokter_ref
        const dokterRef = janjiTemuData.dokter_ref;
        const dokterDoc = await getDoc(dokterRef);
        const dokterData = dokterDoc.data();
        const namaDokter = dokterData.nama;
        const fotoDokter = dokterData.foto;

        // Ambil data dari referensi tindakan_ref
        const tindakanRef = janjiTemuData.tindakan_ref;
        const tindakanDoc = await getDoc(tindakanRef);
        const tindakanData = tindakanDoc.data();
        const namaTindakan = tindakanData.nama_tindakan;

        janjiSudahSelesaiList.push({
          id: doc.id,
          namaDokter: namaDokter,
          fotoDokter: fotoDokter,
          namaTindakan: namaTindakan,
          ...janjiTemuData,
        });
      }

      await new Promise((resolve) => {
        this.setState({ janjiSudahSelesai: janjiSudahSelesaiList }, resolve);
      });

      console.log({ janjiSudahSelesai: this.state.janjiSudahSelesai });
    } catch (error) {
      console.error("Error fetching current appointments:", error);
      throw error;
    }
  };

  handleFilter = async (selectedOption) => {
    await new Promise((resolve) => {
      this.setState({ jenisKelamin: selectedOption.value }, resolve);
    });

    const filterLakilaki = this.state.dokterHadir.filter(
      (dokter) => dokter.jenis_kelamin === "Laki-laki"
    );
    await new Promise((resolve) => {
      this.setState({ dokterHadirLakilaki: filterLakilaki }, resolve);
    });

    // Filter dokterHadir laki -laki
    const filterPerempuan = this.state.dokterHadir.filter(
      (dokter) => dokter.jenis_kelamin === "Perempuan"
    );
    await new Promise((resolve) => {
      this.setState({ dokterHadirPerempuan: filterPerempuan }, resolve);
    });
    // console.log({ jenisKelamin: this.state.jenisKelamin });
    // console.log({ dokterHadir: this.state.dokterHadir });
    // console.log({ dokterHadirLakilaki: this.state.dokterHadirLakilaki });
    // console.log({ dokterHadirPerempuan: this.state.dokterHadirPerempuan });
  };

  render() {
    console.log(this.state.dataKosong, "kosong");
    var settings = {
      dots: false,
      infinite: true,
      autoplay: true,
      speed: 2000,
      autoplaySpeed: 3000,
      cssEase: "linear",
      slidesToShow: 1,
      slidesToScroll: 1,
    };

    const options = [
      { value: "Laki-laki", label: "Laki-laki" },
      { value: "Perempuan", label: "Perempuan" },
    ];

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          overflowX: "hidden",
          position: "relative",
          marginBottom: "2rem",
        }}
      >
        {/* <Guide /> */}
        {this.state.loading == true && (
          <>
            <div className="w-[100%] h-[100%] absolute z-[999999] bg-white">
              <Loading />
            </div>
          </>
        )}

        <div className="flex flex-col mx-auto w-[100%] justify-start mt-6">
          <div className="w-full h-auto flex justify-center px-3">
            <div className="flex gap-5 justify-between w-full ">
              <div className="my-auto text-ms font-medium leading-6 text-black capitalize">
                Jadwal {this.state.tanggalTampil}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center px-7 mt-3 w-full text-xs leading-4 capitalize bg-white h-auto text-neutral-950">
            <div className="flex items-center px-2.5 h-10  w-full bg-white rounded-lg border border-solid border-zinc-400 gap-2 ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="#29a7d1"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 9a5 5 0 1 0 10 0A5 5 0 1 0 7 9m5 5v7m-5-3h10"
                />
              </svg>
              <Select
                options={options}
                placeholder={`Pilih jenis Kelamin ${
                  this.state.jenisKelamin ? `- ${this.state.jenisKelamin}` : ""
                }`}
                onChange={this.handleFilter}
                classNames={{
                  menuButton: ({ isDisabled }) =>
                    `flex text-sm text-gray-500  rounded shadow-sm transition-all duration-300 focus:outline-none ${
                      isDisabled
                        ? "bg-gray-200"
                        : "bg-white focus:ring focus:ring-blue-500/20"
                    }`,
                  menu: "absolute z-10 w-full bg-white shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700",
                  listItem: ({ isSelected }) =>
                    `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded ${
                      isSelected
                        ? `text-white bg-emerald-500`
                        : `text-gray-500 hover:bg-emerald-100 hover:text-emerald-500`
                    }`,
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 px-4 py-3.5 mt-1.5 w-full bg-slate-50 leading-[120%] ">
            <div className="w-100 h-auto py-4 px-2 flex flex-col justify-between gap-4  bg-gradient-to-r from-emerald-400 to-emerald-700 rounded-lg">
              <div className="w-full text-base leading-5 capitalize text-white font-medium flex justify-start px-3">
                Terapis Yang Tersedia
              </div>
              {this.state.dokterHadir.length <= 1 ? (
                <>
                  {this.state.dokterHadir.map((dokter) => (
                    <div className="flex flex-col justify-center px-4 py-3  text-xs bg-white rounded-xl shadow-sm w-full">
                      <div className="flex gap-2.5 text-black">
                        <img
                          loading="lazy"
                          srcSet={dokter.foto}
                          className="shrink-0 aspect-[0.79] w-[90px] h-full rounded-md object-cover bg-cover"
                        />
                        <div className="flex flex-col flex-1 justify-center">
                          <div className="text-sm font-medium">
                            {dokter.nama}
                          </div>
                          <div className="text-gray-400 mt-1">
                            Umur : {dokter.umur} Tahun
                          </div>
                          <div className="flex gap-2 mt-2.5">
                            <div className="flex  gap-2 justify-center bg-emerald-100 text-emerald-500 rounded-md p-1 text-xs">
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
                              <div className="flex-1">
                                {dokter.pengalaman} Tahun
                              </div>
                            </div>
                            <div className="flex  gap-2 justify-center bg-emerald-100 text-emerald-500 rounded-md p-1 text-xs">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 1024 1024"
                              >
                                <path
                                  fill="#10B981"
                                  d="M885.9 533.7c16.8-22.2 26.1-49.4 26.1-77.7c0-44.9-25.1-87.4-65.5-111.1a67.67 67.67 0 0 0-34.3-9.3H572.4l6-122.9c1.4-29.7-9.1-57.9-29.5-79.4A106.62 106.62 0 0 0 471 99.9c-52 0-98 35-111.8 85.1l-85.9 311H144c-17.7 0-32 14.3-32 32v364c0 17.7 14.3 32 32 32h601.3c9.2 0 18.2-1.8 26.5-5.4c47.6-20.3 78.3-66.8 78.3-118.4c0-12.6-1.8-25-5.4-37c16.8-22.2 26.1-49.4 26.1-77.7c0-12.6-1.8-25-5.4-37c16.8-22.2 26.1-49.4 26.1-77.7c-.2-12.6-2-25.1-5.6-37.1M184 852V568h81v284zm636.4-353l-21.9 19l13.9 25.4a56.2 56.2 0 0 1 6.9 27.3c0 16.5-7.2 32.2-19.6 43l-21.9 19l13.9 25.4a56.2 56.2 0 0 1 6.9 27.3c0 16.5-7.2 32.2-19.6 43l-21.9 19l13.9 25.4a56.2 56.2 0 0 1 6.9 27.3c0 22.4-13.2 42.6-33.6 51.8H329V564.8l99.5-360.5a44.1 44.1 0 0 1 42.2-32.3c7.6 0 15.1 2.2 21.1 6.7c9.9 7.4 15.2 18.6 14.6 30.5l-9.6 198.4h314.4C829 418.5 840 436.9 840 456c0 16.5-7.2 32.1-19.6 43"
                                />
                              </svg>
                              <div className="flex-1">4.8</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col flex-1 justify-end w-full mt-2 text-sm">
                        <div className="flex  gap-2 justify-center bg-emerald-500 text-white border border-solid font-semibold border-emerald-500 rounded-md p-1 text-xs">
                          {dokter.jenis_kelamin}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <Slider {...settings}>
                    {/* Card Dokter */}
                    {this.state.jenisKelamin === "Laki-laki"
                      ? this.state.dokterHadirLakilaki.map((dokter) => (
                          <div className="flex flex-col justify-center px-4 py-3  text-xs bg-white rounded-xl shadow-md w-full">
                            <div className="flex gap-2.5 text-black">
                              <img
                                loading="lazy"
                                srcSet={dokter.foto}
                                className="shrink-0 aspect-[0.79] w-[90px] h-full rounded-md object-cover bg-cover"
                              />
                              <div className="flex flex-col flex-1 justify-center">
                                <div className="text-sm font-medium">
                                  {dokter.nama}
                                </div>
                                <div className="text-gray-400 mt-1">
                                  Umur : {dokter.umur} Tahun
                                </div>
                                <div className="flex gap-2 mt-2.5">
                                  <div className="flex  gap-2 justify-center bg-emerald-100 text-emerald-500 rounded-md p-1 text-xs">
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
                                    <div className="flex-1">
                                      {dokter.pengalaman} Tahun
                                    </div>
                                  </div>
                                  <div className="flex  gap-2 justify-center bg-emerald-100 text-emerald-500 rounded-md p-1 text-xs">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="18"
                                      height="18"
                                      viewBox="0 0 1024 1024"
                                    >
                                      <path
                                        fill="#10B981"
                                        d="M885.9 533.7c16.8-22.2 26.1-49.4 26.1-77.7c0-44.9-25.1-87.4-65.5-111.1a67.67 67.67 0 0 0-34.3-9.3H572.4l6-122.9c1.4-29.7-9.1-57.9-29.5-79.4A106.62 106.62 0 0 0 471 99.9c-52 0-98 35-111.8 85.1l-85.9 311H144c-17.7 0-32 14.3-32 32v364c0 17.7 14.3 32 32 32h601.3c9.2 0 18.2-1.8 26.5-5.4c47.6-20.3 78.3-66.8 78.3-118.4c0-12.6-1.8-25-5.4-37c16.8-22.2 26.1-49.4 26.1-77.7c0-12.6-1.8-25-5.4-37c16.8-22.2 26.1-49.4 26.1-77.7c-.2-12.6-2-25.1-5.6-37.1M184 852V568h81v284zm636.4-353l-21.9 19l13.9 25.4a56.2 56.2 0 0 1 6.9 27.3c0 16.5-7.2 32.2-19.6 43l-21.9 19l13.9 25.4a56.2 56.2 0 0 1 6.9 27.3c0 16.5-7.2 32.2-19.6 43l-21.9 19l13.9 25.4a56.2 56.2 0 0 1 6.9 27.3c0 22.4-13.2 42.6-33.6 51.8H329V564.8l99.5-360.5a44.1 44.1 0 0 1 42.2-32.3c7.6 0 15.1 2.2 21.1 6.7c9.9 7.4 15.2 18.6 14.6 30.5l-9.6 198.4h314.4C829 418.5 840 436.9 840 456c0 16.5-7.2 32.1-19.6 43"
                                      />
                                    </svg>
                                    <div className="flex-1">4.8</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col flex-1 justify-end w-full mt-2 text-sm">
                              <div className="flex  gap-2 justify-center bg-emerald-500 text-white border border-solid font-semibold border-emerald-500 rounded-md p-1 text-xs">
                                {dokter.jenis_kelamin}
                              </div>
                            </div>
                          </div>
                        ))
                      : this.state.jenisKelamin === "Perempuan"
                      ? this.state.dokterHadirPerempuan.map((dokter) => (
                          <div className="flex flex-col justify-center px-4 py-3  text-xs bg-white rounded-xl shadow-sm w-full">
                            <div className="flex gap-2.5 text-black">
                              <img
                                loading="lazy"
                                srcSet={dokter.foto}
                                className="shrink-0 aspect-[0.79] w-[90px] h-full rounded-md object-cover bg-cover"
                              />
                              <div className="flex flex-col flex-1 justify-center">
                                <div className="text-sm font-medium">
                                  {dokter.nama}
                                </div>
                                <div className="text-gray-400 mt-1">
                                  Umur : {dokter.umur} Tahun
                                </div>
                                <div className="flex gap-2 mt-2.5">
                                  <div className="flex  gap-2 justify-center bg-emerald-100 text-emerald-500 rounded-md p-1 text-xs">
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
                                    <div className="flex-1">
                                      {dokter.pengalaman} Tahun
                                    </div>
                                  </div>
                                  <div className="flex  gap-2 justify-center bg-emerald-100 text-emerald-500 rounded-md p-1 text-xs">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="18"
                                      height="18"
                                      viewBox="0 0 1024 1024"
                                    >
                                      <path
                                        fill="#10B981"
                                        d="M885.9 533.7c16.8-22.2 26.1-49.4 26.1-77.7c0-44.9-25.1-87.4-65.5-111.1a67.67 67.67 0 0 0-34.3-9.3H572.4l6-122.9c1.4-29.7-9.1-57.9-29.5-79.4A106.62 106.62 0 0 0 471 99.9c-52 0-98 35-111.8 85.1l-85.9 311H144c-17.7 0-32 14.3-32 32v364c0 17.7 14.3 32 32 32h601.3c9.2 0 18.2-1.8 26.5-5.4c47.6-20.3 78.3-66.8 78.3-118.4c0-12.6-1.8-25-5.4-37c16.8-22.2 26.1-49.4 26.1-77.7c0-12.6-1.8-25-5.4-37c16.8-22.2 26.1-49.4 26.1-77.7c-.2-12.6-2-25.1-5.6-37.1M184 852V568h81v284zm636.4-353l-21.9 19l13.9 25.4a56.2 56.2 0 0 1 6.9 27.3c0 16.5-7.2 32.2-19.6 43l-21.9 19l13.9 25.4a56.2 56.2 0 0 1 6.9 27.3c0 16.5-7.2 32.2-19.6 43l-21.9 19l13.9 25.4a56.2 56.2 0 0 1 6.9 27.3c0 22.4-13.2 42.6-33.6 51.8H329V564.8l99.5-360.5a44.1 44.1 0 0 1 42.2-32.3c7.6 0 15.1 2.2 21.1 6.7c9.9 7.4 15.2 18.6 14.6 30.5l-9.6 198.4h314.4C829 418.5 840 436.9 840 456c0 16.5-7.2 32.1-19.6 43"
                                      />
                                    </svg>
                                    <div className="flex-1">4.8</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col flex-1 justify-end w-full mt-2 text-sm">
                              <div className="flex  gap-2 justify-center bg-emerald-500 text-white border border-solid font-semibold border-emerald-500 rounded-md p-1 text-xs">
                                {dokter.jenis_kelamin}
                              </div>
                            </div>
                          </div>
                        ))
                      : this.state.dokterHadir.map((dokter) => (
                          <div className="flex flex-col justify-center px-4 py-3  text-xs bg-white rounded-xl shadow-sm w-full">
                            <div className="flex gap-2.5 text-black">
                              <img
                                loading="lazy"
                                srcSet={dokter.foto}
                                className="shrink-0 aspect-[0.79] w-[90px] h-full rounded-md object-cover bg-cover"
                              />
                              <div className="flex flex-col flex-1 justify-center">
                                <div className="text-sm font-medium">
                                  {dokter.nama}
                                </div>
                                <div className="text-gray-400 mt-1">
                                  Umur : {dokter.umur} Tahun
                                </div>
                                <div className="flex gap-2 mt-2.5">
                                  <div className="flex  gap-2 justify-center bg-emerald-100 text-emerald-500 rounded-md p-1 text-xs">
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
                                    <div className="flex-1">
                                      {dokter.pengalaman} Tahun
                                    </div>
                                  </div>
                                  <div className="flex  gap-2 justify-center bg-emerald-100 text-emerald-500 rounded-md p-1 text-xs">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="18"
                                      height="18"
                                      viewBox="0 0 1024 1024"
                                    >
                                      <path
                                        fill="#10B981"
                                        d="M885.9 533.7c16.8-22.2 26.1-49.4 26.1-77.7c0-44.9-25.1-87.4-65.5-111.1a67.67 67.67 0 0 0-34.3-9.3H572.4l6-122.9c1.4-29.7-9.1-57.9-29.5-79.4A106.62 106.62 0 0 0 471 99.9c-52 0-98 35-111.8 85.1l-85.9 311H144c-17.7 0-32 14.3-32 32v364c0 17.7 14.3 32 32 32h601.3c9.2 0 18.2-1.8 26.5-5.4c47.6-20.3 78.3-66.8 78.3-118.4c0-12.6-1.8-25-5.4-37c16.8-22.2 26.1-49.4 26.1-77.7c0-12.6-1.8-25-5.4-37c16.8-22.2 26.1-49.4 26.1-77.7c-.2-12.6-2-25.1-5.6-37.1M184 852V568h81v284zm636.4-353l-21.9 19l13.9 25.4a56.2 56.2 0 0 1 6.9 27.3c0 16.5-7.2 32.2-19.6 43l-21.9 19l13.9 25.4a56.2 56.2 0 0 1 6.9 27.3c0 16.5-7.2 32.2-19.6 43l-21.9 19l13.9 25.4a56.2 56.2 0 0 1 6.9 27.3c0 22.4-13.2 42.6-33.6 51.8H329V564.8l99.5-360.5a44.1 44.1 0 0 1 42.2-32.3c7.6 0 15.1 2.2 21.1 6.7c9.9 7.4 15.2 18.6 14.6 30.5l-9.6 198.4h314.4C829 418.5 840 436.9 840 456c0 16.5-7.2 32.1-19.6 43"
                                      />
                                    </svg>
                                    <div className="flex-1">4.8</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col flex-1 justify-end w-full mt-2 text-sm">
                              <div className="flex  gap-2 justify-center bg-emerald-500 text-white border border-solid font-semibold border-emerald-500 rounded-md p-1 text-xs">
                                {dokter.jenis_kelamin}
                              </div>
                            </div>
                          </div>
                        ))}
                  </Slider>
                </>
              )}

              {/* end card dokter */}
            </div>

            {/* Tab Bar */}
            <div className="flex flex-col justify-center pt-3 font-medium max-w-[100%]  ">
              <div className="w-full text-base leading-5 capitalize text-neutral-950 font-medium flex justify-start px-3 mb-3">
                Jadwal Berlangsung
              </div>
              <Tabs
                id="controlled-tab-example"
                activeKey={this.state.value}
                onSelect={this.handleTab}
                className="custom-tab-bar"
              >
                <Tab eventKey="tab1" title="Saat Ini"></Tab>
                <Tab eventKey="tab2" title="Kosong"></Tab>
                <Tab eventKey="tab3" title="Selesai"></Tab>
              </Tabs>
              {this.state.value == "tab1" && (
                <>
                  <div className="flex flex-col w-full h-[22.2rem] justify-start items-center p-3 gap-3 overflow-y-scroll">
                    {this.state.janjiSaatIni.length > 0 ? (
                      <>
                        {this.state.janjiSaatIni.map((dokter) => (
                          <div className="flex flex-col justify-center p-4 bg-white rounded-xl shadow-md w-full">
                            <div className="flex gap-2.5 justify-center text-xs font-medium">
                              <img
                                loading="lazy"
                                srcSet={dokter.fotoDokter}
                                className="shrink-0 aspect-[0.78] w-[100px] h-[70px] object-cover bg-cover rounded-md"
                              />
                              <div className="flex flex-col flex-1">
                                <div className="flex gap-2 text-center text-emerald-500 whitespace-nowrap">
                                  <div className="justify-center px-2 py-1 rounded-lg border border-emerald-500 border-solid px-16">
                                    {dokter.namaTindakan}
                                  </div>
                                </div>
                                <div className="mt-1 text-sm text-black">
                                  {dokter.namaDokter}
                                </div>
                                <div className="mt-1 text-gray-400">
                                  Pasien : {dokter.nama_pasien}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-0 justify-center mt-4 rounded-xl">
                              <div className="flex flex-col flex-1 text-xs text-black">
                                <div className="flex gap-4">
                                  <img
                                    loading="lazy"
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/da0895661014f504f1582d9801e90433fdd0e20311169c3e19d61080d6e7ac6c?"
                                    className="shrink-0 aspect-square w-[18px]"
                                  />
                                  <div>{dokter.tanggal}</div>
                                </div>
                                <div className="flex gap-4 mt-2.5">
                                  <img
                                    loading="lazy"
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/51f302d9064442e1b1b7d2c592ac690e6da9fc8c29a6a2149936dfdc19d77f6a?"
                                    className="shrink-0 aspect-square w-[18px]"
                                  />
                                  <div>
                                    {dokter.jam_mulai} - {dokter.jam_selesai}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2.5 justify-center self-end px-2 py-1 mt-6 text-xs font-medium text-center text-yellow-500 whitespace-nowrap rounded-2xl bg-yellow-500 bg-opacity-10">
                                <div className="shrink-0 my-auto w-2 h-2 bg-yellow-500 rounded-full" />
                                <div>Berlangsung</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col text-center max-w-[360px]">
                          <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/0c65606ebee1b6385716d2b992b9da1ce85e7d156aec662e98ee133e4645beff?"
                            className="self-center w-full aspect-[1.37] max-w-[250px] "
                          />
                          <div className="mt-4 w-full text-base font-medium text-slate-700">
                            Aktifitas masih kosong
                          </div>
                          <div className="w-full text-xs text-gray-400">
                            Yuk Terapi Sekarang !!!
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
              {this.state.value == "tab2" && (
                <>
                  <div className="flex flex-col w-full h-[22.2rem] justify-start items-center p-3 gap-3 overflow-y-scroll">
                    {this.state.dataKosong.map((item) => (
                      <div className="flex w-[300px]  h-auto p-4 items-center rounded-xl bg-white shadow-md  justify-between   gap-7 text-emerald-500">
                        <div className="w-[50px] h-[50px] flex justify-center items-center p-0 bg-emerald-100 p-3 rounded-md">
                          <img
                            loading="lazy"
                            src={TimeImage}
                            className="shrink-0 my-auto aspect-[0.85] fill-zinc-300 w-[100%] h-[100%]"
                          />
                        </div>
                        <div className="w-[80%] h-[auto] flex flex-col justify-between items-start p-0">
                          <div className="text-black font-medium text[14px]">
                            Pukul {item.jam_mulai} - {item.jam_selesai}
                          </div>
                          <p className="text-[12px] text-emerald-500 mt-1">
                            Tidak Ada Pasien
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {this.state.value == "tab3" && (
                <>
                  <div className="flex flex-col w-100 h-[22.2rem] justify-start items-center p-3 gap-3 overflow-y-scroll">
                    {this.state.dataSelesai.length === 0 ? (
                      <div className="flex flex-col text-center max-w-[360px]">
                        <img
                          loading="lazy"
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/0c65606ebee1b6385716d2b992b9da1ce85e7d156aec662e98ee133e4645beff?"
                          className="self-center w-full aspect-[1.37] max-w-[250px] "
                        />
                        <div className="mt-4 w-full text-base font-medium text-slate-700">
                          Aktifitas masih kosong
                        </div>
                        <div className="w-full text-xs text-gray-400">
                          Yuk Terapi Sekarang !!!
                        </div>
                      </div>
                    ) : (
                      this.state.dataSelesai.map((dokter) => (
                        <div className="flex flex-col justify-center p-4 bg-white rounded-xl shadow-md w-full">
                          <div className="flex gap-2.5 justify-center text-xs font-medium">
                            <img
                              loading="lazy"
                              srcSet={dokter.fotoDokter}
                              className="shrink-0 aspect-[0.78] w-[100px] h-[70px] object-cover bg-cover rounded-md"
                            />
                            <div className="flex flex-col flex-1">
                              <div className="flex gap-2 text-center text-emerald-500 whitespace-nowrap">
                                <div className="justify-center px-2 py-1 rounded-lg border border-emerald-500 border-solid px-16">
                                  {dokter.namaTindakan}
                                </div>
                              </div>
                              <div className="mt-1 text-sm text-black">
                                {dokter.namaDokter}
                              </div>
                              <div className="mt-1 text-gray-400">
                                Pasien : {dokter.nama_pasien}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-0 justify-center mt-4 rounded-xl">
                            <div className="flex flex-col flex-1 text-xs text-black">
                              <div className="flex gap-4">
                                <img
                                  loading="lazy"
                                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/da0895661014f504f1582d9801e90433fdd0e20311169c3e19d61080d6e7ac6c?"
                                  className="shrink-0 aspect-square w-[18px]"
                                />
                                <div>{dokter.tanggal}</div>
                              </div>
                              <div className="flex gap-4 mt-2.5">
                                <img
                                  loading="lazy"
                                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/51f302d9064442e1b1b7d2c592ac690e6da9fc8c29a6a2149936dfdc19d77f6a?"
                                  className="shrink-0 aspect-square w-[18px]"
                                />
                                <div>
                                  {dokter.jam_mulai} - {dokter.jam_selesai}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2.5 justify-center self-end px-2 py-1 mt-6 text-xs font-medium text-center text-emerald-500 whitespace-nowrap rounded-2xl bg-emerald-500 bg-opacity-10">
                              <div className="shrink-0 my-auto w-2 h-2 bg-emerald-500 rounded-full" />
                              <div>Selesai</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
            {/* End Tab Bar */}

            {/* card jadwal */}

            {/* end card jadwal */}
          </div>
        </div>
      </div>
    );
  }
}

export default HomePage;
