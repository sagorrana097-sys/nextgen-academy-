const STORAGE_KEY = 'nextgen_academy_erp_v1';

const DEFAULT_STATE = {
  lang: 'bn',
  theme: 'light',
  currentUser: null,
  academy: {
    name: 'NextGen Academy',
    director: 'মো: আলমগীর হোসেন (সাগর)',
    taglineBn: 'আধুনিক শিক্ষা ও স্মার্ট অ্যাকাডেমিক ব্যবস্থাপনা',
    taglineEn: 'Modern Learning & Smart Academic ERP',
    phone: '01792818005, 015812299984',
    email: 'Sagorrana097@gmail.com',
    address: 'লক্ষিপুরা রোড, বাস-স্ট্যান্ড, জয়দেবপুর, গাজীপুর।'
  },
  admissions: [
    {
      id: 'ADM-201',
      name: 'Nusrat Jahan',
      phone: '01711223344',
      studentClass: 'Class 10',
      group: 'Science',
      batch: 'Morning',
      status: 'Pending',
      createdAt: '2026-11-10'
    }
  ],
  students: [
    {
      id: 'STU-101',
      password: '123',
      name: 'Tanvir Ahmed',
      phone: '01811223344',
      guardianPhone: '01715556677',
      studentClass: 'Class 10',
      group: 'Science',
      batch: 'Morning',
      feeStatus: 'Paid',
      feeAmount: 2500,
      paymentMethod: 'bKash',
      paymentAccount: '01811223344',
      receiptNo: 'RCP-9001',
      verificationCode: 'NGA-VER-9001'
    }
  ],
  teachers: [
    {
      id: 'TCH-01',
      password: '123',
      name: 'Prof. Mahmudul Hasan',
      subject: 'Physics & Mathematics',
      phone: '01611223344',
      batch: 'Morning / Day'
    }
  ],
  fees: [
    {
      id: 'FEE-1',
      studentId: 'STU-101',
      studentName: 'Tanvir Ahmed',
      studentClass: 'Class 10',
      month: 'November 2026',
      amount: 2500,
      method: 'bKash',
      accountNo: '01811223344',
      status: 'Paid',
      receiptNo: 'RCP-9001',
      verificationCode: 'NGA-VER-9001',
      date: '2026-11-05'
    }
  ],
  exams: [
    {
      id: 'EXM-1',
      title: 'Physics Weekly Test - 04',
      studentClass: 'Class 10',
      group: 'Science',
      totalMarks: 100,
      obtainedMarks: 86,
      date: '2026-11-18',
      question: 'Newton’s second law states that F = ma. If m = 5 kg and a = 4 m/s², what is F (in N)?',
      answerKey: '20'
    }
  ],
  onlineClasses: [
    {
      id: 'CLS-1',
      topic: 'Higher Math: Vectors & Geometry',
      studentClass: 'Class 10',
      group: 'Science',
      teacherName: 'Prof. Mahmudul Hasan',
      date: '2026-11-20',
      time: '09:30 AM',
      link: 'https://meet.google.com/nextgen-math-10'
    }
  ],
  notices: [
    {
      id: 'NTC-1',
      title: 'Monthly Assessment & Fee Clearance Notice',
      body: 'All students of Class 6–12 are requested to complete November tuition fees and attend upcoming tests on schedule.',
      date: '2026-11-15'
    }
  ],
  textbooks: [
    { id: 'TB-1', studentClass: 'Class 10', group: 'Science', title: 'Higher Mathematics & Physics Guide', code: 'NGA-BK-101' }
  ]
};

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

const Store = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const fresh = cloneDefaultState();
        this.save(fresh);
        return fresh;
      }
      const parsed = JSON.parse(raw);
      return {
        ...cloneDefaultState(),
        ...parsed,
        academy: {
          ...cloneDefaultState().academy,
          ...(parsed.academy || {})
        }
      };
    } catch {
      return cloneDefaultState();
    }
  },
  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  },
  reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return cloneDefaultState();
  },
  calculateGrade(obtained, total = 100) {
    const pct = total > 0 ? (Number(obtained) / Number(total)) * 100 : 0;
    if (pct >= 80) return { gpa: '5.00', grade: 'A+' };
    if (pct >= 70) return { gpa: '4.00', grade: 'A' };
    if (pct >= 60) return { gpa: '3.50', grade: 'A-' };
    if (pct >= 50) return { gpa: '3.00', grade: 'B' };
    if (pct >= 40) return { gpa: '2.00', grade: 'C' };
    if (pct >= 33) return { gpa: '1.00', grade: 'D' };
    return { gpa: '0.00', grade: 'F' };
  }
};
