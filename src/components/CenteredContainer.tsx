import { PropsWithChildren } from "preact/compat";

export function CenterContainer({ children }: PropsWithChildren) {
	return (
		<div className="max-w-[1080px] bg-black mx-auto text-white">
			{children}
		</div>
	)
}
