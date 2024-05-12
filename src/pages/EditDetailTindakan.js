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
class EditDetailTindakan extends React.Component {
  constructor(props) {
    super(props);
    const idTindakan = this.props.params.idTindakan;
    const id = this.props.params.id;
    console.log(idTindakan);
    console.log(id);
    console.log(props);
    this.state = {
      idTindakan: idTindakan,
      idDetail: id,
      tanggal: dayjs().locale("id"),
      tindakan: {},
      namaTindakan: "",
      detailTindakan: [],
      durasi: 0,
      biaya: 0,
    };
  }
  componentDidMount() {
    this.getDetailTindakan();
  }

  getDetailTindakan = async () => {
    const { idTindakan, idDetail } = this.state;
    const id = idDetail;
    console.log(id);
    try {
      const tindakanDoc = await getDoc(
        doc(db, `tindakans/${idTindakan}/waktu_tindakan`, id)
      );
      const tindakanData = tindakanDoc.data();
      console.log("tidanakan", tindakanData);
      if (tindakanData) {
        this.setState({
          durasi: tindakanData.durasi,
          biaya: tindakanData.biaya,
        });
      } else {
        console.error("Tindakan not found");
      }
    } catch (error) {
      console.error("Error fetching nama tindakan:", error);
    }
  };
  handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update the state with the new value
    this.setState({ [name]: value }, () => {
      // Callback to ensure state is updated before calling getRegistrasi
    });
  };

  handleUpdate = async (e) => {
    e.preventDefault();
    this.setState({ isProses: true });

    try {
      const { idTindakan, idDetail, durasi, biaya } = this.state;
      const id = idDetail;

      // Menyiapkan data yang akan diupdate
      const dataToUpdate = {
        durasi: parseInt(durasi), // Pastikan durasi berupa integer
        biaya: parseInt(biaya), // Pastikan biaya berupa integer
      };

      // Mengupdate data di Firestore
      await updateDoc(
        doc(db, `tindakans/${idTindakan}/waktu_tindakan`, id),
        dataToUpdate
      );
      this.setState({ isProses: false, durasi: 0, biaya: 0 });

      Swal.fire(
        "Berhasil",
        "Data Detail Tindakan Berhasil Diubah",
        "success",
        () => {
          window.location.href = `/tindakan/detail-tindakan/${this.state.idTindakan}`;
        }
      );
      window.location.href = `/tindakan/detail-tindakan/${this.state.idTindakan}`;

      // Mengatur state isEdit menjadi false dan isProses menjadi false
      this.setState({ isEdit: false, isProses: false });
    } catch (error) {
      console.error("Error mengupdate data:", error);
      Swal.fire("Error", "Gagal Memperbarui Data Detail Tindakan", "error");

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
              Edit Detail Tindakan
            </div>
          </div>
          <div className="flex flex-col gap-2.5 p-2 w-[100%] h-auto justify-center items-center">
            <div className="flex flex-col gap-1 justify-center w-[100%] p-4 text-[14px]">
              <div className="gap-0 w-full text-sm text-stone-900">
                Lama Tindakan
              </div>
              <input
                type="text"
                placeholder="Lama Waktu Tindakan"
                value={this.state.durasi}
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
                value={this.state.biaya}
                name="biaya"
                onChange={this.handleInputChange}
                className=" text-[14px] justify-center px-4 py-4 mt-2.5 text-sm whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              />
            </div>
            <button
              onClick={this.handleUpdate}
              className="justify-center p-2 w-full text-sm text-center text-white bg-emerald-500 rounded-lg max-w-[320px]"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(EditDetailTindakan);
