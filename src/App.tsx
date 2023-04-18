import { lazy, Suspense } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import axios from "axios";

import ReconnectUser from "./components/ReconnectUser";
import Spinner from "./components/Spinner";
import ChatWindow from "./components/ChatWindow";
import VideoCallModal from "./components/VideoCallModal";
import store from "./redux/store";
import "react-tooltip/dist/react-tooltip.css";
import "./index.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const MapPage = lazy(() => import("./pages/MapPage"));

axios.defaults.baseURL = "http://localhost:5000";

const App = () => {
  return (
    <Provider store={store}>
      <ReconnectUser />
      <Suspense fallback={<Spinner size="large" />}>
        <main className="relative min-h-screen bg-slate-100">
          <VideoCallModal />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />}  />
              <Route path="/map" element={<MapPage />}  />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="*" element={<h1>Page not found...</h1>} />
            </Routes>
          </BrowserRouter>
          <ChatWindow />
        </main>
      </Suspense>
    </Provider>
  )
};

export default App;
