export type MemberId = "an" | "nhi" | "linh" | "long" | "tbd";
export type FolderId = "persona" | "skills" | "rules" | "workflows";

export type Member = {
  id: MemberId;
  name: string;
  legalName?: string;
  company: string;
  short: string;
  role: string;
  folderEnv: string;
  accent: string;
  metrics: [string, string][];
  questions: string[];
};

export type FolderSpec = {
  id: FolderId;
  name: string;
  label: string;
  files: string[];
  purpose: string;
};

export const folders: FolderSpec[] = [
  {
    id: "persona",
    name: "Folder Persona",
    label: "Persona",
    files: ["soul", "memory", "mission", "org chart", "user", "tools", "heartbeat"],
    purpose: "Định nghĩa danh tính, vai trò, quyền hạn, ký ức nền và cách agent giữ nhịp làm việc."
  },
  {
    id: "skills",
    name: "Folder Skills",
    label: "Skills",
    files: ["domain skills", "tool SOP", "prompt patterns", "learning data"],
    purpose: "Kỹ năng agent cần học, tiêu chuẩn đầu ra, ví dụ tốt/xấu và luồng dùng công cụ."
  },
  {
    id: "rules",
    name: "Folder Rules",
    label: "Rules",
    files: ["approval rules", "data rules", "risk rules", "handoff rules"],
    purpose: "Quy tắc phối hợp, phân quyền, human-in-the-loop, bảo mật và giới hạn tự động."
  },
  {
    id: "workflows",
    name: "Folder Workflows",
    label: "Workflows",
    files: ["intake", "planning", "execution", "review", "escalation"],
    purpose: "Luồng nhận dữ liệu, xử lý, xin duyệt, bàn giao, báo cáo và cảnh báo."
  }
];

export const members: Member[] = [
  {
    id: "an",
    name: "Anh An",
    legalName: "Luu Tu An",
    company: "Alpha 8",
    short: "International market",
    role: "Co-founder CEO, quản lý thị trường international, trọng tâm USA và Việt Nam. Vận hành Hybrid Team 3 người lõi và 150 AI Digital Workers.",
    folderEnv: "DRIVE_FOLDER_ALPHA8",
    accent: "#44c7f4",
    metrics: [
      ["150", "AI Agents"],
      ["USA", "Thị trường trọng tâm"],
      ["2 MOU", "Mục tiêu tháng 06/2026"],
      ["99.9%", "Uptime cùng IT Lead"]
    ],
    questions: [
      "Agent nào chịu trách nhiệm học liệu, marketing, B2B/bảo hiểm và kế toán? Mỗi agent có KPI riêng là gì?",
      "Hồ sơ nào liên quan HIPAA, bảo hiểm, bệnh viện, đối tác quốc tế cần human approval trước khi gửi?",
      "Dữ liệu thị trường USA lấy từ nguồn nào, cập nhật bao lâu một lần, ai được quyền chỉnh sửa?",
      "Khi agent tạo cam kết pháp lý hoặc nội dung nhạy cảm về trẻ tự kỷ, tiêu chí chặn và escalation là gì?",
      "Token/API budget cho 150 agents chia theo team ra sao, ngưỡng cảnh báo vượt chi phí là bao nhiêu?",
      "Approval workflow giữa CEO, IT Lead và nhân sự USA gồm những trạng thái nào?"
    ]
  },
  {
    id: "nhi",
    name: "Chị Nhi",
    company: "Alpha 25",
    short: "Domestic market",
    role: "Co-founder COO / Managing Director, quản lý thị trường nội địa, mở rộng 50 trường chuyên biệt và học liệu hòa nhập tại TP.HCM.",
    folderEnv: "DRIVE_FOLDER_ALPHA25",
    accent: "#22c55e",
    metrics: [
      ["300", "AI Digital Workers"],
      ["50", "Trường chuyên biệt"],
      ["15", "Trường phổ thông"],
      ["15,000", "Bộ học liệu"]
    ],
    questions: [
      "Cấu trúc 300 agents chia theo học liệu, marketing, chăm sóc trường học, kế hoạch/kế toán như thế nào?",
      "Mỗi trường đối tác cần bộ dữ liệu đầu vào nào để agent tạo học liệu cá nhân hóa đúng chuẩn?",
      "Quy trình ký MOU với trường chuyên biệt và trường phổ thông gồm các bước, tài liệu và người phê duyệt nào?",
      "Agent chăm sóc trường được phép trả lời real-time đến mức nào trước khi chuyển cho người phụ trách?",
      "Chuẩn kiểm định học liệu tiền tiểu học, cấp 1, 2, 3 gồm các tiêu chí bắt buộc nào?",
      "Khi có xung đột giữa nhu cầu nhà trường và chuẩn chuyên môn, agent phải ưu tiên quy tắc nào?"
    ]
  },
  {
    id: "linh",
    name: "Mỹ Linh",
    company: "Alpha 1",
    short: "Specialized inclusive school",
    role: "Co-founder kiêm Chủ trường Chuyên biệt - Hòa nhập. Điều hành 3 Phó Hiệu trưởng AI, 100 giáo viên bóng ảo và 30 Digital Workers.",
    folderEnv: "DRIVE_FOLDER_ALPHA1",
    accent: "#f59e0b",
    metrics: [
      ["3", "Phó Hiệu trưởng AI"],
      ["100", "Virtual Shadow Teachers"],
      ["30", "Digital Workers"],
      [">95%", "Hài lòng phụ huynh"]
    ],
    questions: [
      "Ba Phó Hiệu trưởng AI có quyền quyết định gì, việc gì bắt buộc Chủ trường duyệt?",
      "Hồ sơ trẻ, phụ huynh, giáo viên bóng ảo cần những field nào để agent điều phối chính xác?",
      "Luồng 24/7 phụ huynh - chuyên gia - giáo viên bóng cần SLA, escalation và nhật ký trao đổi ra sao?",
      "Bộ học liệu cá nhân hóa được kiểm định chuyên môn theo tầng nào trước khi áp dụng cho trẻ?",
      "Agent nào phụ trách kế hoạch, kế toán, marketing, B2B đối tác, và agent đó dùng tool nào?",
      "Quy tắc bảo mật dữ liệu trẻ, gia đình, chuyên gia cần viết thành policy nào cho agent?"
    ]
  },
  {
    id: "long",
    name: "Anh Long",
    company: "Aquaponics",
    short: "Bio-tech operations",
    role: "Co-founder Aquaponics. Thiết kế cụm agent cho vận hành kỹ thuật sinh học, trị liệu/học tập, token/tài chính và chuỗi cung ứng.",
    folderEnv: "DRIVE_FOLDER_AQUAPONICS",
    accent: "#14b8a6",
    metrics: [
      ["3", "Core AI Agents"],
      ["IoT", "pH, DO, EC, nhiệt độ"],
      ["SMS", "Escalation khẩn cấp"],
      ["ROI", "Token/OPEX"]
    ],
    questions: [
      "Bio-Tech Agent đọc dữ liệu IoT qua gateway nào, tần suất bao nhiêu, ngưỡng nguy hiểm đã duyệt là gì?",
      "Khi nước vượt ngưỡng độc, workflow dừng micro-task trị liệu và báo tài chính thiệt hại chạy thế nào?",
      "Shadow Teacher và phụ huynh được quyền gửi yêu cầu gì cho Therapy Agent, yêu cầu nào cần quản lý duyệt?",
      "Cụm agent nên clone theo farm/site hay mở rộng năng lực xử lý tập trung? Điều kiện chuyển mô hình là gì?",
      "Offline mode/cache của PWA cần lưu dữ liệu nào để không mất vận hành khi mất Internet?",
      "Token budget tính theo tác vụ nào: đọc sensor, tạo báo cáo, phân tích rủi ro, voice command, dashboard?"
    ]
  },
  {
    id: "tbd",
    name: "Người thứ 5",
    company: "NBAI Ecosystem",
    short: "Ecosystem governance",
    role: "Placeholder vì brief nói có 5 người chính nhưng mới liệt kê 4 người. Tab này dành cho Founder/Ecosystem Admin hoặc thành viên bổ sung sau.",
    folderEnv: "DRIVE_FOLDER_PERSON5",
    accent: "#94a3b8",
    metrics: [
      ["TBD", "Tên thành viên"],
      ["Shared", "Hạ tầng AI"],
      ["Governance", "Chuẩn ecosystem"],
      ["Audit", "Kiểm soát agent"]
    ],
    questions: [
      "Người này giữ vai trò governance, kỹ thuật, tài chính hay vận hành ecosystem?",
      "Các chuẩn chung nào mọi agent trong Alpha 1, Alpha 8, Alpha 25 và Aquaponics phải tuân thủ?",
      "Ai sở hữu hạ tầng dùng chung, token budget, logging, audit và phân quyền admin?",
      "Khi agent giữa các công ty trao đổi dữ liệu, cần hợp đồng dữ liệu và policy nào?",
      "Dashboard tổng cần so sánh KPI nào giữa các đơn vị?",
      "Quy trình duyệt agent mới trước khi đưa vào production gồm các bước nào?"
    ]
  }
];

export function findMember(id: string | null): Member {
  return members.find((member) => member.id === id) ?? members[0];
}

export function findFolder(id: string | null): FolderSpec {
  return folders.find((folder) => folder.id === id) ?? folders[0];
}

export function buildTemplate(member: Member, folder: FolderSpec): string {
  const personaFields = folder.id === "persona" ? `
0. Thông tin cá nhân cần collect
- Họ tên pháp lý: ${member.legalName || ""}
- Ngày tháng năm sinh:
- Email:
- Số điện thoại:
- Vai trò/chức danh hiện tại:
- Đơn vị/phòng ban phụ trách:
` : "";

  return `MẪU WORD - ${folder.name.toUpperCase()}
Người phụ trách: ${member.name}
Đơn vị: ${member.company}
Vai trò: ${member.role}
${personaFields}

1. Mục tiêu tài liệu
Tài liệu này giúp Digital Worker hiểu rõ nhiệm vụ, dữ liệu được dùng, giới hạn quyền hạn, tiêu chuẩn đầu ra và khi nào phải xin con người duyệt.

2. Bối cảnh vận hành
- Mô tả phòng ban / squad liên quan:
- Người phê duyệt cuối:
- Agent liên quan:
- Tool hoặc hệ thống được phép dùng:

3. Nội dung chính cần nạp cho agent
- Soul: agent tồn tại để phục vụ mục tiêu nào?
- Memory: agent cần nhớ dữ kiện nền nào?
- Mission: kết quả cần tạo ra theo ngày / tuần / tháng là gì?
- Org chart: agent báo cáo cho ai, phối hợp với agent nào?
- User: ai là người dùng cuối, nhu cầu và rủi ro của họ là gì?
- Tools: agent được phép dùng công cụ nào, input/output ra sao?
- Heartbeat: agent phải báo cáo nhịp nào, chỉ số nào báo động?

4. Quy tắc an toàn
- Việc agent được tự làm:
- Việc agent phải xin duyệt:
- Dữ liệu cấm gửi ra ngoài:
- Ngưỡng escalation khẩn cấp:

5. KPI và tiêu chuẩn nghiệm thu
- KPI chính:
- Chất lượng đầu ra đạt khi:
- Log/bằng chứng cần lưu:

6. Ví dụ đầu vào và đầu ra mẫu
Input mẫu:
Output tốt:
Output không chấp nhận:

7. Câu hỏi còn thiếu
- Cần bổ sung dữ liệu nào?
- Ai xác nhận bản cuối?
- Ngày cập nhật tiếp theo?`;
}
