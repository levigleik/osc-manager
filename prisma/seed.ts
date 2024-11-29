import { prisma } from "@/app/api/prisma/prisma.config";
import {
	courses,
	projects,
	semesters,
	socialMediaPlatforms,
	surveys,
	users,
} from "./constants";

interface Student {
	name: string;
	whatsapp?: string;
	courseId?: string;
}

interface Project {
	id: string;
	name: string;
	description?: string;
	link?: string;
	osc: { name: string };
	students: Student[];
}

/**
 * Asynchronously upserts data for a specific entity.
 *
 * @param entityName - The name of the entity being upserted.
 * @param data - An array of data items to be upserted.
 * @param upsertHandler - A handler function that performs the upsert operation for each item.
 */
async function upsertData(
	entityName: string,
	data: any[],
	upsertHandler: (item: any) => Promise<void>,
) {
	console.log(`Seeding ${entityName} (${data.length} records)...`);
	await Promise.all(
		data.map(async (item) => {
			await upsertHandler(item);
		}),
	);
	console.log(`${entityName} seeded.`);
}

/**
 * Seeds the database with social media platforms data by upserting each platform.
 * Utilizes the provided upsertData utility function to handle bulk operations.
 */
async function seedSocials() {
	await upsertData(
		"social media platforms",
		socialMediaPlatforms,
		async (social) => {
			await prisma.socialPlatform.upsert({
				create: social,
				update: social,
				where: { id: social.id },
			});
		},
	);
}

/**
 * Seeds the database with courses data by upserting each course.
 * Utilizes the provided upsertData utility function to handle bulk operations.
 */
async function seedCourses() {
	await upsertData("courses", courses, async (course) => {
		await prisma.course.upsert({
			create: course,
			update: course,
			where: { id: course.id },
		});
	});
}

// async function seedUsers() {
// 	await upsertData("users", users, async (user) => {
// 		await prisma.user.upsert({
// 			create: user,
// 			update: user,
// 			where: { id: user.id },
// 		});
// 	});
// }

/**
 * Seeds the database with semesters data by upserting each semester.
 * Utilizes the provided upsertData utility function to handle bulk operations.
 */
async function seedSemesters() {
	await upsertData("semesters", semesters, async (semester) => {
		await prisma.semester.upsert({
			create: semester,
			update: semester,
			where: { id: semester.id },
		});
	});
}

/**
 * Seeds the database with project data by upserting each project.
 * Utilizes the provided upsertData utility function to handle bulk operations efficiently.
 * Each project is associated with an existing semester and one or more students.
 * The function creates all associated students and oscs if they do not exist.
 */
const seedProjects = async () => {
	await upsertData("projects", projects, async (project) => {
		await prisma.project.upsert({
			create: {
				...project,
				osc: { create: { name: project.osc.name } },
				students: {
					createMany: {
						data: (project.students as Student[]).map((student) => ({
							name: student.name,
							whatsapp: student.whatsapp,
							courseId: 1,
						})),
					},
				},
				semester: {
					connect: { name: "2024.2" },
				},
				id: undefined,
			},
			update: {
				...project,
				osc: { create: { name: project.osc.name } },
				students: {
					createMany: {
						data: (project.students as Student[]).map((student) => ({
							name: student.name,
							courseId: 1,
						})),
					},
				},
				semester: {
					connect: { name: "2024.2" },
				},
				id: undefined,
			},
			where: { id: project.id },
		});
	});
};

// Seeds the database with survey data by upserting surveys and creating associated questions.
// This function ensures that surveys are upserted into the database. For each survey, it creates
// associated questions in the specified order. Each question may include multiple choice and checkbox
// options, which are also created and sorted by order. The function utilizes the upsertData utility
// to handle bulk operations efficiently.
async function seedSurveys() {
	await upsertData("surveys", surveys, async (survey) => {
		await prisma.survey.upsert({
			create: { ...survey, questions: undefined },
			update: { ...survey, questions: undefined },
			where: { id: survey.id },
		});

		await Promise.all(
			survey.questions.create
				.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
				.map(async (question: any) => {
					await prisma.question.create({
						data: {
							...question,
							surveyId: survey.id,
							order: question.order,
							multipleChoice: {
								create: question.multipleChoice
									?.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
									.map((choice: any) => ({
										...choice,
										choice: choice.choice ?? "",
									})),
							},
							checkBox: {
								create: question.checkBox
									?.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
									.map((option: any) => ({
										...option,
										option: option.option ?? "",
									})),
							},
						},
					});
				}),
		);
	});
}

/**
 * Seeds the database with initial data.
 *
 * This function is called by the `seed` script in `package.json`, and is used
 * to populate the database with some initial data. This is useful for testing
 * and development purposes.
 *
 * The function will log a message to the console when it starts and when it
 * finishes, and will exit the process with a non-zero exit code if it
 * encounters an error.
 *
 * The function will disconnect from the database once it's finished, to ensure
 * that the connection is closed properly.
 */
async function seed() {
	try {
		console.log("Starting the seeding process...");
		await seedSocials();
		await seedCourses();
		// await seedUsers();
		await seedSemesters();
		await seedSurveys();
		await seedProjects();
	} catch (e) {
		console.error(e);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

seed();
