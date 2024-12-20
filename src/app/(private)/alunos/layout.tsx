import HeaderTable from "@/components/ui/header.table";
import { columnsFilterable } from "@/lib/utils";
import type { Metadata } from "next";
import { columnsStudents } from "./constants";

export const metadata: Metadata = {
	title: "Alunos",
};

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<HeaderTable
				filterColumns={columnsFilterable(columnsStudents)}
				path={"alunos"}
				defaultText="Aluno"
			/>
			{children}
		</>
	);
}
