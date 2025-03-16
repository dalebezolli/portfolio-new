"use client";

export default function TableOfContents({headings} : TableOfContentsProps) {
	return (
		<nav className="h-fit">
			<h2 className="mb-4 text-lg font-heading font-bold tracking-wider text-zinc-200">Table of Contents</h2>
			<ul>
				{
					headings.map(heading => <TOCLink key={heading.text} heading={heading} />)
				}
			</ul>
		</nav>
	);
}

type TableOfContentsProps = {
	headings: Heading[];
};

type Heading = {text: string, depth: 0 | 1 | 2};

function TOCLink({heading}: {heading: Heading}) {
	const id = "#"+heading.text.toLowerCase().replaceAll(" ", "_");
	return (
		<li>
			<a
				href={id}
				className="inline-block py-1 text-zinc-400 hover:text-zinc-200"
				style={{paddingLeft: `${heading.depth}rem`}}>
				{heading.text}
			</a>
		</li>
	)
}
