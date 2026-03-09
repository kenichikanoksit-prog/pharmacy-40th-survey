'use client';

import React, { useState, useEffect } from 'react';

const PharmacyQuestionnaire = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    status: '',
    rxGeneration: '',
    currentYear: '',
    workplace: '',
    province: '',
    phone: '',
    contact: '',
    interestedToJoin: '',
    preferredTime: '',
    disciplines: [],
    seminarTopics: [],
    presentationFormats: [],
    alumniBenefits: [],
    otherBenefits: '',
    feeFullPackage: '',
    feeConferenceOnly: '',
    feePartyOnly: '',
    boothActivities: [],
    preferredBrands: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');
  
  // Admin Panel States
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Responses data from Google Sheet
  const [allResponses, setAllResponses] = useState([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);

  // Stats data from Google Sheet - แยกศิษย์เก่าและศิษย์ปัจจุบัน
  const [statsData, setStatsData] = useState({ 
    total: 0, 
    totalAlumni: 0,
    totalCurrent: 0,
    alumniStats: [], 
    currentStats: [] 
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Admin credentials
  const ADMIN_USER = '40RxRSU';
  const ADMIN_PASS = 'RxRSU2026';

  // ดึงข้อมูลทั้งหมดจาก API (stats + responses)
  const fetchAllData = async () => {
    setIsLoadingStats(true);
    setIsLoadingResponses(true);
    try {
      const response = await fetch('/api/submit', { cache: 'no-store' });
      const data = await response.json();
      if (data.success) {
        setStatsData({ 
          total: data.total || 0, 
          totalAlumni: data.totalAlumni || 0,
          totalCurrent: data.totalCurrent || 0,
          alumniStats: data.alumniStats || [],
          currentStats: data.currentStats || []
        });
        setAllResponses(data.responses || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoadingStats(false);
    setIsLoadingResponses(false);
  };

  // ดึงข้อมูลเมื่อโหลดหน้า
  useEffect(() => {
    fetchAllData();
  }, []);

  // ดึงข้อมูลใหม่เมื่อ submit สำเร็จ
  useEffect(() => {
    if (isSubmitted) {
      setTimeout(() => fetchAllData(), 1000); // รอ 1 วินาทีให้ Google Sheet อัปเดต
    }
  }, [isSubmitted]);

  const handleAdminLogin = () => {
    if (adminUsername === ADMIN_USER && adminPassword === ADMIN_PASS) {
      setIsAdminLoggedIn(true);
      setLoginError('');
      fetchAllData(); // ดึงข้อมูลเมื่อ login สำเร็จ
    } else {
      setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setShowAdminLogin(false);
    setAdminUsername('');
    setAdminPassword('');
  };

  // Export to Excel (CSV format)
  const exportToExcel = () => {
    const headers = ['ลำดับ', 'ชื่อ-นามสกุล', 'สถานะ', 'รุ่น/ชั้นปี', 'ที่ทำงาน', 'จังหวัด', 'โทรศัพท์', 'สนใจร่วมงาน', 'เวลาที่สะดวก', 'ประเด็นที่สนใจ', 'หัวข้อสัมมนา', 'รูปแบบการนำเสนอ', 'สิทธิประโยชน์ที่อยากได้', 'สิทธิประโยชน์อื่นๆ', 'ค่า Full Package', 'ค่าเฉพาะประชุม', 'ค่าเฉพาะเลี้ยง', 'กิจกรรมบูธ', 'วันที่ตอบ'];
    
    const rows = allResponses.map((r, i) => [
      i + 1,
      r.fullName,
      r.status === 'alumni' ? 'ศิษย์เก่า' : 'ศิษย์ปัจจุบัน',
      r.rxGeneration || r.currentYear || '',
      r.workplace,
      r.province,
      r.phone,
      r.interestedToJoin === 'yes' ? 'สนใจ' : 'ไม่สนใจ',
      r.preferredTime === 'morning' ? 'ครึ่งเช้า' : r.preferredTime === 'afternoon' ? 'ครึ่งบ่าย' : r.preferredTime === 'both' ? 'ทั้งวัน' : '',
      r.disciplines?.join(', ') || '',
      r.seminarTopics?.join(', ') || '',
      r.presentationFormats?.join(', ') || '',
      r.alumniBenefits?.join(', ') || '',
      r.otherBenefits || '',
      r.feeFullPackage || '',
      r.feeConferenceOnly || '',
      r.feePartyOnly || '',
      r.boothActivities?.join(', ') || '',
      r.timestamp
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `survey_responses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Calculate statistics
  const getStats = () => {
    const total = allResponses.length;
    const interested = allResponses.filter(r => r.interestedToJoin === 'yes').length;
    const notInterested = allResponses.filter(r => r.interestedToJoin === 'no').length;
    const morning = allResponses.filter(r => r.preferredTime === 'morning').length;
    const afternoon = allResponses.filter(r => r.preferredTime === 'afternoon').length;
    const alumni = allResponses.filter(r => r.status === 'alumni').length;
    const current = allResponses.filter(r => r.status === 'current').length;

    // Count by Rx generation / ชั้นปี
    const rxCounts = {};
    allResponses.forEach(r => {
      // ใช้ rxGeneration สำหรับศิษย์เก่า, currentYear สำหรับศิษย์ปัจจุบัน
      const rx = r.rxGeneration || r.currentYear || 'ไม่ระบุ';
      rxCounts[rx] = (rxCounts[rx] || 0) + 1;
    });

    // Count disciplines (ประเด็นที่สนใจ)
    const disciplineCounts = {};
    allResponses.forEach(r => {
      r.disciplines?.forEach(d => {
        disciplineCounts[d] = (disciplineCounts[d] || 0) + 1;
      });
    });

    // Count seminar topics (หัวข้อสัมมนา)
    const topicCounts = {};
    allResponses.forEach(r => {
      r.seminarTopics?.forEach(t => {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      });
    });

    // Count presentation formats (รูปแบบการนำเสนอ)
    const formatCounts = {};
    allResponses.forEach(r => {
      r.presentationFormats?.forEach(f => {
        formatCounts[f] = (formatCounts[f] || 0) + 1;
      });
    });

    // Count alumni benefits (สิทธิประโยชน์สมาคมศิษย์เก่า)
    const benefitCounts = {};
    allResponses.forEach(r => {
      r.alumniBenefits?.forEach(b => {
        benefitCounts[b] = (benefitCounts[b] || 0) + 1;
      });
    });

    // Count registration fees - 3 schemes
    const feeFullPackageCounts = {};
    allResponses.forEach(r => {
      if (r.feeFullPackage) {
        feeFullPackageCounts[r.feeFullPackage] = (feeFullPackageCounts[r.feeFullPackage] || 0) + 1;
      }
    });

    const feeConferenceOnlyCounts = {};
    allResponses.forEach(r => {
      if (r.feeConferenceOnly) {
        feeConferenceOnlyCounts[r.feeConferenceOnly] = (feeConferenceOnlyCounts[r.feeConferenceOnly] || 0) + 1;
      }
    });

    const feePartyOnlyCounts = {};
    allResponses.forEach(r => {
      if (r.feePartyOnly) {
        feePartyOnlyCounts[r.feePartyOnly] = (feePartyOnlyCounts[r.feePartyOnly] || 0) + 1;
      }
    });

    // Count booth activities (กิจกรรมบูธ)
    const boothCounts = {};
    allResponses.forEach(r => {
      r.boothActivities?.forEach(b => {
        boothCounts[b] = (boothCounts[b] || 0) + 1;
      });
    });

    // Count provinces (จังหวัด)
    const provinceCounts = {};
    allResponses.forEach(r => {
      if (r.province) {
        provinceCounts[r.province] = (provinceCounts[r.province] || 0) + 1;
      }
    });

    return { 
      total, interested, notInterested, morning, afternoon, alumni, current, 
      rxCounts, disciplineCounts, topicCounts, formatCounts, benefitCounts, 
      feeFullPackageCounts, feeConferenceOnlyCounts, feePartyOnlyCounts, boothCounts, provinceCounts 
    };
  };

  const sections = [
    { title: 'ข้อมูลผู้ให้ข้อมูล', icon: '👤', subtitle: 'Lead Generation' },
    { title: 'ประเด็นที่สนใจ', icon: '📚', subtitle: 'Disciplines & Trends' },
    { title: 'หัวข้อสัมมนา', icon: '🎯', subtitle: 'Topic Ideas' },
    { title: 'รูปแบบงาน', icon: '🎤', subtitle: 'Attendance Drivers' },
    { title: 'กิจกรรมและพาร์ทเนอร์', icon: '🤝', subtitle: 'Experience & Partners' }
  ];

  const disciplines = [
    { id: 'hospital', label: 'Hospital Pharmacy', desc: 'การบริบาลและนวัตกรรมใน รพ.' },
    { id: 'community', label: 'Community Pharmacy', desc: 'การยกระดับร้านยาและเภสัชกรชุมชน' },
    { id: 'regulatory', label: 'Regulatory Affairs, Legal & Policy', desc: 'กฎหมายและนโยบายยา' },
    { id: 'marketing', label: 'Marketing & Commercial', desc: 'กลยุทธ์การตลาดและการบริหารธุรกิจยา' },
    { id: 'industrial', label: 'Industrial (Ceutics/Manu)', desc: 'เทคโนโลยีการผลิตและ R&D' },
    { id: 'newdrug', label: 'New Drug Innovation', desc: 'อัปเดตยากลุ่มใหม่ๆ ในตลาด' },
    { id: 'ai', label: 'AI in Pharmacy Practice', desc: 'การใช้ AI และ ChatGPT ในงานเภสัชกรรม' },
    { id: 'nutraceuticals', label: 'Advanced Nutraceuticals', desc: 'สารอาหารบำบัดขั้นสูง' },
    { id: 'weight', label: 'Modern Weight Management', desc: 'นวัตกรรมการจัดการน้ำหนัก' },
    { id: 'aesthetic', label: 'Aesthetic & Anti-Aging Pharmacy', desc: 'เภสัชกรรมความงามและการชะลอวัย' },
    { id: 'vaccine', label: 'Vaccine Update', desc: 'การจัดการและอัปเดตนวัตกรรมวัคซีน' },
    { id: 'digital', label: 'Digital Pharmacy & Tele-Pharmacy', desc: 'ระบบเภสัชกรรมทางไกล' },
    { id: 'cannabis', label: 'Medical Cannabis & Kratom', desc: 'กัญชา-กระท่อมทางการแพทย์' }
  ];

  const seminarTopics = [
    { id: 'bioage', label: 'The Science of Biological Age', desc: 'ศาสตร์การวัดอายุจริงและการย้อนวัย' },
    { id: 'pharmacogenomics', label: 'Pharmacogenomics in Practice', desc: 'การออกแบบสุขภาพเฉพาะบุคคลด้วยยีน' },
    { id: 'metabolism', label: 'Precision Metabolism', desc: 'บทบาทเภสัชกรกับการจัดการความอ้วนและ Healthspan' },
    { id: 'herbal', label: 'Next-Gen Herbal Medicine', desc: 'การยกระดับสมุนไพรไทยสู่มาตรฐานสากล' },
    { id: 'brain', label: 'Brain Health & Cognitive Vitality', desc: 'สุขภาวะสมองและการชะลอเสื่อม' },
    { id: 'leadership', label: 'Pharmacy Leadership', desc: 'บทบาทผู้นำเภสัชกรในการขับเคลื่อนนโยบายสุขภาพ' },
    { id: 'ecosystem', label: 'Pharmacy Ecosystem', desc: 'การสร้างเครือข่ายความร่วมมือของเภสัชกรทุกภาคส่วน' }
  ];

  const presentationFormats = [
    { id: 'lecture', label: 'Academic Lecture', desc: 'การบรรยายวิชาการโดยผู้เชี่ยวชาญ (เน้นเนื้อหา/CPE)' },
    { id: 'interview', label: 'Alumni Interview & Talk', desc: 'การสัมภาษณ์เจาะลึกพูดคุยกับศิษย์เก่าผู้มีประสบการณ์' },
    { id: 'sharing', label: 'Sharing Experience', desc: 'การแบ่งปันประสบการณ์ตรง (Success/Failure Stories)' },
    { id: 'panel', label: 'Panel Discussion', desc: 'การเสวนาแลกเปลี่ยนมุมมองจากวิทยากรหลายท่าน' },
    { id: 'showcase', label: 'Technology Showcase', desc: 'การสาธิตนวัตกรรมและเครื่องมือจริง' }
  ];

  const alumniBenefits = [
    { id: 'cpe_discount', label: 'ส่วนลดงานประชุมวิชาการ/CPE', icon: '💰' },
    { id: 'networking', label: 'เครือข่ายและโอกาสทางธุรกิจ', icon: '🤝' },
    { id: 'health', label: 'สิทธิประโยชน์ด้านสุขภาพ (ตรวจสุขภาพ/ประกัน)', icon: '🏥' }
  ];

  const boothActivities = [
    { id: 'bioage', label: 'ตรวจสุขภาพ Bio-Age', icon: '🧬' },
    { id: 'brainapp', label: 'ทดสอบแอป Brain Health', icon: '🧠' },
    { id: 'products', label: 'ชิมผลิตภัณฑ์นวัตกรรมศิษย์เก่า', icon: '🧪' },
    { id: 'networking', label: 'Networking Lounge', icon: '☕' },
    { id: 'memory', label: 'นิทรรศการ Memory Lane', icon: '📸' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  // ตรวจสอบว่าเคยตอบแบบสอบถามแล้วหรือยัง (เช็คจากชื่อ-นามสกุล)
  const checkDuplicate = () => {
    const normalizedName = formData.fullName.trim().toLowerCase();
    const existingResponse = allResponses.find(r => 
      r.fullName.trim().toLowerCase() === normalizedName
    );
    return existingResponse;
  };

  // เมื่อกดปุ่มส่งแบบสอบถาม - แสดง Confirm Modal
  const handlePreSubmit = () => {
    const duplicate = checkDuplicate();
    if (duplicate) {
      setDuplicateName(duplicate.fullName);
      setShowDuplicateWarning(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  // ยืนยันการส่งข้อมูล
  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    
    // ส่งข้อมูลไป Google Sheets ผ่าน API route
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      console.log('Submit result:', result);
    } catch (error) {
      console.error('Error submitting:', error);
    }
    
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // กลับไปแก้ไขข้อมูล
  const handleEditData = (sectionIndex) => {
    setShowConfirmModal(false);
    setCurrentSection(sectionIndex);
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper function สำหรับแสดงข้อมูลใน Confirm Modal
  const getDisplayValue = (field, value) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return '-';
    
    if (field === 'status') {
      return value === 'alumni' ? 'ศิษย์เก่า' : 'ศิษย์ปัจจุบัน';
    }
    if (field === 'interestedToJoin') {
      return value === 'yes' ? '✅ สนใจเข้าร่วม' : '❌ ไม่สนใจ';
    }
    if (field === 'preferredTime') {
      if (value === 'morning') return '🌅 ครึ่งเช้า';
      if (value === 'afternoon') return '🌤️ ครึ่งบ่าย';
      if (value === 'both') return '☀️ ทั้งวัน';
      return '';
    }
    if (field === 'disciplines' && Array.isArray(value)) {
      return value.map(v => disciplines.find(d => d.id === v)?.label || v).join(', ');
    }
    if (field === 'seminarTopics' && Array.isArray(value)) {
      return value.map(v => seminarTopics.find(t => t.id === v)?.label || v).join(', ');
    }
    if (field === 'presentationFormats' && Array.isArray(value)) {
      return value.map(v => presentationFormats.find(f => f.id === v)?.label || v).join(', ');
    }
    if (field === 'alumniBenefits' && Array.isArray(value)) {
      return value.map(v => alumniBenefits.find(b => b.id === v)?.label || v).join(', ');
    }
    if (field === 'boothActivities' && Array.isArray(value)) {
      return value.map(v => boothActivities.find(b => b.id === v)?.label || v).join(', ');
    }
    if (field === 'registrationFee') {
      return `${value} บาท`;
    }
    return value;
  };

  // ใช้ข้อมูลจาก statsData - แยกศิษย์เก่าและศิษย์ปัจจุบัน
  const alumniStats = statsData.alumniStats.length > 0 ? statsData.alumniStats : [];
  const currentStats = statsData.currentStats.length > 0 ? statsData.currentStats : [];
  const totalResponses = statsData.total;
  const totalAlumni = statsData.totalAlumni;
  const totalCurrent = statsData.totalCurrent;

  // สีสำหรับ Top 3 และอื่นๆ
  const getRankStyle = (index) => {
    if (index === 0) return { bg: 'linear-gradient(90deg, #FFD700, #FFA500)', medal: '🥇' };
    if (index === 1) return { bg: 'linear-gradient(90deg, #C0C0C0, #A8A8A8)', medal: '🥈' };
    if (index === 2) return { bg: 'linear-gradient(90deg, #CD7F32, #B8860B)', medal: '🥉' };
    return { bg: 'linear-gradient(90deg, #4FC3F788, #4FC3F7)', medal: null };
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen p-4" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        fontFamily: "'Prompt', 'Sarabun', sans-serif"
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
          
          .bar-animate {
            animation: growBar 1s ease-out forwards;
          }
          
          @keyframes growBar {
            from { width: 0; }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        
        <div className="max-w-2xl mx-auto">
          {/* Thank You Header */}
          <div className="text-center pt-6 pb-4 fade-in-up">
            <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center rounded-full" style={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1))',
              border: '2px solid rgba(76, 175, 80, 0.5)'
            }}>
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
              ขอบคุณสำหรับการตอบแบบสอบถาม
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mt-2" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <span className="text-sm">📅</span>
              <span className="text-white font-medium text-xs">พบกัน 20 มิถุนายน 2569</span>
            </div>
          </div>

          {/* Total Count Card */}
          <div className="rounded-2xl p-4 mb-4 text-center fade-in-up" style={{
            background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.2), rgba(79, 195, 247, 0.2))',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            animationDelay: '0.1s'
          }}>
            <div className="text-4xl md:text-5xl font-bold text-white mb-1">
              {totalResponses}
            </div>
            <div className="text-sm text-gray-300">คนร่วมตอบแบบสอบถามแล้ว 🎉</div>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <span className="text-blue-400">🎓 ศิษย์เก่า {totalAlumni} คน</span>
              <span className="text-green-400">📚 ศิษย์ปัจจุบัน {totalCurrent} คน</span>
            </div>
          </div>

          {/* Ranking by Alumni */}
          {alumniStats.length > 0 && (
            <div className="rounded-2xl p-4 mb-4 fade-in-up" style={{
              background: 'rgba(59, 130, 246, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              animationDelay: '0.3s'
            }}>
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <span>🎓</span> อันดับรุ่นศิษย์เก่า
              </h3>
              <div className="space-y-2">
                {alumniStats.map((item, index) => {
                  const maxCount = alumniStats[0].count;
                  const barStyle = getRankStyle(index);
                  return (
                    <div key={item.rx} className="flex items-center gap-2">
                      <div className="w-6 text-center flex-shrink-0">
                        {barStyle.medal ? (
                          <span className="text-sm">{barStyle.medal}</span>
                        ) : (
                          <span className="text-gray-500 text-xs">{index + 1}</span>
                        )}
                      </div>
                      <div className="w-16 text-xs text-blue-300 text-right flex-shrink-0">{item.rx}</div>
                      <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div 
                          className="h-full rounded-full bar-animate flex items-center justify-end pr-2"
                          style={{ 
                            width: `${(item.count / maxCount) * 100}%`,
                            background: barStyle.bg,
                            animationDelay: `${0.5 + index * 0.1}s`
                          }}
                        >
                          <span className="text-white text-xs font-bold">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ranking by Current Students */}
          {currentStats.length > 0 && (
            <div className="rounded-2xl p-4 mb-4 fade-in-up" style={{
              background: 'rgba(34, 197, 94, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              animationDelay: '0.5s'
            }}>
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <span>📚</span> อันดับชั้นปีศิษย์ปัจจุบัน
              </h3>
              <div className="space-y-2">
                {currentStats.map((item, index) => {
                  const maxCount = currentStats[0].count;
                  const barStyle = getRankStyle(index);
                  return (
                    <div key={item.rx} className="flex items-center gap-2">
                      <div className="w-6 text-center flex-shrink-0">
                        {barStyle.medal ? (
                          <span className="text-sm">{barStyle.medal}</span>
                        ) : (
                          <span className="text-gray-500 text-xs">{index + 1}</span>
                        )}
                      </div>
                      <div className="w-16 text-xs text-green-300 text-right flex-shrink-0">{item.rx}</div>
                      <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div 
                          className="h-full rounded-full bar-animate flex items-center justify-end pr-2"
                          style={{ 
                            width: `${(item.count / maxCount) * 100}%`,
                            background: barStyle.bg,
                            animationDelay: `${0.7 + index * 0.1}s`
                          }}
                        >
                          <span className="text-white text-xs font-bold">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No data message */}
          {alumniStats.length === 0 && currentStats.length === 0 && (
            <div className="rounded-2xl p-4 mb-4 fade-in-up text-center" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              animationDelay: '0.3s'
            }}>
              <p className="text-gray-400">ยังไม่มีข้อมูลสถิติ</p>
            </div>
          )}

          {/* CTA Button */}
          <div className="text-center pb-4 fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="inline-block px-6 py-3 rounded-full text-white font-semibold text-sm" style={{
              background: 'linear-gradient(135deg, #e94560, #ff6b6b)'
            }}>
              🎉 พบกันในงาน!
            </div>
          </div>

          {/* ข้อความปิดหน้า */}
          <div className="text-center pb-6 fade-in-up" style={{ animationDelay: '0.9s' }}>
            <p className="text-gray-500 text-sm">สามารถปิดหน้านี้ได้เลยครับ</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: "'Prompt', 'Sarabun', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600&display=swap');
        
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .input-field {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.3s ease;
        }
        
        .input-field:focus {
          background: rgba(255, 255, 255, 0.12);
          border-color: #e94560;
          box-shadow: 0 0 20px rgba(233, 69, 96, 0.3);
        }
        
        .checkbox-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .checkbox-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(233, 69, 96, 0.5);
          transform: translateY(-2px);
        }
        
        .checkbox-card.selected {
          background: rgba(233, 69, 96, 0.15);
          border-color: #e94560;
          box-shadow: 0 0 25px rgba(233, 69, 96, 0.25);
        }
        
        .progress-dot {
          transition: all 0.4s ease;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #e94560, #ff6b6b);
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(233, 69, 96, 0.4);
        }
        
        .radio-option {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .radio-option:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        
        .radio-option.selected {
          background: rgba(233, 69, 96, 0.15);
          border-color: #e94560;
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .floating {
          animation: floating 3s ease-in-out infinite;
        }
        
        @keyframes floating {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Header */}
      <div className="pt-8 pb-4 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          งานครบรอบ 40 ปี
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold mb-3" style={{ color: '#808000' }}>
          เภสัชศาสตร์ มหาวิทยาลัยรังสิต
        </h2>
        <div className="text-lg md:text-xl font-bold text-white mb-3" style={{ 
          fontFamily: 'Georgia, serif',
          letterSpacing: '0.05em'
        }}>
          40th Years of Pharmacy RSU
        </div>
        {/* Capsule Pill */}
        <div className="floating inline-block mb-4">
          <svg width="120" height="50" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pinkGradCap" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B9D"/>
                <stop offset="100%" stopColor="#E94560"/>
              </linearGradient>
              <linearGradient id="blueGradCap" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4FC3F7"/>
                <stop offset="100%" stopColor="#2196F3"/>
              </linearGradient>
              <filter id="capsuleShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.3"/>
              </filter>
            </defs>
            {/* Left half - Pink */}
            <path d="M25 5 H60 V45 H25 A20 20 0 0 1 25 5 Z" fill="url(#pinkGradCap)" filter="url(#capsuleShadow)"/>
            {/* Right half - Blue */}
            <path d="M60 5 H95 A20 20 0 0 1 95 45 H60 V5 Z" fill="url(#blueGradCap)" filter="url(#capsuleShadow)"/>
            {/* Center line */}
            <line x1="60" y1="5" x2="60" y2="45" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
            {/* Shine effect */}
            <ellipse cx="40" cy="15" rx="12" ry="5" fill="rgba(255,255,255,0.25)"/>
            <ellipse cx="80" cy="15" rx="12" ry="5" fill="rgba(255,255,255,0.25)"/>
            {/* Outline */}
            <rect x="5" y="5" width="110" height="40" rx="20" ry="20" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none"/>
          </svg>
        </div>
        <div className="block">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{
            background: 'rgba(128, 128, 0, 0.15)',
            border: '1px solid rgba(128, 128, 0, 0.3)'
          }}>
            <span className="text-lg">📅</span>
            <span className="text-white font-medium">20 มิถุนายน 2569</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm">
          แบบสำรวจความคิดเห็นเพื่อการจัดงานที่ตรงใจทุกท่าน
        </p>
        {/* ปุ่มดูสถิติ */}
        <button
          onClick={() => setShowStatsModal(true)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(79, 195, 247, 0.2), rgba(233, 69, 96, 0.2))',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <span>📊</span>
          <span className="text-white">ดูสถิติรุ่นที่ตอบแบบสอบถาม</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          {sections.map((section, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className={`progress-dot w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl ${
                  index <= currentSection ? 'text-white' : 'text-gray-500'
                }`}
                style={{
                  background: index <= currentSection 
                    ? 'linear-gradient(135deg, #e94560, #ff6b6b)' 
                    : 'rgba(255,255,255,0.1)'
                }}
              >
                {section.icon}
              </div>
              <span className={`text-xs mt-2 hidden md:block ${
                index === currentSection ? 'text-white' : 'text-gray-500'
              }`}>
                {section.title}
              </span>
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden mt-4">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((currentSection + 1) / sections.length) * 100}%`,
              background: 'linear-gradient(135deg, #e94560, #ff6b6b)'
            }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 pb-8 max-w-4xl mx-auto">
        <div className="glass-card rounded-3xl p-6 md:p-10 fade-in">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-1">
              {sections[currentSection].title}
            </h3>
            <p className="text-gray-400 text-sm">{sections[currentSection].subtitle}</p>
          </div>

          {/* แจ้งเตือนกรอกภาษาไทย */}
          <div className="mb-6 p-3 rounded-lg flex items-center gap-2" style={{ 
            background: 'rgba(128, 128, 0, 0.15)', 
            border: '1px solid rgba(128, 128, 0, 0.3)' 
          }}>
            <span className="text-lg">🇹🇭</span>
            <span className="text-gray-300 text-sm">กรุณากรอกข้อมูลทั้งหมดเป็น<span className="text-yellow-400 font-medium">ภาษาไทย</span></span>
          </div>

          {/* Section 1: Personal Info */}
          {currentSection === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2 font-medium">ชื่อ-นามสกุล * <span className="text-gray-400 text-xs font-normal">(ภาษาไทย)</span></label>
                <input
                  type="text"
                  className="input-field w-full px-4 py-3 rounded-xl text-white outline-none"
                  placeholder="เช่น สมชาย ใจดี"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-white mb-3 font-medium">สถานะ *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    className={`radio-option p-4 rounded-xl ${formData.status === 'alumni' ? 'selected' : ''}`}
                    onClick={() => handleInputChange('status', 'alumni')}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        formData.status === 'alumni' ? 'border-pink-500 bg-pink-500' : 'border-gray-400'
                      }`}>
                        {formData.status === 'alumni' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="text-white">ศิษย์เก่า</span>
                    </div>
                    {formData.status === 'alumni' && (
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="input-field w-full px-3 py-2 rounded-lg text-white outline-none mt-3 text-sm"
                        placeholder="ระบุรุ่น (ตัวเลข เช่น 12)"
                        value={formData.rxGeneration}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          handleInputChange('rxGeneration', val);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                  <div
                    className={`radio-option p-4 rounded-xl ${formData.status === 'current' ? 'selected' : ''}`}
                    onClick={() => handleInputChange('status', 'current')}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        formData.status === 'current' ? 'border-pink-500 bg-pink-500' : 'border-gray-400'
                      }`}>
                        {formData.status === 'current' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="text-white">ศิษย์ปัจจุบัน</span>
                    </div>
                    {formData.status === 'current' && (
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="input-field w-full px-3 py-2 rounded-lg text-white outline-none mt-3 text-sm"
                        placeholder="ระบุชั้นปี (ตัวเลข เช่น 3)"
                        value={formData.currentYear}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          handleInputChange('currentYear', val);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 font-medium">สถานที่ทำงาน / ชื่อองค์กร</label>
                  <input
                    type="text"
                    className="input-field w-full px-4 py-3 rounded-xl text-white outline-none"
                    placeholder="เช่น รพ.รามา, บ.ไฟเซอร์, ร้านยาXX"
                    value={formData.workplace}
                    onChange={(e) => handleInputChange('workplace', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 font-medium">จังหวัดที่ทำงาน</label>
                  <input
                    type="text"
                    className="input-field w-full px-4 py-3 rounded-xl text-white outline-none"
                    placeholder="เช่น กรุงเทพฯ"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 font-medium">เบอร์โทรศัพท์ *</label>
                  <input
                    type="tel"
                    className="input-field w-full px-4 py-3 rounded-xl text-white outline-none"
                    placeholder="08X-XXX-XXXX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 font-medium">Line ID หรือ Email</label>
                  <input
                    type="text"
                    className="input-field w-full px-4 py-3 rounded-xl text-white outline-none"
                    placeholder="Line ID หรือ Email"
                    value={formData.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                  />
                </div>
              </div>

              {/* คำถามความสนใจเข้าร่วมงาน */}
              <div className="pt-4 border-t border-gray-700">
                <label className="block text-white mb-3 font-medium">
                  🎉 ทางวิทยาลัยจะจัดงานครบรอบ 40 ปี เภสัชรังสิต วันที่ 20 มิถุนายน 2569<br/>
                  <span className="text-pink-400">ท่านสนใจมาร่วมงานหรือไม่? *</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`radio-option p-4 rounded-xl text-center ${formData.interestedToJoin === 'yes' ? 'selected' : ''}`}
                    onClick={() => handleInputChange('interestedToJoin', 'yes')}
                  >
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-white font-medium">สนใจ</div>
                  </div>
                  <div
                    className={`radio-option p-4 rounded-xl text-center ${formData.interestedToJoin === 'no' ? 'selected' : ''}`}
                    onClick={() => handleInputChange('interestedToJoin', 'no')}
                  >
                    <div className="text-3xl mb-2">❌</div>
                    <div className="text-white font-medium">ไม่สนใจ</div>
                  </div>
                </div>
              </div>

              {/* คำถามเวลาที่เหมาะสม - แสดงเมื่อสนใจเข้าร่วม */}
              {formData.interestedToJoin === 'yes' && (
                <div>
                  <label className="block text-white mb-3 font-medium">
                    🕐 ท่านคิดว่าเวลาใดเหมาะสมและท่านสนใจเข้าร่วมประชุม? *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div
                      className={`radio-option p-4 rounded-xl text-center ${formData.preferredTime === 'morning' ? 'selected' : ''}`}
                      onClick={() => handleInputChange('preferredTime', 'morning')}
                    >
                      <div className="text-3xl mb-2">🌅</div>
                      <div className="text-white font-medium">ครึ่งเช้า</div>
                      <div className="text-gray-400 text-xs mt-1">08:00 - 12:00 น.</div>
                    </div>
                    <div
                      className={`radio-option p-4 rounded-xl text-center ${formData.preferredTime === 'afternoon' ? 'selected' : ''}`}
                      onClick={() => handleInputChange('preferredTime', 'afternoon')}
                    >
                      <div className="text-3xl mb-2">🌤️</div>
                      <div className="text-white font-medium">ครึ่งบ่าย</div>
                      <div className="text-gray-400 text-xs mt-1">13:00 - 17:00 น.</div>
                    </div>
                    <div
                      className={`radio-option p-4 rounded-xl text-center ${formData.preferredTime === 'both' ? 'selected' : ''}`}
                      onClick={() => handleInputChange('preferredTime', 'both')}
                    >
                      <div className="text-3xl mb-2">☀️</div>
                      <div className="text-white font-medium">ทั้งวัน</div>
                      <div className="text-gray-400 text-xs mt-1">สะดวกทั้งเช้าและบ่าย</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 2: Disciplines */}
          {currentSection === 1 && (
            <div>
              <p className="text-gray-300 mb-6">
                ประเด็น/สายงานที่ท่านสนใจอยากให้มีการนำเสนอเนื้อหาเพิ่มเติม
                <span className="text-pink-400 ml-2">(เลือกได้หลายข้อ)</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {disciplines.map((item) => (
                  <div
                    key={item.id}
                    className={`checkbox-card p-4 rounded-xl ${
                      formData.disciplines.includes(item.id) ? 'selected' : ''
                    }`}
                    onClick={() => handleCheckboxChange('disciplines', item.id)}
                  >
                    <div className="flex items-start">
                      <div className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                        formData.disciplines.includes(item.id) 
                          ? 'border-pink-500 bg-pink-500' 
                          : 'border-gray-400'
                      }`}>
                        {formData.disciplines.includes(item.id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{item.label}</div>
                        <div className="text-gray-400 text-xs mt-1">{item.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Seminar Topics */}
          {currentSection === 2 && (
            <div>
              <p className="text-gray-300 mb-6">
                หากมีการจัดสัมมนาในหัวข้อต่อไปนี้ ท่านมีความสนใจในหัวข้อใดมากที่สุด?
                <span className="text-pink-400 ml-2">(เลือกได้สูงสุด 3 หัวข้อ)</span>
              </p>
              <div className="space-y-3">
                {seminarTopics.map((item, index) => (
                  <div
                    key={item.id}
                    className={`checkbox-card p-5 rounded-xl ${
                      formData.seminarTopics.includes(item.id) ? 'selected' : ''
                    } ${formData.seminarTopics.length >= 3 && !formData.seminarTopics.includes(item.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (formData.seminarTopics.length < 3 || formData.seminarTopics.includes(item.id)) {
                        handleCheckboxChange('seminarTopics', item.id);
                      }
                    }}
                  >
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0" style={{
                        background: formData.seminarTopics.includes(item.id) 
                          ? 'linear-gradient(135deg, #e94560, #ff6b6b)'
                          : 'rgba(255,255,255,0.1)'
                      }}>
                        {formData.seminarTopics.includes(item.id) 
                          ? formData.seminarTopics.indexOf(item.id) + 1 
                          : index + 1}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{item.label}</div>
                        <div className="text-gray-400 text-sm mt-1">{item.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <span className="text-gray-400 text-sm">
                  เลือกแล้ว {formData.seminarTopics.length}/3 หัวข้อ
                </span>
              </div>
            </div>
          )}

          {/* Section 4: Presentation & Registration */}
          {currentSection === 3 && (
            <div className="space-y-8">
              <div>
                <p className="text-gray-300 mb-4">
                  รูปแบบการนำเสนอที่ท่านสนใจเข้าร่วมมากที่สุด
                  <span className="text-pink-400 ml-2">(เลือกได้สูงสุด 2 ข้อ)</span>
                </p>
                <div className="space-y-3">
                  {presentationFormats.map((item) => (
                    <div
                      key={item.id}
                      className={`checkbox-card p-4 rounded-xl ${
                        formData.presentationFormats.includes(item.id) ? 'selected' : ''
                      } ${formData.presentationFormats.length >= 2 && !formData.presentationFormats.includes(item.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (formData.presentationFormats.length < 2 || formData.presentationFormats.includes(item.id)) {
                          handleCheckboxChange('presentationFormats', item.id);
                        }
                      }}
                    >
                      <div className="flex items-start">
                        <div className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                          formData.presentationFormats.includes(item.id) 
                            ? 'border-pink-500 bg-pink-500' 
                            : 'border-gray-400'
                        }`}>
                          {formData.presentationFormats.includes(item.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium">{item.label}</div>
                          <div className="text-gray-400 text-sm mt-1">{item.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white mb-2 font-medium">
                  สิทธิประโยชน์สมาชิกสมาคมศิษย์เก่าที่ท่านอยากได้
                </label>
                <p className="text-gray-400 text-sm mb-4">(เลือกได้มากกว่า 1 ข้อ)</p>
                <div className="space-y-3">
                  {alumniBenefits.map((item) => (
                    <div
                      key={item.id}
                      className={`checkbox-card p-4 rounded-xl flex items-center gap-4 ${
                        formData.alumniBenefits.includes(item.id) ? 'selected' : ''
                      }`}
                      onClick={() => handleCheckboxChange('alumniBenefits', item.id)}
                    >
                      <div className="text-3xl">{item.icon}</div>
                      <div className="text-white font-medium">{item.label}</div>
                    </div>
                  ))}
                </div>
                
                {/* ช่องกรอกเอง */}
                <div className="mt-4">
                  <label className="block text-gray-300 mb-2 text-sm">อื่นๆ (โปรดระบุ)</label>
                  <input
                    type="text"
                    className="input-field w-full px-4 py-3 rounded-xl text-white outline-none"
                    placeholder="สิทธิประโยชน์อื่นๆ ที่ท่านต้องการ..."
                    value={formData.otherBenefits}
                    onChange={(e) => handleInputChange('otherBenefits', e.target.value)}
                  />
                </div>
              </div>

              {/* ค่าลงทะเบียน 3 Schemes */}
              <div className="space-y-6 pt-4 border-t border-gray-700">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <span>💰</span> อัตราค่าลงทะเบียนที่ท่านเห็นว่าเหมาะสม
                </h4>

                {/* Scheme 1: Full Package */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-gray-300 mb-3">
                    <span className="text-yellow-400 font-medium">🎉 ลงทะเบียนเข้าร่วม ทั้ง งานประชุมวิชาการ และ งานเลี้ยงสังสรรค์</span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: '2000-2500', label: '2,000 - 2,500 บาท' },
                      { value: '2500-3000', label: '2,500 - 3,000 บาท' },
                      { value: '3000-3500', label: '3,000 - 3,500 บาท' }
                    ].map((item) => (
                      <div
                        key={item.value}
                        className={`radio-option p-3 rounded-xl text-center ${
                          formData.feeFullPackage === item.value ? 'selected' : ''
                        }`}
                        onClick={() => handleInputChange('feeFullPackage', item.value)}
                      >
                        <div className="text-white font-semibold text-sm">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scheme 2: เฉพาะงานประชุมวิชาการ */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-gray-300 mb-3">
                    <span className="text-yellow-400 font-medium">📚 ลงทะเบียนเข้าร่วม เฉพาะ งานประชุมวิชาการ</span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: '800-1000', label: '800 - 1,000 บาท' },
                      { value: '1000-1200', label: '1,000 - 1,200 บาท' },
                      { value: '1200-1500', label: '1,200 - 1,500 บาท' }
                    ].map((item) => (
                      <div
                        key={item.value}
                        className={`radio-option p-3 rounded-xl text-center ${
                          formData.feeConferenceOnly === item.value ? 'selected' : ''
                        }`}
                        onClick={() => handleInputChange('feeConferenceOnly', item.value)}
                      >
                        <div className="text-white font-semibold text-sm">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scheme 3: เฉพาะงานเลี้ยงสังสรรค์ */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-gray-300 mb-3">
                    <span className="text-yellow-400 font-medium">🥂 ลงทะเบียนเข้าร่วม เฉพาะ งานเลี้ยงสังสรรค์</span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: '1000-1200', label: '1,000 - 1,200 บาท' },
                      { value: '1200-1500', label: '1,200 - 1,500 บาท' },
                      { value: '1500-1800', label: '1,500 - 1,800 บาท' }
                    ].map((item) => (
                      <div
                        key={item.value}
                        className={`radio-option p-3 rounded-xl text-center ${
                          formData.feePartyOnly === item.value ? 'selected' : ''
                        }`}
                        onClick={() => handleInputChange('feePartyOnly', item.value)}
                      >
                        <div className="text-white font-semibold text-sm">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Booth Activities & Partners */}
          {currentSection === 4 && (
            <div className="space-y-8">
              <div>
                <p className="text-gray-300 mb-4">
                  กิจกรรมบูธหรือประสบการณ์ที่ท่านสนใจเข้าร่วม
                  <span className="text-pink-400 ml-2">(เลือกได้หลายข้อ)</span>
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {boothActivities.map((item) => (
                    <div
                      key={item.id}
                      className={`checkbox-card p-5 rounded-xl text-center ${
                        formData.boothActivities.includes(item.id) ? 'selected' : ''
                      }`}
                      onClick={() => handleCheckboxChange('boothActivities', item.id)}
                    >
                      <div className="text-4xl mb-3">{item.icon}</div>
                      <div className="text-white text-sm font-medium">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white mb-2 font-medium">
                  ชื่อบริษัท หรือ แบรนด์ผลิตภัณฑ์สุขภาพ ที่ท่านอยากให้มาออกบูธเป็นพิเศษ
                </label>
                <textarea
                  className="input-field w-full px-4 py-3 rounded-xl text-white outline-none resize-none"
                  rows={4}
                  placeholder="พิมพ์ชื่อบริษัทหรือแบรนด์ที่สนใจ..."
                  value={formData.preferredBrands}
                  onChange={(e) => handleInputChange('preferredBrands', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-700">
            <button
              onClick={prevSection}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                currentSection === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'text-white bg-gray-700 hover:bg-gray-600'
              }`}
            >
              ← ย้อนกลับ
            </button>
            
            {currentSection === sections.length - 1 ? (
              <button
                onClick={handlePreSubmit}
                className="btn-primary px-8 py-3 rounded-xl text-white font-semibold"
              >
                ตรวจสอบข้อมูล ✓
              </button>
            ) : (
              <button
                onClick={nextSection}
                className="btn-primary px-8 py-3 rounded-xl text-white font-semibold"
              >
                ถัดไป →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Duplicate Warning Modal */}
      {showDuplicateWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 w-full max-w-md text-center" style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: '1px solid rgba(255, 193, 7, 0.3)'
          }}>
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-3">พบข้อมูลซ้ำ</h3>
            <p className="text-gray-300 mb-2">
              ชื่อ <span className="text-yellow-400 font-semibold">"{duplicateName}"</span>
            </p>
            <p className="text-gray-400 text-sm mb-6">
              เคยทำแบบสำรวจนี้ไปแล้ว<br/>
              ไม่สามารถส่งซ้ำได้อีกครั้ง
            </p>
            <button
              onClick={() => setShowDuplicateWarning(false)}
              className="px-6 py-3 rounded-xl text-white font-medium"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Confirm Data Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="rounded-2xl p-6 w-full max-w-2xl my-8" style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">📋 ตรวจสอบข้อมูลก่อนส่ง</h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-white text-xl">
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {/* Section 1: ข้อมูลส่วนตัว */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-white font-semibold">👤 ข้อมูลผู้ให้ข้อมูล</h4>
                  <button 
                    onClick={() => handleEditData(0)}
                    className="text-xs px-3 py-1 rounded-full text-pink-400 hover:bg-pink-500 hover:bg-opacity-20"
                    style={{ border: '1px solid rgba(233, 69, 96, 0.3)' }}
                  >
                    แก้ไข ✏️
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">ชื่อ-นามสกุล:</span> <span className="text-white">{formData.fullName || '-'}</span></div>
                  <div><span className="text-gray-400">สถานะ:</span> <span className="text-white">{getDisplayValue('status', formData.status)} {formData.rxGeneration || formData.currentYear}</span></div>
                  <div><span className="text-gray-400">ที่ทำงาน:</span> <span className="text-white">{formData.workplace || '-'}</span></div>
                  <div><span className="text-gray-400">จังหวัด:</span> <span className="text-white">{formData.province || '-'}</span></div>
                  <div><span className="text-gray-400">โทรศัพท์:</span> <span className="text-white">{formData.phone || '-'}</span></div>
                  <div><span className="text-gray-400">ติดต่อ:</span> <span className="text-white">{formData.contact || '-'}</span></div>
                  <div className="col-span-2"><span className="text-gray-400">สนใจร่วมงาน:</span> <span className="text-white">{getDisplayValue('interestedToJoin', formData.interestedToJoin)}</span></div>
                  {formData.interestedToJoin === 'yes' && (
                    <div className="col-span-2"><span className="text-gray-400">เวลาที่สะดวก:</span> <span className="text-white">{getDisplayValue('preferredTime', formData.preferredTime)}</span></div>
                  )}
                </div>
              </div>

              {/* Section 2: ประเด็นที่สนใจ */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-white font-semibold">📚 ประเด็นที่สนใจ</h4>
                  <button 
                    onClick={() => handleEditData(1)}
                    className="text-xs px-3 py-1 rounded-full text-pink-400 hover:bg-pink-500 hover:bg-opacity-20"
                    style={{ border: '1px solid rgba(233, 69, 96, 0.3)' }}
                  >
                    แก้ไข ✏️
                  </button>
                </div>
                <p className="text-white text-sm">{getDisplayValue('disciplines', formData.disciplines)}</p>
              </div>

              {/* Section 3: หัวข้อสัมมนา */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-white font-semibold">🎯 หัวข้อสัมมนา</h4>
                  <button 
                    onClick={() => handleEditData(2)}
                    className="text-xs px-3 py-1 rounded-full text-pink-400 hover:bg-pink-500 hover:bg-opacity-20"
                    style={{ border: '1px solid rgba(233, 69, 96, 0.3)' }}
                  >
                    แก้ไข ✏️
                  </button>
                </div>
                <p className="text-white text-sm">{getDisplayValue('seminarTopics', formData.seminarTopics)}</p>
              </div>

              {/* Section 4: รูปแบบงาน */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-white font-semibold">🎤 รูปแบบงาน</h4>
                  <button 
                    onClick={() => handleEditData(3)}
                    className="text-xs px-3 py-1 rounded-full text-pink-400 hover:bg-pink-500 hover:bg-opacity-20"
                    style={{ border: '1px solid rgba(233, 69, 96, 0.3)' }}
                  >
                    แก้ไข ✏️
                  </button>
                </div>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-400">รูปแบบการนำเสนอ:</span> <span className="text-white">{getDisplayValue('presentationFormats', formData.presentationFormats)}</span></div>
                  <div><span className="text-gray-400">สิทธิประโยชน์ที่อยากได้:</span> <span className="text-white">{getDisplayValue('alumniBenefits', formData.alumniBenefits)}{formData.otherBenefits ? `, ${formData.otherBenefits}` : ''}</span></div>
                  <div className="pt-2 border-t border-gray-700 mt-2">
                    <div className="text-gray-400 mb-1">💰 ค่าลงทะเบียนที่เหมาะสม:</div>
                    <div className="pl-3 space-y-1">
                      <div><span className="text-yellow-400">🎉 Full Package:</span> <span className="text-white">{formData.feeFullPackage ? `${formData.feeFullPackage} บาท` : '-'}</span></div>
                      <div><span className="text-yellow-400">📚 เฉพาะประชุมวิชาการ:</span> <span className="text-white">{formData.feeConferenceOnly ? `${formData.feeConferenceOnly} บาท` : '-'}</span></div>
                      <div><span className="text-yellow-400">🥂 เฉพาะงานเลี้ยง:</span> <span className="text-white">{formData.feePartyOnly ? `${formData.feePartyOnly} บาท` : '-'}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: กิจกรรมและพาร์ทเนอร์ */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-white font-semibold">🤝 กิจกรรมและพาร์ทเนอร์</h4>
                  <button 
                    onClick={() => handleEditData(4)}
                    className="text-xs px-3 py-1 rounded-full text-pink-400 hover:bg-pink-500 hover:bg-opacity-20"
                    style={{ border: '1px solid rgba(233, 69, 96, 0.3)' }}
                  >
                    แก้ไข ✏️
                  </button>
                </div>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-400">กิจกรรมบูธ:</span> <span className="text-white">{getDisplayValue('boothActivities', formData.boothActivities)}</span></div>
                  <div><span className="text-gray-400">แบรนด์ที่อยากให้มา:</span> <span className="text-white">{formData.preferredBrands || '-'}</span></div>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="mt-4 p-3 rounded-lg text-center" style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
              <p className="text-yellow-400 text-sm">
                ⚠️ <strong>หมายเหตุ:</strong> เมื่อกดยืนยันส่งข้อมูลแล้ว จะไม่สามารถแก้ไขได้
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-xl text-white font-medium"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                ← กลับไปแก้ไข
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 py-3 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, #4CAF50, #45a049)' }}
              >
                ✓ ยืนยันส่งข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pb-8 text-gray-500 text-sm">
        © 2026 เภสัชศาสตร์ มหาวิทยาลัยรังสิต | ครบรอบ 40 ปี
      </div>

      {/* Admin Gear Button */}
      <button
        onClick={() => setShowAdminLogin(true)}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setShowStatsModal(false)}>
          <div 
            className="rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" 
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📊</span> สถิติผู้ตอบแบบสอบถาม
              </h3>
              <button 
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Total Count */}
            <div className="rounded-xl p-4 mb-4 text-center" style={{
              background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.2), rgba(79, 195, 247, 0.2))',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div className="text-3xl font-bold text-white mb-1">{totalResponses}</div>
              <div className="text-sm text-gray-300">คนร่วมตอบแบบสอบถามแล้ว 🎉</div>
              <div className="flex justify-center gap-4 mt-2 text-xs">
                <span className="text-blue-400">🎓 ศิษย์เก่า {totalAlumni} คน</span>
                <span className="text-green-400">📚 ศิษย์ปัจจุบัน {totalCurrent} คน</span>
              </div>
            </div>

            {/* Alumni Ranking */}
            {alumniStats.length > 0 && (
              <div className="rounded-xl p-4 mb-4" style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                  <span>🎓</span> อันดับรุ่นศิษย์เก่า
                </h4>
                <div className="space-y-2">
                  {alumniStats.map((item, index) => {
                    const maxCount = alumniStats[0].count;
                    const barStyle = getRankStyle(index);
                    return (
                      <div key={item.rx} className="flex items-center gap-2">
                        <div className="w-6 text-center flex-shrink-0">
                          {barStyle.medal ? (
                            <span className="text-sm">{barStyle.medal}</span>
                          ) : (
                            <span className="text-gray-500 text-xs">{index + 1}</span>
                          )}
                        </div>
                        <div className="w-16 text-xs text-blue-300 text-right flex-shrink-0">{item.rx}</div>
                        <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <div 
                            className="h-full rounded-full flex items-center justify-end pr-2"
                            style={{ 
                              width: `${(item.count / maxCount) * 100}%`,
                              background: barStyle.bg
                            }}
                          >
                            <span className="text-white text-xs font-bold">{item.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Students Ranking */}
            {currentStats.length > 0 && (
              <div className="rounded-xl p-4 mb-4" style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                  <span>📚</span> อันดับชั้นปีศิษย์ปัจจุบัน
                </h4>
                <div className="space-y-2">
                  {currentStats.map((item, index) => {
                    const maxCount = currentStats[0].count;
                    const barStyle = getRankStyle(index);
                    return (
                      <div key={item.rx} className="flex items-center gap-2">
                        <div className="w-6 text-center flex-shrink-0">
                          {barStyle.medal ? (
                            <span className="text-sm">{barStyle.medal}</span>
                          ) : (
                            <span className="text-gray-500 text-xs">{index + 1}</span>
                          )}
                        </div>
                        <div className="w-16 text-xs text-green-300 text-right flex-shrink-0">{item.rx}</div>
                        <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <div 
                            className="h-full rounded-full flex items-center justify-end pr-2"
                            style={{ 
                              width: `${(item.count / maxCount) * 100}%`,
                              background: barStyle.bg
                            }}
                          >
                            <span className="text-white text-xs font-bold">{item.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No data message */}
            {alumniStats.length === 0 && currentStats.length === 0 && (
              <div className="rounded-xl p-4 mb-4 text-center" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <p className="text-gray-400">ยังไม่มีข้อมูลสถิติ</p>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setShowStatsModal(false)}
              className="w-full mt-4 py-3 rounded-full text-white font-medium"
              style={{ background: 'linear-gradient(135deg, #e94560, #ff6b6b)' }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && !isAdminLoggedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">🔐 Admin Login</h3>
              <button onClick={() => setShowAdminLogin(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Username</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter password"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>
              {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
              <button
                onClick={handleAdminLogin}
                className="w-full py-3 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, #e94560, #ff6b6b)' }}
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Dashboard */}
      {isAdminLoggedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-auto">
          <div className="min-h-screen p-4" style={{
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f3460 100%)'
          }}>
            {/* Admin Header */}
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #e94560, #ff6b6b)'
                  }}>
                    <span className="text-white">⚙️</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-gray-400 text-sm">งานครบรอบ 40 ปี เภสัชรังสิต</p>
                  </div>
                </div>
                <button
                  onClick={handleAdminLogout}
                  className="px-4 py-2 rounded-lg text-white text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  ออกจากระบบ ↗
                </button>
              </div>

              {/* Admin Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setAdminTab('dashboard')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    adminTab === 'dashboard' ? 'text-white' : 'text-gray-400'
                  }`}
                  style={{
                    background: adminTab === 'dashboard' ? 'linear-gradient(135deg, #e94560, #ff6b6b)' : 'rgba(255,255,255,0.05)'
                  }}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setAdminTab('responses')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    adminTab === 'responses' ? 'text-white' : 'text-gray-400'
                  }`}
                  style={{
                    background: adminTab === 'responses' ? 'linear-gradient(135deg, #e94560, #ff6b6b)' : 'rgba(255,255,255,0.05)'
                  }}
                >
                  📋 Responses
                </button>
              </div>

              {/* Dashboard Tab */}
              {adminTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-xl p-4" style={{ background: 'rgba(79, 195, 247, 0.15)', border: '1px solid rgba(79, 195, 247, 0.3)' }}>
                      <div className="text-3xl font-bold text-white">{getStats().total}</div>
                      <div className="text-gray-300 text-sm">ผู้ตอบทั้งหมด</div>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: 'rgba(76, 175, 80, 0.15)', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                      <div className="text-3xl font-bold text-white">{getStats().interested}</div>
                      <div className="text-gray-300 text-sm">สนใจเข้าร่วม</div>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: 'rgba(255, 193, 7, 0.15)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                      <div className="text-3xl font-bold text-white">{getStats().morning}</div>
                      <div className="text-gray-300 text-sm">ครึ่งเช้า</div>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: 'rgba(233, 69, 96, 0.15)', border: '1px solid rgba(233, 69, 96, 0.3)' }}>
                      <div className="text-3xl font-bold text-white">{getStats().afternoon}</div>
                      <div className="text-gray-300 text-sm">ครึ่งบ่าย</div>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Interest Chart */}
                    <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <h3 className="text-white font-bold mb-4">📊 ความสนใจเข้าร่วมงาน</h3>
                      <div className="flex items-center gap-4">
                        <div className="relative w-32 h-32">
                          <svg viewBox="0 0 36 36" className="w-full h-full">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#4CAF50"
                              strokeWidth="3"
                              strokeDasharray={`${(getStats().interested / getStats().total) * 100}, 100`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{Math.round((getStats().interested / getStats().total) * 100)}%</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-gray-300 text-sm">สนใจ ({getStats().interested})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                            <span className="text-gray-300 text-sm">ไม่สนใจ ({getStats().total - getStats().interested})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Chart */}
                    <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <h3 className="text-white font-bold mb-4">👥 สถานะผู้ตอบ</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">ศิษย์เก่า</span>
                            <span className="text-white">{getStats().alumni}</span>
                          </div>
                          <div className="h-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <div className="h-full rounded-full" style={{
                              width: `${(getStats().alumni / getStats().total) * 100}%`,
                              background: 'linear-gradient(90deg, #e94560, #ff6b6b)'
                            }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">ศิษย์ปัจจุบัน</span>
                            <span className="text-white">{getStats().current}</span>
                          </div>
                          <div className="h-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <div className="h-full rounded-full" style={{
                              width: `${(getStats().current / getStats().total) * 100}%`,
                              background: 'linear-gradient(90deg, #4FC3F7, #2196F3)'
                            }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Disciplines */}
                    <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <h3 className="text-white font-bold mb-4">📚 ประเด็นที่สนใจ (Top 5)</h3>
                      <div className="space-y-2">
                        {Object.entries(getStats().disciplineCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([key, count], i) => {
                            const discipline = disciplines.find(d => d.id === key);
                            const maxCount = Math.max(...Object.values(getStats().disciplineCounts));
                            return (
                              <div key={key} className="flex items-center gap-2">
                                <span className="text-gray-400 w-4 text-sm">{i + 1}</span>
                                <div className="flex-1">
                                  <div className="h-6 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                    <div className="h-full rounded-full flex items-center px-2" style={{
                                      width: `${(count / maxCount) * 100}%`,
                                      background: `linear-gradient(90deg, hsl(${200 + i * 30}, 70%, 50%), hsl(${200 + i * 30}, 70%, 60%))`
                                    }}>
                                      <span className="text-white text-xs truncate">{discipline?.label || key}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-white text-sm w-6">{count}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Registration Fees - 3 Schemes */}
                    <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <h3 className="text-white font-bold mb-4">💰 ค่าลงทะเบียนที่เหมาะสม</h3>
                      
                      {/* Full Package */}
                      <div className="mb-4">
                        <p className="text-yellow-400 text-sm mb-2">🎉 Full Package (ประชุม + เลี้ยง)</p>
                        <div className="space-y-2">
                          {['2000-2500', '2500-3000', '3000-3500'].map(fee => {
                            const count = getStats().feeFullPackageCounts[fee] || 0;
                            const maxCount = Math.max(...Object.values(getStats().feeFullPackageCounts), 1);
                            return (
                              <div key={fee} className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs w-24">{fee} บาท</span>
                                <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                  <div className="h-full rounded-full" style={{
                                    width: `${(count / maxCount) * 100}%`,
                                    background: 'linear-gradient(90deg, #FFD700, #FFA500)'
                                  }}></div>
                                </div>
                                <span className="text-white text-xs w-6">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Conference Only */}
                      <div className="mb-4">
                        <p className="text-yellow-400 text-sm mb-2">📚 เฉพาะประชุมวิชาการ</p>
                        <div className="space-y-2">
                          {['800-1000', '1000-1200', '1200-1500'].map(fee => {
                            const count = getStats().feeConferenceOnlyCounts[fee] || 0;
                            const maxCount = Math.max(...Object.values(getStats().feeConferenceOnlyCounts), 1);
                            return (
                              <div key={fee} className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs w-24">{fee} บาท</span>
                                <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                  <div className="h-full rounded-full" style={{
                                    width: `${(count / maxCount) * 100}%`,
                                    background: 'linear-gradient(90deg, #4FC3F7, #2196F3)'
                                  }}></div>
                                </div>
                                <span className="text-white text-xs w-6">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Party Only */}
                      <div>
                        <p className="text-yellow-400 text-sm mb-2">🥂 เฉพาะงานเลี้ยง</p>
                        <div className="space-y-2">
                          {['1000-1200', '1200-1500', '1500-1800'].map(fee => {
                            const count = getStats().feePartyOnlyCounts[fee] || 0;
                            const maxCount = Math.max(...Object.values(getStats().feePartyOnlyCounts), 1);
                            return (
                              <div key={fee} className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs w-24">{fee} บาท</span>
                                <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                  <div className="h-full rounded-full" style={{
                                    width: `${(count / maxCount) * 100}%`,
                                    background: 'linear-gradient(90deg, #E040FB, #9C27B0)'
                                  }}></div>
                                </div>
                                <span className="text-white text-xs w-6">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alumni Responses by Rx - Ranking */}
                  <div className="rounded-xl p-5" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <h3 className="text-white font-bold mb-4">🎓 อันดับรุ่นศิษย์เก่า</h3>
                    <div className="space-y-2">
                      {alumniStats.length > 0 ? alumniStats.map((item, index) => {
                        const maxCount = alumniStats[0].count;
                        const isTop3 = index < 3;
                        const medals = ['🥇', '🥈', '🥉'];
                        const barColors = [
                          'linear-gradient(90deg, #FFD700, #FFA500)',
                          'linear-gradient(90deg, #C0C0C0, #A8A8A8)',
                          'linear-gradient(90deg, #CD7F32, #B8860B)',
                        ];
                        return (
                          <div key={item.rx} className="flex items-center gap-2">
                            <div className="w-8 text-center flex-shrink-0">
                              {isTop3 ? (
                                <span className="text-lg">{medals[index]}</span>
                              ) : (
                                <span className="text-gray-400 text-sm">{index + 1}</span>
                              )}
                            </div>
                            <div className="w-16 text-xs text-blue-300 font-medium text-right flex-shrink-0">
                              {item.rx}
                            </div>
                            <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                              <div className="h-full rounded-full flex items-center justify-end pr-2" style={{
                                width: `${(item.count / maxCount) * 100}%`,
                                background: isTop3 ? barColors[index] : 'linear-gradient(90deg, #4FC3F788, #4FC3F7)'
                              }}>
                                <span className="text-white text-xs font-bold">{item.count}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }) : (
                        <p className="text-gray-500 text-sm text-center">ยังไม่มีข้อมูลศิษย์เก่า</p>
                      )}
                    </div>
                  </div>

                  {/* Current Students by Year - Ranking */}
                  <div className="rounded-xl p-5" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    <h3 className="text-white font-bold mb-4">📚 อันดับชั้นปีศิษย์ปัจจุบัน</h3>
                    <div className="space-y-2">
                      {currentStats.length > 0 ? currentStats.map((item, index) => {
                        const maxCount = currentStats[0].count;
                        const isTop3 = index < 3;
                        const medals = ['🥇', '🥈', '🥉'];
                        const barColors = [
                          'linear-gradient(90deg, #FFD700, #FFA500)',
                          'linear-gradient(90deg, #C0C0C0, #A8A8A8)',
                          'linear-gradient(90deg, #CD7F32, #B8860B)',
                        ];
                        return (
                          <div key={item.rx} className="flex items-center gap-2">
                            <div className="w-8 text-center flex-shrink-0">
                              {isTop3 ? (
                                <span className="text-lg">{medals[index]}</span>
                              ) : (
                                <span className="text-gray-400 text-sm">{index + 1}</span>
                              )}
                            </div>
                            <div className="w-16 text-xs text-green-300 font-medium text-right flex-shrink-0">
                              {item.rx}
                            </div>
                            <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                              <div className="h-full rounded-full flex items-center justify-end pr-2" style={{
                                width: `${(item.count / maxCount) * 100}%`,
                                background: isTop3 ? barColors[index] : 'linear-gradient(90deg, #22C55E88, #22C55E)'
                              }}>
                                <span className="text-white text-xs font-bold">{item.count}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }) : (
                        <p className="text-gray-500 text-sm text-center">ยังไม่มีข้อมูลศิษย์ปัจจุบัน</p>
                      )}
                    </div>
                  </div>

                  {/* More Charts Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Seminar Topics */}
                    <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <h3 className="text-white font-bold mb-4">🎯 หัวข้อสัมมนาที่สนใจ</h3>
                      <div className="space-y-2">
                        {Object.entries(getStats().topicCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([key, count], i) => {
                            const topic = seminarTopics.find(t => t.id === key);
                            const maxCount = Math.max(...Object.values(getStats().topicCounts));
                            return (
                              <div key={key} className="flex items-center gap-2">
                                <span className="text-gray-400 w-4 text-sm">{i + 1}</span>
                                <div className="flex-1">
                                  <div className="h-6 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                    <div className="h-full rounded-full flex items-center px-2" style={{
                                      width: `${(count / maxCount) * 100}%`,
                                      background: `linear-gradient(90deg, hsl(${280 + i * 20}, 70%, 50%), hsl(${280 + i * 20}, 70%, 60%))`
                                    }}>
                                      <span className="text-white text-xs truncate">{topic?.label || key}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-white text-sm w-6">{count}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Presentation Formats */}
                    <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <h3 className="text-white font-bold mb-4">🎤 รูปแบบการนำเสนอที่สนใจ</h3>
                      <div className="space-y-2">
                        {Object.entries(getStats().formatCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([key, count], i) => {
                            const format = presentationFormats.find(f => f.id === key);
                            const maxCount = Math.max(...Object.values(getStats().formatCounts));
                            return (
                              <div key={key} className="flex items-center gap-2">
                                <span className="text-gray-400 w-4 text-sm">{i + 1}</span>
                                <div className="flex-1">
                                  <div className="h-6 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                    <div className="h-full rounded-full flex items-center px-2" style={{
                                      width: `${(count / maxCount) * 100}%`,
                                      background: `linear-gradient(90deg, hsl(${120 + i * 25}, 60%, 45%), hsl(${120 + i * 25}, 60%, 55%))`
                                    }}>
                                      <span className="text-white text-xs truncate">{format?.label || key}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-white text-sm w-6">{count}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Alumni Benefits */}
                    <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <h3 className="text-white font-bold mb-4">🎁 สิทธิประโยชน์ที่อยากได้</h3>
                      <div className="space-y-3">
                        {Object.entries(getStats().benefitCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([key, count]) => {
                            const benefit = alumniBenefits.find(b => b.id === key);
                            const maxCount = Math.max(...Object.values(getStats().benefitCounts));
                            return (
                              <div key={key} className="flex items-center gap-3">
                                <span className="text-2xl">{benefit?.icon || '🎁'}</span>
                                <div className="flex-1">
                                  <div className="h-6 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                    <div className="h-full rounded-full flex items-center px-2" style={{
                                      width: `${(count / maxCount) * 100}%`,
                                      background: 'linear-gradient(90deg, #9C27B0, #E040FB)'
                                    }}>
                                      <span className="text-white text-xs truncate">{benefit?.label || key}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-white font-bold">{count}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Booth Activities */}
                    <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <h3 className="text-white font-bold mb-4">🎪 กิจกรรมบูธที่สนใจ</h3>
                      <div className="space-y-2">
                        {Object.entries(getStats().boothCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([key, count], i) => {
                            const booth = boothActivities.find(b => b.id === key);
                            const maxCount = Math.max(...Object.values(getStats().boothCounts));
                            return (
                              <div key={key} className="flex items-center gap-2">
                                <span className="text-xl">{booth?.icon || '🎯'}</span>
                                <div className="flex-1">
                                  <div className="h-6 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                    <div className="h-full rounded-full flex items-center px-2" style={{
                                      width: `${(count / maxCount) * 100}%`,
                                      background: `linear-gradient(90deg, hsl(${40 + i * 30}, 80%, 50%), hsl(${40 + i * 30}, 80%, 60%))`
                                    }}>
                                      <span className="text-white text-xs truncate">{booth?.label || key}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-white text-sm w-6">{count}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Province Distribution */}
                  <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 className="text-white font-bold mb-4">📍 จังหวัดที่ทำงาน</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(getStats().provinceCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([province, count]) => (
                          <div key={province} className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="text-2xl font-bold text-white">{count}</div>
                            <div className="text-gray-400 text-sm">{province}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Responses Tab */}
              {adminTab === 'responses' && (
                <div>
                  {/* Export Button */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold">รายการผู้ตอบแบบสอบถาม ({allResponses.length} รายการ)</h3>
                    <button
                      onClick={exportToExcel}
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #4CAF50, #45a049)' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export Excel
                    </button>
                  </div>

                  {/* Responses Table */}
                  <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <th className="text-left text-gray-300 p-3">#</th>
                            <th className="text-left text-gray-300 p-3">ชื่อ-นามสกุล</th>
                            <th className="text-left text-gray-300 p-3">รุ่น</th>
                            <th className="text-left text-gray-300 p-3">ที่ทำงาน</th>
                            <th className="text-left text-gray-300 p-3">โทร</th>
                            <th className="text-left text-gray-300 p-3">สนใจ</th>
                            <th className="text-left text-gray-300 p-3">เวลา</th>
                            <th className="text-left text-gray-300 p-3">วันที่</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allResponses.map((r, i) => (
                            <tr key={r.id} className="border-t border-gray-700 hover:bg-white hover:bg-opacity-5">
                              <td className="p-3 text-gray-400">{i + 1}</td>
                              <td className="p-3 text-white">{r.fullName}</td>
                              <td className="p-3 text-gray-300">{r.rxGeneration || r.currentYear}</td>
                              <td className="p-3 text-gray-300">{r.workplace}</td>
                              <td className="p-3 text-gray-300">{r.phone}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  r.interestedToJoin === 'yes' ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'
                                }`}>
                                  {r.interestedToJoin === 'yes' ? '✓ สนใจ' : '✗ ไม่สนใจ'}
                                </span>
                              </td>
                              <td className="p-3 text-gray-300">
                                {r.preferredTime === 'morning' ? '🌅 เช้า' : r.preferredTime === 'afternoon' ? '🌤️ บ่าย' : r.preferredTime === 'both' ? '☀️ ทั้งวัน' : '-'}
                              </td>
                              <td className="p-3 text-gray-400 text-xs">{r.timestamp}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyQuestionnaire;
