import { PropsWithChildren } from "preact/compat";

export function App({children}: PropsWithChildren) {
	return (
		<div className="bg-black text-white min-w-screen min-h-screen">
			{children}
		</div>
	)
}
