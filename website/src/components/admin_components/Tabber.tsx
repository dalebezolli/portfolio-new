import { Children, createContext, HTMLAttributes, PropsWithChildren, useContext, useState } from "preact/compat";

type TabDetails = {
	tabIndex: number;
	select: (index: number) => void;
}

const TabContext = createContext<TabDetails>({
	tabIndex: 0,
	select: () => {},
});

export default TabContext;

export function TabWrapper({children}: PropsWithChildren) {
	const [tabIndex, setTabIndex] = useState(0);
	
	const contextValue = {
		tabIndex,
		select: setTabIndex,
	} as TabDetails;

	return (
		<TabContext.Provider value={contextValue}>
			{children}
		</TabContext.Provider>
	);
}

type TabberProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Tabs({children, ...props}: TabberProps) {
	const {tabIndex} = useContext(TabContext);

	if(!props.className) props.className = "";
	props.className += " relative overflow-hidden";
	return (
		<div {...props}>
			{
				Children.map(children, (child, i) => (
					<div
						className="absolute left-0 flex w-full h-full transition-all duration-300 ease-in-out"
						style={{top: tabIndex === i ? "0%" : "10%", opacity: tabIndex === i ? "100%" : "0%", transitionDelay: tabIndex === i ? "0.3s" : ""}}>
						{child}
					</div>
				))
			}
		</div>
	);
}
