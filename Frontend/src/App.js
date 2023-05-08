import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from './components/Dashboard.js';
import Layout from "./components/Layout";
import Missing from "./components/Missing";
import Unauthorized from "./components/Unauthorized";
import Profile from "./components/Profile";
import Investment from "./components/Investment";
import Client from "./components/Client"
import RequireAuth from "./components/RequireAuth";
import PersistLogin from "./components/PersistLogin";

import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route path="/" element={<Register />}></Route>
        <Route path="login" element={<Login />}></Route>
        <Route path="register" element={<Register />}></Route>
        <Route path="unauthorized" element={<Unauthorized />}></Route>

        {/* protected */}
        <Route element={<PersistLogin></PersistLogin>}>
          <Route element={<RequireAuth allowedRoles={['Advisor']} />}>
            <Route path="dashboard" element={<Dashboard />}></Route>
            <Route path="client" element={<Client />}></Route>
            <Route path="profile" element={<Profile />}></Route>
            <Route path="investment" element={<Investment />}></Route>
          </Route>
        </Route>

        <Route path="*" element={<Missing />}></Route>
      </Route>
    </Routes>
  );
}

export default App;
