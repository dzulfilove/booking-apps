import React from "react";

import withRouter from "../withRouter";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../config/firebase";

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
class Login extends React.Component {
  constructor(props) {
    super(props);
    const idTindakan = this.props.params.id;
    console.log(props);
    this.state = {
      email: "",
      password: "",
      username: "",
      isSignUpActive: false,
      load: false,
    };
  }

  handleMethodChange = () => {
    this.setState((prevState) => ({
      isSignUpActive: !prevState.isSignUpActive,
    }));
  };

  handleLogin = () => {
    this.setState({ load: true }, () => {
      this.handleSignIn();
    });
  };
  handleSignUp = () => {
    console.log("daftar");
    const { email, password, username } = this.state;
    console.log(password);
    if (!email || !password || !username) return;
    createUserWithEmailAndPassword(auth, email, password, username)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        this.setState({ load: true }, () => {
          this.handleSubmit();
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  handleSignIn = () => {
    const { email, password } = this.state;
    if (!email || !password) return;
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Selamat, Anda Berhasil Masuk ",
          showConfirmButton: false,
          timer: 1500,
        });
        // Setelah berhasil masuk, set sessionStorage dan arahkan ke dashboard
        sessionStorage.setItem("isLoggedIn", true);
        sessionStorage.setItem("user", JSON.stringify(user)); // Jika perlu menyimpan info pengguna
        // Redirect setelah sessionStorage diset
        sessionStorage.getItem("isLoggedIn") &&
          (window.location.href = "/dashboard");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update the state with the new value
    this.setState({ [name]: value }, () => {
      // Callback to ensure state is updated before calling getRegistrasi
    });
  };

  handleSubmit = async () => {
    try {
      const newUser = {
        username: this.state.username,
        email: this.state.email,
        password: this.state.password,
      };
      await addDoc(collection(db, "users"), newUser);
      this.setState({
        nama: "",
        deskripsi: "",
        gambar: "",
      });
      Swal.fire(
        "Berhasil",
        "Berhasil Membuat Akun Baru, Silakan Masuk Ke Akun Anda",
        "success"
      );
      this.handleMethodChange();
      this.setState({ load: false });
    } catch (error) {
      Swal.fire("Gagal", "Gagal menyimpan", "error");
      console.error("Error menambahkan data:", error);
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
        {this.state.load == true && (
          <>
            <div className="absolute w-[100%] h-[100%] z-[99999]">
              <Loading />
            </div>
          </>
        )}
        <div className="flex flex-col gap-0 items-start mt-3 h-[100%] overflow-y-scroll pb-4 font-medium bg-slate-50 w-[100%]">
          <div className="flex gap-5 self-stretch p-4 w-full  text-center text-stone-900">
            <div className="flex-auto gap-0 text-xl font-medium">Masuk</div>
          </div>
          <div className="flex flex-col gap-2.5 p-2 w-[100%] h-auto justify-center items-center">
            <div className="flex flex-col items-center p-4 mx-auto w-full bg-white w-full">
              {this.state.isSignUpActive == true && (
                <>
                  <div className="text-sm text-stone-900 w-full flex justify-start px-2">
                    Username
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    required
                    onChange={this.handleInputChange}
                    name="username"
                    className=" w-full text-[14px] justify-center px-4 py-4 mt-2.5  whitespace-nowrap rounded border border-solid border-neutral-600 text-neutral-400"
                  />
                </>
              )}
              <div className="text-sm mt-3 text-stone-900 w-full flex justify-start px-2">
                Email
              </div>
              <input
                type="text"
                placeholder="Email"
                required
                onChange={this.handleInputChange}
                name="email"
                className=" w-full text-[14px] justify-center px-4 py-4 mt-2.5  whitespace-nowrap rounded border border-solid border-neutral-600 text-neutral-400"
              />
              <div className="text-sm text-stone-900 w-full flex justify-start px-2 mt-3">
                Password
              </div>
              <input
                type="password"
                placeholder="Password"
                required
                onChange={this.handleInputChange}
                name="password"
                className=" w-full text-[14px] justify-center px-4 py-4 mt-2.5  whitespace-nowrap rounded border border-solid border-neutral-600 text-neutral-400"
              />
              <div className="flex gap-5 px-5 mt-9 w-full text-sm text-emerald-500 capitalize max-w-[349px]">
                <div className="flex-auto font-medium">Lupa Password</div>
                <div className="flex-auto font-semibold">
                  <span className="font-medium text-black">User</span>{" "}
                  <span className="font-medium text-black">Baru ?</span>{" "}
                  <button
                    className="text-emerald-500"
                    onClick={this.handleMethodChange}
                  >
                    Daftar
                  </button>
                </div>
              </div>
            </div>

            {this.state.isSignUpActive == true ? (
              <>
                <button
                  onClick={this.handleSignUp}
                  className="justify-center p-2 w-full text-sm text-center text-white bg-emerald-500 rounded-lg max-w-[320px]"
                >
                  Daftar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={this.handleLogin}
                  className="justify-center p-2 w-full text-sm text-center text-white bg-emerald-500 rounded-lg max-w-[320px]"
                >
                  Masuk
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);
