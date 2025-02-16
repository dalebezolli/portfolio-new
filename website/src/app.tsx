import { Fragment, PropsWithChildren } from "preact/compat";

export function App({children}: PropsWithChildren) {
	return <Fragment>{children}</Fragment>;
}
