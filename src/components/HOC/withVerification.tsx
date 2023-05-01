import { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserRootState } from "../../redux/store";

/**
 * HOC para proteger las rutas que requieran
 * autenticación y verificación.
 */
const withVerification = (Component: ComponentType) => {
  return () => {
    const {isLoading, currentUser}= useSelector((state: UserRootState) => state.user);
    const token = localStorage.getItem("token");
    
    // Si no está autenticado, redirigir a la página de login
    if(!isLoading && !currentUser && !token) {
      return <Navigate to="/" replace />
    };

    // Si está autenticado pero no está verificado,
    // redirigir a la página de verificación
    if (!isLoading && currentUser && !currentUser.emailVerified) {
      return <Navigate to="/verify-account" replace />
    };

    return <Component />;
  };
};

export default withVerification;