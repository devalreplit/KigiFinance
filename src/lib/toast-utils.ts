import { toast } from "@/hooks/use-toast";

interface ToastSuccessOptions {
  title: string;
  description?: string;
}

interface ToastErrorOptions {
  title: string;
  description?: string;
}

interface ToastInfoOptions {
  title: string;
  description?: string;
}

interface ToastWarningOptions {
  title: string;
  description?: string;
}

export const toastSuccess = ({ title, description }: ToastSuccessOptions) => {
  return toast({
    title,
    description,
    variant: "success",
    style: {
      backgroundColor: "#16a34a",
      color: "white",
      border: "1px solid #15803d",
    },
    className: "toast-success",
  });
};

export const toastError = ({ title, description }: ToastErrorOptions) => {
  return toast({
    title,
    description,
    variant: "destructive",
    style: {
      backgroundColor: "#dc2626",
      color: "white",
      border: "1px solid #b91c1c",
    },
    className: "toast-error",
  });
};

export const toastInfo = ({ title, description }: ToastInfoOptions) => {
  return toast({
    title,
    description,
    variant: "info",
    style: {
      backgroundColor: "#2563eb",
      color: "white",
      border: "1px solid #1d4ed8",
    },
    className: "toast-info",
  });
};

export const toastWarning = ({ title, description }: ToastWarningOptions) => {
  return toast({
    title,
    description,
    variant: "warning",
    style: {
      backgroundColor: "#d97706",
      color: "white",
      border: "1px solid #b45309",
    },
    className: "toast-warning",
  });
};