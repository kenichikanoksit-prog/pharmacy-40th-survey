'use client';

import React, { useState } from 'react';

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
  
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminTab, setAdminTab] = useState('dashboard');

  const [allResponses] = useState([
    { id: 1, fullName: 'สมชาย ใจดี', status: 'alumni', rxGeneration: 'Rx34', workplace: 'รพ.รามาธิบดี', province: 'กรุงเทพฯ', phone: '081-234-5678', interestedToJoin: 'yes', preferredTime: 'morning', disciplines: ['hospital', 'ai'], seminarTopics: ['brain', 'bioage'], presentationFormats: ['lecture'], alumniBenefits: ['cpe_discount', 'health'], otherBenefits: '', feeFullPackage: '2500-3000', feeConferenceOnly: '1000-1200', feePartyOnly: '1200-1500', boothActivities: ['bioage', 'brainapp'], timestamp: '2025-03-01 10:30' },
    { id: 2, fullName: 'สมหญิง รักเรียน', status: 'alumni', rxGeneration: 'Rx36', workplace: 'บ.ไฟเซอร์', province: 'กรุงเทพฯ', phone: '082-345-6789', interestedToJoin: 'yes', preferredTime: 'afternoon', disciplines: ['marketing', 'newdrug'], seminarTopics: ['pharmacogenomics'], presentationFormats: ['panel'], alumniBenefits: ['networking'], otherBenefits: 'ส่วนลดร้านค้าพันธมิตร', feeFullPackage: '2000-2500', feeConferenceOnly: '800-1000', feePartyOnly: '1000-1200', boothActivities: ['networking'], timestamp: '2025-03-01 14:22' },
    { id: 3, fullName: 'วิชัย เก่งกาจ', status: 'current', currentYear: 'ปี 5', workplace: 'มหาวิทยาลัยรังสิต', province: 'ปทุมธานี', phone: '083-456-7890', interestedToJoin: 'yes', preferredTime: 'morning', disciplines: ['ai', 'digital'], seminarTopics: ['brain', 'ecosystem'], presentationFormats: ['showcase'], alumniBenefits: ['cpe_discount', 'networking'], otherBenefits: '', feeFullPackage: '2000-2500', feeConferenceOnly: '800-1000', feePartyOnly: '1000-1200', boothActivities: ['brainapp', 'products'], timestamp: '2025-03-02 09:15' },
    { id: 4, fullName: 'มานี มีสุข', status: 'alumni', rxGeneration: 'Rx31', workplace: 'ร้านยาฟาสซิโน', province: 'เชียงใหม่', phone: '084-567-8901', interestedToJoin: 'yes', preferredTime: 'afternoon', disciplines: ['community', 'nutraceuticals'], seminarTopics: ['herbal', 'metabolism'], presentationFormats: ['sharing'], alumniBenefits: ['health', 'networking'], otherBenefits: '', feeFullPackage: '2500-3000', feeConferenceOnly: '1000-1200', feePartyOnly: '1200-1500', boothActivities: ['products', 'memory'], timestamp: '2025-03-02 16:45' },
    { id: 5, fullName: 'ประเสริฐ ยิ่งใหญ่', status: 'alumni', rxGeneration: 'Rx29', workplace: 'สำนักงาน อย.', province: 'นนทบุรี', phone: '085-678-9012', interestedToJoin: 'no', preferredTime: '', disciplines: ['regulatory'], seminarTopics: ['leadership'], presentationFormats: ['lecture'], alumniBenefits: ['cpe_discount'], otherBenefits: '', feeFullPackage: '3000-3500', feeConferenceOnly: '1200-1500', feePartyOnly: '1500-1800', boothActivities: [], timestamp: '2025-03-03 11:30' },
    { id: 6, fullName: 'นภา สวยงาม', status: 'alumni', rxGeneration: 'Rx35', workplace: 'คลินิกความงาม', province: 'กรุงเทพฯ', phone: '086-789-0123', interestedToJoin: 'yes', preferredTime: 'morning', disciplines: ['aesthetic', 'weight'], seminarTopics: ['bioage', 'metabolism'], presentationFormats: ['interview'], alumniBenefits: ['health', 'cpe_discount'], otherBenefits: '', feeFullPackage: '2500-3000', feeConferenceOnly: '1000-1200', feePartyOnly: '1200-1500', boothActivities: ['bioage'], timestamp: '2025-03-03 14:00' },
    { id: 7, fullName: 'กิตติ รุ่งเรือง', status: 'alumni', rxGeneration: 'Rx34', workplace: 'รพ.ศิริราช', province: 'กรุงเทพฯ', phone: '087-890-1234', interestedToJoin: 'yes', preferredTime: 'afternoon', disciplines: ['hospital', 'vaccine'], seminarTopics: ['brain'], presentationFormats: ['panel', 'lecture'], alumniBenefits: ['cpe_discount', 'networking', 'health'], otherBenefits: '', feeFullPackage: '2500-3000', feeConferenceOnly: '1000-1200', feePartyOnly: '1500-1800', boothActivities: ['brainapp', 'networking'], timestamp: '2025-03-04 10:00' },
    { id: 8, fullName: 'พิมพ์ใจ ดีเลิศ', status: 'current', currentYear: 'ปี 6', workplace: 'มหาวิทยาลัยรังสิต', province: 'ปทุมธานี', phone: '088-901-2345', interestedToJoin: 'yes', preferredTime: 'morning', disciplines: ['industrial', 'cannabis'], seminarTopics: ['herbal'], presentationFormats: ['showcase'], alumniBenefits: ['networking'], otherBenefits: 'ทุนการศึกษา', feeFullPackage: '2000-2500', feeConferenceOnly: '800-1000', feePartyOnly: '1000-1200', boothActivities: ['products'], timestamp: '2025-03-04 15:30' },
  ]);

  const ADMIN_USER = '40RxRSU';
  const ADMIN_PASS = 'RxRSU2026';

  const handleAdminLogin = () => {
    if (adminUsername === ADMIN_USER && adminPassword === ADMIN_PASS) {
      setIsAdminLoggedIn(true);
      setLoginError('');
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

  const exportToExcel = () => {
    const headers = ['ลำดับ', 'ชื่อ-นามสกุล', 'สถานะ', 'รุ่น/ชั้นปี', 'ที่ทำงาน', 'จังหวัด', 'โทรศัพท์', 'สนใจร่วมงาน', 'เวลาที่สะดวก', 'ประเด็นที่สนใจ', 'หัวข้อสัมมนา', 'รูปแบบการนำเสนอ', 'สิทธิประโยชน์ที่อยากได้', 'สิทธิประโยชน์อื่นๆ', 'ค่า Full Package', 'ค่าเฉพาะประชุม', 'ค่าเฉพาะเลี้ยง', 'กิจกรรมบูธ', 'วันที่ตอบ'];
    const rows = allResponses.map((r, i) => [
      i + 1, r.fullName, r.status === 'alumni' ? 'ศิษย์เก่า' : 'ศิษย์ปัจจุบัน', r.rxGeneration || r.currentYear || '', r.workplace, r.province, r.phone, r.interestedToJoin === 'yes' ? 'สนใจ' : 'ไม่สนใจ', r.preferredTime === 'morning' ? 'ครึ่งเช้า' : r.preferredTime === 'afternoon' ? 'ครึ่งบ่าย' : '', r.disciplines?.join(', ') || '', r.seminarTopics?.join(', ') || '', r.presentationFormats?.join(', ') || '', r.alumniBenefits?.join(', ') || '', r.otherBenefits || '', r.feeFullPackage || '', r.feeConferenceOnly || '', r.feePartyOnly || '', r.boothActivities?.join(', ') || '', r.timestamp
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `survey_responses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStats = () => {
    const total = allResponses.length;
    const interested = allResponses.filter(r => r.interestedToJoin === 'yes').length;
    const notInterested = allResponses.filter(r => r.interestedToJoin === 'no').length;
    const morning = allResponses.filter(r => r.preferredTime === 'morning').length;
    const afternoon = allResponses.filter(r => r.preferredTime === 'afternoon').length;
    const alumni = allResponses.filter(r => r.status === 'alumni').length;
    const current = allResponses.filter(r => r.status === 'current').length;
    const rxCounts = {};
    allResponses.forEach(r => {
      const rx = r.status === 'current' ? 'นศ. ปัจจุบัน' : r.rxGeneration;
      if (rx) rxCounts[rx] = (rxCounts[rx] || 0) + 1;
    });
    const disciplineCounts = {};
    allResponses.forEach(r => { r.disciplines?.forEach(d => { disciplineCounts[d] = (disciplineCounts[d] || 0) + 1; }); });
    const topicCounts = {};
    allResponses.forEach(r => { r.seminarTopics?.forEach(t => { topicCounts[t] = (topicCounts[t] || 0) + 1; }); });
    const formatCounts = {};
    allResponses.forEach(r => { r.presentationFormats?.forEach(f => { formatCounts[f] = (formatCounts[f] || 0) + 1; }); });
    const benefitCounts = {};
    allResponses.forEach(r => { r.alumniBenefits?.forEach(b => { benefitCounts[b] = (benefitCounts[b] || 0) + 1; }); });
    const feeFullPackageCounts = {};
    allResponses.forEach(r => { if (r.feeFullPackage) feeFullPackageCounts[r.feeFullPackage] = (feeFullPackageCounts[r.feeFullPackage] || 0) + 1; });
    const feeConferenceOnlyCounts = {};
    allResponses.forEach(r => { if (r.feeConferenceOnly) feeConferenceOnlyCounts[r.feeConferenceOnly] = (feeConferenceOnlyCounts[r.feeConferenceOnly] || 0) + 1; });
    const feePartyOnlyCounts = {};
    allResponses.forEach(r => { if (r.feePartyOnly) feePartyOnlyCounts[r.feePartyOnly] = (feePartyOnlyCounts[r.feePartyOnly] || 0) + 1; });
    const boothCounts = {};
    allResponses.forEach(r => { r.boothActivities?.forEach(b => { boothCounts[b] = (boothCounts[b] || 0) + 1; }); });
    const provinceCounts = {};
    allResponses.forEach(r => { if (r.province) provinceCounts[r.province] = (provinceCounts[r.province] || 0) + 1; });
    return { total, interested, notInterested, morning, afternoon, alumni, current, rxCounts, disciplineCounts, topicCounts, formatCounts, benefitCounts, feeFullPackageCounts, feeConferenceOnlyCounts, feePartyOnlyCounts, boothCounts, provinceCounts };
  };

  const sections = [
    { title: 'ข้อมูลผู้ให้ข้อมูล', icon: '👤', subtitle: 'Lead Generation' },
    { title: 'ประเด็นที่สนใจ', icon: '📚', subtitle: 'Disciplines & Trends' },
    { title: 'หัวข้อสัมมนา', icon: '🎯', subtitle: 'Deep-Dive Topics' },
    { title: 'รูปแบบงาน', icon: '🎤', subtitle: 'Format & Pricing' },
    { title: 'กิจกรรม & พาร์ทเนอร์', icon: '🤝', subtitle: 'Booth & Sponsors' }
  ];

  const disciplines = [
    { id: 'hospital', label: 'เภสัชกรรมโรงพยาบาล', icon: '🏥' },
    { id: 'community', label: 'เภสัชกรรมชุมชน/ร้านยา', icon: '💊' },
    { id: 'industrial', label: 'เภสัชอุตสาหกรรม', icon: '🏭' },
    { id: 'marketing', label: 'การตลาดยา', icon: '📊' },
    { id: 'regulatory', label: 'งานทะเบียนและกฎหมาย', icon: '📋' },
    { id: 'academic', label: 'วิชาการและวิจัย', icon: '🔬' },
    { id: 'aesthetic', label: 'เวชสำอางและความงาม', icon: '✨' },
    { id: 'nutraceuticals', label: 'อาหารเสริมและสมุนไพร', icon: '🌿' },
    { id: 'digital', label: 'Digital Health & AI', icon: '🤖' },
    { id: 'ai', label: 'AI ในงานเภสัชกรรม', icon: '🧠' },
    { id: 'cannabis', label: 'กัญชาทางการแพทย์', icon: '🌱' },
    { id: 'weight', label: 'Weight Management', icon: '⚖️' },
    { id: 'newdrug', label: 'นวัตกรรมยาใหม่', icon: '💡' },
    { id: 'vaccine', label: 'วัคซีนและภูมิคุ้มกัน', icon: '💉' }
  ];

  const seminarTopics = [
    { id: 'brain', label: 'Brain Health & Cognitive', desc: 'สุขภาพสมองและการป้องกันภาวะสมองเสื่อม' },
    { id: 'bioage', label: 'Biological Age', desc: 'อายุชีวภาพและการชะลอวัย' },
    { id: 'pharmacogenomics', label: 'Pharmacogenomics', desc: 'เภสัชพันธุศาสตร์และการแพทย์แม่นยำ' },
    { id: 'metabolism', label: 'Metabolic Health', desc: 'สุขภาพเมตาบอลิกและโรค NCDs' },
    { id: 'herbal', label: 'Herbal & Natural Products', desc: 'สมุนไพรและผลิตภัณฑ์ธรรมชาติ' },
    { id: 'leadership', label: 'Leadership & Career', desc: 'ภาวะผู้นำและการพัฒนาอาชีพ' },
    { id: 'ecosystem', label: 'Healthcare Ecosystem', desc: 'ระบบนิเวศสุขภาพและ Digital Health' }
  ];

  const presentationFormats = [
    { id: 'lecture', label: 'Lecture Style', desc: 'การบรรยายโดยผู้เชี่ยวชาญ' },
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
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const checkDuplicate = () => {
    const normalizedName = formData.fullName.trim().toLowerCase();
    const existingResponse = allResponses.find(r => r.fullName.trim().toLowerCase() === normalizedName);
    return existingResponse;
  };

  const handlePreSubmit = () => {
    const duplicate = checkDuplicate();
    if (duplicate) {
      setDuplicateName(duplicate.fullName);
      setShowDuplicateWarning(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const getDisplayValue = (field, value) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return '-';
    if (field === 'status') return value === 'alumni' ? 'ศิษย์เก่า' : 'ศิษย์ปัจจุบัน';
    if (field === 'interestedToJoin') return value === 'yes' ? '✅ สนใจเข้าร่วม' : '❌ ไม่สนใจ';
    if (field === 'preferredTime') return value === 'morning' ? '🌅 ครึ่งเช้า' : '🌤️ ครึ่งบ่าย';
    if (field === 'disciplines' && Array.isArray(value)) return value.map(v => disciplines.find(d => d.id === v)?.label || v).join(', ');
    if (field === 'seminarTopics' && Array.isArray(value)) return value.map(v => seminarTopics.find(t => t.id === v)?.label || v).join(', ');
    if (field === 'presentationFormats' && Array.isArray(value)) return value.map(v => presentationFormats.find(f => f.id === v)?.label || v).join(', ');
    if (field === 'alumniBenefits' && Array.isArray(value)) return value.map(v => alumniBenefits.find(b => b.id === v)?.label || v).join(', ');
    if (field === 'boothActivities' && Array.isArray(value)) return value.map(v => boothActivities.find(b => b.id === v)?.label || v).join(', ');
    return value;
  };

  const responsesByRx = [
    { rx: 'นศ. ปัจจุบัน', count: 55 },
    { rx: 'Rx34', count: 45 },
    { rx: 'Rx36', count: 42 },
    { rx: 'Rx35', count: 38 },
    { rx: 'Rx31', count: 35 },
    { rx: 'Rx33', count: 32 },
    { rx: 'Rx30', count: 30 },
    { rx: 'Rx29', count: 28 },
    { rx: 'Rx32', count: 28 },
    { rx: 'Rx37', count: 25 },
    { rx: 'Rx28', count: 25 },
    { rx: 'Rx38', count: 22 },
    { rx: 'Rx27', count: 20 },
    { rx: 'Rx39', count: 18 },
    { rx: 'Rx26', count: 15 },
    { rx: 'Rx25', count: 12 },
    { rx: 'Rx1-24', count: 8 },
  ].sort((a, b) => b.count - a.count);

  const totalResponses = responsesByRx.reduce((sum, r) => sum + r.count, 0);

  const getRankStyle = (index) => {
    if (index === 0) return { bg: 'linear-gradient(90deg, #FFD700, #FFA500)', medal: '🥇' };
    if (index === 1) return { bg: 'linear-gradient(90deg, #C0C0C0, #A8A8A8)', medal: '🥈' };
    if (index === 2) return { bg: 'linear-gradient(90deg, #CD7F32, #B8860B)', medal: '🥉' };
    return { bg: 'linear-gradient(90deg, #4FC3F788, #4FC3F7)', medal: null };
  };
