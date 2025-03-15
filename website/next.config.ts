import type { NextConfig } from "next";
import createMDX from '@next/mdx';
import rehypeHighlight from "rehype-highlight";

const nextConfig: NextConfig = {
	pageExtensions: ['md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
	options: {
		rehypePlugins: [rehypeHighlight],
	}
});

export default withMDX(nextConfig);
