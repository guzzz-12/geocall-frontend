import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
};

interface State {
  hasError: boolean;
};


class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false}
  };

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.log(`Something went wrong: ${error.message}`, errorInfo);
    this.setState({hasError: true});
  };
  
  render() {
    if(this.state.hasError) {
      return (
        <section
          style={{backgroundImage: "url(/img/error-boundary-bg.webp)"}}
          className="flex flex-col justify-end items-center w-screen h-screen px-5 bg-cover bg-top bg-no-repeat"
        >
          <div className="flex flex-col justify-center items-center gap-4 max-w-[500px] h-[40vh] text-center -translate-y-4">
            <p className="text-4xl font-bold">
            Something went wrong
            </p>
            <p className="text-base text-gray-700">
              If you are using Firefox or Safari in <span className="font-bold">incognito mode</span> this might be the cause as the storage engine is not available in <span className="font-bold">incognito mode</span> and we need it to store your chats.
            </p>
          </div>
        </section>
      )
    };

    return this.props.children;
  };
};

export default ErrorBoundary;
