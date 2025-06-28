import { toast } from "@/hooks/use-toast";

interface ToastSuccessOptions {
  title: string;
  description?: string;
}

interface ToastErrorOptions {
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
    className: "text-white",
  });
};

export const toastError = ({ title, description }: ToastErrorOptions) => {
  return toast({
    title,
    description,
    variant: "destructive",
  });
};