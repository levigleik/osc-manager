import HeaderTable from "@/components/ui/header.table";
import { columnsFilterable } from "@/lib/utils";
import type { Metadata } from "next";
import { columnsProjects } from "./constants";

export const metadata: Metadata = {
	title: "Projetos",
};

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<HeaderTable
				filterColumns={columnsFilterable(columnsProjects)}
				path={"projetos"}
				defaultText="Projeto"
			/>
			{children}
		</>
	);
}
