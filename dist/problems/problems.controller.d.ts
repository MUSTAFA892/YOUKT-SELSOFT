import { ProblemsService } from './problems.service';
export declare class ProblemsController {
    private readonly problemsService;
    constructor(problemsService: ProblemsService);
    findAll(): Omit<import("./problems.service").Problem, "testCases" | "wrapperCode">[];
    findOne(id: string): Omit<import("./problems.service").Problem, "testCases" | "wrapperCode">;
}
