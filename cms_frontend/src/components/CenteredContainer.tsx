import { PropsWithChildren } from "preact/compat";

export function CenterContainer({ className, children }: PropsWithChildren<{className?: string}>) {
	return (
		<div className={`max-w-[1080px] mx-auto text-white px-2 sm:px-4 ${className}`}>
			{children}
		</div>
	)
}
