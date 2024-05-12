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
class InputDetailTindakan extends React.Component {
  constructor(props) {
    super(props);
    const idTindakan = this.props.params.id;
    console.log(props);
    this.state = {
      idTindakan: idTindakan,
      tanggal: dayjs().locale("id"),
      tindakan: {},
      namaTindakan: "",
      detailTindakan: [],
      durasi: 0,
      biaya: 0,
    };
  }
  componentDidMount() {
    this.getAllWaktuTindakan();
  }

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
      if (waktuTindakanList.length) {
        this.setState({
          detailtindakan: waktuTindakanList,
          isAda: true,
        });
      }
    } catch (error) {
      console.error("Error fetching waktu tindakan data:", error);
      throw error;
    }
  };
  handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update the state with the new value
    this.setState({ [name]: value }, () => {
      // Callback to ensure state is updated before calling getRegistrasi
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ isProses: false });
    try {
      const { durasi, biaya } = this.state;
      const data = {
        durasi: parseInt(durasi),
        biaya: parseInt(biaya),
      };

      await addDoc(
        collection(db, `tindakans/${this.state.idTindakan}/waktu_tindakan`),
        data
      );
      this.setState({ isProses: false, durasi: "", biaya: "" });

      Swal.fire({
        icon: "success",
        text: "Data Detail Tindakan Berhasil ditambah",
        confirmButtonColor: "#10B981",
        confirmButtonText: "Ya",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = `/tindakan/detail-tindakan/${this.state.idTindakan}`;
        }
      });
    } catch (error) {
      console.error("Error menambah data:", error);
      alert("Gagal menambah data.");
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
        <div className="flex flex-col gap-0 items-start h-[100%] overflow-y-scroll pb-4 font-medium bg-slate-50 w-[100%]">
          <div className="flex gap-5 self-stretch p-4 w-full  text-center text-stone-900">
            <button
              onClick={() => {
                window.location.href = `/tindakan/detail-tindakan/${this.state.idTindakan}`;
              }}
              className="w-auto h-auto "
            >
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/8b2d02e05b773c962fdd4341539effdff4e46139a4745b83f97d7e9cb10455ed?"
                className="shrink-0 gap-0 w-6 aspect-square"
              />
            </button>
            <div className="flex-auto gap-0 text-xl font-medium">
              Input Detail Tindakan
            </div>
          </div>
          <div className="flex flex-col gap-2.5 p-2 w-[100%] h-auto justify-center items-center">
            <div className="flex flex-col gap-1 justify-center w-[100%] p-4 text-[14px]">
              <div className="gap-0 w-full text-sm text-stone-900">
                Lama Tindakan ( Dalam Menit )
              </div>
              <input
                type="text"
                placeholder="Lama Waktu Tindakan"
                required
                onChange={this.handleInputChange}
                name="durasi"
                className=" text-[14px] justify-center px-4 py-4 mt-2.5 text-sm whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              />
              <div className="gap-0 mt-4 w-full text-sm text-stone-900 text-[14px]">
                Biaya Tindakan
              </div>
              <input
                type="text"
                placeholder="Biaya Tindakan"
                required
                name="biaya"
                onChange={this.handleInputChange}
                className=" text-[14px] justify-center px-4 py-4 mt-2.5 text-sm whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              />
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

export default withRouter(InputDetailTindakan);
