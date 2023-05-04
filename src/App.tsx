import { lazy, Suspense, useEffect } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import ErrorBoundary from "./components/ErrorBoundary";
import RefetchCurrentUser from "./components/RefetchCurrentUser";
import ReconnectUser from "./components/ReconnectUser";
import Spinner from "./components/Spinner";
import ChatWindow from "./components/ChatWindow";
import VideoCallModal from "./components/VideoCallModal";
import ImageModal from "./components/ImageModal";
import GlobalAlert from "./components/GlobalAlert";
import VideocallContextProvider from "./hooks/VideoCallContext";
import store from "./redux/store";
import "react-tooltip/dist/react-tooltip.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const VerifiAccountPage = lazy(() => import("./pages/VerifyAccountPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));

const App = () => {
  // Verificar la cantidad de espacio consumido y disponible
  useEffect(() => {
    navigator.storage
    .estimate()
    .then((result) => {
      const {quota, usage} = result;
      console.log({storage: {quota, usage}})
    });

    // Inicializar el state del modal informativo mostrado en production
    const showInfoModal = localStorage.getItem("showInfoModal");
    if (!showInfoModal) {
      localStorage.setItem("showInfoModal", "true");
    }
  }, []);

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <RefetchCurrentUser />
        <ReconnectUser />
        <Suspense fallback={<Spinner size="large" />}>
          <main className="w-full min-h-screen bg-slate-100">
            <section className="relative w-full max-w-[1440px] mx-auto overflow-x-hidden">
              <ImageModal />
              <VideoCallModal />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<LandingPage />}  />
                  <Route
                    path="/map"
                    element={
                      <VideocallContextProvider>
                        <MapPage />
                      </VideocallContextProvider>
                    }
                  />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/verify-account" element={<VerifiAccountPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="*" element={<h1>Page not found...</h1>} />
                </Routes>
              </BrowserRouter>
              <VideocallContextProvider>
                <ChatWindow />
              </VideocallContextProvider>
              <ToastContainer
                position="bottom-left"
                autoClose={5000}
                hideProgressBar={true}
                theme="dark"
              />
              <GlobalAlert />
            </section>
          </main>
        </Suspense>
      </ErrorBoundary>
    </Provider>
  )
};

export default App;
