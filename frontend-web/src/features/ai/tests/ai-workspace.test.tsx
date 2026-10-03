import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StudentSkills } from "../components/student-skills";
import { Recommendations } from "../components/recommendations";
import { aiApi } from "../api";

vi.mock("@/features/auth/hooks/use-auth", () => ({ useAuth: () => ({ user: { id: "student-1", role: "STUDENT" } }) }));
vi.mock("../api", () => ({ aiApi: { skills: vi.fn(), taxonomy: vi.fn(), extract: vi.fn(), confirm: vi.fn(), declare: vi.fn(), recommend: vi.fn(), plan: vi.fn() } }));
function mount(ui: React.ReactNode) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}
beforeEach(() => {
    cleanup(); vi.clearAllMocks();
    vi.mocked(aiApi.skills).mockResolvedValue([]);
    vi.mocked(aiApi.taxonomy).mockResolvedValue([{ id: "SK-JAVA", skillName: "Java" }]);
});
describe("AI workspace review flow", () => {
    it("requires consent and keeps cloud disabled by default", async () => {
        vi.mocked(aiApi.extract).mockResolvedValue({ status: "COMPLETED", mode: "rule_based", skills: [] });
        mount(<StudentSkills />);
        fireEvent.change(screen.getByLabelText("Hoặc dán nội dung"), { target: { value: "Java" } });
        expect(screen.getByRole("button", { name: "Phân tích CV" })).toBeDisabled();
        fireEvent.click(screen.getByLabelText(/Tôi đồng ý/));
        fireEvent.click(screen.getByRole("button", { name: "Phân tích CV" }));
        await waitFor(() => expect(aiApi.extract).toHaveBeenCalledWith({ text: "Java", consent: true, allowCloud: false }));
        expect(await screen.findByRole("status")).toHaveTextContent("Đã xử lý CV");
    });
    it("shows evidence and prevents confirming negated proposals", async () => {
        vi.mocked(aiApi.skills).mockResolvedValue([{ skillId: "SK-DOCKER", skillName: "Docker", source: "CV_AI", isConfirmed: false,
            aiEvidence: { assertionStatus: "negated", evidence: { quote: "Tôi chưa biết Docker" } } }]);
        mount(<StudentSkills />);
        expect(await screen.findByText("Tôi chưa biết Docker")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Xác nhận kỹ năng" })).toBeDisabled();
        expect(aiApi.confirm).not.toHaveBeenCalled();
    });
    it("positive proposal is confirmed only after explicit click", async () => {
        vi.mocked(aiApi.skills).mockResolvedValue([{ skillId: "SK-JAVA", skillName: "Java", source: "CV_AI", isConfirmed: false,
            aiEvidence: { assertionStatus: "mentioned", evidence: { quote: "Dự án Java" } } }]);
        mount(<StudentSkills />);
        const button = await screen.findByRole("button", { name: "Xác nhận kỹ năng" });
        expect(aiApi.confirm).not.toHaveBeenCalled();
        fireEvent.click(button);
        await waitFor(() => expect(aiApi.confirm).toHaveBeenCalledWith("SK-JAVA", true));
    });
    it("does not present unknown data as a zero match score", async () => {
        vi.mocked(aiApi.recommend).mockResolvedValue([{ jobId: "job-1", jobTitle: "Java Intern", companyName: "Company",
            matchScore: 0, scoreAvailable: false, semanticAvailable: false, mode: "insufficient_data",
            missingSkills: ["SK-JAVA"], matchedSkills: [], explanation: {}, warnings: [] }]);
        mount(<Recommendations terms={[{ id: "term-1", name: "Kỳ 1" }]} userId="student-1" />);
        fireEvent.change(screen.getByLabelText("Kỳ thực tập"), { target: { value: "term-1" } });
        expect(await screen.findByText("Chưa đủ dữ liệu để tính điểm")).toBeInTheDocument();
        expect(screen.queryByText("0% khớp kỹ năng")).not.toBeInTheDocument();
        expect(screen.getByText("Yêu cầu chưa có minh chứng: Java")).toBeInTheDocument();
    });
});
