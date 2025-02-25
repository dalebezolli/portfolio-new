import { HTMLAttributes } from "preact/compat";

export function FileUploader({...rest}: FileUploaderProps) {
	return (
		<input type="file" {...rest} />
	);
}

type FileUploaderProps = HTMLAttributes<HTMLInputElement>;
