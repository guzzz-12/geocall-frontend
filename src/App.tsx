import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MapPage from "./pages/MapPage";
import store from "./redux/store";
import "./index.css";

const App = () => {
  return (
    <Provider store={store}>
      <main className="min-h-screen bg-slate-100">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />}  />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="*" element={<h1>Page not found...</h1>} />
          </Routes>
        </BrowserRouter>
      </main>
    </Provider>
  )
};

export default App;
