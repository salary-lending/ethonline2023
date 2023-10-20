import React from "react";

type Props = {
  text: string;
};

const Heading = ({ text }: Props) => {
  return <h1 className="block  font-heading  font-semibold text-2xl sm:text-3xl md:text-4xl leading-normal">{text}</h1>;
};

export default Heading;
