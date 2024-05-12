import React from "react";
import { Tabs, Tab } from "react-bootstrap";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { FileInput, Label } from "flowbite-react";

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
class InputTindakan extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      value: "hadir",
      tanggal: dayjs().locale("id"),
      tindakans: [],
      id: null,
      nama: "",
      deskripsi: "",
      gambar: null,
      isProses: false,
      isEdit: false,
    };
  }
  componentDidMount() {}
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
  handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update the state with the new value
    this.setState({ [name]: value });
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

  handleTab = (newValue) => {
    this.setState({ value: newValue });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ isProses: true });
    console.log(this.state.gambar, "ini foto mentah");

    const nama = this.state.nama;
    const imageUrl = nama.toLowerCase().replace(/\s+/g, "-");
    try {
      const imgRef = ref(dbImage, `tindakans/${imageUrl}`);
      await uploadBytes(imgRef, this.state.gambar);
      console.log("proses sebelum upload", imgRef);
      const urlFoto = await getDownloadURL(imgRef);
      console.log("ini foto jadi", urlFoto);
      const newTindakan = {
        nama_tindakan: this.state.nama,
        deskripsi_tindakan: this.state.deskripsi,
        foto_tindakan: urlFoto,
      };
      await addDoc(collection(db, "tindakans"), newTindakan);
      this.setState({
        nama: "",
        deskripsi: "",
        gambar: "",
        isProses: false,
      });
      Swal.fire(
        "Berhasil",
        "Data Tindakan berhasil ditambah",
        "success",
        () => {
          window.location.href = "/tindakan/";
        }
      );
    } catch (error) {
      Swal.fire("Gagal", "Gagal menyimpan", "error");
      console.error("Error menambahkan data:", error);
    }
  };
  handleEdit = (dokter) => {
    const { id, nama_tindakan, deskripsi_tindakan, foto_tindakan } = dokter;

    this.setState({
      id: id,
      nama: nama_tindakan,
      deskripsi: deskripsi_tindakan,
      gambar: foto_tindakan,
      isEdit: !this.state.isEdit,
    });
  };

  handleDelete = async (id) => {
    try {
      const result = window.confirm("Apakah Anda yakin ingin menghapus?");
      if (result === true) {
        await deleteDoc(doc(db, "tindakans", id));
        alert("Data berhasil dihapus.");
        this.getAllTindakan();
      }
    } catch (error) {
      console.error("Error menghapus data:", error);
      alert("Gagal menghapus data.");
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
        <div className="flex flex-col gap-0 h-[100%] items-center pb-10 font-medium bg-slate-50 w-[100%]">
          <div className="flex gap-5 self-stretch p-4 w-full  text-center text-stone-900">
            <button
              onClick={() => {
                window.location.href = "/tindakan/";
              }}
              className="w-11 h-auto "
            >
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/8b2d02e05b773c962fdd4341539effdff4e46139a4745b83f97d7e9cb10455ed?"
                className="shrink-0 gap-0 w-6 aspect-square"
              />
            </button>

            <div className="flex-auto gap-0 text-xl font-medium">
              Input Tindakan
            </div>
          </div>
          <div className="flex flex-col gap-2.5 p-2 w-[100%] h-auto justify-center items-center">
            <div className="flex flex-col gap-1 justify-center w-[100%] p-4 text-[14px]">
              <div className="gap-0 w-full text-sm text-stone-900">
                Nama Tindakan
              </div>
              <input
                type="text"
                placeholder="Nama Tindakan"
                required
                onChange={this.handleInputChange}
                name="nama"
                className=" text-[14px] justify-center px-4 py-4 mt-2.5 text-sm whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              />
              <div className="gap-0 mt-4 w-full text-sm text-stone-900 text-[14px]">
                Deskripsi Tindakan
              </div>
              <input
                type="text"
                placeholder="Deskripsi"
                required
                name="deskripsi"
                onChange={this.handleInputChange}
                className=" text-[14px] justify-center px-4 py-4 mt-2.5 text-sm whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              />
              <div
                id="fileUpload"
                className="text-[14px] justify-center px-4 py-3 bg-white mt-2.5 text-sm whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              >
                <input
                  type="file"
                  onChange={(e) => this.setState({ gambar: e.target.files[0] })}
                />
              </div>
            </div>
            <button
              onClick={this.handleSubmit}
              className="justify-center p-2 w-full text-base text-center text-white bg-emerald-500 rounded-lg max-w-[320px]"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default InputTindakan;
