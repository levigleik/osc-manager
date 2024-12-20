"use client";

import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { AiFillMoon, AiFillSun } from "react-icons/ai";

export function ModeToggle() {
	const { setTheme, theme } = useTheme();

	return (
		<TooltipProvider disableHoverableContent>
			<Tooltip delayDuration={100}>
				<TooltipTrigger asChild>
					<Button
						className="rounded-full w-8 h-8 bg-background mr-2"
						variant="outline"
						size="icon"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					>
						<AiFillSun className="w-[1.2rem] h-[1.2rem] rotate-90 scale-0 transition-transform ease-in-out duration-500 dark:rotate-0 dark:scale-100" />
						<AiFillMoon className="absolute w-[1.2rem] h-[1.2rem] rotate-0 scale-1000 transition-transform ease-in-out duration-500 dark:-rotate-90 dark:scale-0" />
						<span className="sr-only">Mudar tema</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom">Mudar tema</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
