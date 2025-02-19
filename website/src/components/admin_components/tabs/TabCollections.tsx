import { JSX, useContext } from "preact/compat";
import Button from "../Button";
import Table from "../Table";
import TabContext, { Tabs, TabWrapper } from "../Tabs";
import GlobalState from "../../../state/GlobalState";
import { STable, TBody, THead, THeadRow, TRow } from "../SimpleTable";
import Input from "../Input";

export default function TabCollections() {
	return (
		<TabWrapper>
			<div className="grow flex">
				<SideNav />

				<main className="w-full h-full">
					<Tabs className="w-full h-full">
						<CollectionView />
						<CollectionEditor />
						<RecordEditor />
					</Tabs>
				</main>
			</div>
		</TabWrapper>
	);
}

function SideNav() {
	const {select} = useContext(TabContext);
	const {collections, selectedCollection, setSelectedCollection, setEditingCollection, setEditingCollectionStatus} = useContext(GlobalState);

	function selectCollection(path: string) {
		setSelectedCollection(path);
		select(0);
	}

	return (
		<div className="bg-gray-900 border-r border-gray-800">
			<CollectionSearch />
			<section className="px-4 pt-4 flex flex-col gap-2">
				{
					Object.entries(collections).map(([path, collection]) => (
						<Button
							key={path}
							text={collection.name}
							onClick={() => selectCollection(path)}
							active={path == selectedCollection}
							className="w-full"/>
					))
				}
				<Button
					text="New Collection"
					icon="plus"
					onClick={() => {
						setEditingCollection({name: "", path: "", attributes: [{name: "", type: "string"}], records: {}});
						setEditingCollectionStatus("new");
						select(1);
					}}
					className="w-full border-2 border-gray-800 mt-4 justify-center" />
			</section>
		</div>
	);
}

function CollectionView() {
	const {select} = useContext(TabContext);
	const {collections, selectedCollection, setEditingCollection, setEditingCollectionStatus} = useContext(GlobalState);

	const collectionName = (collections[selectedCollection ?? ""]) ? collections[selectedCollection ?? ""].name : "";

	if(!collectionName) {
		return (
			<div className="w-full p-8 pt-16 flex justify-center gap-8">
				<p className="font-bold text-xl text-gray-400">Create your first collection</p>
			</div>
		);
	}

	const rawRecords = Object.values(collections[selectedCollection!].records);
	let tableRecords = rawRecords.map(record => ({
			id: record._id,
			title: record['title'],
			status: 'Draft',
			createdAt: new Date().toISOString(),
	}));

	return (
		<div className="w-full p-8 flex flex-col gap-8">
			<header className="pb-12 flex flex-col gap-4">
				<div className="grow flex gap-2 items-center">
					<p className="text-lg font-semibold text-gray-600">Collections &nbsp;&nbsp;/&nbsp;&nbsp;
						<span className="text-gray-300">{collectionName}</span>
					</p>
					<Button
						text="Edit"
						icon="pen"
						onClick={() => {
							setEditingCollection(collections[selectedCollection!]);
							setEditingCollectionStatus("old");
							select(1);
						}}
						className="ml-auto w-fit border-2 border-gray-800 justify-center" />
				</div>
			</header>

			<div className="grow flex flex-col">
				<section className="pb-4 flex gap-2">
					<Button text="New Record" icon="plus" onClick={() => select(2)} className="w-fit" color="highlight" />
					<Button text="Search" icon="magnifying-glass" className="w-fit border-2 border-gray-800 justify-center" />
				</section>

				<Table
					columns={[{title: "ID"},{title: "Title", options:{width: ""}},{title: "Status"},{title: "Created At"}]} 
					records={tableRecords}
					onClickRow={() => select(2)}
				/>
			</div>

			<footer className="p-4 flex justify-between items-center gap-4 rounded-xl bg-gray-900 text-gray-400">
				<p>Total records: {tableRecords.length}</p>

				<section className="flex gap-2">
					<Button text="Edit" icon="pen" color="warning" disabled />
					<Button text="Delete" icon="trash-can" color="error" disabled />
				</section>
			</footer>
		</div>
	);
}

function CollectionEditor() {
	const {select} = useContext(TabContext);
	const {
		setCollection, setSelectedCollection,
		editingCollection, editingCollectionStatus: status, setEditingCollection
	} = useContext(GlobalState);

	function createCollection() {
		setCollection(editingCollection);
		setSelectedCollection(editingCollection.path);
		select(0);
	}

	function insertAttribute() {
		const newAttribute: CollectionAttribute = {name: "", type: "string"};
		setEditingCollection(old => {
			return {...old, attributes: [...old.attributes, newAttribute]};
		});
	}

	function updateAttribute(event: JSX.TargetedEvent<HTMLInputElement>, prop: "name" | "type", index: number) {
		const newAttribute = {...editingCollection.attributes[index], [prop]: event.currentTarget.value};

		setEditingCollection(old => {
			let attributes = [...old.attributes];
			attributes[index] = newAttribute;
			return {...old, attributes};
		});
	}

	function removeAttribute(index: number) {
		setEditingCollection(old => {
			return {
				...old,
				attributes: old.attributes.filter((_, i) => i !== index),
			};
		});
	}

	return (
		<section className="w-full p-8 flex flex-col gap-8 font-bold text-gray-400">
			<header className="flex items-center gap-4">
				<Button icon="arrow-left" className="border-2 border-gray-800" onClick={() => select(0)} />
				<p className="font-bold text-xl">{status === "old" ? "Edit" : "Create"} Collection</p>
			</header>

			<div className="flex flex-col gap-4 p-4 bg-gray-900 border-2 border-gray-800 rounded-2xl">
				<p className="text-gray-200 font-bold text-xl mb-2">Collection Information</p>

				<div className="flex flex-col gap-1">
					<p>Collection Name</p>

					<div className="flex items-center gap-4">
					<Input placeholder="A really cool collection" value={editingCollection.name} onChange={e => setEditingCollection(c => ({...c, name: e.currentTarget.value}))} />
					<p className="text-gray-700 font-bold">Path: none</p>
					</div>
				</div>

				<div className="flex flex-col gap-1">
					<p>Collection Attributes</p>


					<STable className="bg-gray-800">
						<THead className="bg-gray-700">
							<THeadRow>
								<td className="w-[1%]"><div className="w-[32px] h-[48px]"></div></td>
								<td className="w-[20%]">NAME</td>
								<td className="w-[20%]">TYPE</td>
								<td className="w-[60%]" align="right"></td>
							</THeadRow>
						</THead>

						<TBody>
							{
								editingCollection.attributes.map((attr, i) => (
									<TRow>
										<td></td>
										<td><Input value={attr.name} placeholder="Helpful Attribute" onChange={e => updateAttribute(e, "name", i)} /></td>
										<td><Input defaultValue={attr.type} placeholder="Type" onChange={e => updateAttribute(e, "type", i)} /></td>
										<td align="right"><Button icon="trash-can" className="my-4" onClick={() => removeAttribute(i)} /></td>
									</TRow>
								))
							}
						</TBody>
					</STable>

					<Button text="Add Attribute" onClick={insertAttribute} className="w-fit" />
				</div>

				<div className="pt-6">
					<Button text="Create Collection" className="w-fit" color="success" onClick={createCollection} />
				</div>
			</div>

		</section>
	);
}

function RecordEditor() {
	const {select} = useContext(TabContext);
	const {collections, selectedCollection, setRecord} = useContext(GlobalState);

	function createRecord() {
		if(selectedCollection == null) return;

		const record = {
			_id: (Object.entries(collections[selectedCollection].records).length).toString(),
			title: "Record"+Object.entries(collections[selectedCollection].records).length,
		};
		setRecord(selectedCollection, record);
		select(0);
	}

	return (
		<div>
			<p>Record Editor</p>
			<Button text="Create Empty Record" color="success" onClick={createRecord} />
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
