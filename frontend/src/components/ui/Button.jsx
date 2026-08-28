import { Link } from "react-router-dom";

const styles = {
  primary: "bg-emerald-700 text-white hover:bg-emerald-800",
  secondary: "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50",
  dark: "bg-slate-900 text-white hover:bg-slate-800",
  danger: "bg-red-700 text-white hover:bg-red-800"
};

export default function Button({ children, to, variant = "primary", className = "", ...props }) {
  const classes = `inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${styles[variant]} ${className}`;
  if (to) return <Link to={to} className={classes}>{children}</Link>;
  return <button className={classes} {...props}>{children}</button>;
}
