import React from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Select from "react-tailwindcss-select";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, dbImage } from "../config/firebase";
import { addDoc, collection } from "firebase/firestore";
import Swal from "sweetalert2";
class InputTerapis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alamat: "",
      email: "",
      id: null,
      nama: null,
      jenis_kelamin: null,
      pengalaman: null,
      umur: null,
      foto: null,
      fotoDisplay: null,
      kontak: null,
      tanggalLahir: null,
      value: "hadir",
      // tanggal: dayjs().locale("id"),
      isProses: false,
      imgSementara: "",
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
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.onload = (event) => {
      this.setState({ fotoDisplay: event.target.result, foto: file });
    };

    reader.readAsDataURL(file);
  };

  hitungUmur = async (selectedDate) => {
    const tanggalLahir = new Date(selectedDate);
    const tahunSekarang = new Date().getFullYear();
    try {
      const tanggalLahirObj = new Date(tanggalLahir);
      const tahunLahir = tanggalLahirObj.getFullYear();
      const bulanLahir = tanggalLahirObj.getMonth() + 1;

      let umur = tahunSekarang - tahunLahir;

      if (
        new Date(tahunSekarang, bulanLahir - 1, tanggalLahirObj.getDate()) >
        new Date()
      ) {
        umur--;
      }

      const year = tanggalLahir.getFullYear();
      const month = String(tanggalLahir.getMonth() + 1).padStart(2, "0"); // Tambah 1 karena bulan dimulai dari 0
      const day = String(tanggalLahir.getDate()).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;

      await new Promise((resolve) => {
        this.setState({ umur: umur, tanggalLahir: formattedDate }, resolve);
      });
      return umur;
    } catch (error) {
      console.error("gagal menghitung");
      throw error;
    }
  };

  handleTab = (newValue) => {
    this.setState({ value: newValue });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ isProses: true });
    // buat nama file foto
    const nama = this.state.nama;
    const imageUrl = nama.toLowerCase().replace(/\s+/g, "-");

    try {
      const imgRef = ref(dbImage, `dokters/${imageUrl}`);
      await uploadBytes(imgRef, this.state.foto);

      const urlFoto = await getDownloadURL(imgRef);

      const newDoctor = {
        nama: this.state.nama,
        tanggal_lahir: this.state.tanggalLahir,
        jenis_kelamin: this.state.jenis_kelamin,
        pengalaman: this.state.pengalaman,
        // pengalaman: "10 Tahun",
        umur: this.state.umur,
        kontak: this.state.kontak,
        foto: urlFoto,
      };
      await addDoc(collection(db, "dokters"), newDoctor);

      Swal.fire({
        icon: "success",
        text: "Data dokter berhasil ditambah",
        confirmButtonColor: "#10B981",
        confirmButtonText: "Ya",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/terapis";
        }
      });

      this.setState({
        nama: "",
        pengalaman: "",
        jenisKelamin: "",
        umur: "",
        kontak: "",
        tanggalLahir: "",
        foto: null,
        fotoDisplay: "",
        alamat: "",
        isProses: false,
      });
    } catch (error) {
      Swal.fire("Error", "Gagal menambah data", "error");
      console.error("Error menambahkan data:", error);
    }
  };
  render() {
    const options = [
      { value: "Laki-laki", label: "Laki-laki" },
      { value: "Perempuan", label: "Perempuan" },
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
          <div className="flex gap-5 self-stretch p-4 w-full  text-center text-stone-900">
            <button
              onClick={() => {
                window.location.href = "/terapis/";
              }}
              className="w-auto h-auto "
            >
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/8b2d02e05b773c962fdd4341539effdff4e46139a4745b83f97d7e9cb10455ed?"
                className="shrink-0 gap-0 w-6 aspect-square "
              />
            </button>
            <div className="flex-auto gap-0 text-xl font-medium">
              Input Terapis
            </div>
          </div>
          <div className="flex flex-col gap-2.5 p-2 w-[100%] h-auto justify-center items-center">
            <div className="flex flex-col gap-2.5 justify-center font-medium text-center text-emerald-500 max-w-[328px]">
              <div className=" text-[14px] flex justify-center items-center self-center  text-lg tracking-widest whitespace-nowrap bg-emerald-100 h-[120px] rounded-[120px] w-[120px]">
                <img
                  src={this.state.fotoDisplay}
                  alt=""
                  className="flex justify-center items-center object-cover bg-cover self-center border bg-emerald-100 h-[120px] rounded-[120px] w-[120px]"
                />
              </div>
              <div className="gap-0 mt-2.5 w-full text-[14px] relative">
                <input
                  type="file"
                  accept="image/*"
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  onChange={this.handleFileChange}
                />
                <span className="mr-2">Pilih berkas</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 justify-center w-[100%] h-auto p-4 text-[14px]">
              <div className="gap-0 w-full text-xs text-stone-900">Nama</div>
              <input
                type="text"
                placeholder="Nama"
                required
                value={this.state.nama}
                onChange={(e) => this.setState({ nama: e.target.value })}
                name="nama"
                className=" text-[14px] justify-center px-4 py-4 mt-2.5 text-xs whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              />
              <div className="gap-0 mt-4 w-full text-xs text-stone-900 text-[14px]">
                No. Telepon
              </div>
              <input
                type="text"
                placeholder="No Telepon"
                value={this.state.kontak}
                onChange={(e) => this.setState({ kontak: e.target.value })}
                required
                name="no_hp"
                className=" text-[14px] justify-center px-4 py-4 mt-2.5 text-xs rounded border border-solid border-neutral-400 text-neutral-400"
              />
              <div className="gap-0 mt-4 w-full text-xs text-stone-900 text-[14px]">
                Tanggal Lahir
              </div>
              <div className="w-[100%] p-0 mt-4">
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  className="text-[14px] justify-center px-4 py-4 mt-2.5 text-xs whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
                  adapterLocale="en-gb"
                >
                  <DatePicker
                    className="text-[14px] border-solid border-neutral-400 bg-white w-[100%] justify-center px-4 py-4 mt-2.5 text-xs whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
                    locale="id"
                    value={this.state.tanggalLahir}
                    onChange={this.hitungUmur}
                    inputFormat="DD/MM/YYYY"
                  />
                </LocalizationProvider>{" "}
              </div>
              <div className="gap-0 mt-4 w-full text-xs text-stone-900 text-[14px]">
                Jenis Kelamin
              </div>
              <div className="select-container relative w-[100%]">
                <div className="flex flex-col justify-center px-0 mt-3 w-[100%] text-[14px] text-xs leading-4 capitalize border border-solid border-neutral-400 bg-white text-neutral-950 rounded-lg">
                  <div className="flex items-center px-2.5 h-12 text-lg  w-[100%] bg-white border-solid border-neutral-400 rounded-lg  gap-2 ">
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
                      options={options}
                      name="kelamin"
                      placeholder={`Pilih jenis Kelamin ${
                        this.state.jenis_kelamin
                          ? `- ${this.state.jenis_kelamin}`
                          : ""
                      }`}
                      onChange={async (selectedOption) => {
                        await new Promise((resolve) => {
                          this.setState(
                            { jenis_kelamin: selectedOption.value },
                            resolve
                          );
                        });
                      }}
                      classNames={{
                        menuButton: ({ isDisabled }) =>
                          `text-[15px] flex text-sm text-slate-400 w-[100%] bg-white rounded shadow-sm transition-all duration-300 focus:outline-none ${
                            isDisabled
                              ? "bg-white "
                              : "bg-white focus:ring focus:ring-blue-500/20"
                          }`,
                        menu: "absolute z-10 w-full bg-white shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700",
                        listItem: ({ isSelected }) =>
                          `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded ${
                            isSelected
                              ? `text-gray-700 bg-white`
                              : `text-gray-700 hover:bg-emerald-500 hover:text-white`
                          }`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="gap-0 mt-5 w-full text-xs text-stone-900 text-[14px]">
                Umur
              </div>
              <input
                type="text"
                placeholder="Umur"
                name="alamat"
                value={this.state.umur}
                onChange={(e) => this.setState({ umur: e.target.value })}
                readOnly
                className=" text-[14px] justify-center px-4 py-4 mt-2.5 text-xs whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              />
              <div className="gap-0 mt-4 w-full text-xs text-stone-900 text-[14px]">
                Pengalaman
              </div>
              <input
                type="text"
                placeholder="Pengalaman"
                value={this.state.pengalaman}
                onChange={(e) => this.setState({ pengalaman: e.target.value })}
                required
                name="no_hp"
                className=" text-[14px] justify-center px-4 py-4 mt-2.5 text-xs rounded border border-solid border-neutral-400 text-neutral-400"
              />
              <div className="gap-0 mt-5 w-full text-xs text-stone-900 text-[14px]">
                Alamat Lengkap
              </div>
              <input
                type="textarea"
                placeholder="Alamat"
                value={this.state.alamat}
                onChange={(e) => this.setState({ alamat: e.target.value })}
                required
                name="alamat"
                className="justify-center text-[14px] px-4 py-4 mt-2.5 text-xs whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              />
              <div className="gap-0 mt-1 w-full text-xs italic text-right text-zinc-400">
                Maks 100 Karaketer
              </div>
            </div>
            <button
              className="justify-center p-2 w-full text-base text-center text-white bg-emerald-500 rounded-lg max-w-[320px]"
              disabled={this.state.isProses}
              type="submit"
              onClick={this.handleSubmit}
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default InputTerapis;
