import { TextareaHTMLAttributes } from "preact/compat";

export default function TextArea({className="", ...rest}: TextAreaProps) {
	return (
		<textarea rows={16} className={`px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded-xl font-bold placeholder:font-normal ${className}`} {...rest}/>
	);
}

type TextAreaProps = {

} & TextareaHTMLAttributes;
