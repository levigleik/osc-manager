import { getQuery } from "@/lib/query";
import type { DeleteDefaultDTO } from "@/types/api";
import { type NextRequest, NextResponse } from "next/server";
import type { PUTStudentDTO } from "../dto/put";
import { studentService } from "../service";

type Params = {
	id: string;
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
				{ msg: "Falha ao buscar dados do aluno" },
				{ status: 404 },
			);

		const students = await studentService.findOne({
			...query,
			where: { id },
		});
		return NextResponse.json(students);
	} catch (error) {
		return NextResponse.json(
			{ msg: "Falha ao buscar alunos", error },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: Request,
	context: {
		params: Params;
	},
) {
	try {
		const id = Number(context.params.id);

		if (Number.isNaN(id))
			return NextResponse.json(
				{ msg: "Falha ao atualizar dados do aluno" },
				{ status: 404 },
			);

		const data = (await request.json()) as PUTStudentDTO;
		const student = await studentService.update({
			data,
			where: { id },
		});
		return NextResponse.json(student);
	} catch (error) {
		return NextResponse.json(
			{ msg: "Falha ao atualizar aluno", error },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: Request) {
	try {
		const { id } = (await request.json()) as DeleteDefaultDTO;
		await studentService.deleteOne(id);
		return NextResponse.json({ message: "Curso deletado com sucesso" });
	} catch (error) {
		return NextResponse.json(
			{ msg: "Falha ao deletar aluno", error },
			{ status: 500 },
		);
	}
}