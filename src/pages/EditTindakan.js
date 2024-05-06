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
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import withRouter from "../withRouter";
class EditTindakan extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    const idTindakan = this.props.params.id;
    this.state = {
      idTindakan: idTindakan,
      value: "hadir",
      tanggal: dayjs().locale("id"),
      tindakan: {},
      id: null,
      nama: "",
      deskripsi: "",
      gambar: null,
      isProses: false,
      isEdit: false,
      foto: null,
    };
  }
  componentDidMount() {
    this.getNamaTindakan();
  }

  getNamaTindakan = async () => {
    try {
      const tindakanDoc = await getDoc(
        doc(db, "tindakans", this.state.idTindakan)
      );
      const tindakanData = tindakanDoc.data();
      console.log("tidanakan", tindakanData);
      if (tindakanData) {
        this.setState({
          nama: tindakanData.nama_tindakan,
          deskripsi: tindakanData.deskripsi_tindakan,
          foto: tindakanData.foto_tindakan,
          tindakan: tindakanData,
        });
      } else {
        console.error("Tindakan not found");
      }
    } catch (error) {
      console.error("Error fetching nama tindakan:", error);
    }
  };
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

    this.setState({ [name]: value });
    console.log(value);
  };
  handleImageChange = (e) => {
    const file = e.target.files[0]; // Ambil file pertama dari daftar files
    const filename = file.name; // Ambil nama file

    // Update state dengan nama file dan file itu sendiri
    this.setState({ gambar: file });

    // Pastikan bahwa file adalah Blob sebelum membacanya
    if (file instanceof Blob) {
      // Buat objek FileReader
      const reader = new FileReader();

      // Setelah FileReader selesai membaca file, atur sumber gambar
      reader.onload = (e) => {
        // e.target.result adalah data URL dari gambar yang dibaca
        this.setState({ foto: e.target.result });
        console.log(e.target.result, "Hasil");
      };

      // Membaca file sebagai URL data
      reader.readAsDataURL(file);
      console.log(file, "Awal");
    } else {
      console.error("File yang dipilih tidak didukung.");
    }
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

  handleUpdate = async (e) => {
    e.preventDefault();
    this.setState({ isProses: true });

    const { idTindakan, nama, deskripsi, gambar } = this.state;
    console.log("sebelum", gambar);
    try {
      // Upload gambar baru (jika ada)
      if (gambar) {
        const imageUrl = nama.toLowerCase().replace(/\s+/g, "-");
        const imgRef = ref(dbImage, `tindakans/${imageUrl}`);
        console.log("proses sebelum upload", imgRef);

        await uploadBytes(imgRef, gambar);
        const foto_tindakan = await getDownloadURL(imgRef);
        console.log("proses sesudah upload", foto_tindakan);

        // Update properti foto_tindakan pada dokumen tindakan yang sesuai
        await updateDoc(doc(db, "tindakans", idTindakan), {
          nama_tindakan: nama,
          deskripsi_tindakan: deskripsi,
          foto_tindakan: foto_tindakan,
        });
      } else {
        // Jika tidak ada gambar baru, hanya perbarui properti nama_tindakan dan deskripsi_tindakan
        await updateDoc(doc(db, "tindakans", idTindakan), {
          nama_tindakan: nama,
          deskripsi_tindakan: deskripsi,
        });
      }

      Swal.fire("Berhasil", "Data Tindakan Berhasil Diperbarui", "success");
      this.setState({
        nama: "",
        deskripsi: "",
        isEdit: !this.state.isEdit,
        isProses: false,
      });

      this.getNamaTindakan();
      window.location.href = `/tindakan/detail-tindakan/${idTindakan}`;
    } catch (error) {
      console.error("Error updating data:", error);
      Swal.fire("Error", "Gagal Memperbarui Data Tindakan", "error");
      this.setState({ isProses: false });
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
                window.location.href = `/tindakan/detail-tindakan/${this.state.idTindakan}`;
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
              <div className="gap-0 w-full text-xs text-stone-900">
                Nama Tindakan
              </div>
              <input
                type="text"
                placeholder="Nama Tindakan"
                value={this.state.nama}
                onChange={this.handleInputChange}
                name="nama"
                className=" text-[14px] justify-center px-4 py-4 mt-2.5 text-xs whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              />
              <div className="gap-0 mt-4 w-full text-xs text-stone-900 text-[14px]">
                Deskripsi Tindakan
              </div>
              <input
                type="text"
                placeholder="Deskripsi"
                value={this.state.deskripsi}
                name="deskripsi"
                onChange={this.handleInputChange}
                className=" text-[14px] justify-center px-4 py-4 mt-2.5 text-xs whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              />
              <div className="gap-0 mt-4 w-full text-xs text-stone-900 text-[14px]">
                Foto Tindakan
              </div>
              <div
                id="fileUpload"
                className="text-[12px] justify-center px-4 py-3 bg-white mt-2.5 text-xs whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              >
                <input type="file" onChange={this.handleImageChange} />
              </div>
              <div className="w-[100%] h-[8.5rem] flex justify-center items-center px-10 py-4 bg-white border border-solid border-gray-500 rounded-md  mt-3">
                <img
                  loading="lazy"
                  src={this.state.foto}
                  className="shrink-0 gap-0 w-6 aspect-square w-[80%] h-[100%] rounded-md"
                />
              </div>
            </div>
            <button
              onClick={this.handleUpdate}
              className="justify-center p-2 w-full text-sm text-center text-white bg-blue-500 rounded-lg max-w-[320px]"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(EditTindakan);
