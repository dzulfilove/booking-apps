import React from "react";
import { Tabs, Tab } from "react-bootstrap";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "../styles/homepage.css";
import TimeImage from "../assets/clock.png";
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
import { db } from "../config/firebase";
import Swal from "sweetalert2";

class JanjiTemu extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      tanggal: dayjs().locale("id"),
      tanggalString: dayjs().locale("id").format("YYYY-MM-DD"),
      value: "tab2",
      dataJanji: [],
      dataSelesai: [],
      dataSaatIni: [],
    };
  }
  handleTab = (newValue) => {
    this.setState({ value: newValue });
  };
  componentDidMount() {
    this.getAllJanji();
  }
  handleStatus = async (item) => {
    try {
      const id = item.id;

      const result = await Swal.fire({
        icon: "info",
        text: "Apakah Janji Temu telah Selesai ?",
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
        // Mengupdate data di Firestore
        await updateDoc(doc(db, "janji_temu", id), {
          status: "selesai",
        });

        Swal.fire("Berhasil", "Janji Temu Telah selesai", "success");
        this.getAllJanji();
      } else if (result.isDenied) {
        // Tidak melakukan apa pun jika pengguna menolak
      }
    } catch (error) {
      console.error("Error mengupdate data:", error);
      Swal.fire("Error", "Gagal Memperbarui Data Detail Tindakan", "error");

      this.setState({ isProses: false });
    }
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
        });
      }

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
      // Setelah semua data diproses, atur state janjis dan kembalikan processedJanjiList
      await new Promise((resolve) => {
        this.setState(
          {
            dataJanji: hasilTransformasi,
            dataSaatIni: objekBerlangsung,
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

  handleAdd = () => {
    window.location.href = "/tindakan/tambah-data/";
  };
  handleTab = (newValue) => {
    this.setState({ value: newValue });
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
        <div className="flex flex-col gap-0 h-[100%] items-center pb-4 font-medium bg-slate-50 w-[100%]">
          <div className="flex gap-5 self-stretch p-4 w-full  text-center text-stone-900">
            <div className="flex-auto gap-0 text-xl font-medium">
              Data Janji Temu Pasien
            </div>
          </div>
          <div className="w-full h-auto px-3">
            <Tabs
              id="controlled-tab-example"
              activeKey={this.state.value}
              onSelect={this.handleTab}
              className="custom-tab-bar"
            >
              <Tab eventKey="tab1" title="Saat Ini">
                {" "}
              </Tab>
              <Tab eventKey="tab2" title="Semua">
                {" "}
              </Tab>
              <Tab eventKey="tab3" title="Selesai">
                {" "}
              </Tab>
            </Tabs>
          </div>
          <div className="flex flex-col w-[100%] h-[100%] justify-start items-center mb-4 overflow-y-scroll p-3 ">
            {this.state.value == "tab1" && (
              <>
                <div className="flex flex-col w-full h-[100%] justify-start items-center p-3 gap-3 overflow-y-scroll">
                  {this.state.dataSaatIni.length > 0 ? (
                    <>
                      {this.state.dataSaatIni.map((item) => (
                        <>
                          <div className="flex flex-col justify-center p-4 bg-white rounded-xl shadow-md w-full">
                            <div className="flex gap-2.5 justify-center text-xs font-medium">
                              <img
                                loading="lazy"
                                srcSet={item.foto}
                                className="shrink-0 aspect-[0.78] w-[100px] h-[70px] object-cover bg-cover rounded-md "
                              />
                              <div className="flex flex-col flex-1">
                                <div className="flex gap-2 text-center text-blue-500 whitespace-nowrap">
                                  <div className="justify-center px-2 py-1 rounded-lg border border-blue-500 border-solid px-16">
                                    {item.tindakan}
                                  </div>
                                </div>
                                <div className="mt-1 text-sm text-black">
                                  {item.dokter}
                                </div>
                                <div className="mt-1 text-gray-400">
                                  Pasien : {item.nama_pasien}
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
                                  <div>{item.tanggal}</div>
                                </div>
                                <div className="flex gap-4 mt-2.5 justify-between">
                                  <div className="flex gap-4 mt-2.5">
                                    <img
                                      loading="lazy"
                                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/51f302d9064442e1b1b7d2c592ac690e6da9fc8c29a6a2149936dfdc19d77f6a?"
                                      className="shrink-0 aspect-square w-[18px]"
                                    />
                                    <div>
                                      {item.jam_mulai} - {item.jam_selesai}
                                    </div>
                                  </div>
                                  <div className="flex gap-2.5 justify-center self-end px-2 py-1 text-xs font-medium text-center text-green-500 whitespace-nowrap rounded-2xl bg-green-500 bg-opacity-10">
                                    <div className="shrink-0 my-auto w-2 h-2 bg-green-500 rounded-full" />
                                    <div>Berlangsung</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-4 mt-4 text-sm text-center whitespace-nowrap">
                              <button
                                className="flex-1 w-12 p-2 justify-center text-white bg-blue-500 rounded-lg items-center"
                                onClick={() => this.handleStatus(item)}
                              >
                                Selesai
                              </button>
                            </div>
                          </div>
                        </>
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col text-center max-w-[360px]">
                        <img
                          loading="lazy"
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/0c65606ebee1b6385716d2b992b9da1ce85e7d156aec662e98ee133e4645beff?"
                          className="self-center w-full aspect-[1.37] max-w-[250px]"
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
                <div className="flex flex-col w-full h-[100%] justify-start items-center p-3 gap-3 overflow-y-scroll">
                  {this.state.dataJanji.length > 0 ? (
                    <>
                      {this.state.dataJanji.map((item) => (
                        <>
                          <div className="flex flex-col justify-center p-4 bg-white rounded-xl shadow-md w-full">
                            <div className="flex gap-2.5 justify-center text-xs font-medium">
                              <img
                                loading="lazy"
                                srcSet={item.foto}
                                className="shrink-0 aspect-[0.78] w-[100px] h-[70px] object-cover bg-cover rounded-md "
                              />
                              <div className="flex flex-col flex-1">
                                <div className="flex gap-2 text-center text-blue-500 whitespace-nowrap">
                                  <div className="justify-center px-2 py-1 rounded-lg border border-blue-500 border-solid px-16">
                                    {item.tindakan}
                                  </div>
                                </div>
                                <div className="mt-1 text-sm text-black">
                                  {item.dokter}
                                </div>
                                <div className="mt-1 text-gray-400">
                                  Pasien : {item.nama_pasien}
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
                                  <div>{item.tanggal}</div>
                                </div>
                                <div className="flex gap-4 mt-2.5">
                                  <img
                                    loading="lazy"
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/51f302d9064442e1b1b7d2c592ac690e6da9fc8c29a6a2149936dfdc19d77f6a?"
                                    className="shrink-0 aspect-square w-[18px]"
                                  />
                                  <div>
                                    {item.jam_mulai} - {item.jam_selesai}
                                  </div>
                                </div>
                              </div>
                              {item.status == "berlangsung" ? (
                                <>
                                  <div className="flex gap-2.5 justify-center self-end px-2 py-1 mt-6 text-xs font-medium text-center text-green-500 whitespace-nowrap rounded-2xl bg-green-500 bg-opacity-10">
                                    <div className="shrink-0 my-auto w-2 h-2 bg-green-500 rounded-full" />
                                    <div>Berlangsung</div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex gap-2.5 justify-center self-end px-2 py-1 mt-6 text-xs font-medium text-center text-blue-500 whitespace-nowrap rounded-2xl bg-blue-500 bg-opacity-10">
                                    <div className="shrink-0 my-auto w-2 h-2 bg-blue-500 rounded-full" />
                                    <div>Selesai</div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col text-center max-w-[360px]">
                        <img
                          loading="lazy"
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/0c65606ebee1b6385716d2b992b9da1ce85e7d156aec662e98ee133e4645beff?"
                          className="self-center w-full aspect-[1.37] max-w-[250px]"
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
            {this.state.value == "tab3" && (
              <>
                <div className="flex flex-col w-full h-[100%] justify-start items-center p-3 gap-3 overflow-y-scroll">
                  {this.state.dataSelesai.length > 0 ? (
                    <>
                      {this.state.dataSelesai.map((item) => (
                        <>
                          <div className="flex flex-col justify-center p-4 bg-white rounded-xl shadow-md w-full">
                            <div className="flex gap-2.5 justify-center text-xs font-medium">
                              <img
                                loading="lazy"
                                srcSet={item.foto}
                                className="shrink-0 aspect-[0.78] w-[100px] h-[70px] object-cover bg-cover rounded-md "
                              />
                              <div className="flex flex-col flex-1">
                                <div className="flex gap-2 text-center text-blue-500 whitespace-nowrap">
                                  <div className="justify-center px-2 py-1 rounded-lg border border-blue-500 border-solid px-16">
                                    {item.tindakan}
                                  </div>
                                </div>
                                <div className="mt-1 text-sm text-black">
                                  {item.dokter}
                                </div>
                                <div className="mt-1 text-gray-400">
                                  Pasien : {item.nama_pasien}
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
                                  <div>{item.tanggal}</div>
                                </div>
                                <div className="flex gap-4 mt-2.5">
                                  <img
                                    loading="lazy"
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/51f302d9064442e1b1b7d2c592ac690e6da9fc8c29a6a2149936dfdc19d77f6a?"
                                    className="shrink-0 aspect-square w-[18px]"
                                  />
                                  <div>
                                    {item.jam_mulai} - {item.jam_selesai}
                                  </div>
                                </div>
                              </div>
                              {item.status == "berlangsung" ? (
                                <>
                                  <div className="flex gap-2.5 justify-center self-end px-2 py-1 mt-6 text-xs font-medium text-center text-green-500 whitespace-nowrap rounded-2xl bg-green-500 bg-opacity-10">
                                    <div className="shrink-0 my-auto w-2 h-2 bg-green-500 rounded-full" />
                                    <div>Berlangsung</div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex gap-2.5 justify-center self-end px-2 py-1 mt-6 text-xs font-medium text-center text-blue-500 whitespace-nowrap rounded-2xl bg-blue-500 bg-opacity-10">
                                    <div className="shrink-0 my-auto w-2 h-2 bg-blue-500 rounded-full" />
                                    <div>Selesai</div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col text-center max-w-[360px]">
                        <img
                          loading="lazy"
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/0c65606ebee1b6385716d2b992b9da1ce85e7d156aec662e98ee133e4645beff?"
                          className="self-center w-full aspect-[1.37] max-w-[250px]"
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
          </div>
          <button
            onClick={() => {
              window.location.href = "/janji-temu/tambah-data";
            }}
            className="justify-center p-2 w-full text-sm text-center text-white bg-blue-500 rounded-lg max-w-[320px]"
          >
            Tambah
          </button>
        </div>
      </div>
    );
  }
}

export default JanjiTemu;
