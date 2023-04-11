import { lazy, Suspense } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import axios from "axios";

import ReconnectUser from "./components/ReconnectUser";
import Spinner from "./components/Spinner";
import store from "./redux/store";
import "./index.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const MapPage = lazy(() => import("./pages/MapPage"));

axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true;

const App = () => {
  return (
    <Suspense fallback={<Spinner size="large" />}>
      <Provider store={store}>
        <main className="min-h-screen bg-slate-100">
          <ReconnectUser />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />}  />
              <Route path="/map" element={<MapPage />}  />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="*" element={<h1>Page not found...</h1>} />
            </Routes>
          </BrowserRouter>
        </main>
      </Provider>
    </Suspense>
  )
};

export default App;
