"use client";
import {
	getData,
	postData,
	putData,
	toastErrorsApi,
} from "@/lib/functions.api";
import type { PostData, PutData } from "@/types/api";
import { Button, Input, Skeleton } from "@nextui-org/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type { StudentFormProps } from "./types";

import { Combobox } from "@/components/ui/combobox";
import type { Course, Student } from "@prisma/client";

const StudentEdit = () => {
	const { id } = useParams<{ id: string | "new" }>();
	const { data: dataGetStudent, isLoading: loadingGet } = useQuery({
		queryFn: ({ signal }) =>
			getData<Student>({
				url: "student",
				id: Number.parseInt(id, 10),
				signal,
				query: "include.course=true",
			}),
		queryKey: ["student-get-by-id", id],
		enabled: id !== "new",
	});

	const { mutateAsync: mutatePost, isPending: loadingPost } = useMutation({
		mutationFn: async (val: PostData<Student>) =>
			postData<Student, Student>(val),
		mutationKey: ["student-post"],
	});

	const { mutateAsync: mutatePut, isPending: loadingPut } = useMutation({
		mutationFn: (val: PutData<Student>) => putData<Student, Student>(val),
		mutationKey: ["student-put"],
	});

	const { data: dataGetCourse, isLoading: loadingGetCourse } = useQuery({
		queryFn: ({ signal }) =>
			getData<Course[]>({
				url: "course",
				signal,
			}),
		queryKey: ["course-get"],
		refetchOnMount: false,
		refetchOnReconnect: false,
	});

	const { handleSubmit, setValue, control, reset, getValues } = useForm<
		StudentFormProps,
		"students"
	>();

	const onSubmit = (data: StudentFormProps) => {
		const parseData = {
			...data,
			courseId: Number(data.courseId),
		};
		if (id === "new")
			mutatePost({
				url: "/student",
				data: parseData,
			})
				.then(() => {
					toast.success("Aluno cadastrado com sucesso");
					reset();
				})
				.catch((error: any) => {
					toastErrorsApi(error);
				});
		else
			mutatePut({
				url: "/student",
				data: parseData,
				id: Number.parseInt(id, 10),
			})
				.then(() => {
					toast.success("Aluno atualizado com sucesso");
				})
				.catch((err) => {
					toastErrorsApi(err);
				});
	};

	const loading = loadingGet || loadingPost || loadingPut;

	useEffect(() => {
		if (dataGetStudent && id !== "new") {
			setValue("name", dataGetStudent.name);
			setValue("semester", dataGetStudent.semester);
			setValue("matriculation", dataGetStudent.matriculation);
			setValue("courseId", String(dataGetStudent.courseId));
		}
	}, [dataGetStudent, id, setValue]);

	return (
		<form
			autoComplete="off"
			onSubmit={handleSubmit(onSubmit)}
			className="flex w-full flex-col gap-4"
		>
			<Controller
				name="name"
				control={control}
				defaultValue=""
				rules={{ required: "Campo obrigatório" }}
				render={({ field, fieldState: { error } }) => (
					<Skeleton className="rounded-md" isLoaded={!loading}>
						<Input
							label="Nome"
							id={field.name}
							type="text"
							onChange={field.onChange}
							name={field.name}
							value={field.value}
							variant="bordered"
							color="primary"
							isRequired
							isInvalid={!!error}
							errorMessage={error?.message}
						/>
					</Skeleton>
				)}
			/>
			<Controller
				name="matriculation"
				control={control}
				defaultValue=""
				rules={{ required: "Campo obrigatório" }}
				render={({ field, fieldState: { error } }) => (
					<Skeleton className="rounded-md" isLoaded={!loading}>
						<Input
							label="Matrícula"
							id={field.name}
							type="text"
							onChange={field.onChange}
							name={field.name}
							value={field.value}
							variant="bordered"
							color="primary"
							isRequired
							isInvalid={!!error}
							errorMessage={error?.message}
						/>
					</Skeleton>
				)}
			/>
			<Controller
				name="semester"
				control={control}
				defaultValue=""
				rules={{
					required: "Campo obrigatório",
					validate: (val) => {
						const regex = /^(?:\d{1,4})(?:\.(?:[1-2])?)?$/;
						if (!regex.test(val)) {
							return "Formato inválido. Use até 4 dígitos, opcionalmente seguidos por um ponto e 1 ou 2.";
						}
						const [year, semester] = val.split(".");
						if (
							Number(year) < 1900 ||
							Number(year) > new Date().getFullYear()
						) {
							return "Ano inválido";
						}
						if (semester && (Number(semester) < 1 || Number(semester) > 2)) {
							return "Semestre deve ser 1 ou 2";
						}
						return true;
					},
				}}
				render={({ field, fieldState: { error } }) => (
					<Skeleton className="rounded-md" isLoaded={!loading}>
						<Input
							label="Semestre"
							id={field.name}
							type="text"
							onChange={(e) => {
								let value = e.target.value.replace(/\D/g, "");
								if (value.length > 4) {
									value = `${value.slice(0, 4)}.${value.slice(4, 5)}`;
								}
								const regex = /^(?:\d{0,4})(?:\.(?:[1-2])?)?$/;
								if (regex.test(value)) {
									field.onChange(value);
								}
							}}
							name={field.name}
							value={field.value}
							variant="bordered"
							color="primary"
							isRequired
							isInvalid={!!error}
							errorMessage={error?.message}
						/>
					</Skeleton>
				)}
			/>
			<Controller
				name="courseId"
				control={control}
				rules={{ required: "Campo obrigatório" }}
				render={({ field, fieldState: { error } }) => (
					<Skeleton
						className="h-14 rounded-md [&>div]:h-14"
						isLoaded={!loadingGetCourse}
					>
						<Combobox
							id={field.name}
							data={dataGetCourse ?? []}
							value={field.value}
							onChange={field.onChange}
							label="Curso"
							filterKey={["name"]}
							textValueKey="name"
							isRequired
							itemRenderer={(item) => (
								<span className="font-bold">{item.name}</span>
							)}
						/>
					</Skeleton>
				)}
			/>
			<Button
				type="submit"
				variant="flat"
				color="primary"
				className="w-fit"
				isDisabled={loading}
			>
				Salvar
			</Button>
		</form>
	);
};

export default StudentEdit;
