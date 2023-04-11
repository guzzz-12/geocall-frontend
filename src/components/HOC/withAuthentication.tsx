import { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import Spinner from "../Spinner";
import { useGetCurrentUserQuery } from "../../redux/api";

/**
 * HOC para proteger las rutas que requieran autenticación
 */
const withAuthentication = (Component: ComponentType) => {
  return () => {
    const {data, isLoading} = useGetCurrentUserQuery();

    if(isLoading) {
      return (
        <Spinner size="large"/>
      )
    };

    if(!isLoading && !data) {
      return <Navigate to="/login" replace />
    };

    return <Component />;
  };
};

export default withAuthentication;