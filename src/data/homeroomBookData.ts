import { HomeroomBookData } from '../types';

export const INITIAL_HOMEROOM_BOOK_DATA: HomeroomBookData = {
  academicYear: 'Năm học 2025 - 2026',
  plan: {
    totalStudentsStart: 36,
    totalStudentsEnd: 36,
    maleCount: 18,
    femaleCount: 18,
    unionMembersCount: 36,
    ethnicMinorityCount: 1,
    policyBeneficiaryCount: 2,
    poorHouseholdCount: 1,
    specialHealthCount: 4, // 3 bạn cận thị nặng, 1 bạn tiền sử hen suyễn nhẹ
    
    advantages: [
      '100% học sinh đều là Đoàn viên TNCS Hồ Chí Minh, có ý thức tổ chức kỷ luật và nề nếp đạo đức tốt.',
      'Tập thể lớp chọn khối Khoa học Tự nhiên (KHTN), đa số các em có năng lực tư duy Toán, Lý, Hóa vượt trội.',
      'Ban đại diện Cha mẹ học sinh rất nhiệt tình, trách nhiệm, luôn đồng hành và phối hợp chặt chẽ với GVCN trong mọi hoạt động.',
      'Đội ngũ Giáo viên bộ môn giảng dạy khối 12 giàu kinh nghiệm luyện thi Tốt nghiệp THPT và Đánh giá Năng lực.',
      'Cơ sở vật chất phòng học 302 khang trang, đầy đủ máy chiếu, điều hòa, quạt mát, internet tốc độ cao phục vụ chuyển đổi số.'
    ],
    difficulties: [
      'Áp lực học tập năm cuối cấp rất lớn đối với kỳ thi Tốt nghiệp THPT 2026 và xét tuyển Đại học.',
      'Một số học sinh còn bị lệch điểm ở môn Ngữ Văn và Tiếng Anh so với các môn Tự nhiên.',
      'Khoảng 3-4 học sinh nhà ở xa trường (khu vực Kiến Thụy, An Dương), việc đi lại trong mùa mưa bão gặp khó khăn.',
      'Tâm lý lứa tuổi 18 đôi lúc dễ bị căng thẳng, áp lực chọn ngành nghề cần GVCN và chuyên gia tâm lý tư vấn thường xuyên.'
    ],
    
    academicTargets: {
      excellent: 75.0, // 27/36 học sinh Xuất sắc & Giỏi
      good: 25.0,      // 9/36 học sinh Khá
      average: 0.0,
      weak: 0.0
    },
    conductTargets: {
      good: 97.2,      // 35/36 học sinh xếp loại Tốt
      fair: 2.8,       // 1/36 học sinh xếp loại Khá
      average: 0.0,
      weak: 0.0
    },
    graduationTargetPercent: 100,
    universityAdmissionTargetPercent: 92.5,
    hsgAwardsTarget: 'Đạt từ 5 - 8 giải Học sinh Giỏi cấp Trường và 2 - 4 giải cấp Thành phố (các môn Toán, Lý, Hóa, Sinh, Tin).',
    classEmulationTitleTarget: 'Tập thể Lớp Tiên tiến Xuất sắc dẫn đầu Khối 12 - Chi đoàn Vững mạnh Xuất sắc nhận Giấy khen của Quận Đoàn.',
    
    keyMeasures: {
      morality: 'Tăng cường giáo dục truyền thống nhà trường THPT Trần Nguyên Hãn, lý tưởng sống cao đẹp, tinh thần yêu nước, văn hóa ứng xử văn minh trong không gian mạng và đời sống học đường.',
      studyQuality: 'Thực hiện nghiêm túc quy chế học tập, duy trì 15 phút truy bài đầu giờ chất lượng. Triển khai mô hình "Đôi bạn cùng tiến", giao học sinh giỏi kèm cặp học sinh còn yếu môn phụ. Tổ chức thi thử định kỳ đánh giá sát năng lực.',
      cooperation: 'Duy trì kết nối 3 bên: GVCN - Phụ huynh - GV Bộ môn qua Sổ liên lạc điện tử và Zalo nhóm. Tổ chức họp PHHS định kỳ 3 lần/năm và các buổi tiếp xúc riêng với PHHS học sinh cần quan tâm.',
      selfManagement: 'Phát huy tối đa năng lực tự quản của Ban cán sự lớp, 4 Tổ trưởng và Ban Chấp hành Chi đoàn. Xây dựng môi trường lớp học dân chủ, kỷ cương, tình thương và trách nhiệm.'
    },
    
    monthlyThemes: [
      {
        month: 'Tháng 9/2025',
        theme: 'Chào năm học mới & Ổn định tổ chức',
        focusTasks: 'Bầu Ban cán sự lớp, kiện toàn Chi đoàn. Phổ biến nội quy, biên chế 4 Tổ, lập sơ đồ lớp và TKB 2 buổi. Khảo sát chất lượng đầu năm.'
      },
      {
        month: 'Tháng 10/2025',
        theme: 'Thi đua Chăm ngoan - Học tốt',
        focusTasks: 'Phát động phong trào "Hoa điểm 10", chuẩn bị tham gia kỳ thi chọn HSG cấp trường. Kiểm tra nề nếp sổ đầu bài và vệ sinh trực nhật.'
      },
      {
        month: 'Tháng 11/2025',
        theme: 'Tôn sư trọng đạo - Tri ân thầy cô 20/11',
        focusTasks: 'Hội thi văn nghệ, thiết kế báo tường số chào mừng Ngày Nhà giáo Việt Nam 20/11. Thi giữa Học kỳ 1. Họp giao ban BGH.'
      },
      {
        month: 'Tháng 12/2025',
        theme: 'Ôn tập & Kiểm tra Cuối Học kỳ 1',
        focusTasks: 'Tổng kết điểm học kỳ 1, đánh giá 2 mặt giáo dục. Sơ kết công tác thi đua đợt 1. Họp Phụ huynh học sinh sơ kết HK1.'
      },
      {
        month: 'Tháng 1/2026',
        theme: 'Xuân tình nguyện & Khởi động HK2',
        focusTasks: 'Triển khai kế hoạch học kỳ 2. Hoạt động thiện nguyện "Tết yêu thương" giúp đỡ các bạn có hoàn cảnh khó khăn.'
      },
      {
        month: 'Tháng 2/2026',
        theme: 'Tiến bước lên Đoàn & Hội thao trường',
        focusTasks: 'Tăng tốc ôn luyện chuyên đề TN THPT. Tổ chức hướng nghiệp, giới thiệu các phương thức xét tuyển sớm Đại học 2026.'
      },
      {
        month: 'Tháng 3/2026',
        theme: 'Tháng Thanh Niên - Khát vọng tuổi 18',
        focusTasks: 'Kỷ niệm 95 năm Ngày thành lập Đoàn (26/3). Tổ chức Lễ Trưởng thành tuổi 18 và thi thử ĐGNL Đại học Quốc gia.'
      },
      {
        month: 'Tháng 4/2026',
        theme: 'Về đích - Kiểm tra Cuối Học kỳ 2',
        focusTasks: 'Hoàn thành chương trình lớp 12. Kiểm tra cuối HK2, tổng hợp đánh giá xếp loại cả năm học. Tư vấn đăng ký nguyện vọng xét tuyển ĐH.'
      },
      {
        month: 'Tháng 5/2026',
        theme: 'Tri ân & Trưởng thành - Tốt nghiệp THPT',
        focusTasks: 'Lễ Tri ân và Trưởng thành niên khóa 2023 - 2026. Chốt học bạ, hoàn tất hồ sơ dự thi Tốt nghiệp THPT quốc gia.'
      }
    ]
  },
  
  committee: [
    {
      roleName: 'Lớp trưởng',
      studentId: 'hs-05',
      studentName: 'Lê Hải Yến',
      phone: '0912345682',
      mainDuty: 'Bao quát toàn bộ hoạt động lớp, điều hành sinh hoạt lớp cuối tuần, đại diện lớp liên hệ với BGH và Đoàn trường.'
    },
    {
      roleName: 'Lớp phó Học tập',
      studentId: 'hs-01',
      studentName: 'Nguyễn Hoàng Long',
      phone: '0912345678',
      mainDuty: 'Quản lý 15 phút truy bài, đôn đốc nộp bài tập về nhà, phụ trách giải đáp bài tập khó và nhóm thi HSG Toán - KHTN.'
    },
    {
      roleName: 'Lớp phó Lao động & Đời sống',
      studentId: 'hs-12',
      studentName: 'Đặng Quốc Bảo',
      phone: '0912345689',
      mainDuty: 'Kiểm tra phân công trực nhật 8 ca/tuần, giữ gìn vệ sinh phòng học 302, quản lý tài sản, quạt, đèn và điều hòa.'
    },
    {
      roleName: 'Lớp phó Văn Thể Mỹ',
      studentId: 'hs-17',
      studentName: 'Phạm Quỳnh Anh',
      phone: '0912345694',
      mainDuty: 'Phụ trách phong trào văn nghệ, hội diễn 20/11, báo tường, hội thao và tổ chức sinh nhật hàng tháng cho thành viên.'
    },
    {
      roleName: 'Bí thư Chi đoàn 12A1',
      studentId: 'hs-10',
      studentName: 'Đỗ Hải Đăng',
      phone: '0912345687',
      mainDuty: 'Chủ trì công tác Đoàn, sổ Đoàn viên, thu nộp đoàn phí, phong trào thanh niên tình nguyện và quản lý thi đua các tổ.'
    },
    {
      roleName: 'Phó Bí thư Chi đoàn',
      studentId: 'hs-21',
      studentName: 'Bùi Minh Triết',
      phone: '0912345698',
      mainDuty: 'Hỗ trợ công tác Đoàn, quản lý phong trào rèn luyện đạo đức và chuyên đề hướng nghiệp tuổi 18.'
    },
    {
      roleName: 'Thủ quỹ Lớp',
      studentId: 'hs-08',
      studentName: 'Ngô Bảo Châu',
      phone: '0912345685',
      mainDuty: 'Quản lý thu chi quỹ lớp công khai minh bạch theo kế hoạch đã thống nhất với Ban đại diện CMHS.'
    },
    {
      roleName: 'Tổ trưởng Tổ 1',
      studentId: 'hs-01',
      studentName: 'Nguyễn Hoàng Long',
      phone: '0912345678',
      mainDuty: 'Quản lý nề nếp, chuyên cần, phân công trực nhật và chấm điểm thi đua 9 bạn Tổ 1 (Dãy 1).'
    },
    {
      roleName: 'Tổ trưởng Tổ 2',
      studentId: 'hs-10',
      studentName: 'Đỗ Hải Đăng',
      phone: '0912345687',
      mainDuty: 'Quản lý nề nếp, chuyên cần, phân công trực nhật và chấm điểm thi đua 9 bạn Tổ 2 (Dãy 2).'
    },
    {
      roleName: 'Tổ trưởng Tổ 3',
      studentId: 'hs-19',
      studentName: 'Vũ Đức Trọng',
      phone: '0912345696',
      mainDuty: 'Quản lý nề nếp, chuyên cần, phân công trực nhật và chấm điểm thi đua 9 bạn Tổ 3 (Dãy 3).'
    },
    {
      roleName: 'Tổ trưởng Tổ 4',
      studentId: 'hs-28',
      studentName: 'Hoàng Nhật Minh',
      phone: '0912345705',
      mainDuty: 'Quản lý nề nếp, chuyên cần, phân công trực nhật và chấm điểm thi đua 9 bạn Tổ 4 (Dãy 4).'
    }
  ],
  
  parentsBoard: [
    {
      id: 'pb-01',
      role: 'Trưởng ban',
      fullName: 'Ông Nguyễn Văn Hùng',
      studentId: 'hs-01',
      studentName: 'Nguyễn Hoàng Long (Tổ 1)',
      phone: '0988.776.655',
      workplace: 'Tổng Công ty Cảng Hải Phòng - Trưởng phòng Điều độ',
      notes: 'Trách nhiệm cao, tâm huyết, kết nối phụ huynh toàn lớp rất tốt.'
    },
    {
      id: 'pb-02',
      role: 'Phó ban',
      fullName: 'Bà Trần Thị Bích Thảo',
      studentId: 'hs-05',
      studentName: 'Lê Hải Yến (Tổ 1)',
      phone: '0977.654.321',
      workplace: 'Ngân hàng TMCP Ngoại thương (Vietcombank CN Hải Phòng) - Phó GĐ Phòng GD',
      notes: 'Phụ trách công tác tài chính, hậu cần và các sự kiện ngoại khóa của lớp.'
    },
    {
      id: 'pb-03',
      role: 'Phó ban',
      fullName: 'Ông Đỗ Quốc Tuấn',
      studentId: 'hs-10',
      studentName: 'Đỗ Hải Đăng (Tổ 2)',
      phone: '0913.224.466',
      workplace: 'Bệnh viện Hữu nghị Việt Tiệp Hải Phòng - Bác sĩ CKI Ngoại khoa',
      notes: 'Tư vấn chăm sóc sức khỏe học đường và dinh dưỡng mùa thi cho học sinh.'
    },
    {
      id: 'pb-04',
      role: 'Ủy viên',
      fullName: 'Bà Vũ Minh Nguyệt',
      studentId: 'hs-19',
      studentName: 'Vũ Đức Trọng (Tổ 3)',
      phone: '0904.558.899',
      workplace: 'Trường Đại học Hàng hải Việt Nam - Giảng viên Khoa Kinh tế',
      notes: 'Hỗ trợ tư vấn hướng nghiệp và thông tin tuyển sinh Đại học 2026.'
    },
    {
      id: 'pb-05',
      role: 'Ủy viên',
      fullName: 'Ông Hoàng Đình Phúc',
      studentId: 'hs-28',
      studentName: 'Hoàng Nhật Minh (Tổ 4)',
      phone: '0912.889.900',
      workplace: 'Công ty CP Nhựa Tiền Phong Hải Phòng - Trưởng ban Kỹ thuật',
      notes: 'Đại diện phụ huynh Tổ 4, hỗ trợ công tác an ninh, trật tự và đưa đón học sinh.'
    }
  ],
  
  subjectTeachers: [
    {
      id: 'st-01',
      subjectName: 'Toán Học (GVCN)',
      teacherName: 'Thầy Nguyễn Văn An',
      phone: '0912.345.678',
      email: 'nguyenvanan.gv@tnh.edu.vn',
      periodsPerWeek: 5,
      notes: 'Chủ nhiệm lớp 12A1, Thạc sĩ Toán học, Tổ phó chuyên môn.'
    },
    {
      id: 'st-02',
      subjectName: 'Vật Lý',
      teacherName: 'Thầy Trần Quốc Tuấn',
      phone: '0903.112.233',
      email: 'tranquoctuan.gv@tnh.edu.vn',
      periodsPerWeek: 4,
      notes: 'Giáo viên dạy giỏi cấp Thành phố, bồi dưỡng Đội tuyển HSG Lý.'
    },
    {
      id: 'st-03',
      subjectName: 'Hóa Học',
      teacherName: 'Cô Trần Thị Hương',
      phone: '0915.223.344',
      email: 'tranthihuong.gv@tnh.edu.vn',
      periodsPerWeek: 4,
      notes: 'Thạc sĩ Hóa học, chuyên đề Luyện thi Đại học khối A, B.'
    },
    {
      id: 'st-04',
      subjectName: 'Sinh Học',
      teacherName: 'Cô Hoàng Thu Hà',
      phone: '0982.334.455',
      email: 'hoangthuha.gv@tnh.edu.vn',
      periodsPerWeek: 2,
      notes: 'Tổ trưởng chuyên môn Sinh - Công nghệ.'
    },
    {
      id: 'st-05',
      subjectName: 'Ngữ Văn',
      teacherName: 'Cô Nguyễn Thị Minh Tuyết',
      phone: '0973.445.566',
      email: 'minhtuyet.gv@tnh.edu.vn',
      periodsPerWeek: 4,
      notes: 'Tổ phó chuyên môn Ngữ Văn, chuyên đề Nghị luận xã hội & văn học.'
    },
    {
      id: 'st-06',
      subjectName: 'Tiếng Anh',
      teacherName: 'Thầy David Phạm (Phạm Hoàng Long)',
      phone: '0936.556.677',
      email: 'davidpham.gv@tnh.edu.vn',
      periodsPerWeek: 3,
      notes: 'Chứng chỉ IELTS 8.5, luyện thi chứng chỉ quốc tế và tốt nghiệp THPT.'
    },
    {
      id: 'st-07',
      subjectName: 'Lịch Sử',
      teacherName: 'Cô Đặng Kim Oanh',
      phone: '0912.667.788',
      email: 'kimoanh.gv@tnh.edu.vn',
      periodsPerWeek: 2,
      notes: 'Giáo viên giàu kinh nghiệm đổi mới phương pháp giảng dạy tích hợp.'
    },
    {
      id: 'st-08',
      subjectName: 'Địa Lý',
      teacherName: 'Thầy Lê Quang Đạt',
      phone: '0988.778.899',
      email: 'quangdat.gv@tnh.edu.vn',
      periodsPerWeek: 2,
      notes: 'Ứng dụng bản đồ số và Atlat trong dạy học Địa lý 12.'
    },
    {
      id: 'st-09',
      subjectName: 'GDKT & Pháp Luật',
      teacherName: 'Cô Bùi Bích Phương',
      phone: '0904.889.900',
      email: 'bichphuong.gv@tnh.edu.vn',
      periodsPerWeek: 1,
      notes: 'Tuyên truyền phổ biến pháp luật và kiến thức kinh tế học đường.'
    },
    {
      id: 'st-10',
      subjectName: 'Tin Học',
      teacherName: 'Thầy Vũ Mạnh Hùng',
      phone: '0918.990.011',
      email: 'manhhung.gv@tnh.edu.vn',
      periodsPerWeek: 2,
      notes: 'Phụ trách phòng Lab Tin học và hệ thống học trực tuyến EdTech.'
    },
    {
      id: 'st-11',
      subjectName: 'Giáo Dục Thể Chất',
      teacherName: 'Thầy Đoàn Trọng Tấn',
      phone: '0979.001.122',
      email: 'trongtan.gv@tnh.edu.vn',
      periodsPerWeek: 2,
      notes: 'HLV Đội tuyển Bóng rổ - Bóng đá học sinh trường.'
    },
    {
      id: 'st-12',
      subjectName: 'Giáo Dục QP-AN',
      teacherName: 'Thầy Nguyễn Hữu Thắng',
      phone: '0983.112.244',
      email: 'huuthang.gv@tnh.edu.vn',
      periodsPerWeek: 1,
      notes: 'Sĩ quan biệt phái - Huấn luyện điều lệnh và bắn súng điện tử.'
    }
  ],
  
  specialStudents: [
    {
      id: 'sp-01',
      studentId: 'hs-15',
      studentName: 'Vũ Quốc Khánh (Tổ 2)',
      category: 'Học tập yếu',
      reasons: 'Điểm môn Tiếng Anh và Hóa học đầu năm còn yếu (dưới 6.0), dễ mất tập trung trong giờ tự học.',
      supportPlan: 'Xếp ngồi cùng bàn với em Nguyễn Hoàng Long (giỏi Toán - KHTN) và Bùi Minh Triết (giỏi Tiếng Anh). GVCN gặp riêng phụ đạo vào chiều Thứ 5 hàng tuần.',
      followUpNotes: [
        {
          date: '2025-10-15',
          progress: 'Đã hoàn thành đầy đủ bài tập về nhà môn Hóa, điểm kiểm tra 15 phút đạt 7.5 điểm.',
          evaluatedBy: 'Cô Trần Thị Hương (GV Hóa)'
        },
        {
          date: '2025-11-20',
          progress: 'Tiến bộ rõ rệt trong giờ tiếng Anh, tích cực xung phong phát biểu từ vựng.',
          evaluatedBy: 'Thầy David Phạm'
        }
      ]
    },
    {
      id: 'sp-02',
      studentId: 'hs-22',
      studentName: 'Nguyễn Thị Mai Lan (Tổ 3)',
      category: 'Hoàn cảnh khó khăn',
      reasons: 'Gia đình thuộc diện cận nghèo, bố mất sớm, mẹ bán hàng rong nuôi 3 con ăn học.',
      supportPlan: 'Đề xuất nhà trường miễn giảm 100% các khoản đóng góp tự nguyện, trao học bổng "Thắp sáng ước mơ" trị giá 3.000.000đ/học kỳ. Lớp hỗ trợ tặng trọn bộ sách giáo khoa và dụng cụ học tập.',
      followUpNotes: [
        {
          date: '2025-09-28',
          progress: 'Đã hoàn tất thủ tục nhận học bổng của Hội Khuyến học trường THPT Trần Nguyên Hãn.',
          evaluatedBy: 'Thầy Nguyễn Văn An (GVCN)'
        },
        {
          date: '2025-12-10',
          progress: 'Em rất chăm ngoan, đạt học lực Giỏi và được Chi đoàn tuyên dương gương vượt khó vươn lên.',
          evaluatedBy: 'Bí thư Đoàn Trường'
        }
      ]
    },
    {
      id: 'sp-03',
      studentId: 'hs-03',
      studentName: 'Trần Minh Đức (Tổ 1)',
      category: 'Sức khỏe đặc biệt',
      reasons: 'Cận thị nặng 5.5 độ và có tiền sử hen suyễn do thời tiết lạnh.',
      supportPlan: 'Bố trí ngồi bàn 1 dãy 2 (trung tâm, gần bảng và đủ ánh sáng). Nhắc nhở giữ ấm vào mùa đông, miễn các bài chạy bền nặng trong giờ Giáo dục thể chất khi thời tiết chuyển mùa.',
      followUpNotes: [
        {
          date: '2025-10-05',
          progress: 'Sức khỏe ổn định, vị trí ngồi thuận lợi nhìn rõ bảng, tiếp thu bài tốt.',
          evaluatedBy: 'Bác sĩ Y tế Học đường'
        }
      ]
    },
    {
      id: 'sp-04',
      studentId: 'hs-01',
      studentName: 'Nguyễn Hoàng Long (Tổ 1)',
      category: 'Năng khiếu đặc biệt',
      reasons: 'Tư duy Toán học và Lập trình xuất sắc, đạt giải Nhì HSG Toán cấp Thành phố.',
      supportPlan: 'Bồi dưỡng chuyên sâu trong Đội tuyển HSG Quốc gia, hướng dẫn tham gia kỳ thi Tin học trẻ và tạo điều kiện nghiên cứu khoa học kỹ thuật (KHKT).',
      followUpNotes: [
        {
          date: '2025-11-15',
          progress: 'Đạt điểm tuyệt đối 10.0 trong kỳ khảo sát đội tuyển HSG Toán của Sở GD&ĐT.',
          evaluatedBy: 'Tổ trưởng Chuyên môn Toán'
        }
      ]
    }
  ],
  
  inspections: [
    {
      id: 'insp-01',
      inspectionDate: '2025-09-30',
      period: 'Đầu năm học',
      inspectorName: 'TS. Lê Thị Mai',
      inspectorRole: 'Phó Hiệu Trưởng - Phụ trách Khối 12',
      evaluationContent: 'Sổ Chủ nhiệm được thiết lập đầy đủ, khoa học theo đúng Thông tư của Bộ GD&ĐT. Các thông tin trích ngang, sơ đồ lớp, kế hoạch năm học và phân công ban cán sự rất chi tiết, có tính khả thi cao.',
      strengths: 'Kế hoạch hóa rõ ràng theo từng tháng, có giải pháp cụ thể cho học sinh đặc biệt và mô hình đôi bạn cùng tiến.',
      recommendations: 'Tiếp tục theo dõi sát sao việc phối hợp với Ban đại diện CMHS trong công tác tư vấn hướng nghiệp chọn ngành lớp 12.',
      rating: 'Xuất sắc',
      signed: true,
      signatureDate: '2025-09-30'
    },
    {
      id: 'insp-02',
      inspectionDate: '2025-11-15',
      period: 'Tháng 10',
      inspectorName: 'TS. Lê Thị Mai',
      inspectorRole: 'Phó Hiệu Trưởng - Phụ trách Khối 12',
      evaluationContent: 'Cập nhật kịp thời kết quả học tập giữa kỳ 1, theo dõi nề nếp và sổ đầu bài chuẩn mực. Điểm rèn luyện thi đua của 4 tổ được ghi chép minh bạch, công bằng.',
      strengths: 'Phong trào thi đua chào mừng 20/11 sôi nổi, lớp đạt giải Nhất báo tường số.',
      recommendations: 'Nhắc nhở giáo viên bộ môn ký duyệt điểm và sổ đầu bài đầy đủ sau mỗi tiết dạy.',
      rating: 'Xuất sắc',
      signed: true,
      signatureDate: '2025-11-15'
    },
    {
      id: 'insp-03',
      inspectionDate: '2026-01-10',
      period: 'Cuối Học kỳ 1',
      inspectorName: 'TS. Lê Thị Mai',
      inspectorRole: 'Phó Hiệu Trưởng - Phụ trách Khối 12',
      evaluationContent: 'Hoàn thành đánh giá 2 mặt giáo dục Học kỳ 1 đúng tiến độ. Tỷ lệ học sinh Xuất sắc và Giỏi đạt 77.8% (vượt chỉ tiêu đầu năm). Hồ sơ trích lục, biên bản họp CMHS đầy đủ.',
      strengths: 'Chất lượng học tập môn Toán, Lý, Hóa dẫn đầu toàn khối 12 của trường.',
      recommendations: 'Xây dựng kế hoạch ôn tập nước rút HK2 cho các em có nguyện vọng thi khối A00, A01, B00 và D01.',
      rating: 'Xuất sắc',
      signed: true,
      signatureDate: '2026-01-10'
    }
  ],
  
  meetingMinutes: [
    {
      id: 'min-01',
      title: 'Biên Bản Họp Cha Mẹ Học Sinh Đầu Năm Học 2025 - 2026',
      meetingType: 'Họp Phụ huynh đầu năm',
      date: '2025-09-14',
      time: '08:00 - 10:30',
      location: 'Phòng học 302 - Nhà A, THPT Trần Nguyên Hãn',
      attendeesCount: '36/36 Phụ huynh (100% có mặt)',
      presidedBy: 'Thầy Nguyễn Văn An (GVCN)',
      secretary: 'Bà Trần Thị Bích Thảo (Phụ huynh em Lê Hải Yến)',
      mainContent: `1. GVCN báo cáo đặc điểm tình hình lớp 12A1, kết quả năm học lớp 11 và mục tiêu trọng tâm năm học cuối cấp 2025 - 2026.
2. Thông qua kế hoạch giáo dục, thời khóa biểu 2 buổi/ngày, chương trình ôn thi Tốt nghiệp THPT và chuẩn bị cho kỳ thi Đánh giá năng lực ĐHQG.
3. Bầu Ban đại diện Cha mẹ học sinh lớp năm học 2025 - 2026 gồm 5 thành viên (Trưởng ban: Ông Nguyễn Văn Hùng).
4. Thảo luận và thống nhất các biện pháp phối hợp giữa Gia đình và Nhà trường trong việc quản lý giờ giấc tự học, chế độ dinh dưỡng mùa thi và sử dụng điện thoại thông minh.`,
      resolutions: '100% Phụ huynh nhất trí với phương hướng hoạt động và chỉ tiêu năm học 2025 - 2026 của lớp 12A1. Thống nhất lập kênh Zalo liên lạc riêng và sử dụng Sổ liên lạc điện tử nhà trường.'
    },
    {
      id: 'min-02',
      title: 'Biên Bản Họp Cha Mẹ Học Sinh Sơ Kết Học Kỳ 1',
      meetingType: 'Họp Phụ huynh cuối HK1',
      date: '2026-01-08',
      time: '08:00 - 10:00',
      location: 'Phòng học 302 - Nhà A, THPT Trần Nguyên Hãn',
      attendeesCount: '36/36 Phụ huynh (100% có mặt)',
      presidedBy: 'Thầy Nguyễn Văn An (GVCN)',
      secretary: 'Bà Trần Thị Bích Thảo (Phụ huynh em Lê Hải Yến)',
      mainContent: `1. Báo cáo kết quả 2 mặt giáo dục Học kỳ 1:
   - Học lực/KQHT: Xuất sắc & Giỏi: 28 em (77.8%), Khá: 8 em (22.2%), không có học sinh TB/Yếu.
   - Hạnh kiểm/KQRL: Tốt: 35 em (97.2%), Khá: 1 em (2.8%).
   - Khen thưởng: Tuyên dương 10 học sinh có thành tích xuất sắc nhất lớp và 4 bạn tiến bộ vượt bậc.
2. Ban đại diện CMHS báo cáo công khai minh bạch tài chính quỹ lớp HK1.
3. GVCN tư vấn định hướng chọn khối thi, ngành học và các phương thức xét tuyển sớm Đại học đợt 1 năm 2026.`,
      resolutions: 'Biên bản được thông qua với sự đồng thuận 100%. Phụ huynh bày tỏ sự tin tưởng và cảm ơn sâu sắc tới BGH, GVCN và các thầy cô giáo bộ môn.'
    }
  ],
  
  snapshots: [
    {
      id: 'snap-01',
      title: 'Hồ Sơ Sổ Chủ Nhiệm - Bản Chốt Đầu Năm Học',
      createdAt: '2025-09-30 16:30',
      period: 'Chốt sổ Đầu năm học',
      createdBy: 'Thầy Nguyễn Văn An (GVCN 12A1)',
      note: 'Đã hoàn tất kiểm tra chéo thông tin 36 học sinh, TKB 2 buổi, sơ đồ 4 dãy bàn và chữ ký duyệt của BGH.',
      totalStudents: 36,
      gpaAverage: 8.85,
      goodConductPercent: 97.2
    },
    {
      id: 'snap-02',
      title: 'Hồ Sơ Sổ Chủ Nhiệm - Bản Sơ Kết Học Kỳ 1 (Báo Cáo BGH)',
      createdAt: '2026-01-10 11:15',
      period: 'Chốt sổ Cuối HK1',
      createdBy: 'Thầy Nguyễn Văn An (GVCN 12A1)',
      note: 'Dữ liệu điểm thi HK1, sổ đầu bài, nề nếp thi đua 4 tổ và biên bản họp PHHS đã được số hóa và ký duyệt điện tử.',
      totalStudents: 36,
      gpaAverage: 8.92,
      goodConductPercent: 97.2
    }
  ],
  
  lastUpdated: new Date().toISOString()
};
