import { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import Spinner from "../Spinner";
import { useGetUserQuery } from "../../redux/api";

/**
 * HOC para no permitir acceder las rutas que NO requieran autenticación
 * una vez que el usuario está autenticado, como las páginas login y signup.
 */
const withoutAuthentication = (Component: ComponentType) => {
  return () => {
    const {data, isLoading} = useGetUserQuery();

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