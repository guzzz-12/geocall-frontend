interface Props {
  mainMessage: string;
  infoMessage: string;
};

const ErrorMessage = ({mainMessage, infoMessage}: Props) => {
  return (
    <section
      style={{backgroundImage: "url(/img/error-boundary-bg.webp)"}}
      className="flex flex-col justify-end items-center w-screen h-screen px-5 bg-cover bg-top bg-no-repeat"
    >
      <div className="flex flex-col justify-center items-center max-w-[500px] h-[40vh] text-center -translate-y-4">
        <p className="mb-1 text-4xl font-bold">
          Something went wrong
        </p>
        <p className="mb-4 text-xl font-bold text-red-700">
          {mainMessage}
        </p>
        <p className="text-base text-gray-700">
          {infoMessage}
        </p>
      </div>
    </section>
  )
};

export default ErrorMessage;