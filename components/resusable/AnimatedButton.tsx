import { ButtonHTMLAttributes, ReactNode } from "react";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  primaryText: string;
  hoverText: string;
  icon?: ReactNode;
  isActive?: boolean;
}

export default function AnimatedButton({
  primaryText,
  hoverText,
  icon,
  isActive = false,
  className = "",
  ...props
}: AnimatedButtonProps) {
  return (
    <button
      className={`group relative flex items-center justify-center gap-2.5 px-6 py-3 text-[17px] font-semibold text-white bg-blue-600 rounded-lg overflow-hidden transition-all duration-500 active:scale-90 active:duration-100 hover:cursor-pointer ${className}`}
      {...props}
    >
      {/* The hidden text waiting off-screen */}
      <span
        className={`absolute left-0 z-10 transition-all duration-500 ${isActive ? "translate-x-4" : "-translate-x-full group-hover:translate-x-4 group-hover:delay-300"}`}
      >
        {hoverText}
      </span>

      {/* The visible text that gets pushed out */}
      <span
        className={`transition-all duration-500 ${isActive ? "translate-x-[300%]" : "delay-300 group-hover:translate-x-[300%]"}`}
      >
        {primaryText}
      </span>

      {/* The Icon wrapper */}
      {icon && (
        <span
          className={`z-10 transition-all duration-500 ${isActive ? "scale-[3] translate-x-1/2" : "group-hover:scale-[3] group-hover:translate-x-1/2"}`}
        >
          {icon}
        </span>
      )}
    </button>
  );
}
