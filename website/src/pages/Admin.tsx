import Button from "../components/admin_components/Button";
import TabCollections from "../components/admin_components/tabs/TabCollections";

export function Admin() {
	return (
		<div className="bg-gray-950 text-white min-w-screen min-h-screen flex justify-stretch" id="top">
			<Header />
			<TabCollections />
		</div>
	);
}

function Header() {
	return (
		<header className="flex flex-col bg-gray-900 p-4 border-r border-gray-800">
			<h1 className="p-4 pb-10 text-lg font-bold">Dashboard</h1>

			<nav className="grow flex flex-col gap-1 bg-gray-900">
				<Button text="Home" icon="github" disabled className="w-full" />
				<Button text="Collections" icon="github" active className="w-full" />
				<Button text="Analytics" icon="github" disabled className="w-full" />
				<div className="flex items-end grow">
					<Button text="Settings" icon="github" disabled className="w-full" />
				</div>
			</nav>
		</header>
	);
}
