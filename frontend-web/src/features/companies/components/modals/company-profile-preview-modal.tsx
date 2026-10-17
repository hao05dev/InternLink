import { Modal } from "@/components/ui/modal";
import type { PublicCompany } from "../../types/public-company.types";
import { CompanyProfileHeader } from "../public/company-profile-header";
import { CompanyIntroductionSection } from "../public/company-introduction-section";
import { CompanyFactsSection } from "../public/company-facts-section";
import { CompanyLocationSection } from "../public/company-location-section";

export function CompanyProfilePreviewModal({ company, onClose }: { company: PublicCompany; onClose: () => void }) {
  return <Modal isOpen onClose={onClose} title="Xem trước hồ sơ công khai" description="Các thay đổi trong bản xem trước chưa được lưu." maxWidth="4xl">
    <div className="space-y-5 bg-slate-50 p-2 sm:p-4">
      <CompanyProfileHeader company={company} />
      <CompanyIntroductionSection description={company.description} />
      <div className="grid gap-5 md:grid-cols-2"><CompanyFactsSection company={company} /><CompanyLocationSection company={company} /></div>
    </div>
  </Modal>;
}
