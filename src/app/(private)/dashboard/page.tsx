"use client";

import { Button, Select, SelectItem, Tooltip } from "@nextui-org/react";
import SurveyCharts from "./chart";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/lib/functions.api";
import { useState } from "react";
import type { SurveAnswersDashboard } from "@/app/api/survey/[id]/answers/route";
import Loading from "@/components/loading";
import { FaExclamationTriangle, FaFileExcel } from "react-icons/fa";
import { handleExportToCSV } from "./functions";
import type { OSC, OSCAddress } from "@prisma/client";

export default function Home() {
	const [selectedSurveyId, setSelectedSurveyId] = useState("");
	const [selectedOscId, setSelectedOscId] = useState("");

	const {
		data: dataSurvey,
		isLoading: isLoadingSurveys,
		error: surveysError,
	} = useQuery({
		queryKey: ["survey-list"],
		queryFn: ({ signal }) =>
			getData<{ id: number; description: string; name: string }[]>({
				url: "/survey",
				signal,
			}),
	});

	const {
		data: oscs,
		isLoading: isLoadingOscs,
		error: oscError,
	} = useQuery({
		queryKey: ["osc-get"],
		queryFn: ({ signal }) =>
			getData<(OSC & { address: OSCAddress })[]>({
				url: "/osc",
				signal,
				query: "include.address=true",
			}),
	});

	const {
		data: surveyAnswers,
		isLoading: isLoadingAnswers,
		error: answersError,
	} = useQuery<SurveAnswersDashboard>({
		queryKey: ["survey-answers", selectedSurveyId, selectedOscId],
		queryFn: ({ signal }) =>
			getData<SurveAnswersDashboard>({
				url: `/survey/${selectedSurveyId}/answers`,
				signal,
				query: selectedOscId ? `where.oscId=${selectedOscId}` : undefined,
			}),
		enabled: !!selectedSurveyId,
	});

	if (isLoadingSurveys || isLoadingAnswers) {
		return <Loading />;
	}

	if (surveysError || answersError) {
		return (
			<div className="w-full flex items-center justify-center">
				<div className="flex items-center justify-center p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg w-fit">
					<FaExclamationTriangle className="mr-2" />
					<span>Erro ao carregar os questionários</span>
				</div>
			</div>
		);
	}

	const isGoogleForms = process.env.NEXT_PUBLIC_GRAPH_GOOGLE_FORMS === "true";

	return (
		<div className="flex flex-col justify-between w-full">
			<div className="flex justify-between gap-2 items-center">
				<h1 className="text-3xl font-bold mt-2 mb-4">Dashboard</h1>
				{!!surveyAnswers?.questions?.length && (
					<Tooltip
						content="Exportar em Excel"
						placement="bottom-end"
						color="success"
					>
						<Button
							isIconOnly
							color="success"
							className="rounded-full"
							onPress={() => {
								// exportar para excel
								handleExportToCSV(surveyAnswers, selectedSurveyId);
							}}
							title="Exportar"
						>
							<FaFileExcel size={20} />
						</Button>
					</Tooltip>
				)}
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
				<Select
					items={dataSurvey ?? []}
					label="Questionário"
					placeholder="Selecione um questionário"
					className="md:max-w-md mb-2 "
					isDisabled={isLoadingSurveys || !!surveysError}
					onChange={(e) => {
						const value = e.target.value;
						setSelectedSurveyId(value);
						if (isGoogleForms) {
							setSelectedSurveyId("");
						}
					}}
					selectedKeys={selectedSurveyId ? [selectedSurveyId] : []}
				>
					{(survey) => (
						<SelectItem key={survey.id} value={survey.id}>
							{survey.name}
						</SelectItem>
					)}
				</Select>
				<Select
					items={oscs ?? []}
					label="OSC"
					placeholder="Selecione um questionário"
					className="md:max-w-md mb-2 justify-self-end"
					isDisabled={isLoadingOscs || !!oscError}
					onChange={(e) => {
						const value = e.target.value;
						setSelectedOscId(value);
					}}
					selectedKeys={selectedOscId ? [selectedOscId] : []}
				>
					{(osc) => (
						<SelectItem key={osc.id} value={osc.id}>
							{osc.name}
						</SelectItem>
					)}
				</Select>
			</div>

			{!isGoogleForms && surveyAnswers && (
				<div className="flex justify-center items-start gap-48 flex-wrap py-8">
					{surveyAnswers.questions.map((question) => (
						<SurveyCharts key={question.question} surveyData={question} />
					))}
				</div>
			)}
			{surveyAnswers && surveyAnswers.questions.length === 0 && (
				<div className="w-full flex items-center justify-center">
					<div className="flex items-center justify-center p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg w-fit">
						<FaExclamationTriangle className="mr-2" />
						<span>Este questionário ainda não possui respostas</span>
					</div>
				</div>
			)}
			{isGoogleForms && (
				<iframe
					title="Google Sheets"
					className="w-[1435px] overflow-x-hidden h-screen border-0 bg-black"
					allowFullScreen
					width={640}
					height={1705}
					src="https://docs.google.com/spreadsheets/d/e/2PACX-1vTYeey6PnXWMDA_VPlarT6dJ6t_BYKA6cbd7RxY6lXaJgkET_2Y7vaiN1EOAOoB-p8XJppZ2_aWoRAZ/pubhtml?gid=179606886&amp;single=true&amp;widget=true&amp;headers=false"
				/>
			)}
		</div>
	);
}
