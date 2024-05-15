import React from "react";
import { Tabs, Tab } from "react-bootstrap";
import { db, dbImage } from "../config/firebase";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

class Terapis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dokters: [],
      kehadirans: [],
      hadir: [],
      id: null,
      nama: null,
      jenis_kelamin: null,
      pengalaman: null,
      umur: null,
      foto: null,
      kontak: null,
      value: "hadir",
      absen: [],
      dataHadir: [],
      dataAbsen: [],
      isHadir: true,
      search: "",
      lokasi: "GTS Tirtayasa",
      dataSemua: [],
    };
    this.sectionRef = React.createRef();
  }

  componentDidMount = async () => {
    await this.getAllDokter();
    await this.getAllKehadiran();
    await this.getAllHadir();
  };

  getAllDokter = async () => {
    try {
      const dokterCollection = collection(db, "dokters");
      const querySnapshot = await getDocs(dokterCollection);

      const dokterList = [];
      querySnapshot.forEach((doc) => {
        dokterList.push({ id: doc.id, ...doc.data() });
      });

      const objekLokasi = dokterList.filter(
        (objek) => objek.lokasi == "GTS Tirtayasa"
      );

      await new Promise((resolve) => {
        this.setState({ dokters: objekLokasi, dataSemua: dokterList }, resolve);
      });
    } catch (error) {
      console.error("Error fetching dokter data:", error);
      throw error;
    }
  };

  // Menangani perubahan input pencarian
  handleSearchChange = (event) => {
    this.setState({ search: event.target.value });
    this.handleSearch(event.target.value);
  };

  // Menjalankan pencarian
  handleSearch = (search) => {
    const { dataHadir, dataAbsen, dataSemua, dokters } = this.state;
    // Lakukan pencarian di sini
    console.log(dataAbsen);
    console.log(dataHadir);
    console.log(dataSemua);
    // Misalnya, jika data Anda disimpan di dalam 'data', Anda dapat menggunakan metode filter
    if (dataAbsen.length > 0) {
      const results2 = dataAbsen.filter((item) =>
        item.nama.toLowerCase().includes(search.toLowerCase())
      );
      this.setState({ absen: results2 });
    }

    if (dataHadir.length > 0) {
      const results3 = dataHadir.filter((item) =>
        item.nama.toLowerCase().includes(search.toLowerCase())
      );

      this.setState({ hadir: results3 });
    }

    const results = dokters.filter((item) =>
      item.nama.toLowerCase().includes(search.toLowerCase())
    );

    this.setState({ dokters: results });
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
          is_hadir: kehadiranData.is_hadir,
          lokasi: dokterDoc.data().lokasi,
        });
      }

      await new Promise((resolve) => {
        this.setState({ kehadirans: kehadiranList }, resolve);
        this.getAllHadir();
      });
    } catch (error) {
      console.error("Error fetching kehadiran:", error);
      throw error;
    }
  };
  getAllHadir = async () => {
    const objekLokasi = this.state.kehadirans.filter(
      (objek) => objek.lokasi == "GTS Tirtayasa"
    );

    const filteredArray = objekLokasi.filter((item) => item.is_hadir == true);
    const filteredArray2 = objekLokasi.filter((item) => item.is_hadir == false);
    await new Promise((resolve) => {
      this.setState(
        {
          hadir: filteredArray,
          absen: filteredArray2,
          dataHadir: filteredArray,
          dataAbsen: filteredArray2,
        },
        resolve
      );
    });
    console.log("hadir", filteredArray);
    console.log("absen", filteredArray2);
  };

  handleTab = async (newValue) => {
    await new Promise((resolve) => {
      this.setState({ value: newValue }, resolve);
    });
  };

  handlePresensi = async (isHadir, dokter) => {
    try {
      const currentDate = new Date();

      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0"); //

      const formattedDate = `${year}-${month}-${day}`;

      const dokterRef = doc(db, "dokters", dokter.id);
      const kehadiranQuerySnapshot = await getDocs(
        query(
          collection(db, "kehadirans"),
          where("dokter_ref", "==", dokterRef),
          where("tanggal", "==", formattedDate)
        )
      );

      if (!kehadiranQuerySnapshot.empty) {
        const kehadiranDoc = kehadiranQuerySnapshot.docs[0];
        await updateDoc(kehadiranDoc.ref, { is_hadir: isHadir });
        console.log("berhasil update kehadiran");
      } else {
        const dataKehadiran = {
          dokter_ref: dokterRef,
          is_hadir: isHadir,
          tanggal: formattedDate,
        };
        await addDoc(collection(db, "kehadirans"), dataKehadiran);
        console.log("berhasil tambah kehadiran");
      }
      if (isHadir == true) {
        Swal.fire({
          icon: "success",
          text: "Terapis Berhasil Hadir",
          confirmButtonColor: "#10B981",
          confirmButtonText: "Ya",
        }).then((result) => {
          if (result.isConfirmed) {
            this.getAllKehadiran();
            this.setState({ value: "hadir" });
          }
        });
      } else {
        this.getAllKehadiran();
        Swal.fire({
          icon: "success",
          text: "Terapis Berhasil Absen",
          confirmButtonColor: "#10B981",
          confirmButtonText: "Ya",
        }).then((result) => {
          if (result.isConfirmed) {
            this.getAllHadir();

            this.setState({ value: "absen" });
          }
        });
      }
    } catch (error) {
      console.error("gagal hadir", error);
    }
  };

  handleClick = () => {
    // Pastikan sectionRef sudah terinisialisasi sebelum mencoba mengaksesnya
    if (this.sectionRef.current) {
      this.sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  handleEdit = () => {
    console.log("Hello World");
  };
  handleFilterLokasi = (selectedOption) => {
    const objekLokasi = this.state.dataSemua.filter(
      (objek) => objek.lokasi == selectedOption
    );

    const objekLokasi2 = this.state.kehadirans.filter(
      (objek) => objek.lokasi === selectedOption
    );

    const filteredArray = objekLokasi2.filter((item) => item.is_hadir == true);
    const filteredArray2 = objekLokasi2.filter(
      (item) => item.is_hadir == false
    );

    this.setState({
      hadir: filteredArray,
      absen: filteredArray2,
      dataHadir: filteredArray,
      dataAbsen: filteredArray2,
      dokters: objekLokasi,
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
        ref={this.sectionRef}
      >
        <button className="floating-btn" onClick={this.handleClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="white"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="m17 14l-5-5m0 0l-5 5"
            />
          </svg>
        </button>
        <button
          onClick={() => {
            window.location.href = "/terapis/tambah-data/";
          }}
          className="justify-center p-2 w-full text-base text-center text-white bg-emerald-500 rounded-lg max-w-[320px] floating-btn-add shadow-lg"
        >
          Tambah Terapis
        </button>
        <div className="flex flex-col gap-0 h-[100%] items-center font-medium pb-4 w-[100%]">
          <div className="flex flex-col items-center justify-start w-full h-[40%]  gap-5">
            <div className="flex gap-5 self-stretch p-4 w-full  text-center text-stone-900 ">
              <div className="flex-auto gap-0 text-xl font-medium">
                Data Terapis
              </div>
            </div>
            <div className="w-[100%] h-auto pl-3 pr-3 px-0 ">
              <div className="flex gap-4 bg-white  px-4 py-3 w-full text-sm tracking-normal leading-4  rounded-lg shadow-sm text-neutral-400">
                <button className="w-auto h-auto" onClick={this.handleSearch}>
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/e2779943858cc6dd76b2feebe0c17cecc9a5287dfa76d9a94d344c614a742faa?"
                    className="shrink-0 gap-0 w-6 aspect-square"
                  />
                </button>
                <input
                  type="text"
                  required
                  name="search"
                  placeholder="Cari Nama Terapis"
                  className="flex-1 gap-0 my-auto h-8 border-none"
                  onChange={this.handleSearchChange}
                />
              </div>

              <div className="flex justify-start gap-4  mt-3 w-full text-sm leading-4 capitalize  h-auto text-neutral-950">
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
                      this.state.lokasi == "GTS Tirtayasa"
                        ? "#10B981"
                        : "white",
                    color:
                      this.state.lokasi == "GTS Tirtayasa"
                        ? "white"
                        : "#10B981",
                    border:
                      this.state.lokasi == "GTS Tirtayasa"
                        ? ""
                        : " 1px solid #10B981",
                  }}
                >
                  GTS Tirtayasa
                </button>
              </div>
            </div>
            <div className="w-[100%] h-auto pl-3 pr-3">
              <Tabs
                id="controlled-tab-example"
                activeKey={this.state.value}
                onSelect={this.handleTab}
                className="custom-tab-bar-2"
              >
                <Tab eventKey="semua" title="Semua">
                  {" "}
                </Tab>
                <Tab eventKey="hadir" title="Hadir">
                  {" "}
                </Tab>
                <Tab eventKey="absen" title="Tidak Hadir">
                  {" "}
                </Tab>
              </Tabs>
            </div>
          </div>
          <div className="flex flex-col w-full px-5 h-[60%] justify-start items-center p-2 gap-3 overflow-y-scroll bg-slate-50 pb-20">
            {this.state.value == "semua" && (
              <>
                {/* Looping semua data terapis */}
                {this.state.dokters.map((dokter) => (
                  <div className="flex flex-col justify-center self-center p-4 mt-1 w-full bg-white rounded-xl shadow-md flex-wrap h-15 ">
                    <Link
                      to={dokter.id}
                      className="flex gap-2 justify-between w-full  overflow-x-hidden "
                    >
                      <img
                        loading="lazy"
                        src={dokter.foto}
                        className="shrink-0 my-auto aspect-[0.79] w-[30%] h-[100%] bg-cover rounded-md object-cover"
                      />
                      <div className="flex flex-col my-auto items-start w-[70%] ">
                        <div className="text-base font-medium text-black flex w-100 justify-start items-center gap-1">
                          {dokter.nama}
                        </div>

                        <div className="flex flex-col flex-1 text-black text-sm mt-3 gap-2">
                          <div className="flex whitespace-nowrap justify-start gap-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fill="#10B981"
                                d="M10 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8m-4.991 9A2 2 0 0 0 3 13c0 1.691.833 2.966 2.135 3.797C6.417 17.614 8.145 18 10 18s3.583-.386 4.865-1.203C16.167 15.967 17 14.69 17 13a2 2 0 0 0-2-2z"
                              />
                            </svg>
                            <div className="text-gray-600">
                              {dokter.jenis_kelamin}
                            </div>
                          </div>
                          <div className="flex whitespace-nowrap justify-start gap-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="#10B981"
                                d="M19 6h-3V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3m-9-1h4v1h-4Zm10 13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5.61L8.68 14A1.19 1.19 0 0 0 9 14h6a1.19 1.19 0 0 0 .32-.05L20 12.39Zm0-7.72L14.84 12H9.16L4 10.28V9a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1Z"
                              />
                            </svg>
                            <div className="text-grey-600 ">
                              {" "}
                              {dokter.pengalaman} Tahun Pengalaman
                            </div>
                          </div>
                          <div className="flex whitespace-nowrap justify-start gap-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 32 32"
                            >
                              <path
                                fill="#10B981"
                                d="M16 2A11.013 11.013 0 0 0 5 13a10.9 10.9 0 0 0 2.216 6.6s.3.395.349.452L16 30l8.439-9.953c.044-.053.345-.447.345-.447l.001-.003A10.9 10.9 0 0 0 27 13A11.013 11.013 0 0 0 16 2m0 15a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4"
                              />
                              <circle cx="16" cy="13" r="4" fill="none" />
                            </svg>
                            <div className="text-grey-600">
                              {" "}
                              {dokter.lokasi}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="flex gap-4 mt-4 text-sm text-center whitespace-nowrap">
                      <button
                        className="flex-1 w-12 p-2 justify-center text-white bg-red-500 rounded-lg border border-solid"
                        onClick={(e) => {
                          this.handlePresensi(false, dokter);
                        }}
                      >
                        Tidak Hadir
                      </button>
                      <button
                        className="flex-1 w-12 p-2 justify-center text-white bg-emerald-500 rounded-lg items-center"
                        onClick={(e) => {
                          this.handlePresensi(true, dokter);
                        }}
                      >
                        Hadir
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {this.state.value == "hadir" && (
              <>
                {this.state.hadir.length > 0 ? (
                  <>
                    {this.state.hadir.map((item) => (
                      <div className="flex flex-col justify-center self-center p-4 mt-1 w-full bg-white rounded-xl shadow-md flex-wrap h-15 ">
                        <div className="flex gap-2 justify-between w-full overflow-x-hidden ">
                          <img
                            loading="lazy"
                            srcSet={item.foto}
                            className="shrink-0 my-auto aspect-[0.79] w-[30%] h-[100%] bg-cover rounded-md object-cover"
                          />
                          <div className="flex flex-col text-lg my-auto items-start w-[70%] ">
                            <div className="text-base font-medium text-black flex w-100 justify-start items-center gap-1">
                              {item.nama}
                            </div>

                            <div className="flex flex-col flex-1 text-black text-sm mt-3 gap-2">
                              <div className="flex whitespace-nowrap justify-start gap-4">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fill="#10B981"
                                    d="M10 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8m-4.991 9A2 2 0 0 0 3 13c0 1.691.833 2.966 2.135 3.797C6.417 17.614 8.145 18 10 18s3.583-.386 4.865-1.203C16.167 15.967 17 14.69 17 13a2 2 0 0 0-2-2z"
                                  />
                                </svg>
                                <div className="text-gray-600">
                                  {item.jenis_kelamin}
                                </div>
                              </div>
                              <div className="flex whitespace-nowrap justify-start gap-4">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fill="#10B981"
                                    d="M19 6h-3V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3m-9-1h4v1h-4Zm10 13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5.61L8.68 14A1.19 1.19 0 0 0 9 14h6a1.19 1.19 0 0 0 .32-.05L20 12.39Zm0-7.72L14.84 12H9.16L4 10.28V9a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1Z"
                                  />
                                </svg>
                                <div className="text-grey-600">
                                  {" "}
                                  {item.pengalaman} Tahun Pengalaman
                                </div>
                              </div>
                              <div className="flex whitespace-nowrap justify-start gap-4">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 32 32"
                                >
                                  <path
                                    fill="#10B981"
                                    d="M16 2A11.013 11.013 0 0 0 5 13a10.9 10.9 0 0 0 2.216 6.6s.3.395.349.452L16 30l8.439-9.953c.044-.053.345-.447.345-.447l.001-.003A10.9 10.9 0 0 0 27 13A11.013 11.013 0 0 0 16 2m0 15a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4"
                                  />
                                  <circle cx="16" cy="13" r="4" fill="none" />
                                </svg>
                                <div className="text-grey-600">
                                  {" "}
                                  {item.lokasi}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-4 text-sm text-center whitespace-nowrap">
                          <div className="flex-1 w-12 p-2 justify-center text-emerald-500 bg-emerald-100 border border-solid border-emerald-500 rounded-lg items-center">
                            Hadir
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
                      <div className="w-full text-sm text-gray-400">
                        Harap Tambahkan Krhadiran Terapis
                      </div>
                    </div>
                  </>
                )}
                {/* Looping semua data terapis */}
              </>
            )}
            {this.state.value == "absen" && (
              <>
                {this.state.absen.length > 0 ? (
                  <>
                    {this.state.absen.map((item) => (
                      <div className="flex flex-col justify-center self-center p-4 mt-1 w-[100%] bg-white rounded-xl shadow-md flex-wrap h-15 ">
                        <div className="flex gap-2 justify-between w-full  overflow-x-hidden ">
                          <img
                            loading="lazy"
                            srcSet={item.foto}
                            className="shrink-0 my-auto aspect-[0.79] w-[30%] h-[100%] bg-cover rounded-md object-cover"
                          />
                          <div className="flex flex-col my-auto items-start w-[70%] ">
                            <div className="text-base font-medium text-black flex w-100 justify-start items-center gap-1">
                              {item.nama}
                            </div>

                            <div className="flex flex-col flex-1 text-black text-sm mt-3 gap-2">
                              <div className="flex whitespace-nowrap justify-start gap-4">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fill="#10B981"
                                    d="M10 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8m-4.991 9A2 2 0 0 0 3 13c0 1.691.833 2.966 2.135 3.797C6.417 17.614 8.145 18 10 18s3.583-.386 4.865-1.203C16.167 15.967 17 14.69 17 13a2 2 0 0 0-2-2z"
                                  />
                                </svg>
                                <div className="text-gray-600">
                                  {item.jenis_kelamin}
                                </div>
                              </div>
                              <div className="flex whitespace-nowrap justify-start gap-4">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fill="#10B981"
                                    d="M19 6h-3V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3m-9-1h4v1h-4Zm10 13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5.61L8.68 14A1.19 1.19 0 0 0 9 14h6a1.19 1.19 0 0 0 .32-.05L20 12.39Zm0-7.72L14.84 12H9.16L4 10.28V9a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1Z"
                                  />
                                </svg>
                                <div className="text-grey-600">
                                  {" "}
                                  {item.pengalaman} Tahun Pengalaman
                                </div>
                              </div>
                              <div className="flex whitespace-nowrap justify-start gap-4">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 32 32"
                                >
                                  <path
                                    fill="#10B981"
                                    d="M16 2A11.013 11.013 0 0 0 5 13a10.9 10.9 0 0 0 2.216 6.6s.3.395.349.452L16 30l8.439-9.953c.044-.053.345-.447.345-.447l.001-.003A10.9 10.9 0 0 0 27 13A11.013 11.013 0 0 0 16 2m0 15a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4"
                                  />
                                  <circle cx="16" cy="13" r="4" fill="none" />
                                </svg>
                                <div className="text-grey-600">
                                  {" "}
                                  {item.lokasi}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-4 text-sm text-center whitespace-nowrap">
                          <div className="flex-1 w-12 p-2 justify-center text-red-500 bg-red-100 border border-solid border-red-500 rounded-lg items-center">
                            Tidak Hadir
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
                      <div className="w-full text-sm text-gray-400">
                        Harap Tambahkan Krhadiran Terapis
                      </div>
                    </div>
                  </>
                )}
                {/* Looping semua data terapis */}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Terapis;
