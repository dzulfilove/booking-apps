import React from "react";
import { Tabs, Tab } from "react-bootstrap";
import Select from "react-tailwindcss-select";
import dayjs from "dayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
import { StaticTimePicker } from "@mui/x-date-pickers/StaticTimePicker";
import { Autocomplete, TextField } from "@mui/material";
import RcSelect from "rc-select";
import "../styles/homepage.css";
import Swal from "sweetalert2";

import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

class InputJanjiTemu extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      nama: "",
      alamat: "",
      tanggalString: dayjs().locale("id").format("YYYY-MM-DD"),
      photo: null,
      email: "",
      no_hp: "",
      value: "hadir",
      dataTindakan: [],
      dataDokter: [],
      tanggal: dayjs().locale("id"),
      jam_mulai: dayjs().locale("id").format("HH:mm"),
      dataLama: [],
      lama: {},
      status: {},
      dokterRef: null,
      tindakanRef: null,
      biaya: 0,
      jam_selesai: "",
    };
  }
  componentDidMount() {
    this.getAllTindakan();
    this.getAllDokter();
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update the state with the new value
    this.setState({ [name]: value }, () => {
      // Callback to ensure state is updated before calling getRegistrasi
    });
  };
  getAllDokter = async () => {
    try {
      const dokterCollection = collection(db, "dokters");
      const querySnapshot = await getDocs(dokterCollection);

      const dokterList = [];
      querySnapshot.forEach((doc) => {
        dokterList.push({ id: doc.id, ...doc.data() });
      });

      await new Promise((resolve) => {
        this.setState({ dataDokter: dokterList }, resolve);
      });
    } catch (error) {
      console.error("Error fetching dokter data:", error);
      throw error;
    }
  };

  getAllTindakan = async () => {
    try {
      const tindakanCollection = collection(db, "tindakans");
      const querySnapshot = await getDocs(tindakanCollection);

      const tindakanList = [];
      await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          // Ambil data tindakan dari dokumen
          const tindakanData = doc.data();

          // Ambil subcollection waktu_tindakan dari dokumen tindakan
          const waktuTindakanCollection = collection(doc.ref, "waktu_tindakan");
          const waktuTindakanSnapshot = await getDocs(waktuTindakanCollection);
          const waktuTindakanList = [];

          // Loop untuk setiap dokumen di subcollection waktu_tindakan
          waktuTindakanSnapshot.forEach((waktuTindakanDoc) => {
            waktuTindakanList.push({
              id: waktuTindakanDoc.id,
              ...waktuTindakanDoc.data(),
            });
          });

          // Tambahkan data tindakan dan waktu_tindakan ke dalam tindakanList
          tindakanList.push({
            id: doc.id,
            ...tindakanData,
            waktu_tindakan: waktuTindakanList,
          });
        })
      );

      // Set state dengan tindakanList yang telah diperbarui
      this.setState({ dataTindakan: tindakanList });

      console.log(tindakanList);
    } catch (error) {
      console.error("Error fetching dokter data:", error);
      throw error;
    }
  };
  handleDateChange = (selectedDate) => {
    // Convert selectedDate to Dayjs object if it's not already
    const dayjsDate = dayjs(selectedDate);

    // Ensure dayjsDate is a valid Dayjs object
    if (!dayjsDate.isValid()) {
      return; // Handle invalid date selection appropriately
    }

    // Subtract one day from the selected date

    // Format the modified date in the desired ISO 8601 format

    const formattedDate = dayjsDate.format("HH:mm");
    console.log(formattedDate, "jam");
    this.setState({
      jam_mulai: formattedDate,
      tanggal: selectedDate,
    });
  };

  // Update the state with the formatted date

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

  bulatkanWaktu(waktu) {
    // Pisahkan jam dan menit
    const [jam, menit] = waktu.split(":").map(Number);

    // Hitung waktu dalam menit
    const totalMenit = jam * 60 + menit;

    // Hitung waktu terdekat ke bawah dan ke atas yang merupakan kelipatan 15 menit
    const bawah = Math.floor(totalMenit / 5) * 5;
    const atas = Math.ceil(totalMenit / 5) * 5;

    // Tentukan waktu yang lebih dekat
    const waktuBulat = totalMenit - bawah < atas - totalMenit ? bawah : atas;

    // Konversi waktu bulat kembali ke format jam:menit
    const jamBulat = Math.floor(waktuBulat / 60);
    const menitBulat = waktuBulat % 60;
    const waktuBulatStr = `${String(jamBulat).padStart(2, "0")}:${String(
      menitBulat
    ).padStart(2, "0")}`;

    return waktuBulatStr;
  }

  handleDropdown = (name, selectedOption) => {
    if (name == "dokter") {
      this.setState({ dokterRef: selectedOption });
    } else if (name == "tindakan") {
      this.setState({ tindakanRef: selectedOption });
      console.log("id", selectedOption.value);
      const selectedTindakan = this.state.dataTindakan.find(
        (item) => item.id === selectedOption.value
      );
      console.log("find", selectedTindakan);
      const waktuTindakanOptions = selectedTindakan
        ? selectedTindakan.waktu_tindakan.map((subItem) => ({
            value: subItem.id,
            label: this.formatDurasi(subItem.durasi),
          }))
        : [];
      if (waktuTindakanOptions.length > 0) {
        this.setState({ dataLama: waktuTindakanOptions });
      } else {
        Swal.fire({
          title: "Perhatian!",
          text: "Durasi Tindakan Tidak Ditemukan, Harap Isi Durasi Tindakan Terlebih Dahulu",
          icon: "warning",
          confirmButtonColor: "#3B82F6",
          confirmButtonText: "Ya",
          showCancelButton: "true",
          cancelButtonText: "Tidak",
          cancelButtonColor: "#E22128",
          closeOnConfirm: true,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = `/tindakan/detail-tindakan/tambah-data/${selectedOption.value}`;
          } else {
          }
        });
      }
      console.log(waktuTindakanOptions);
    } else if (name == "lama") {
      const tindakan = this.state.dataTindakan.find(
        (item) => item.id === this.state.tindakanRef.value
      );

      const selectedTindakan = tindakan.waktu_tindakan.find(
        (item) => item.id === selectedOption.value
      );
      const jamMulai = this.state.jam_mulai;
      console.log("jam Mulai", jamMulai);
      const [jam, menit] = jamMulai.split(":").map(Number);
      const waktuMulai = new Date();
      waktuMulai.setHours(jam);
      waktuMulai.setMinutes(menit);
      console.log("waktu mulai", waktuMulai);
      // Tambahkan durasi ke waktuMulai
      const waktuSelesai = new Date(
        waktuMulai.getTime() + selectedTindakan.durasi * 60000
      ); // Konversi durasi dari menit ke milidetik

      // Format waktuSelesai ke dalam string "HH:mm"
      const jamSelesai = `${String(waktuSelesai.getHours()).padStart(
        2,
        "0"
      )}:${String(waktuSelesai.getMinutes()).padStart(2, "0")}`;
      console.log("jam", jamSelesai);
      this.setState({
        lama: selectedOption,
        biaya: selectedTindakan.biaya,
        jam_selesai: jamSelesai,
      });
    } else {
      this.setState({ status: selectedOption });
    }
  };
  handleTab = (newValue) => {
    this.setState({ value: newValue });
  };
  formatRupiah(biaya) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(biaya);
  }
  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ isProses: true });

    try {
      const {
        dokterRef,
        tindakanRef,
        lama,
        jam_mulai,
        nama,
        status,
        tanggalString,
        biaya,
      } = this.state;

      // Membuat objek referensi Firestore untuk dokterRef, tindakanRef, dan waktuTindakanRef
      const dokterDocRef = doc(db, "dokters", dokterRef.value);
      const tindakanDocRef = doc(db, "tindakans", tindakanRef.value);
      const waktuTindakanDocRef = doc(
        db,
        "tindakans",
        tindakanRef.value,
        "waktu_tindakan",
        lama.value
      );

      try {
        const waktuTindakanDocSnap = await getDoc(waktuTindakanDocRef);
        if (waktuTindakanDocSnap.exists()) {
          const waktuTindakanData = waktuTindakanDocSnap.data();
          var durasi = waktuTindakanData.durasi;
        }
      } catch (error) {
        console.error("Error fetching waktu_tindakan document:", error);
      }

      const jamAwal = this.bulatkanWaktu(jam_mulai);
      const jamAkhir = this.bulatkanWaktu(this.state.jam_selesai);
      // Membuat objek data baru untuk ditambahkan ke koleksi "janji_temu"
      const newData = {
        dokter_ref: dokterDocRef,
        tindakan_ref: tindakanDocRef,
        waktu_tindakan_ref: waktuTindakanDocRef,
        jam_mulai: jamAwal,
        jam_selesai: jamAkhir,
        nama_pasien: nama,
        status: status.value,
        tanggal: tanggalString,
        biaya: biaya,
      };

      // Menambahkan data baru ke koleksi "janji_temu"
      await addDoc(collection(db, "janji_temu"), newData);

      // Memberikan notifikasi bahwa data berhasil ditambahkan
      Swal.fire({
        title: "Berhasil",
        text: "Data janji temu berhasil ditambah",
        type: "warning",
        confirmButtonColor: "#3B82F6",
        confirmButtonText: "Oke",
        closeOnConfirm: false,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/janji-temu";
        }
      });

      // Reset nilai state setelah data berhasil ditambahkan
      this.setState({
        dokterRef: null,
        tindakanRef: null,
        lama: null,
        jamMulai: "",
        jam_selesai: "",
        nama: "",
        status: "",
      });

      // Mengambil ulang data janji temu untuk mengupdate tampilan
    } catch (error) {
      // Menampilkan pesan error jika terjadi kesalahan
      console.error("Error menambah data janji temu:", error);
      Swal.fire("Error", "Gagal menambah data janji temu", "error");
    }
  };
  render() {
    const optionsTerapis = this.state.dataDokter.map((data) => ({
      value: data.id,
      label: data.nama,
    }));

    const optionsTindakan = this.state.dataTindakan.map((data) => ({
      value: data.id,
      label: data.nama_tindakan,
    }));

    const optionsLama = this.state.dataLama;
    const optionsStatus = [
      { value: "berlangsung", label: "Berlangsung" },
      { value: "selesai", label: "Selesai" },
    ];
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
        <div className="flex flex-col gap-0 items-start h-[100%] overflow-y-scroll pb-4 font-medium bg-slate-50 w-[100%]">
          <div className="flex gap-5 self-stretch p-4 w-full text-xl font-medium text-center bg-white text-stone-900">
            <button
              onClick={() => {
                window.location.href = "/janji-temu/";
              }}
              className="w-11 h-auto "
            >
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/8b2d02e05b773c962fdd4341539effdff4e46139a4745b83f97d7e9cb10455ed?"
                className="shrink-0 gap-0 w-6 aspect-square"
              />
            </button>

            <div className="flex-auto">Input Janji Temu</div>
          </div>
          <div className="flex flex-col p-4 w-[100%] h-auto justify-between items-center text-[14px] ">
            <div className="mt-9 text-xs text-stone-900 w-[100%] text-[14px]">
              Nama Pasien
            </div>

            <input
              type="text"
              placeholder="Nama"
              required
              onChange={this.handleInputChange}
              name="nama"
              className="date text-black"
            />
            <div className="mt-6 text-xs text-stone-900 w-[100%] mb-2.5 text-[14px]">
              Pukul
            </div>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MobileTimePicker
                defaultValue={this.state.tanggal}
                className=" date"
                onChange={this.handleDateChange}
              />
            </LocalizationProvider>
            <div className="mt-3 text-xs text-stone-900 w-[100%] text-[14px]">
              Pilih Terapis
            </div>
            <div className="select-container relative w-[100%]">
              <div className="flex flex-col justify-center px-0 mt-3 w-[100%] text-[14px] text-xs leading-4 capitalize bg-blue-100 text-neutral-950 rounded-lg">
                <div className="flex items-center px-2.5 h-12 text-lg  w-[100%] bg-blue-100 rounded-lg  gap-2 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#29a7d1"
                      d="M18.39 14.56C16.71 13.7 14.53 13 12 13s-4.71.7-6.39 1.56A2.97 2.97 0 0 0 4 17.22V20h16v-2.78c0-1.12-.61-2.15-1.61-2.66M12 12c2.21 0 4-1.79 4-4V4.5c0-.83-.67-1.5-1.5-1.5c-.52 0-.98.27-1.25.67c-.27-.4-.73-.67-1.25-.67s-.98.27-1.25.67c-.27-.4-.73-.67-1.25-.67C8.67 3 8 3.67 8 4.5V8c0 2.21 1.79 4 4 4"
                    />
                  </svg>
                  <Select
                    options={optionsTerapis}
                    name="terapis"
                    onChange={(selectedOption) =>
                      this.handleDropdown("dokter", selectedOption)
                    }
                    placeholder="Pilih Terapis"
                    value={this.state.dokterRef}
                    classNames={{
                      menuButton: ({ isDisabled }) =>
                        `text-[15px] flex text-sm text-blue-500 w-[100%] bg-blue-100 rounded shadow-sm transition-all duration-300 focus:outline-none ${
                          isDisabled
                            ? "bg-blue-100 "
                            : "bg-blue-100 focus:ring focus:ring-blue-500/20"
                        }`,
                      menu: "absolute z-10 w-full bg-slate-50 shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700",
                      listItem: ({ isSelected }) =>
                        `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded ${
                          isSelected
                            ? `text-blue-500 bg-slate-50`
                            : `text-blue-500 hover:bg-blue-100 hover:text-blue-500`
                        }`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-stone-900 w-[100%] text-[14px]">
              Pilih Tindakan
            </div>
            <div className="select-container relative w-[100%]">
              <div className="flex flex-col justify-center px-0 mt-3 w-[100%] text-[14px] text-xs leading-4 capitalize bg-blue-100 text-neutral-950 rounded-lg">
                <div className="flex items-center px-2.5 h-12 text-lg  w-[100%] bg-blue-100 rounded-lg  gap-2 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="16"
                    viewBox="0 0 576 512"
                  >
                    <path
                      fill="#29a7d1"
                      d="M159.88 175.82h64v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16h-64v-64a16 16 0 0 0-16-16h-64a16 16 0 0 0-16 16v64h-64a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16m408.19 160.31a39.91 39.91 0 0 0-55.93-8.47l-119.67 88.18H271.86a16 16 0 0 1 0-32h78.24c16 0 30.75-10.87 33.37-26.61a32.06 32.06 0 0 0-31.62-37.38h-160a117.7 117.7 0 0 0-74.12 26.25l-46.5 37.74H15.87a16.11 16.11 0 0 0-16 16v96a16.11 16.11 0 0 0 16 16h347a104.8 104.8 0 0 0 61.7-20.27L559.6 392a40 40 0 0 0 8.47-55.87"
                    />
                  </svg>
                  <Select
                    options={optionsTindakan}
                    name="tindakan"
                    placeholder="Pilih Tindakan"
                    value={this.state.tindakanRef}
                    onChange={(selectedOption) =>
                      this.handleDropdown("tindakan", selectedOption)
                    }
                    classNames={{
                      menuButton: ({ isDisabled }) =>
                        `text-[15px] flex text-sm text-blue-500 w-[100%] bg-blue-100 rounded shadow-sm transition-all duration-300 focus:outline-none ${
                          isDisabled
                            ? "bg-blue-100 "
                            : "bg-blue-100 focus:ring focus:ring-blue-500/20"
                        }`,
                      menu: "absolute z-10 w-full bg-slate-50 shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700",
                      listItem: ({ isSelected }) =>
                        `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded ${
                          isSelected
                            ? `text-blue-500 bg-slate-50`
                            : `text-blue-500 hover:bg-blue-100 hover:text-blue-500`
                        }`,
                    }}
                  />
                </div>
              </div>
            </div>
            {this.state.tindakanRef !== null && (
              <>
                <div className="mt-3 text-xs text-stone-900 w-[100%] text-[14px]">
                  Pilih Durasi Tindakan
                </div>
                <div className="select-container relative w-[100%]">
                  <div className="flex flex-col justify-center px-0 mt-3 w-[100%] text-[14px] text-xs leading-4 capitalize bg-blue-100 text-neutral-950 rounded-lg">
                    <div className="flex items-center px-2.5 h-12 text-lg  w-[100%] bg-blue-100 rounded-lg  gap-2 ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill="#29a7d1"
                          d="M10 20a10 10 0 1 1 0-20a10 10 0 0 1 0 20m0-2a8 8 0 1 0 0-16a8 8 0 0 0 0 16m-1-7.59V4h2v5.59l3.95 3.95l-1.41 1.41z"
                        />
                      </svg>
                      <Select
                        options={optionsLama}
                        name="lama"
                        onChange={(selectedOption) =>
                          this.handleDropdown("lama", selectedOption)
                        }
                        value={this.state.lama}
                        placeholder="Pilih Lama Tindakan"
                        classNames={{
                          menuButton: ({ isDisabled }) =>
                            `text-[15px] flex text-sm text-blue-500 w-[100%] bg-blue-100 rounded shadow-sm transition-all duration-300 focus:outline-none ${
                              isDisabled
                                ? "bg-blue-100 "
                                : "bg-blue-100 focus:ring focus:ring-blue-500/20"
                            }`,
                          menu: "absolute z-10 w-full bg-slate-50 shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700",
                          listItem: ({ isSelected }) =>
                            `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded ${
                              isSelected
                                ? `text-blue-500 bg-slate-50`
                                : `text-blue-500 hover:bg-blue-100 hover:text-blue-500`
                            }`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="mt-3 text-xs text-stone-900 w-[100%] text-[14px]">
              Pilih Status
            </div>
            <div className="select-container relative w-[100%]">
              <div className="flex flex-col justify-center px-0 mt-3 w-[100%] text-[14px] text-xs leading-4 capitalize bg-blue-100 text-neutral-950 rounded-lg">
                <div className="flex items-center px-2.5 h-12 text-lg  w-[100%] bg-blue-100 rounded-lg  gap-2 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#44BED0"
                      d="M16.5 11L13 7.5l1.4-1.4l2.1 2.1L20.7 4l1.4 1.4zM11 7H2v2h9zm10 6.4L19.6 12L17 14.6L14.4 12L13 13.4l2.6 2.6l-2.6 2.6l1.4 1.4l2.6-2.6l2.6 2.6l1.4-1.4l-2.6-2.6zM11 15H2v2h9z"
                    />
                  </svg>
                  <Select
                    options={optionsStatus}
                    name="lama"
                    onChange={(selectedOption) =>
                      this.handleDropdown("status", selectedOption)
                    }
                    placeholder="Pilih Status"
                    value={this.state.status}
                    classNames={{
                      menuButton: ({ isDisabled }) =>
                        `text-[15px] flex text-sm text-blue-500 w-[100%] bg-blue-100 rounded shadow-sm transition-all duration-300 focus:outline-none ${
                          isDisabled
                            ? "bg-blue-100 "
                            : "bg-blue-100 focus:ring focus:ring-blue-500/20"
                        }`,
                      menu: "absolute z-10 w-full bg-slate-50 shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700",
                      listItem: ({ isSelected }) =>
                        `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded ${
                          isSelected
                            ? `text-blue-500 bg-slate-50`
                            : `text-blue-500 hover:bg-blue-100 hover:text-blue-500`
                        }`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-stone-900 w-[100%] text-[14px]">
              Waktu Selesai
            </div>

            <div className="justify-center text-[14px] p-6 w-[100%] mt-2.5 text-sm whitespace-nowrap rounded border border-solid border-neutral-400 text-black">
              {this.state.jam_selesai}
            </div>
            <div className="mt-4 text-sm text-stone-900 w-[100%] text-[14px]">
              Biaya
            </div>

            <div className="justify-center text-[14px] p-6 w-[100%] mt-2.5 text-sm whitespace-nowrap rounded border border-solid border-neutral-400 text-black">
              {this.formatRupiah(this.state.biaya)}
            </div>
            <div className="flex  justify-center self-stretch h-12 mt-14 w-[100%] text-sm font-medium text-center text-white whitespace-nowrap bg-white">
              <button
                onClick={this.handleSubmit}
                className=" flex justify-center p-6 items-center w-full h-9 text-sm text-center text-white bg-blue-500 rounded-lg max-w-[320px]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default InputJanjiTemu;
