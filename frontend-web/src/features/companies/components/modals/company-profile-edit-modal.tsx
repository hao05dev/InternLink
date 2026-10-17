import { Modal } from "@/components/ui/modal";
import type { PublicCompany } from "../../types/public-company.types";
import type { CompanyProfileValues } from "../../types/company-profile.types";
import { CompanyProfileForm } from "../forms/company-profile-form";

interface Props { company: PublicCompany; onSave: (values: CompanyProfileValues) => Promise<PublicCompany>; onClose: () => void }

export function CompanyProfileEditModal({ company, onSave, onClose }: Props) {
  return <Modal isOpen onClose={onClose} title="Chỉnh sửa hồ sơ doanh nghiệp" maxWidth="4xl">
    <CompanyProfileForm company={company} onSave={onSave} />
  </Modal>;
}
