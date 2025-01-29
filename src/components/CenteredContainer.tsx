import { PropsWithChildren } from "preact/compat";

export function CenterContainer({ children }: PropsWithChildren) {
	return (
		<div className="max-w-[1080px] bg-black mx-auto text-white flex gap-4 justify-center items-center">
			{children}
		</div>
	)
}
