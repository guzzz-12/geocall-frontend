import { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserRootState } from "../../redux/store";

/**
 * HOC para no permitir acceder las rutas que NO requieran autenticación
 * una vez que el usuario está autenticado, como las páginas login y signup.
 */
const withoutAuthentication = (Component: ComponentType) => {
  return () => {
    const {isLoading, currentUser} = useSelector((state: UserRootState) => state.user);

    if(!isLoading && currentUser) {
      return <Navigate to="/map" replace />
    };

    return <Component />;
  };
};

export default withoutAuthentication;