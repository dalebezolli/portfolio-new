import { HTMLAttributes } from "preact/compat";

export function ImageUploader({src, ...rest}: FileUploaderProps) {
	return (
		<div className="aspect-video bg-gray-800 border-2 border-gray-700 group/image relative w-fit rounded-xl overflow-clip">
			{src && <img className="absolute inset-0 pointer-events-none" src={src} />}
			<p className={`absolute inset-0 flex justify-center items-center bg-black/80 pointer-events-none ${src ? "opacity-0 group-hover/image:opacity-100" : ""} transition-all duration-500`}>
				{src ? "Edit image" : "Upload image"}
			</p>
			<input
				className="cursor-pointer w-full h-full text-transparent"
				type="file"
				accept="image/*"
				{...rest} />
		</div>
	);
}

type FileUploaderProps = {
	src?: string;
} & HTMLAttributes<HTMLInputElement>;
