import { toast } from 'react-toastify';

export const useToast = () => {
  const notify = (type, message, config) => {
    toast[type](message, {
      toastId: message,
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...config
    });
  }

  return { notify }
}