"use client";

import type { ColumnProps } from "@/app/components/table/types";
import { Button, Tooltip } from "@nextui-org/react";
import { usePathname, useRouter } from "next/navigation";
import { FaArrowLeft, FaPlus } from "react-icons/fa";

interface HeaderTableProps<TData extends Record<string, any>> {
	path: string;
	defaultText?: string;
	newText?: string;
	filterColumns?: ColumnProps<TData>[];
	pathNew?: string;
}

const HeaderTable = <TData extends Record<string, any>>({
	newText,
	path,
	defaultText,
}: HeaderTableProps<TData>) => {
	const pathname = usePathname();
	const lists = pathname === `/${path}`;
	const router = useRouter();

	return (
		<div className="flex justify-between gap-5">
			<div className="flex w-full justify-end gap-5">
				{lists && (
					<Tooltip
						content={`${newText || `New ${defaultText}`}`}
						placement="bottom-end"
						color="primary"
					>
						<Button
							isIconOnly
							color="default"
							className="rounded-full"
							onClick={() => router.push(`/${path}/new`)}
						>
							<FaPlus size={20} />
						</Button>
					</Tooltip>
				)}
				{!lists && (
					<Tooltip content="Back" placement="bottom-end" color="primary">
						<Button
							color="primary"
							isIconOnly
							onClick={() => router.push(`/${path}`)}
							className="rounded-full"
						>
							<FaArrowLeft size={20} />
						</Button>
					</Tooltip>
				)}
			</div>
		</div>
	);
};

export default HeaderTable;
