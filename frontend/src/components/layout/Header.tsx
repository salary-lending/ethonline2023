import { Button, Navbar, NavbarBrand, NavbarContent } from "@nextui-org/react";
import Link from "next/link";

import React from "react";
import { toast } from "sonner";
import {usePathname, useRouter} from 'next/navigation'

type Props = {};

const Header = (props: Props) => {
  const router = useRouter()
  const currentPath = usePathname()
  const navLinks = [
    {
      name:"Borrow",
      path:"/borrow"
    },
    {
      name:"Dashboard",
      path:"/dashboard"
    }
  ]
  return (
    <>
      <Navbar className=" bg-zinc-400/25 border-b  border-zinc-400/25">
        <NavbarContent justify="start">
          <h1 className="font-bold tracking-wider sm:text-2xl">SparkFi</h1>
          {/* <div className="h-8 w-[2px] bg-gradient-to-b from-transparent via-zinc-400 to-transparent rounded-full"></div> */}
          <div className="flex gap-4 items-center">
            {
              navLinks.map((item)=>(
                <Link  onClick={()=>{
                  if(currentPath===item.path){
                    router.refresh()
                  }
                }} className={`text-zinc-700  hover:text-primary-600  hover: font-semibold origin-center duration-200`} href={item.path} key={item.path}>{item.name}</Link>
              ))
            }
          </div>
        </NavbarContent>
        <NavbarContent justify="end">
          <Button onClick={() => toast("Hii")} color="primary">
            Connect Wallet{" "}
          </Button>
        </NavbarContent>
      </Navbar>
    </>
  );
};

export default Header;
