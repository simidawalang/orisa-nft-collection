import React, { MouseEventHandler } from "react";

interface BtnProps {
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  content: string;
}

const Button = ({ className, type, onClick, content }: BtnProps) => {
  return (
    <button className={`btn ${className}`} type={type} onClick={onClick}>
      <span>{content}</span>
    </button>
  );
};

export default Button;
