import React from "react";
import { Tabs, Tab } from "react-bootstrap";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import withRouter from "../withRouter";

import { db } from "../config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import Loading from "../components/loading";
class ListDetailTindakan extends React.Component {
  constructor(props) {
    super(props);
    const idTindakan = this.props.params;
    console.log(this.props.params);
    console.log(props);
    console.log("props", idTindakan);
    this.state = {
      idTindakan: idTindakan.id,
      tanggal: dayjs().locale("id"),
      tindakan: {},
      namaTindakan: "",
      isAda: false,
      detailtindakan: [],
      loading: true,
    };
  }
  componentDidMount() {
    this.getNamaTindakan();
    this.getAllWaktuTindakan();
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
          namaTindakan: tindakanData.nama_tindakan,
          tindakan: tindakanData,
        });
      } else {
        console.error("Tindakan not found");
      }
    } catch (error) {
      console.error("Error fetching nama tindakan:", error);
    }
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

  getAllWaktuTindakan = async () => {
    try {
      const { idTindakan } = this.state;

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
        biaya: this.formatRupiah(objek.biaya),
        lama: this.formatDurasi(objek.durasi),
      }));
      console.log(waktuTindakanList, "Detail");
      if (waktuTindakanList.length > 0) {
        this.setState({
          detailtindakan: hasilTransformasi,
          isAda: true,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching waktu tindakan data:", error);
      throw error;
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
        await deleteDoc(
          doc(db, `tindakans/${this.state.idTindakan}/waktu_tindakan`, id)
        );
        this.getAllWaktuTindakan();
        this.getNamaTindakan();
      } else if (result.isDenied) {
        // Tidak melakukan apa pun jika pengguna menolak
      }
    } catch (error) {
      console.error("Error menghapus data:", error);
      Swal.fire("Error", "Gagal Menghapus Data", "error");
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
        <div className="flex flex-col mt-3 gap-0 h-[100%] items-center font-medium bg-white w-[100%]">
          <div className="flex gap-5 self-stretch p-4 w-full text-xl font-medium text-center  text-stone-900">
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

            <div className="flex-auto">Detail Tindakan</div>
          </div>

          <div className="flex flex-col w-[100%]  h-[26.5rem] justify-start items-center mb-4 overflow-y-scroll relative">
            <div className="flex flex-col bg-white w-[100%]">
              <div className="flex overflow-hidden relative flex-col pb-20 w-full aspect-[1.23]">
                <img
                  loading="lazy"
                  srcSet={this.state.tindakan.foto_tindakan}
                  className="object-cover absolute inset-0 size-full"
                />
              </div>
              <div className="absolute top-[50%] w-[100%] h-auto flex flex-col justify-start  items-center">
                <div className="flex flex-col justify-center bg-white px-4 pt-2 mt-0 w-full rounded-2xl z-[9] ">
                  <div className="flex gap-4 mt-4">
                    <div className="flex flex-col flex-1 justify-center">
                      <div className="text-sm text-zinc-400">
                        Layanan Tindakan
                      </div>
                      <div className="mt-2 text-sm font-semibold text-black">
                        {this.state.tindakan.nama_tindakan}
                      </div>
                    </div>
                    <button
                      className="w-auto h-auto flex justify-center items-center  bg-emerald-100 rounded-md p-2"
                      onClick={() => {
                        window.location.href = `/tindakan/update/${this.state.idTindakan}`;
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill="#44BED0"
                          fill-rule="evenodd"
                          d="M6.169 6.331a3 3 0 0 0-.833 1.6l-.338 1.912a1 1 0 0 0 1.159 1.159l1.912-.338a3 3 0 0 0 1.6-.833l3.07-3.07l2-2A.894.894 0 0 0 15 4.13A3.13 3.13 0 0 0 11.87 1a.894.894 0 0 0-.632.262l-2 2l-3.07 3.07Zm3.936-1.814L7.229 7.392a1.5 1.5 0 0 0-.416.8L6.6 9.4l1.208-.213l.057-.01a1.5 1.5 0 0 0 .743-.406l2.875-2.876a1.63 1.63 0 0 0-1.378-1.378m2.558.199a3.143 3.143 0 0 0-1.379-1.38l.82-.82a1.63 1.63 0 0 1 1.38 1.38l-.82.82ZM8 2.25a.75.75 0 0 0-.75-.75H4.5a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3V8.75a.75.75 0 0 0-1.5 0v2.75a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3h2.75A.75.75 0 0 0 8 2.25"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-col mt-4 w-full text-sm text-justify text-black bg-white rounded-2xl">
                    <div className="text-sm text-zinc-400 mb-2">
                      Deskripsi Tindakan
                    </div>
                    <div className="text-[14px]">
                      {this.state.tindakan.deskripsi_tindakan}
                    </div>
                  </div>
                  <div className="flex flex-col mt-4 w-full text-sm text-justify text-black bg-white rounded-2xl">
                    <div className="text-sm text-zinc-400">Durasi Tindakan</div>
                    <div className="mt-4 flex flex-col justify-start gap-4 text-sm">
                      {this.state.detailtindakan.map((item, index) => (
                        <div className="flex justify-between">
                          <div className="w-auto h-auto flex flex-col justify-start items-start gap-2">
                            <p className="text-black">
                              {index + 1}. Durasi {index + 1}
                            </p>
                            <p className="text-emerald-500 ml-3 mt-2">
                              {" "}
                              <span className="font-semibold">Lama</span> :{" "}
                              {item.lama},{" "}
                            </p>
                            <p className="text-emerald-500 ml-3 mt-2">
                              {" "}
                              <span className="font-semibold">
                                Biaya
                              </span> : {item.biaya}
                            </p>
                          </div>
                          <div className="w-auto h-auto flex justify-end gap-4 items-end">
                            <button
                              onClick={() => this.handleDelete(item.id)}
                              className="w-[auto] h-[auto] flex justify-center items-center p-2 bg-red-100 rounded-md"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  fill="#ce3636"
                                  d="M7 6v13zm4.25 15H7q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v4.3q-.425-.125-.987-.213T17 10V6H7v13h3.3q.15.525.4 1.038t.55.962M9 17h1q0-1.575.5-2.588L11 13.4V8H9zm4-5.75q.425-.275.963-.55T15 10.3V8h-2zM17 22q-2.075 0-3.537-1.463T12 17t1.463-3.537T17 12t3.538 1.463T22 17t-1.463 3.538T17 22m1.65-2.65l.7-.7l-1.85-1.85V14h-1v3.2z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                window.location.href = `/tindakan/detail-tindakan/update/${this.state.idTindakan}/${item.id}`;
                              }}
                              className="w-[auto] h-[auto] flex justify-center items-center p-2 bg-emerald-100 rounded-md"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fill="#44BED0"
                                  fill-rule="evenodd"
                                  d="M6.169 6.331a3 3 0 0 0-.833 1.6l-.338 1.912a1 1 0 0 0 1.159 1.159l1.912-.338a3 3 0 0 0 1.6-.833l3.07-3.07l2-2A.894.894 0 0 0 15 4.13A3.13 3.13 0 0 0 11.87 1a.894.894 0 0 0-.632.262l-2 2l-3.07 3.07Zm3.936-1.814L7.229 7.392a1.5 1.5 0 0 0-.416.8L6.6 9.4l1.208-.213l.057-.01a1.5 1.5 0 0 0 .743-.406l2.875-2.876a1.63 1.63 0 0 0-1.378-1.378m2.558.199a3.143 3.143 0 0 0-1.379-1.38l.82-.82a1.63 1.63 0 0 1 1.38 1.38l-.82.82ZM8 2.25a.75.75 0 0 0-.75-.75H4.5a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3V8.75a.75.75 0 0 0-1.5 0v2.75a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3h2.75A.75.75 0 0 0 8 2.25"
                                  clip-rule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex  p-4 w-full text-xl font-medium text-center bg-[transparent] text-stone-900 items-center justify-center">
            <button
              onClick={() => {
                window.location.href = `/tindakan/detail-tindakan/tambah-data/${this.state.idTindakan}`;
              }}
              className="justify-center p-2 w-full text-base text-center text-white bg-emerald-500 rounded-lg max-w-[320px]"
            >
              Tambah Waktu Tindakan
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ListDetailTindakan);
