import type { MouseEvent, ReactNode } from "react";
import { Link, useInRouterContext } from "react-router-dom";

/** React Router links preserve the in-memory auth session during navigation.
 * Plain anchors are retained only for isolated component previews/tests. */
export default function RouteAnchor({href, className, current, onClick, children}: {
  href: string;
  className?: string;
  current?: "page";
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
}) {
  const inRouter = useInRouterContext();
  const props = { className, "aria-current": current, onClick };
  if (inRouter) return <Link to={href} {...props}>{children}</Link>;
  return <a href={href} {...props}>{children}</a>;
}
