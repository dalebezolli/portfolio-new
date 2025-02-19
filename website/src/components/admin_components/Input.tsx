import { InputHTMLAttributes } from "preact/compat";

export default function Input({className="", ...rest}: InputHTMLAttributes) {
	return (
		<input
			placeholder="A really cool collection"
			className={`px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded-xl font-bold placeholder:font-normal ${className}`} {...rest} />
	);
}
