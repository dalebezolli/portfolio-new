import { createContext, PropsWithChildren, useState } from "preact/compat";
import Button from "./Button";

type PopupName = "none";

type PopupContextDetails = {
	title: string;
	result: object | null;

	show: (popup: PopupName, title?: string) => void;
}

const PopupContext = createContext<PopupContextDetails>({
	title: "",
	result: null,

	show: () => {},
});

export default PopupContext;
export function PopupProvider({children}: PropsWithChildren) {
	const [visible, setVisible] = useState(false);
	const [title, setTitle] = useState("");
	const [popup, setPopup] = useState<PopupName | null>(null);
	const [result, _] = useState<object | null>(null);

	function closePopup(event?: React.MouseEvent<HTMLDivElement>) {
		if(event && event.target !== event.currentTarget) return;
		setVisible(false);
	}

	function show(popup: PopupName, title?: string) {
		setVisible(true);
		setPopup(popup);
		setTitle(title ?? "");
	}

	const contextValue = {
		title,
		result,

		show,
	}

	let Body = () => <div></div>;
	switch(popup) {
	}

	return (
		<PopupContext.Provider value={contextValue}>
			{children}

			<div
				className={`
					fixed inset-0
					flex justify-center py-16
					
					${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
					bg-black/10 backdrop-blur-xs
					transition-all ease-out duration-500`}
				onClick={closePopup}>
				<div className="min-w-[200px] h-[100px] rounded-2xl bg-gray-900 text-gray-400 shadow-2xl shadow-black">
					<header className="flex justify-between items-center p-2 pl-4 border-b-2 border-gray-800">
						<p className="font font-bold">{title}</p>
						<Button icon="xmark" onClick={() => closePopup()} />
					</header>
					<Body />
				</div>
			</div>
		</PopupContext.Provider>
	)
}
