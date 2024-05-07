import logo from "./logo.svg";
import "./App.css";
import Terapis from "./pages/Terapis";
import HomePage from "./pages/Home";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/menu";
import InputTerapis from "./pages/InputTerapis";
import InputJanjiTemu from "./pages/InputjanjiTemu";
import InputTindakan from "./pages/InputTindakan";
import ListTindakan from "./pages/ListTindakan";
import JanjiTemu from "./pages/ListJanjiTemu";
import ListDetailTindakan from "./pages/ListDetailTindakan";
import InputDetailTindakan from "./pages/InputDetailTindakan";
import Loading from "./components/loading";
import EditTindakan from "./pages/EditTindakan";
import EditDetailTindakan from "./pages/EditDetailTindakan";
import Login from "./pages/Login";
import UpdateTerapis from "./pages/UpdateTerapis";
import DashboardAdmin from "./pages/DashboardAdmin";
import JanjiTemuBulan from "./pages/ListJanjiTemuBulan";
import BotBar from "./components/botBar";
import Welcome from "./pages/Welcome";

function App() {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  return (
    <div className="relative h-[100vh]">
      <Router>
        <div className="flex gap-2 mb-3 absolute z-[9999] p-4 w-full justify-start rounded-md items-center text-white bg-gradient-to-r from-emerald-500 to-emerald-500 h-[10%]">
          <div className="flex-auto gap-0 text-lg font-medium">
            Griya Terapi Sehat Kosasih
          </div>
          {isLoggedIn && <BotBar />}
        </div>
        <div className="h-[90vh] w-[100%] overflow-y-scroll m-0 pt-20">
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/masuk/" element={<Login />} />

            {isLoggedIn ? (
              <>
                <Route path="/terapis" element={<Terapis />} />
                <Route path="/dashboard" element={<DashboardAdmin />} />
                <Route
                  path="/tindakan/detail-tindakan/:id"
                  element={<ListDetailTindakan />}
                />
                <Route
                  path="/tindakan/detail-tindakan/update/:idTindakan/:id"
                  element={<EditDetailTindakan />}
                />
                <Route path="/tindakan/update/:id" element={<EditTindakan />} />
                <Route
                  path="/tindakan/detail-tindakan/tambah-data/:id"
                  element={<InputDetailTindakan />}
                />
                <Route path="/tindakan" element={<ListTindakan />} />
                <Route
                  path="/tindakan/tambah-data/"
                  element={<InputTindakan />}
                />
                <Route
                  path="/janji-temu/tambah-data/"
                  element={<InputJanjiTemu />}
                />
                <Route path="/janji-temu/" element={<JanjiTemu />} />
                <Route path="/janji-temu/bulan" element={<JanjiTemuBulan />} />
                <Route path="/terapis/:id/" element={<UpdateTerapis />} />
                <Route
                  path="/terapis/tambah-data/"
                  element={<InputTerapis />}
                />
              </>
            ) : null}
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
