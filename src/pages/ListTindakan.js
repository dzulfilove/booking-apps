import React from "react";
import { Tabs, Tab } from "react-bootstrap";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { Component } from "react";
import { db, dbImage } from "../config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Loading from "../components/loading";
class ListTindakan extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      dataList: [],
      tanggal: dayjs().locale("id"),
      loading: true,
    };
  }

  getAllTindakan = async () => {
    try {
      const tindakanCollection = collection(db, "tindakans");
      const querySnapshot = await getDocs(tindakanCollection);

      const tindakanList = [];
      querySnapshot.forEach((doc) => {
        tindakanList.push({ id: doc.id, ...doc.data() });
      });

      // Iterasi pada setiap objek tindakan
      for (const tindakan of tindakanList) {
        // Panggil fungsi getAllWaktuTindakan untuk mendapatkan biaya
        const biayaString = await this.getAllWaktuTindakan(tindakan.id);

        // Masukkan hasil biaya ke dalam properti biaya pada objek tindakan
        tindakan.biaya = biayaString;
      }

      console.log(tindakanList);
      this.setState({ dataList: tindakanList, loading: false });
    } catch (error) {
      console.error("Error fetching dokter data:", error);
      throw error;
    }
  };

  componentDidMount() {
    this.getAllTindakan();
  }
  formatTanggal = () => {
    const today = dayjs().locale("id"); // Gunakan dayjs() tanpa argumen untuk mendapatkan tanggal hari ini
    const formattedDate = today.format("YYYY-MM-DD");
    const formattedDate2 = today.format("YYYY/MM/DD");
    const jam = today.format("HH:mm");
    const day = today.format("YYYY-MM-DDTHH:mm:ss");
    this.setState({
      tanggal: today,
      tanggalFilter: formattedDate,
      tanggalData: formattedDate2,
      jam: jam,
    });
    console.log(today.format("YYYY-MM-DDTHH:mm"));
  };
  formatRupiah(biaya) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(biaya);
  }

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

  handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update the state with the new value
    this.setState({ [name]: value }, () => {
      // Callback to ensure state is updated before calling getRegistrasi
    });
  };

  handleDateChange = (name, selectedDate) => {
    // Convert selectedDate to Dayjs object if it's not already
    const dayjsDate = dayjs(selectedDate);

    // Ensure dayjsDate is a valid Dayjs object
    if (!dayjsDate.isValid()) {
      return; // Handle invalid date selection appropriately
    }

    // Subtract one day from the selected date

    // Format the modified date in the desired ISO 8601 format

    if (name === "tanggalAwal") {
      const formattedDate = dayjsDate.format("YYYY-MM-DD");

      this.setState(
        {
          tanggalFilterMulai: formattedDate,
          tanggalAwal: selectedDate,
        },
        () => {
          console.log("awal", this.state.tanggalFilterMulai);
          console.log("akhir", this.state.tanggalFilterAkhir);

          this.getRegistrasi(this.state.tanggalFilterAkhir);
        }
      );
    } else {
      const formattedDate = dayjsDate.format("YYYY-MM-DD");

      this.setState(
        {
          tanggal: selectedDate,
          tanggalFilterAkhir: formattedDate,
        },
        () => {
          console.log("awal", this.state.tanggalFilterMulai);
          console.log("akhir", this.state.tanggalFilterAkhir);

          this.getRegistrasi(formattedDate);
        }
      );
    }

    // Update the state with the formatted date
  };
  getAllWaktuTindakan = async (idTindakan) => {
    try {
      const waktuTindakanCollection = collection(
        db,
        `tindakans/${idTindakan}/waktu_tindakan`
      );

      const querySnapshot = await getDocs(waktuTindakanCollection);

      const waktuTindakanList = [];

      querySnapshot.forEach((doc) => {
        waktuTindakanList.push({ id: doc.id, ...doc.data() });
      });
      const hasilTransformasi = waktuTindakanList.map((objek) => ({
        ...objek,
        lama: this.formatDurasi(objek.durasi),
      }));

      // Urutkan array objek berdasarkan nilai biaya dari yang terkecil ke terbesar
      hasilTransformasi.sort((a, b) => a.biaya - b.biaya);

      // Langkah 2: Ubah setiap nilai biaya menjadi format rupiah
      const biayaFormatted = hasilTransformasi.map((objek) =>
        this.formatRupiah(objek.biaya)
      );
      let biayaString = "";
      // Langkah 3: Gabungkan nilai biaya yang telah diformat menjadi satu string dengan rentang yang diinginkan
      if (biayaFormatted.length > 0) {
        if (biayaFormatted.length > 2) {
          biayaString = `${biayaFormatted[0]} - ${
            biayaFormatted[biayaFormatted.length - 1]
          }`;
        } else {
          biayaString = biayaFormatted.join(" - ");
        }
      } else {
        biayaString = "Rp.-";
      }
      console.log(biayaString, "biayaaaa");
      return biayaString;
    } catch (error) {
      console.error("Error fetching waktu tindakan data:", error);
      throw error;
    }
  };
  handleAdd = () => {
    window.location.href = "/tindakan/tambah-data/";
  };
  handleTab = (newValue) => {
    this.setState({ value: newValue });
  };

  handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        icon: "info",
        title: "Apakah Anda Yakin Untuk Menghapus ?",
        showConfirmButton: true,
        showDenyButton: true,
        confirmButtonText: "Ya",
        denyButtonText: "Tidak",
        customClass: {
          actions: "my-actions",
          cancelButton: "order-1 right-gap",
          confirmButton: "order-2",
        },
      });

      if (result.isConfirmed) {
        await deleteDoc(doc(db, "tindakans", id));
        this.getAllTindakan();
      } else if (result.isDenied) {
        // Tidak melakukan apa pun jika pengguna menolak
      }
    } catch (error) {
      console.error("Error menghapus data:", error);
      Swal.fire("Error", "Gagal Memperbarui Data Detail Tindakan", "error");
    }
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
        {this.state.loading == true && (
          <>
            <div className="w-[100%] h-[100%] absolute z-[999999] bg-white">
              <Loading />
            </div>
          </>
        )}
        <div className="flex flex-col gap-0 h-[100%] items-center pb-4 font-medium bg-slate-50 w-[100%]">
          <div className="flex gap-5 self-stretch p-4 w-full  text-center text-stone-900">
            <div className="flex-auto gap-0 text-xl font-medium">
              Data Tindakan
            </div>
          </div>

          <div className="flex flex-col w-[100%] h-[29.5rem] mt-3 gap-4 justify-start items-center  overflow-y-scroll rounded-md ">
            {this.state.dataList.map((item) => (
              <div className="flex gap-4 justify-center p-4 bg-white w-[90%] rounded-lg cursor-pointer shadow-md">
                <div className="flex justify-center items-center p-3.5 bg-emerald-100 rounded-lg h-[50px] w-[50px]">
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/912112b743bb3145e7319e41dc115e7a4e66cc6ccecbb1b521e245ffee9048ec?"
                    className="w-6 aspect-square"
                  />
                </div>
                <div
                  onClick={() => {
                    window.location.href = `/tindakan/detail-tindakan/${item.id}`;
                  }}
                  className="flex flex-col flex-1 justify-center my-auto"
                >
                  <div className="text-xs text-gray-400">Layanan</div>
                  <div className="mt-1 text-base font-medium leading-6 text-black">
                    {item.nama_tindakan}
                  </div>
                  <div className="mt-1 text-xs">{item.biaya}</div>
                </div>
                <div className="w-auto h-auto flex justify-end gap-4 items-center ">
                  <button
                    onClick={() => this.handleDelete(item.id)}
                    className="w-[auto] h-[auto] flex justify-center items-center py-2 px-3 bg-red-100 rounded-md "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#ce3636"
                        d="M7 6v13zm4.25 15H7q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v4.3q-.425-.125-.987-.213T17 10V6H7v13h3.3q.15.525.4 1.038t.55.962M9 17h1q0-1.575.5-2.588L11 13.4V8H9zm4-5.75q.425-.275.963-.55T15 10.3V8h-2zM17 22q-2.075 0-3.537-1.463T12 17t1.463-3.537T17 12t3.538 1.463T22 17t-1.463 3.538T17 22m1.65-2.65l.7-.7l-1.85-1.85V14h-1v3.2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={this.handleAdd}
            className="justify-center p-2 w-full text-base text-center text-white bg-emerald-500 rounded-lg max-w-[320px]"
          >
            Tambah
          </button>
        </div>
      </div>
    );
  }
}

export default ListTindakan;
