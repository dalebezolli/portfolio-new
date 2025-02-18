import { useContext } from "preact/compat";
import Button from "../components/admin_components/Button";
import { PopupProvider } from "../components/admin_components/Popup";
import TabCollections from "../components/admin_components/tabs/TabCollections";
import TabContext, { TabWrapper, Tabs } from "../components/admin_components/Tabs";
import { GlobalStateProvider } from "../state/GlobalState";

export function Admin() {
	return (
		<GlobalStateProvider>
			<PopupProvider>
			 <div className="bg-gray-950 text-white min-w-screen min-h-screen flex justify-stretch" id="top">
					<TabWrapper>
						<Header />

						<Tabs className="w-full">
							<div>Home</div>
							<TabCollections />
							<div>Analytics</div>
						</Tabs>
					</TabWrapper>
				</div>
			</PopupProvider>
		</GlobalStateProvider>
	);
}

function Header() {
	const {tabIndex, select} = useContext(TabContext);

	return (
		<header className="flex flex-col bg-gray-900 p-4 border-r border-gray-800">
			<h1 className="p-4 pb-10 text-lg font-bold">Dashboard</h1>

			<nav className="grow flex flex-col gap-1 bg-gray-900">
				<Button text="Home" icon="home" active={tabIndex === 0} className="w-full" onClick={() => select(0)} />
				<Button text="Collections" icon="cube" active={tabIndex === 1} className="w-full" onClick={() => select(1)} />
				<Button text="Analytics" icon="chart" disabled className="w-full" onClick={() => select(2)} />
				<div className="flex items-end grow">
					<Button text="Settings" icon="gear" disabled className="w-full" />
				</div>
			</nav>
		</header>
	);
}
