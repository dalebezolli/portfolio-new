import { JSX } from "preact/compat";
import Button from "../../components/Button";
import { useTabs, Tabs, TabWrapper } from "../../components/Tabs";
import { useGlobalState } from "../../state/GlobalState";
import { STable, TBody, THead, THeadRow, TRow } from "../../components/SimpleTable";
import Input from "../../components/Input";
import { Collection, CollectionAttribute, CollectionRecord } from "../../types";
import { del, post, put } from "../../utils/network";
import { Checkbox } from "../../components/Checkbox";
import Select from "../../components/Select";
import { selectTypes } from "../../utils/constants";
import { ImageUploader } from "../../components/ImageUploader";
import TextArea from "../../components/TextArea";

export default function TabCollections() {
	return (
		<TabWrapper>
			<div className="grow flex">
				<SideNav />

				<main className="w-full">
					<Tabs className="w-full h-screen">
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
	const {select} = useTabs();
	const {collections, selectedCollection, setSelectedCollection, setEditingCollection} = useGlobalState();

	function selectCollection(id: string) {
		setSelectedCollection(id);
		select(0);
	}

	return (
		<div className="bg-gray-900 border-r border-gray-800">
			<CollectionSearch />
			<section className="px-4 pt-4 flex flex-col gap-2">
				{
					Object.entries(collections).map(([id, collection]) => (
						<Button
							key={id}
							text={collection.name}
							onClick={() => selectCollection(id)}
							active={id == selectedCollection}
							className="w-full"/>
					))
				}
				<Button
					text="New Collection"
					icon="plus"
					onClick={() => {
						setEditingCollection({name: "", path: "", attributes: [{name: "", type: "string"}], records: {}});
						select(1);
					}}
					className="w-full border-2 border-gray-800 mt-4 justify-center" />
			</section>
		</div>
	);
}

function CollectionView() {
	const {select} = useTabs();
	const {
		collections, selectedCollection, selectedRecords,
		setEditingCollection, setEditingRecord, removeRecord,
		addSelectedRecord, toggleSelectedRecord, clearSelectedRecords,
	} = useGlobalState();

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

	function onRowClick(e: JSX.TargetedMouseEvent<HTMLTableRowElement>, entry?: any) {
		if(e.target == null) return;
		const tagName = (e.target as HTMLTableRowElement).tagName;

		if(tagName === "BUTTON" || tagName === "INPUT") return;
		if(entry == null || entry.id == null) return;

		editRecord(selectedCollection!, entry.id);
	}

	function editRecord(collectionId: string, recordId: string) {
		const record = collections[collectionId].records[recordId];
		setEditingRecord(record);
		select(2);
	}

	const selectionCount = Object.values(selectedRecords).length;

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
							select(1);
						}}
						className="ml-auto w-fit border-2 border-gray-800 justify-center" />
				</div>
			</header>

			<div className="grow flex flex-col">
				<section className="pb-4 flex gap-2">
					<Button
						text="New Record"
						icon="plus"
						onClick={() => {
							let newRecord = {};
							if(selectedCollection) {
								newRecord = Object.fromEntries(collections[selectedCollection]
									.attributes.map(attr => [attr.name, ""])
								);
							}
							setEditingRecord(newRecord);
							select(2);
						}}
						className="w-fit"
						color="highlight" />
					<Button text="Search" icon="magnifying-glass" className="w-fit border-2 border-gray-800 justify-center" />
				</section>


				<div className="grow rounded-xl bg-gray-900 overflow-clip">
					<STable>
						<THead className="font-semibold text-gray-200 border-b-2 border-gray-800">
							<THeadRow>
								<td className="w-[1%]" align="center">
									<div className="p-2 w-full h-full flex justify-center items-center">
										<Checkbox onClick={e => {
											if(selectedCollection == null) return;
											console.log(e.currentTarget.checked, ":", selectedRecords);
											if(e.currentTarget.checked) {
												addSelectedRecord(...Object.keys(collections[selectedCollection].records));
											} else {
												clearSelectedRecords();
											}
										}} />
									</div>
								</td>
								<td className="w-[1%]"><div className="p-2"><Button text="ID" className="w-full" /></div></td>
								<td className=""><div className="p-2"><Button text="Title" className="w-full" /></div></td>
								<td className="w-[1%]"><div className="p-2"><Button text="Status" className="w-full" /></div></td>
								<td className="w-[1%]"><div className="p-2"><Button text="Created At" className="w-max" /></div></td>
							</THeadRow>
						</THead>

						<TBody>
							{
								tableRecords.map((record, _) => (
									<TRow key={record.id} entry={record} onRowClick={onRowClick} className="hover:bg-gray-700">
										<td align="center">
											<div className="p-2 w-full h-full flex justify-center items-center">
												<Checkbox key={selectedRecords}
													checked={selectedRecords[record.id]}
													onClick={() => toggleSelectedRecord(record.id)} />
											</div>
										</td>
										<td><p className="px-6 py-4">{record.id}</p></td>
										<td><p className="px-6 py-4">{record.title}</p></td>
										<td><p className="px-6 py-4">{record.status}</p></td>
										<td><p className="px-6 py-4">{record.createdAt}</p></td>
									</TRow>
								))
							}
						</TBody>
					</STable>
				</div>
			</div>

			<footer className="p-4 flex justify-between items-center gap-4 rounded-xl bg-gray-900 text-gray-400">
				<p>Total records: {tableRecords.length}</p>

				<section className="flex gap-2">
					<Button text="Edit" icon="pen" color="warning"
						disabled={selectionCount !== 1}
						onClick={() => editRecord(selectedCollection!, Object.keys(selectedRecords)[0])} />
					<Button text="Delete" icon="trash-can" color="error"
						disabled={selectionCount === 0}
						onClick={() => {
							for(const record of Object.keys(selectedRecords)) {
								del({url: new URL(`${import.meta.env.VITE_CMS_URL}/${collections[selectedCollection!].path}/${record}`)});
								removeRecord(selectedCollection!, record);
							}
						}} />
				</section>
			</footer>
		</div>
	);
}

function CollectionEditor() {
	const {select} = useTabs();
	const {
		collections, selectedCollection,
		setCollection, removeCollection, setSelectedCollection,
		editingCollection, setEditingCollection,
	} = useGlobalState();

	async function saveCollection() {
		const {_id: _, path, records: ___, ...body} = editingCollection;
		let data: Collection | null;

		if(editingCollection._id == null) {
			const response = await post<Collection>({url: new URL(`${import.meta.env.VITE_CMS_URL}/collections`), body});
			if(response?.data == null) return;
			data = response.data;
		} else {
			const response = await put<Collection>({url: new URL(`${import.meta.env.VITE_CMS_URL}/collections/${path}`), body});
			if(response?.data == null) return;
			data = response.data;
		}

		if(data == null || data._id == null) return;

		setCollection({...data, records: {}});
		setEditingCollection({ name: "", path: "", attributes: [], records: {}});

		setSelectedCollection(data._id);
		select(0);
	}

	function insertAttribute() {
		const newAttribute: CollectionAttribute = {name: "", type: "string"};
		setEditingCollection(old => {
			return {...old, attributes: [...old.attributes, newAttribute]};
		});
	}

	function updateAttribute(event: JSX.TargetedEvent<HTMLInputElement | HTMLSelectElement>, prop: "name" | "type", index: number) {
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
				<p className="font-bold text-xl">{editingCollection._id ? "Edit" : "Create"} Collection</p>
				{
					editingCollection._id && (
						<Button icon="trash-can" text="Delete Collection" color="error"
							className="ml-auto border-2 border-gray-800"
							onClick={() => {
								if(selectedCollection == null) return;
								removeCollection(selectedCollection);
								del({url: new URL(`${import.meta.env.VITE_CMS_URL}/collections/${collections[selectedCollection].path}`)});
								if(Object.keys(collections).length === 1) {
									setSelectedCollection(null);
								} else {
									setSelectedCollection(Object.keys(collections)[0]);
								}
								select(0)
							}} />
					)
				}
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
										<td><Select data={selectTypes} onClick={e => updateAttribute(e, "type", i)} /></td>
										<td align="right"><Button icon="trash-can" className="my-4" onClick={() => removeAttribute(i)} /></td>
									</TRow>
								))
							}
						</TBody>
					</STable>

					<Button text="Add Attribute" onClick={insertAttribute} className="w-fit" />
				</div>

				<div className="pt-6">
					<Button icon="check" className="w-fit" color="success" disabled={editingCollection._id != null}
						text={`${editingCollection._id == null ? "Create" : "Save"} Collection`}
						onClick={saveCollection} />
				</div>
			</div>

		</section>
	);
}

function RecordEditor() {
	const {select} = useTabs();
	const {collections, selectedCollection, editingRecord, setRecord, setEditingRecord} = useGlobalState();

	if(selectedCollection == null) {
		return (<div>No collection selected</div>);
	}

	function updateRecord(data: any, attribute: string) {
		setEditingRecord(old => ({...old, [attribute]: data}))
	}

	async function saveRecord() {
		if(selectedCollection == null) return;

		const {_id, ...body} = editingRecord;

		const collectionPath = collections[selectedCollection].path;
		let record: CollectionRecord | null;
		if(_id == null) {
			const response = await post<CollectionRecord>({url: new URL(`${import.meta.env.VITE_CMS_URL}/${collectionPath}`), body});
			if(response?.data == null) return;
			record = response.data;
		} else {
			const response = await put<CollectionRecord>({url: new URL(`${import.meta.env.VITE_CMS_URL}/${collectionPath}/${_id}`), body});
			if(response?.data == null) return;
			record = response.data;
		}

		if(record == null) return;

		setRecord(selectedCollection, record);
		setEditingRecord({});
		select(0);
	}

	return (
		<section id="editor" key={Object.entries(collections[selectedCollection].records).length} className="w-full p-8 flex flex-col flex-1 gap-8 font-bold text-gray-400">
			<header className="flex items-center gap-4">
				<Button icon="arrow-left" className="border-2 border-gray-800" onClick={() => select(0)} />
				<p className="font-bold text-xl">{editingRecord["_id"] ? "Edit" : "New"} Record</p>
			</header>

			<div className="overflow-hidden flex flex-col flex-1 gap-4 p-4 bg-gray-900 border-2 border-gray-800 rounded-2xl">
				<p className="text-gray-200 font-bold text-xl mb-2">Record Information</p>

				<div className="overflow-y-auto flex flex-col gap-4">
				{
					collections[selectedCollection].attributes.map(({name, type}) => {
						if(name == null) return;
						return (
							<div className="flex flex-col gap-1">
								<p>{name}</p>
								{type == "string" && <Input className="w-fit" value={editingRecord[name]} onChange={(e) => updateRecord(e.currentTarget.value, name)} />}
								{type == "image" && <ImageUploader src={editingRecord[name]} onChange={async e => {
									if(e.currentTarget.files == null) return;
									if(e.currentTarget.files[0] == null) return;
									let target = e.currentTarget;
									const file = target.files![0]

									let base64Img = await new Promise((resolve: (value: string) => void) => {
										let reader = new FileReader();
										reader.onload = _ => resolve(reader.result as string)
										reader.readAsDataURL(file)
									});

									updateRecord(base64Img, name)
								}} />}
								{type == "mdx" && <TextArea className="w-full" value={editingRecord[name]} onChange={(e) => updateRecord(e.currentTarget.value, name)} />}
							</div>
						)
					})
				}
				</div>

				<div className="grow flex items-end pt-6">
					<Button icon="check" text={`${editingRecord["_id"] ? "Edit" : "Create"} Record`} className="w-fit" color="success" onClick={saveRecord} />
				</div>
			</div>

		</section>
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
