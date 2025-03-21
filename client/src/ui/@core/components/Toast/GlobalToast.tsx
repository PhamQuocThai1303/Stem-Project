import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GlobalToast = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
};

export default GlobalToast;
