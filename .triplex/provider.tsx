import "./styles.css";
 
export function GlobalProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <div data-theme="dark">{children}</div>;
}