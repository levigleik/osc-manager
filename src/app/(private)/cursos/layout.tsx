import HeaderTable from "@/components/ui/header.table";
import { columnsFilterable } from "@/lib/utils";
import { cn } from "@nextui-org/react";
import type { Metadata } from "next";
import { columnsCourses } from "./constants";

export const metadata: Metadata = {
	title: "Cursos",
};

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex h-full flex-1 flex-col">
			<div
				className={cn(
					"relative z-0 flex flex-col justify-between gap-4 bg-content1 p-4",
					"max-h-[calc(100dvh-8em)] w-full overflow-auto rounded-large shadow-small",
				)}
			>
				<HeaderTable
					filterColumns={columnsFilterable(columnsCourses)}
					path={"cursos"}
					defaultText="Curso"
				/>
				{children}
			</div>
		</div>
	);
}
