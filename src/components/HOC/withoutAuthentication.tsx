import { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import Spinner from "../Spinner";
import { useGetCurrentUserQuery } from "../../redux/api";

/**
 * HOC para no permitir acceder las rutas que NO requieran autenticación
 * una vez que el usuario está autenticado, como las páginas login y signup.
 */
const withoutAuthentication = (Component: ComponentType) => {
  return () => {
    const {data, isLoading} = useGetCurrentUserQuery();

    if(isLoading) {
      return (
        <Spinner size="large"/>
      )
    };

    if(data && !isLoading) {
      return <Navigate to="/map" replace />
    };

    return <Component />;
  };
};

export default withoutAuthentication;