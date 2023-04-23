import { lazy, Suspense, useEffect } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import RefetchCurrentUser from "./components/RefetchCurrentUser";
import ReconnectUser from "./components/ReconnectUser";
import Spinner from "./components/Spinner";
import ChatWindow from "./components/ChatWindow";
import VideoCallModal from "./components/VideoCallModal";
import ImageModal from "./components/ImageModal";
import store from "./redux/store";
import "react-tooltip/dist/react-tooltip.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));

const App = () => {
  // Verificar la cantidad de espacio consumido y disponible
  useEffect(() => {
    navigator.storage
    .estimate()
    .then((result) => {
      const {quota, usage} = result;
      console.log({storage: {quota, usage}})
    });
  }, []);

  return (
    <Provider store={store}>
      <RefetchCurrentUser />
      <ReconnectUser />
      <Suspense fallback={<Spinner size="large" />}>
        <main className="relative min-h-screen bg-slate-100">
          <ImageModal />
          <VideoCallModal />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />}  />
              <Route path="/map" element={<MapPage />}  />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="*" element={<h1>Page not found...</h1>} />
            </Routes>
          </BrowserRouter>
          <ChatWindow />
          <ToastContainer
            position="bottom-left"
            autoClose={5000}
            hideProgressBar={true}
            theme="dark"
          />
        </main>
      </Suspense>
    </Provider>
  )
};

export default App;
