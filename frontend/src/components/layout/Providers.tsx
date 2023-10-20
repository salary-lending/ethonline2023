import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "sonner";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextUIProvider>
      <Toaster richColors />
      {children}
    </NextUIProvider>
  );
};

export default Providers;
