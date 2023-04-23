import { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserRootState } from "../../redux/store";

/**
 * HOC para proteger las rutas que requieran autenticación
 */
const withAuthentication = (Component: ComponentType) => {
  return () => {
    const {isLoading, currentUser}= useSelector((state: UserRootState) => state.user);

    if(!isLoading && !currentUser) {
      return <Navigate to="/login" replace />
    };

    return <Component />;
  };
};

export default withAuthentication;