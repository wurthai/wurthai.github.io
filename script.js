/*
  Lightweight JavaScript for:
  - mobile navigation
  - dark/light theme toggle with localStorage
  - English/Vietnamese language toggle with localStorage
  - reveal effects
  - active navigation links
  - terminal text rotation
*/

const root = document.documentElement;
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const revealElements = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("main section[id]");
const typingText = document.getElementById("typing-text");
const currentYear = document.getElementById("current-year");
const themeToggle = document.querySelector(".theme-toggle");


const langToggle = document.querySelector(".lang-toggle");
const langFlag = document.querySelector(".lang-flag");

const STORAGE_KEYS = {
  theme: "hqt-portfolio-theme",
  language: "hqt-portfolio-language",
};

const translations = {
  en: {
    "notes.topic0.body": "Define the target, permitted techniques and stop conditions. Record the lab setup and keep a clean baseline before testing.",
    "notes.topic0.title": "Scope \u0026 preparation",
    "notes.topic1.body": "Identify hosts, ports and services in scope. Verify service versions and turn observations into testable hypotheses; an open port alone is not a vulnerability.",
    "notes.topic1.title": "Reconnaissance \u0026 enumeration",
    "notes.topic2.body": "Map routes, inputs and user roles. Review authentication, session handling, access control and file upload behavior. Compare expected and actual responses in the lab.",
    "notes.topic2.title": "Web application testing",
    "notes.topic3.body": "Reproduce a suspected issue with the smallest necessary test. Save the request, response and reproduction steps. Separate confirmed impact from assumptions.",
    "notes.topic3.title": "Validate \u0026 collect evidence",
    "notes.topic4.body": "Inspect users, permissions, services and configuration. In a practice lab, investigate how excessive privileges or exposed secrets could create an escalation path.",
    "notes.topic4.title": "Linux \u0026 Windows lab review",
    "notes.topic5.body": "Document the affected component, evidence, impact and remediation. Provide repeatable steps, retest the fix and restore the lab after the exercise.",
    "notes.topic5.title": "Report, remediate \u0026 retest",
    "control.themeDark": "Dark",
    "control.themeLight": "Light",
    "nav.about": "About",
    "nav.skills": "Skills",
    "nav.projects": "Projects",
    "nav.writeups": "Write-ups",
    "nav.notes": "Notes",
    "nav.roadmap": "Roadmap",
    "nav.contact": "Contact",
    "hero.eyebrow": "Hi, this is",
    "hero.name": "Quoc Thai",
    "hero.role": "Security • Red Team • Pentest Web • RE • OSINT",
    "hero.description": "I focus on penetration testing, vulnerability assessment, and hands-on security labs, using tools such as Kali Linux, Nmap, and Metasploit.",
    "hero.description2": "I regularly take part in CTF challenges and Hack The Box labs to sharpen my skills, and document what I learn through write-ups.",
    "hero.quote": "No system is unbreakable — only unexplored.",
    "hero.viewProjects": "View Projects",
    "hero.readWriteups": "Read Write-ups",
    "hero.metric1": "Web & Network",
    "hero.metric2": "Enumeration",
    "hero.metric3": "Write-ups",
    "terminal.line1": "Scanning lab hosts...",
    "terminal.line2": "Enumerating open services...",
    "terminal.line3": "Testing web security...",
    "terminal.line4": "Documenting findings...",
    "terminal.messages": ["Reviewing lab findings", "Checking exposed services", "Testing authorized targets", "Writing CTF solutions", "Improving pentesting skills"],
    "about.eyebrow": "About",
    "about.title": "Learning practical penetration testing",
    "about.p1": "I am a third-year Information Security student aspiring to become a Penetration Tester. I am learning to assess system and web application security, identify vulnerabilities, and practice ethical exploitation in controlled labs.",
    "about.p2": "I regularly solve CTF challenges, practice on Hack The Box, and build hands-on labs to improve my reconnaissance, enumeration, vulnerability assessment, and reporting skills.",
    "about.tag1": "Pentesting",
    "about.tag2": "Enumeration",
    "about.tag3": "Web Security",
    "about.tag4": "CTF & Labs",
    "skills.eyebrow": "Skills",
    "skills.title": "Technical skill areas",
    "skills.subtitle": "Organized around SOC work, operating system fundamentals, security practice, and tools.",
    "skills.socTitle": "SOC & Blue Team",
    "skills.soc1": "Log analysis",
    "skills.soc2": "Alert triage",
    "skills.soc3": "Incident investigation",
    "skills.soc7": "Detection logic",
    "skills.osTitle": "Operating Systems",
    "skills.os1": "Windows logs",
    "skills.os2": "Linux logs",
    "skills.os3": "PowerShell basics",
    "skills.os4": "Bash basics",
    "skills.practiceTitle": "Security Practice",
    "skills.practice2": "Digital forensics",
    "skills.practice3": "Web security testing",
    "skills.practice4": "Basic malware analysis",
    "skills.practice5": "CTF problem solving",
    "skills.toolsTitle": "Tools",
    "projects.eyebrow": "Projects",
    "projects.title": "Academic and hands-on security projects",
    "projects.subtitle": "Selected projects focused on infrastructure, monitoring, system security, and intrusion detection.",

    "projects.p1Type": "Infrastructure Project",
    "projects.p1Title": "Designing and Implementing High Availability (HA) Solutions for Network Services on Windows Server 2019",
    "projects.p1Desc": "Designed and implemented a high availability solution for Windows Server 2019 network services, focusing on redundancy, continuity, and resilient service deployment.",

    "projects.p2Type": "System Security",
    "projects.p2Title": "Deploying and Evaluating the Security of a Linux System Using Lynis",
    "projects.p2Desc": "Deployed a Linux environment and used Lynis to audit, assess, and improve system security through hardening and configuration review.",

    "projects.p3Type": "Monitoring Project",
    "projects.p3Title": "Designing and Implementing a Network Monitoring System with LibreNMS",
    "projects.p3Desc": "Built a network monitoring system using LibreNMS to observe device health, network availability, and operational status in a centralized dashboard.",

    "projects.p4Type": "Detection Project",
    "projects.p4Title": "Design and Implementation of an AI-Based Network Intrusion Detection System Using pfSense Firewall and ELK Stack",
    "projects.p4Desc": "Designed an intrusion detection workflow combining pfSense and the ELK Stack to collect, analyze, and visualize network security events for anomaly detection.",
    "writeups.eyebrow": "CTF Write-ups",
    "writeups.title": "Challenge notes and solving methodology",
    "writeups.subtitle": "Blog-style cards for documenting the problem, evidence, exploitation path, and lessons learned.",
    "writeups.c1Cat": "Web Exploitation",
    "writeups.c1Title": "File Upload Vulnerability Lab",
    "writeups.easy": "Difficulty: Easy",
    "writeups.medium": "Difficulty: Medium",
    "writeups.c1Desc": "Analyzing weak upload validation, identifying execution paths, and documenting controlled exploitation steps.",
    "writeups.c2Cat": "Digital Forensics",
    "writeups.c2Title": "Windows Registry Investigation",
    "writeups.c2Desc": "Reviewing registry artifacts, deleted traces, persistence indicators, and evidence extraction workflow.",
    "writeups.c3Title": "Public Source Investigation",
    "writeups.c3Desc": "Using public metadata, visible clues, and structured search methods without crossing privacy boundaries.",
    "writeups.c4Cat": "Reverse Engineering",
    "writeups.c4Title": "Basic Binary Analysis",
    "writeups.c4Desc": "Reading program behavior, identifying strings, checking file formats, and building a repeatable analysis process.",
    "writeups.readMore": "Read more",
    "notes.eyebrow": "Pentest field notes",
    "notes.title": "From reconnaissance to reporting",
    "notes.subtitle": "A practical checklist for learning and testing in authorized labs. Open a topic to review the workflow.",
    "notes.n1": "PowerShell suspicious behavior",
    "notes.n2": "WMI Event Subscription",
    "notes.n3": "PsExec-like remote execution",
    "notes.n4": "Registry persistence",
    "notes.n5": "Wazuh decoder and rule writing",
    "notes.n6": "MITRE ATT&CK mapping",
    "notes.n7": "IOC investigation workflow",
    "notes.legendActive": "Active alert node",
    "notes.legendHover": "Hover to inspect incident",
    "roadmap.eyebrow": "Learning Roadmap",
    "roadmap.title": "My path toward penetration testing",
    "roadmap.subtitle": "A learning plan built on networking and system foundations. These milestones describe the direction I am working toward, not completed certifications.",
    "roadmap.s1": "Networking \u0026 HTTP foundations",
    "roadmap.s2": "Linux, Windows \u0026 scripting",
    "roadmap.s3": "Scope \u0026 enumeration",
    "roadmap.s4": "Web application security",
    "roadmap.s5": "Vulnerability validation",
    "roadmap.s6": "Privilege escalation labs",
    "roadmap.s7": "End-to-end practice",
    "roadmap.s8": "Reporting \u0026 retesting",
    "roadmap.s1Desc": "Review TCP/IP, DNS, routing, TLS and the HTTP request/response lifecycle.",
    "roadmap.s2Desc": "Build confidence with users, permissions, services, Bash and Python for small lab automation tasks.",
    "roadmap.s3Desc": "Define rules of engagement, map the attack surface and practice service enumeration with Nmap in labs.",
    "roadmap.s4Desc": "Practice authentication, access control, input validation and session testing with Burp Suite in training labs.",
    "roadmap.s5Desc": "Reproduce findings safely in a controlled lab, collect evidence and distinguish false positives from confirmed issues.",
    "roadmap.s6Desc": "Study Linux and Windows misconfigurations, service permissions and escalation paths in practice environments.",
    "roadmap.s7Desc": "Work through CTF and Hack The Box labs, connecting enumeration, validation and clear documentation.",
    "roadmap.s8Desc": "Write concise pentest reports with evidence, impact, remediation and retest results; publish permitted lab write-ups.",
    "contact.eyebrow": "Contact",
    "contact.title": "Connect and collaborate",
    "contact.subtitle": "For projects, write-ups, labs, and cybersecurity learning documentation.",
    "contact.closing": "Always learning. Always investigating. Always improving.",
    "footer.rights": "Cybersecurity portfolio.",
    "footer.backTop": "Back to top",
  },
  vi: {
    "notes.topic0.body": "Xác định mục tiêu, kỹ thuật được phép và điều kiện dừng. Ghi lại cấu hình lab và lưu trạng thái ban đầu trước khi kiểm thử.",
    "notes.topic0.title": "Phạm vi \u0026 chuẩn bị",
    "notes.topic1.body": "Xác định host, cổng và dịch vụ trong phạm vi. Xác minh phiên bản và lập giả thuyết kiểm thử; cổng mở chưa đủ để kết luận có lỗ hổng.",
    "notes.topic1.title": "Trinh sát \u0026 liệt kê dịch vụ",
    "notes.topic2.body": "Lập danh sách đường dẫn, đầu vào và vai trò người dùng. Kiểm tra xác thực, phiên đăng nhập, phân quyền và tải tệp. So sánh phản hồi mong đợi với thực tế trong lab.",
    "notes.topic2.title": "Kiểm thử ứng dụng web",
    "notes.topic3.body": "Tái hiện vấn đề bằng phép thử tối thiểu cần thiết. Lưu request, response và các bước tái hiện. Phân biệt tác động đã xác minh với giả định.",
    "notes.topic3.title": "Xác minh \u0026 thu thập bằng chứng",
    "notes.topic4.body": "Rà soát tài khoản, quyền, dịch vụ và cấu hình. Trong lab thực hành, tìm hiểu cách quyền dư thừa hoặc thông tin bí mật bị lộ có thể tạo đường leo thang đặc quyền.",
    "notes.topic4.title": "Rà soát lab Linux \u0026 Windows",
    "notes.topic5.body": "Ghi rõ thành phần bị ảnh hưởng, bằng chứng, tác động và cách khắc phục. Cung cấp các bước tái hiện, kiểm thử lại bản sửa và khôi phục lab sau bài tập.",
    "notes.topic5.title": "Báo cáo, khắc phục \u0026 kiểm thử lại",
    "control.themeDark": "Tối",
    "control.themeLight": "Sáng",
    "nav.about": "Giới thiệu",
    "nav.skills": "Kỹ năng",
    "nav.projects": "Dự án",
    "nav.writeups": "Write-up",
    "nav.notes": "Ghi chú",
    "nav.roadmap": "Lộ trình",
    "nav.contact": "Liên hệ",
    "hero.eyebrow": "Xin chào, mình là",
    "hero.name": "Quốc Thái",
    "hero.role": "Security • Red Team • Pentest Web • RE • OSINT",
    "hero.description": "Mình tập trung học kiểm thử xâm nhập, đánh giá lỗ hổng và thực hành bảo mật với Kali Linux, Nmap, Metasploit trong môi trường lab.",
    "hero.description2": "Mình thường xuyên tham gia các thử thách CTF, luyện tập trên Hack The Box và ghi lại kiến thức qua các bài write-up.",
    "hero.quote": "Không có hệ thống nào bất khả xâm phạm — chỉ là chưa ai khám phá ra.",
    "hero.viewProjects": "Xem dự án",
    "hero.readWriteups": "Đọc write-up",
    "hero.metric1": "Web & Network",
    "hero.metric2": "Thu thập thông tin",
    "hero.metric3": "Write-up",
    "terminal.line1": "Đang quét các máy trong lab...",
    "terminal.line2": "Đang liệt kê dịch vụ đang mở...",
    "terminal.line3": "Đang kiểm thử bảo mật web...",
    "terminal.line4": "Đang ghi chép các phát hiện...",
    "terminal.messages": ["Rà soát kết quả thực hành", "Kiểm tra dịch vụ và cổng mạng", "Kiểm thử trong môi trường được phép", "Viết lời giải thử thách CTF", "Nâng cao kỹ năng pentest"],
    "about.eyebrow": "Giới thiệu",
    "about.title": "Thực hành kiểm thử xâm nhập",
    "about.p1": "Mình là sinh viên năm 3 ngành An toàn thông tin, định hướng trở thành Pentester. Mình tập trung đánh giá bảo mật hệ thống và ứng dụng web, tìm hiểu lỗ hổng và thực hành khai thác trong môi trường lab có kiểm soát.",
    "about.p2": "Mình thường xuyên tham gia thử thách CTF, luyện tập trên Hack The Box và xây dựng lab để rèn luyện kỹ năng thu thập thông tin, kiểm thử lỗ hổng và viết báo cáo.",
    "about.tag1": "Pentesting",
    "about.tag2": "Thu thập thông tin",
    "about.tag3": "Bảo mật web",
    "about.tag4": "CTF & Lab",
    "skills.eyebrow": "Kỹ năng",
    "skills.title": "Nhóm kỹ năng kỹ thuật",
    "skills.subtitle": "Được tổ chức theo công việc SOC, nền tảng hệ điều hành, thực hành bảo mật và công cụ.",
    "skills.socTitle": "SOC & Blue Team",
    "skills.soc1": "Phân tích log",
    "skills.soc2": "Phân loại alert",
    "skills.soc3": "Điều tra sự cố",
    "skills.soc7": "Logic phát hiện",
    "skills.osTitle": "Hệ điều hành",
    "skills.os1": "Log Windows",
    "skills.os2": "Log Linux",
    "skills.os3": "PowerShell cơ bản",
    "skills.os4": "Bash cơ bản",
    "skills.practiceTitle": "Thực hành bảo mật",
    "skills.practice2": "Điều tra số",
    "skills.practice3": "Kiểm thử bảo mật web",
    "skills.practice4": "Phân tích malware cơ bản",
    "skills.practice5": "Giải quyết bài CTF",
    "skills.toolsTitle": "Công cụ",
    "projects.eyebrow": "Dự án",
    "projects.title": "Các dự án học thuật và thực hành bảo mật",
    "projects.subtitle": "Một số dự án tiêu biểu tập trung vào hạ tầng, giám sát mạng, bảo mật hệ thống và phát hiện xâm nhập.",
    "projects.p1Type": "Dự án hạ tầng",
    "projects.p1Title": "Thiết kế và triển khai giải pháp High Availability (HA) cho các dịch vụ mạng trên Windows Server 2019",
    "projects.p1Desc": "Thiết kế và triển khai giải pháp HA cho các dịch vụ mạng trên Windows Server 2019, tập trung vào tính dự phòng, tính liên tục và khả năng vận hành ổn định của hệ thống.",
    "projects.p2Type": "Bảo mật hệ thống",
    "projects.p2Title": "Triển khai và đánh giá bảo mật hệ thống Linux bằng Lynis",
    "projects.p2Desc": "Triển khai môi trường Linux và sử dụng Lynis để kiểm tra, đánh giá và cải thiện mức độ an toàn của hệ thống thông qua hardening và rà soát cấu hình.",
    "projects.p3Type": "Dự án giám sát",
    "projects.p3Title": "Thiết kế và triển khai hệ thống giám sát mạng với LibreNMS",
    "projects.p3Desc": "Xây dựng hệ thống giám sát mạng bằng LibreNMS để theo dõi trạng thái thiết bị, khả năng sẵn sàng của mạng và hoạt động hệ thống trên một dashboard tập trung.",
    "projects.p4Type": "Dự án phát hiện",
    "projects.p4Title": "Thiết kế và triển khai hệ thống phát hiện xâm nhập mạng dựa trên AI sử dụng pfSense Firewall và ELK Stack",
    "projects.p4Desc": "Thiết kế quy trình phát hiện xâm nhập kết hợp pfSense và ELK Stack để thu thập, phân tích và trực quan hóa các sự kiện an ninh mạng phục vụ phát hiện bất thường.",
    "writeups.eyebrow": "CTF Write-up",
    "writeups.title": "Ghi chú challenge và phương pháp giải",
    "writeups.subtitle": "Các thẻ dạng blog để ghi lại đề bài, bằng chứng, hướng khai thác và bài học rút ra.",
    "writeups.c1Cat": "Web Exploitation",
    "writeups.c1Title": "File Upload Vulnerability Lab",
    "writeups.easy": "Độ khó: Dễ",
    "writeups.medium": "Độ khó: Trung bình",
    "writeups.c1Desc": "Phân tích kiểm tra upload yếu, xác định đường dẫn thực thi và ghi lại các bước khai thác có kiểm soát.",
    "writeups.c2Cat": "Digital Forensics",
    "writeups.c2Title": "Điều tra Windows Registry",
    "writeups.c2Desc": "Rà soát artifact trong registry, dấu vết bị xóa, chỉ dấu persistence và quy trình trích xuất bằng chứng.",
    "writeups.c3Title": "Điều tra nguồn công khai",
    "writeups.c3Desc": "Sử dụng metadata công khai, manh mối nhìn thấy được và phương pháp tìm kiếm có cấu trúc, không vượt ranh giới riêng tư.",
    "writeups.c4Cat": "Reverse Engineering",
    "writeups.c4Title": "Phân tích binary cơ bản",
    "writeups.c4Desc": "Đọc hành vi chương trình, xác định strings, kiểm tra định dạng file và xây dựng quy trình phân tích lặp lại được.",
    "writeups.readMore": "Đọc thêm",
    "notes.eyebrow": "Sổ tay pentest",
    "notes.title": "Từ trinh sát đến báo cáo",
    "notes.subtitle": "Checklist thực hành khi học và kiểm thử trong lab được phép. Mở từng chủ đề để xem quy trình.",
    "notes.n1": "Hành vi PowerShell đáng ngờ",
    "notes.n2": "WMI Event Subscription",
    "notes.n3": "Thực thi từ xa kiểu PsExec",
    "notes.n4": "Persistence qua Registry",
    "notes.n5": "Viết decoder và rule Wazuh",
    "notes.n6": "Ánh xạ MITRE ATT&CK",
    "notes.n7": "Quy trình điều tra IOC",
    "notes.legendActive": "Điểm cảnh báo đang hoạt động",
    "notes.legendHover": "Rê chuột để xem sự kiện",
    "roadmap.eyebrow": "Lộ trình học",
    "roadmap.title": "Lộ trình hướng đến kiểm thử xâm nhập",
    "roadmap.subtitle": "Kế hoạch học dựa trên nền tảng mạng và hệ thống. Các mốc thể hiện hướng phát triển, không phải chứng chỉ hay thành tích đã hoàn thành.",
    "roadmap.s1": "Nền tảng mạng \u0026 HTTP",
    "roadmap.s2": "Linux, Windows \u0026 scripting",
    "roadmap.s3": "Phạm vi \u0026 liệt kê dịch vụ",
    "roadmap.s4": "Bảo mật ứng dụng web",
    "roadmap.s5": "Xác minh lỗ hổng",
    "roadmap.s6": "Lab leo thang đặc quyền",
    "roadmap.s7": "Thực hành quy trình hoàn chỉnh",
    "roadmap.s8": "Báo cáo \u0026 kiểm thử lại",
    "roadmap.s1Desc": "Ôn tập TCP/IP, DNS, định tuyến, TLS và vòng đời request/response HTTP.",
    "roadmap.s2Desc": "Củng cố tài khoản, phân quyền, dịch vụ, Bash và Python cho các tác vụ tự động hóa nhỏ trong lab.",
    "roadmap.s3Desc": "Xác định quy tắc kiểm thử, lập bản đồ bề mặt tấn công và luyện liệt kê dịch vụ bằng Nmap trong lab.",
    "roadmap.s4Desc": "Thực hành kiểm tra xác thực, phân quyền, đầu vào và phiên đăng nhập bằng Burp Suite trong lab.",
    "roadmap.s5Desc": "Tái hiện phát hiện trong lab có kiểm soát, thu thập bằng chứng và phân biệt cảnh báo sai với lỗi đã xác minh.",
    "roadmap.s6Desc": "Tìm hiểu cấu hình sai trên Linux/Windows, quyền dịch vụ và đường leo thang đặc quyền trong môi trường thực hành.",
    "roadmap.s7Desc": "Luyện CTF và lab Hack The Box, kết nối liệt kê dịch vụ, xác minh và tài liệu hóa rõ ràng.",
    "roadmap.s8Desc": "Viết báo cáo pentest có bằng chứng, tác động, khắc phục và kết quả kiểm thử lại; công bố write-up lab được phép.",
    "contact.eyebrow": "Liên hệ",
    "contact.title": "Kết nối và hợp tác",
    "contact.subtitle": "Dành cho dự án, write-up, lab và tài liệu học an toàn thông tin.",
    "contact.closing": "Luôn học hỏi. Luôn điều tra. Luôn cải thiện.",
    "footer.rights": "Cybersecurity portfolio.",
    "footer.backTop": "Lên đầu trang",
  },
};

let currentLanguage = "en";
let currentTheme = localStorage.getItem(STORAGE_KEYS.theme) || "dark";
let messageIndex = 0;

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

function translate(key) {
  return translations[currentLanguage][key] ?? translations.en[key] ?? key;
}

function applyLanguage(language) {
  currentLanguage = "en";
  localStorage.setItem(STORAGE_KEYS.language, currentLanguage);
  root.lang = currentLanguage;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = translate(element.dataset.i18n);
    if (typeof value === "string") element.textContent = value;
  });

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    const value = translate(element.dataset.i18nHtml);
    if (typeof value === "string") element.innerHTML = value;
  });

  if (langFlag) {
    langFlag.src = currentLanguage === "vi" ? "assets/flags/vn.svg" : "assets/flags/gb.svg";
    langFlag.alt = currentLanguage === "vi" ? "Vietnamese flag" : "UK flag";
  }
  if (langToggle) {
    langToggle.setAttribute("aria-pressed", String(currentLanguage === "vi"));
    langToggle.setAttribute(
      "aria-label",
      currentLanguage === "vi" ? "Switch to English" : "Switch to Vietnamese"
    );
  }

  messageIndex = 0;
  const messages = translate("terminal.messages");
  if (typingText && Array.isArray(messages)) typingText.textContent = messages[0];

  updateThemeButton();
}

function getPreferredTheme() {
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
  currentTheme = theme === "light" ? "light" : "dark";
  root.dataset.theme = currentTheme;
  localStorage.setItem(STORAGE_KEYS.theme, currentTheme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", currentTheme === "dark" ? "#080808" : "#f5f5f5");
  updateThemeButton();
}

function updateThemeButton() {
  if (!themeToggle) return;
  const isLight = currentTheme === "light";
  themeToggle.setAttribute("aria-checked", String(isLight));
  themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
}

applyTheme(getPreferredTheme());
applyLanguage(currentLanguage);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

if (langToggle) {
  langToggle.addEventListener("click", () => {
    applyLanguage(currentLanguage === "en" ? "vi" : "en");
  });
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove("open");
    navToggle.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("click", (event) => {
  if (!navLinks || !navToggle || !navLinks.classList.contains("open")) return;
  const clickedInsideNav = navLinks.contains(event.target) || navToggle.contains(event.target);
  if (!clickedInsideNav) {
    navLinks.classList.remove("open");
    navToggle.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );

  revealElements.forEach((element) => revealObserver.observe(element));

  const activeLinkObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navItems.forEach((link) => link.classList.remove("active"));
        const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add("active");
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach((section) => activeLinkObserver.observe(section));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

function rotateTerminalText() {
  const messages = translate("terminal.messages");
  if (!typingText || !Array.isArray(messages)) return;
  messageIndex = (messageIndex + 1) % messages.length;
  typingText.textContent = messages[messageIndex];
}

setInterval(rotateTerminalText, 2800);
// Hacker-style floating background symbols
(() => {
  const securityBgLayer = document.querySelector(".security-bg-icons");

  if (!securityBgLayer) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) return;

  const hackerSymbols = [
    "</>",
    "<script>",
    "</script>",
    "{ }",
    "[ ]",
    "( )",
    ">_",
    "$ sudo",
    "root@kali",
    "whoami",
    "nmap -sV",
    "tcpdump",
    "grep",
    "chmod +x",
    "0x00",
    "0x1F",
    "0xDEAD",
    "CVE",
    "IOC",
    "SOC",
    "SIEM",
    "WAZUH",
    "MITRE",
    "ATT&CK",
    "YARA",
    "PCAP",
    "HASH",
    "DNS",
    "TLS",
    "HTTP",
    "403",
    "404",
    "500",
    "ALERT",
    "RULE",
    "LOG",
    "SHA256",
    "PowerShell",
    "Sysmon",
    "EventID",
    "cmd.exe",
    "payload",
    "reverse shell",
    "priv_esc",
    "detect()",
    "scan()",
    "analyze()",
    "triage()"
  ];

  const colorClasses = ["cyan", "blue", "green", "muted", "strong"];

  function getSymbolCount() {
    if (window.innerWidth <= 480) return 12;
    if (window.innerWidth <= 768) return 18;
    if (window.innerWidth <= 1024) return 24;
    return 34;
  }

  function createHackerSymbol() {
    const symbol = document.createElement("span");
    const text = hackerSymbols[Math.floor(Math.random() * hackerSymbols.length)];
    const color = colorClasses[Math.floor(Math.random() * colorClasses.length)];

    symbol.className = `security-float-icon ${color}`;
    symbol.textContent = text;

    const x = Math.random() * 100;
    const y = 65 + Math.random() * 45;
    const drift = Math.round((Math.random() - 0.5) * 260);
    const rotate = Math.round((Math.random() - 0.5) * 42);
    const duration = 24 + Math.random() * 32;
    const delay = Math.random() * -duration;
    const blinkDuration = 2.4 + Math.random() * 3.2;
    const blinkDelay = Math.random() * -blinkDuration;
    const size = text.length > 10
      ? 10 + Math.random() * 5
      : 12 + Math.random() * 10;
    const isLightTheme = document.documentElement.dataset.theme === "light";
    const opacity = isLightTheme
      ? 0.22 + Math.random() * 0.16
      : 0.08 + Math.random() * 0.12;

    symbol.style.setProperty("--x", `${x.toFixed(2)}vw`);
    symbol.style.setProperty("--y", `${y.toFixed(2)}vh`);
    symbol.style.setProperty("--drift", `${drift}px`);
    symbol.style.setProperty("--rotate", `${rotate}deg`);
    symbol.style.setProperty("--duration", `${duration.toFixed(2)}s`);
    symbol.style.setProperty("--delay", `${delay.toFixed(2)}s`);
    symbol.style.setProperty("--blink-duration", `${blinkDuration.toFixed(2)}s`);
    symbol.style.setProperty("--blink-delay", `${blinkDelay.toFixed(2)}s`);
    symbol.style.setProperty("--size", `${size.toFixed(0)}px`);
    symbol.style.setProperty("--opacity", opacity.toFixed(2));

    return symbol;
  }

  function renderHackerSymbols() {
    securityBgLayer.innerHTML = "";

    const count = getSymbolCount();

    for (let i = 0; i < count; i += 1) {
      securityBgLayer.appendChild(createHackerSymbol());
    }
  }

  let resizeTimer;

  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        renderHackerSymbols();
      }, 300);
    },
    { passive: true }
  );

  renderHackerSymbols();
})();
// Link YAML skill lines with technology cards
(() => {
  const techLines = document.querySelectorAll(".code-line[data-tech]");
  const techCards = document.querySelectorAll(".tech-item[data-tech-card]");

  if (!techLines.length || !techCards.length) return;

  function clearTechHighlights() {
    techLines.forEach((line) => line.classList.remove("is-linked"));
    techCards.forEach((card) => card.classList.remove("is-linked"));
  }

  function highlightTech(tech) {
    clearTechHighlights();

    document
      .querySelectorAll(`.code-line[data-tech="${tech}"]`)
      .forEach((line) => line.classList.add("is-linked"));

    document
      .querySelectorAll(`.tech-item[data-tech-card="${tech}"]`)
      .forEach((card) => card.classList.add("is-linked"));
  }

  techLines.forEach((line) => {
    line.addEventListener("mouseenter", () => {
      highlightTech(line.dataset.tech);
    });

    line.addEventListener("mouseleave", clearTechHighlights);
  });

  techCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      highlightTech(card.dataset.techCard);
    });

    card.addEventListener("mouseleave", clearTechHighlights);
  });
})();
// Skills console panel switch + linked technology highlights
(() => {
  const navButtons = document.querySelectorAll(".console-nav-item[data-skill-panel]");
  const panels = document.querySelectorAll(".skills-panel[data-panel]");
  const skillCards = document.querySelectorAll(".skill-detail-card");
  const techSources = document.querySelectorAll("[data-tech]");
  const techCards = document.querySelectorAll(".tech-item[data-tech-card]");

  if (!navButtons.length || !panels.length) return;

  function clearTechHighlights() {
    techCards.forEach((card) => card.classList.remove("is-linked"));
    techSources.forEach((item) => item.classList.remove("is-linked"));
  }

  function highlightTech(tech) {
    clearTechHighlights();

    document.querySelectorAll(`[data-tech="${tech}"]`).forEach((item) => {
      item.classList.add("is-linked");
    });

    document.querySelectorAll(`.tech-item[data-tech-card="${tech}"]`).forEach((card) => {
      card.classList.add("is-linked");
    });
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const panelName = button.dataset.skillPanel;

      navButtons.forEach((item) => item.classList.remove("active"));
      panels.forEach((panel) => panel.classList.remove("active"));

      button.classList.add("active");
      document.querySelector(`.skills-panel[data-panel="${panelName}"]`)?.classList.add("active");
      clearTechHighlights();
    });
  });

  skillCards.forEach((card) => {
    card.addEventListener("click", () => {
      skillCards.forEach((item) => {
        if (item !== card) item.classList.remove("open");
      });

      card.classList.toggle("open");
    });
  });

  techSources.forEach((source) => {
    source.addEventListener("mouseenter", () => highlightTech(source.dataset.tech));
    source.addEventListener("mouseleave", clearTechHighlights);
  });

  techCards.forEach((card) => {
    card.addEventListener("mouseenter", () => highlightTech(card.dataset.techCard));
    card.addEventListener("mouseleave", clearTechHighlights);
  });
})();

// Final Skills dashboard interaction: tabs + technology highlighting
(() => {
  const tabs = document.querySelectorAll('.skill-mode-tab[data-skill-mode]');
  const panels = document.querySelectorAll('.skill-mode-panel[data-skill-panel]');
  const highlightSources = document.querySelectorAll('.capability-unit[data-tech-targets], .tool-tile-pro[data-tech-targets]');
  const techCards = document.querySelectorAll('.tech-orb[data-tech-card]');

  if (!tabs.length || !panels.length) return;

  function clearHighlights() {
    highlightSources.forEach((item) => item.classList.remove('is-linked'));
    techCards.forEach((card) => card.classList.remove('is-linked'));
  }

  function highlightTargets(targetString, source) {
    clearHighlights();
    if (source) source.classList.add('is-linked');
    const targets = (targetString || '').split(/\s+/).filter(Boolean);
    targets.forEach((target) => {
      document.querySelectorAll(`.tech-orb[data-tech-card="${target}"]`).forEach((card) => {
        card.classList.add('is-linked');
      });
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.skillMode;
      tabs.forEach((item) => item.classList.remove('active'));
      panels.forEach((panel) => panel.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.skill-mode-panel[data-skill-panel="${mode}"]`)?.classList.add('active');
      clearHighlights();
    });
  });

  highlightSources.forEach((source) => {
    source.addEventListener('mouseenter', () => highlightTargets(source.dataset.techTargets, source));
    source.addEventListener('mouseleave', clearHighlights);
    source.addEventListener('focusin', () => highlightTargets(source.dataset.techTargets, source));
    source.addEventListener('focusout', clearHighlights);
  });

  techCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      const tech = card.dataset.techCard;
      clearHighlights();
      card.classList.add('is-linked');
      highlightSources.forEach((source) => {
        if ((source.dataset.techTargets || '').split(/\s+/).includes(tech)) {
          source.classList.add('is-linked');
        }
      });
    });
    card.addEventListener('mouseleave', clearHighlights);
  });
})();
