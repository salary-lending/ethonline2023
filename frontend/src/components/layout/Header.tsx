import { Button, Navbar, NavbarContent } from "@nextui-org/react";
import Link from "next/link";

import React from "react";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";

type Props = {};

const Header = (props: Props) => {
  const router = useRouter();
  const currentPath = usePathname();
  const navLinks = [
    {
      name: "Mint",
      path: "/mint",
    },
    {
      name: "Borrow",
      path: "/borrow",
    },
    {
      name: "Swap",
      path: "/swap",
    },
    { name: "Repay", path: "/repay" },
  ];

  const navigateTo = (nextPath: string) => {
    console.log("navigating", { currentPath, nextPath });
    if (currentPath !== nextPath) {
      router.push(nextPath);
    }
  };
  return (
    <>
      <Navbar className=" border-b bg-default-50/75  border-zinc-200/25">
        <NavbarContent justify="start">
          <Link href="/">
            <h1 className="font-bold  tracking-wider sm:text-2xl font-heading">
              SalaryFi
            </h1>
          </Link>
          <div className="h-8 w-[2px] bg-gradient-to-b from-transparent via-zinc-400 to-transparent rounded-full"></div>
          {navLinks.map((item) => (
            <Link
              href={item.path}
              key={item.path}
              className={`${
                currentPath == item.path &&
                "bg-default-100/50 ring-1 ring-default-200 font-medium rounded-full px-3 text-white"
              } duration-200 px-0 ease-out hover:text-white  py-1.5 text-sm text-default-500`}
            >
              {item.name}
            </Link>
          ))}
        </NavbarContent>
        <NavbarContent justify="end">
          {/* <Button
            onClick={() => toast("Hii")}
            color="default"
            variant="faded"
            radius="lg"
          >
            Connect Wallet{" "}
          </Button> */}
          <w3m-button />
        </NavbarContent>
      </Navbar>
    </>
  );
};

export default Header;
