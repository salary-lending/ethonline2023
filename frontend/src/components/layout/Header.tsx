import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  Tab,
  Tabs,
} from "@nextui-org/react";
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
      name: "Borrow",
      path: "/borrow",
    },
    {
      name: "Minted Tokens",
      path: "/minted",
    },
  ];

  const navigateTo = (nextPath: string) => {
    console.log("navigating");
    if (currentPath !== nextPath) {
      router.push(nextPath);
    }
  };
  return (
    <>
      <Navbar className=" border-b bg-default-50/75  border-zinc-200/25">
        <NavbarContent justify="start">
          <h1 className="font-bold  tracking-wider sm:text-2xl font-heading">
            SparkFi
          </h1>
          {/* <div className="h-8 w-[2px] bg-gradient-to-b from-transparent via-zinc-400 to-transparent rounded-full"></div> */}
        </NavbarContent>
        <NavbarContent justify="center">
          <Tabs
            onSelectionChange={(key) => navigateTo(key.toString())}
            color="primary"
            aria-label="Navlinks"
            radius="lg"
          >
            {navLinks.map((item) => (
              <Tab
                key={item.path}
                title={item.name}
                onSelect={() => navigateTo(item.path)}
              />
            ))}
          </Tabs>
        </NavbarContent>
        <NavbarContent justify="end">
          <Button
            onClick={() => toast("Hii")}
            color="default"
            variant="faded"
            radius="lg"
          >
            Connect Wallet{" "}
          </Button>
        </NavbarContent>
      </Navbar>
    </>
  );
};

export default Header;
