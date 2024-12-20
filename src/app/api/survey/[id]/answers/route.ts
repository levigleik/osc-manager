import { questionService } from "@/app/api/question/service";
import { surveyAnswerService } from "@/app/api/surveyAnswer/service";
import { getQuery } from "@/lib/query";
import type {
	CheckBox,
	MultipleChoice,
	OSC,
	Question,
	QuestionType,
	SurveyAnswer,
	SurveyResponse,
} from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

type Params = {
	id: string;
};

export type SurveAnswersDashboard = {
	surveysAnswers: (SurveyAnswer & {
		osc: {
			name: string;
		};
		student: {
			name: string;
		};
		responses: (SurveyResponse & { question: Question })[];
	})[];
	questions: {
		question: string;
		type: QuestionType;
		answers: {
			labels: string[];
			values: number[];
		};
	}[];
};

export async function GET(
	req: NextRequest,
	context: {
		params: Params;
	},
) {
	try {
		const query = getQuery(req);

		const id = Number(context.params.id);

		if (Number.isNaN(id))
			return NextResponse.json(
				{ msg: "Falha ao buscar dados das respostas" },
				{ status: 404 },
			);

		const surveys = (await surveyAnswerService.find({
			where: {
				surveyId: id,
			},
			include: {
				responses: {
					include: {
						question: true,
					},
				},
				osc: {
					select: {
						name: true,
					},
				},
				student: {
					select: {
						name: true,
					},
				},
			},
			...query,
		})) as (SurveyAnswer & {
			osc: {
				name: string;
			};
			student: {
				name: string;
			};
			responses: {
				question: Question;
				answer: string;
			}[];
		})[];

		const questions = (await questionService.find({
			where: {
				surveyId: id,
				type: { not: "ShortAnswer" },
			},
			include: {
				multipleChoice: true,
				checkBox: true,
			},
			orderBy: {
				order: "asc",
			},
		})) as (Question & {
			multipleChoice: MultipleChoice[];
			checkBox: CheckBox[];
		})[];

		const surveyWithoutShortAnswer = surveys
			.map((survey) => ({
				...survey,
				responses: survey.responses.filter(
					({ question }) => question.type !== "ShortAnswer",
				),
			}))
			.filter(({ responses }) => responses.length > 0);

		const surveyAnswersDashboard: SurveAnswersDashboard = {
			questions: [],
			surveysAnswers: [],
		};

		for (const quest of questions) {
			const name = quest.name;
			const answers = {
				labels: [] as string[],
				values: [] as number[],
			};
			if (quest.type === "MultipleChoice") {
				for (const choice of quest.multipleChoice) {
					answers.labels.push(choice.choice);
					const count = surveyWithoutShortAnswer
						.flatMap(({ responses }) => responses)
						.filter(
							({ question: { id: questionId }, answer }) =>
								questionId === quest.id && answer === choice.choice,
						).length;
					answers.values.push(count);
				}
			}

			if (quest.type === "CheckBox") {
				for (const option of quest.checkBox) {
					answers.labels.push(option.option);
					const count = surveyWithoutShortAnswer
						.flatMap(({ responses }) => responses)
						.filter(
							({ question: { id: questionId }, answer }) =>
								questionId === quest.id &&
								JSON.parse(answer).includes(option.option),
						).length;

					answers.values.push(count);
				}
			}
			surveyAnswersDashboard.questions.push({
				question: name,
				answers,
				type: quest.type,
			});
		}

		surveyAnswersDashboard.surveysAnswers = surveyWithoutShortAnswer.map(
			(survey) => ({
				...survey,
				osc: survey.osc as OSC,
				student: survey.student as OSC,
				responses: survey.responses as (SurveyResponse & {
					question: Question;
				})[],
			}),
		);

		// check if all answers.values are 0
		if (
			surveyAnswersDashboard.questions.every((quest) =>
				quest.answers.values.every((value) => value === 0),
			)
		) {
			surveyAnswersDashboard.questions = [];
		}

		return NextResponse.json({
			questions: surveyAnswersDashboard.questions,
			surveysAnswers: surveys,
		});
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ msg: "Falha ao buscar respostas", error },
			{ status: 500 },
		);
	}
}
