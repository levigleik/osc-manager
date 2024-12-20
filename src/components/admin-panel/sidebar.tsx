"use client";
import logo from "@/assets/imagens/logo.png";
import { Menu } from "@/components/admin-panel/menu";
import { SidebarToggle } from "@/components/admin-panel/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { Image } from "@nextui-org/react";
import Link from "next/link";

export function Sidebar() {
	const sidebar = useStore(useSidebar, (x) => x);
	if (!sidebar) return null;
	const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;
	return (
		<aside
			className={cn(
				"fixed top-0 left-0 z-20 h-screen -translate-x-full",
				"lg:translate-x-0 transition-[width] ease-in-out duration-300",
				!isOpen ? "w-[90px]" : "w-72",
				settings.disabled && "hidden",
			)}
		>
			<SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
			<div
				onMouseEnter={() => setIsHover(true)}
				onMouseLeave={() => setIsHover(false)}
				className={cn(
					"relative h-full flex flex-col px-3 py-4 bg-background",
					"overflow-y-auto shadow-md shadow-background/50",
				)}
			>
				<Button
					className={cn(
						"transition-transform ease-in-out duration-300 mb-1",
						!isOpen ? "translate-x-1" : "translate-x-0",
					)}
					variant="link"
					asChild
				>
					<Link href="/" className="flex items-center gap-2">
						<Image
							src={logo.src}
							alt="Logo"
							className={cn("w-14 h-14", !isOpen && "h-10")}
						/>

						<h1
							className={cn(
								"font-bold text-lg whitespace-nowrap transition-[transform,opacity,display]",
								"ease-in-out duration-300",
								!isOpen
									? "-translate-x-96 opacity-0 hidden"
									: "translate-x-0 opacity-100",
							)}
						>
							OSC Manager
						</h1>
					</Link>
				</Button>
				<Menu isOpen={isOpen} />
			</div>
		</aside>
	);
}
