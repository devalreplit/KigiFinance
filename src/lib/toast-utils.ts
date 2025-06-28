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
    variant: "default",
    style: {
      backgroundColor: "#16a34a",
      color: "white",
      border: "1px solid #15803d",
    },
    className: "text-white border-green-700 bg-green-600",
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
    className: "text-white border-red-700 bg-red-600",
  });
};

export const toastInfo = ({ title, description }: ToastInfoOptions) => {
  return toast({
    title,
    description,
    variant: "default",
    style: {
      backgroundColor: "#2563eb",
      color: "white",
      border: "1px solid #1d4ed8",
    },
    className: "text-white border-blue-700 bg-blue-600",
  });
};

export const toastWarning = ({ title, description }: ToastWarningOptions) => {
  return toast({
    title,
    description,
    variant: "default",
    style: {
      backgroundColor: "#d97706",
      color: "white",
      border: "1px solid #b45309",
    },
    className: "text-white border-orange-700 bg-orange-600",
  });
};