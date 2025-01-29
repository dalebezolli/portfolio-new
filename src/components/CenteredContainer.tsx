import { PropsWithChildren } from "preact/compat";

export function CenterContainer({ children }: PropsWithChildren) {
	return (
		<div className="max-w-[1080px] bg-black mx-auto text-white px-2 sm:px-4">
			{children}
		</div>
	)
}
