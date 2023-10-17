"use client"
import React, { Children } from "react";
import Providers from "./Providers";
import Header from "./Header";

type Props = {
  children:React.ReactNode
};

const Layout = (props: Props) => {
  return (
    <Providers>
      <main className={`flex min-h-screen flex-col `}>
        <Header />
        <div className="z-0 w-full  flex-1 max-w-screen-lg mx-auto px-6 py-4">
          {props.children}
        </div>
      </main>
    </Providers>
  );
};

export default Layout;
