import withoutAuthentication from "../components/HOC/withoutAuthentication";

const HomePage = () => {
  return (
    <div className="relative min-h-screen">
      HomePage
    </div>
  )
};

export default withoutAuthentication(HomePage);