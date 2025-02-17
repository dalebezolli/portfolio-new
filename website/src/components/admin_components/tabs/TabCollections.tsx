import { ButtonHTMLAttributes } from "preact/compat";
import Icon, { IconName } from "../../Icon";
import Button from "../Button";
import Table from "../Table";

export default function TabCollections() {
	return (
		<div className="grow flex">
			<div className="bg-gray-900 border-r border-gray-800">
				<CollectionSearch />
				<section className="px-4 pt-4 gap-2">
					<CollectionButton text="Collection A" />
					<CollectionButton text="Collection B" />
					<Button text="New Collection" className="w-full border-2 border-gray-800 mt-4 justify-center" />
				</section>
			</div>

			<main className="p-8 grow flex flex-col gap-8">
				<header className="pb-12 flex flex-col gap-4">
					<div className="grow flex gap-2 items-center">
						<p className="text-lg font-semibold text-gray-600">Collections &nbsp;&nbsp;/&nbsp;&nbsp; <span className="text-gray-300">collection</span></p>
						<Button text="Edit" className="ml-auto w-fit border-2 border-gray-800 justify-center" />
						<Button text="New Record" className="w-fit border-2 border-gray-800 justify-center" />
					</div>
				</header>

				<div className="grow flex flex-col">
					<section className="pb-4 flex gap-2">
						<Button text="Search" className="w-fit border-2 border-gray-800 justify-center" />
						<Button text="Filters" className="w-fit border-2 border-gray-800 justify-center" />
					</section>

					<Table columns={[{title: "ID"},{title: "Title", options:{width: ""}},{title: "Status"},{title: "Created At"}]} records={[{id: "1", title: "No", status: "status", createdAt: "1"}]} className="" />
				</div>

				<footer className="p-4 flex items-center gap-4 rounded-xl bg-gray-900 text-gray-400">
					<p>Total records: 5</p>
				</footer>
			</main>
		</div>
	);
}

function CollectionSearch() {
	return (
		<input className="
			group p-8 flex gap-2 items-center
			hover:bg-gray-800
			font-bold text-gray-400 hover:text-violet-400 focus:text-violet-400
			border-b border-gray-800 hover:border-violet-400
			cursor-pointer transition-colors"
			placeholder="Search Collections"
			/>
	);
}

type CollectionButtonProps = {
	text?: string;
	icon?: IconName;
} & ButtonHTMLAttributes;

function CollectionButton({text, icon, ...rest}: CollectionButtonProps) {
	return (
		<button className="
			w-full
			group px-4 py-2 flex gap-2 items-center
			hover:bg-gray-800 focus:bg-gray-800 rounded-xl
			font-bold text-gray-400 hover:text-gray-200 focus:text-gray-200
			cursor-pointer transition-colors" {...rest}>
			{icon && <Icon icon={icon} colorFill="fill-gray-400 group-hover:fill-gray-200 group-focus:fill-gray-200" />}
			{text}
		</button>
	);
}
