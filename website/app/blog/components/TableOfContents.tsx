"use client";

import { useEffect, useRef } from "react";

export default function TableOfContents({headings} : TableOfContentsProps) {
	const observer = useRef<IntersectionObserver>(null);
	useEffect(() => {
		if(observer.current == null) {
			observer.current = new IntersectionObserver(isIntersectingCallback, {
				rootMargin: "0% 0% -50% 0%",
			});
		}

		for(const {text} of headings) {
			const element = document.querySelector(`h2[id="${toHref(text).replace("#", "")}"]`);
			if(element == null) continue;

			observer.current.observe(element);
		}
	}, [])

	function isIntersectingCallback(entries: IntersectionObserverEntry[]) {
		let intersectingEntry: Element | null = null;

		for(const entry of entries) {
			const link = document.querySelector(`a[href="${toHref(entry.target.id)}"]`);
			if(link == null) continue;

			if(entry.isIntersecting) {
				intersectingEntry = entry.target;
				break;
			}
		}

		if(intersectingEntry == null) return;

		for(let heading of headings) {
			const linkHref = toHref(heading.text);
			const link = document.querySelector(`a[href="${linkHref}"]`);
			if(link == null) continue;

			link.setAttribute("data-current", "false");
			if(linkHref.replace("#", "") === intersectingEntry.id) {
				link.setAttribute("data-current", "true");
			}
		}
	}

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
	const id = toHref(heading.text);
	return (
		<li>
			<a
				href={id}
				className="inline-block py-1 data-[current=true]:text-red-400 text-zinc-400 hover:text-zinc-200"
				style={{paddingLeft: `${heading.depth}rem`}}>
				{heading.text}
			</a>
		</li>
	)
}

function toHref(id: string) {
	return "#"+id.toLowerCase().replaceAll(" ", "_");
}
