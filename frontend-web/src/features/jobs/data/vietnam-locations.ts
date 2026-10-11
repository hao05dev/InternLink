export interface LocationOption {
    label: string;
    value: string;
    group: "ĐBSCL" | "Thành phố lớn" | "Toàn quốc";
}

export const VIETNAM_LOCATIONS: LocationOption[] = [
    { label: "Tất cả địa điểm", value: "ALL", group: "Toàn quốc" },
    
    // Khu vực trọng điểm ĐBSCL (Ưu tiên sinh viên ĐH Cần Thơ)
    { label: "Cần Thơ", value: "Cần Thơ", group: "ĐBSCL" },
    { label: "Hậu Giang", value: "Hậu Giang", group: "ĐBSCL" },
    { label: "Vĩnh Long", value: "Vĩnh Long", group: "ĐBSCL" },
    { label: "An Giang", value: "An Giang", group: "ĐBSCL" },
    { label: "Đồng Tháp", value: "Đồng Tháp", group: "ĐBSCL" },
    { label: "Tiền Giang", value: "Tiền Giang", group: "ĐBSCL" },
    { label: "Bến Tre", value: "Bến Tre", group: "ĐBSCL" },
    { label: "Kiên Giang", value: "Kiên Giang", group: "ĐBSCL" },
    { label: "Sóc Trăng", value: "Sóc Trăng", group: "ĐBSCL" },
    { label: "Bạc Liêu", value: "Bạc Liêu", group: "ĐBSCL" },
    { label: "Cà Mau", value: "Cà Mau", group: "ĐBSCL" },
    { label: "Trà Vinh", value: "Trà Vinh", group: "ĐBSCL" },
    { label: "Long An", value: "Long An", group: "ĐBSCL" },

    // Các trung tâm công nghệ và thành phố lớn
    { label: "TP. Hồ Chí Minh", value: "Hồ Chí Minh", group: "Thành phố lớn" },
    { label: "Hà Nội", value: "Hà Nội", group: "Thành phố lớn" },
    { label: "Đà Nẵng", value: "Đà Nẵng", group: "Thành phố lớn" },
    { label: "Bình Dương", value: "Bình Dương", group: "Thành phố lớn" },
    { label: "Đồng Nai", value: "Đồng Nai", group: "Thành phố lớn" },
    { label: "Hải Phòng", value: "Hải Phòng", group: "Thành phố lớn" },
];
