'use client';

import React, { useState, useEffect } from 'react';

const FillMissingRx = () => {
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [rxInput, setRxInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'https://script.google.com/macros/s/AKfycbxOj9pdlycF2fvY9Ju13MTbYjEt1cJNGeosJsvPvn_8fltqSJBj5qpItB2OqZhlB4t7uQ/exec';

  // ดึงรายชื่อจาก Google Sheet
  const fetchPeople = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.success) {
        setPeople(data.people || []);
        setFilteredPeople(data.people || []);
        if (data.people.length === 0) {
          setAllDone(true);
        }
      } else {
        setError(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  // กรองรายชื่อตามการค้นหา
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredPeople(people);
    } else {
      const filtered = people.filter(p =>
        p.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        p.maskedName.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredPeople(filtered);
    }
  }, [searchText, people]);

  // เลือกคน
  const handleSelectPerson = (person) => {
    setSelectedPerson(person);
    setRxInput('');
    setSubmitSuccess(false);
  };

  // ส่งข้อมูล
  const handleSubmit = async () => {
    if (!selectedPerson || !rxInput.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowId: selectedPerson.id,
          fullName: selectedPerson.fullName,
          status: selectedPerson.status,
          rxValue: rxInput
        }),
        mode: 'no-cors'
      });

      // ลบคนที่กรอกแล้วออกจากรายการ
      const updatedPeople = people.filter(p => p.id !== selectedPerson.id);
      setPeople(updatedPeople);
      setFilteredPeople(updatedPeople.filter(p =>
        p.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        p.maskedName.toLowerCase().includes(searchText.toLowerCase())
      ));

      setSubmitSuccess(true);

      // ถ้าไม่มีคนเหลือ
      if (updatedPeople.length === 0) {
        setTimeout(() => setAllDone(true), 1500);
      } else {
        // Reset form หลัง 2 วินาที
        setTimeout(() => {
          setSelectedPerson(null);
          setRxInput('');
          setSubmitSuccess(false);
          setSearchText('');
        }, 2000);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึก');
    }

    setIsSubmitting(false);
  };

  // หน้าสำเร็จทั้งหมด
  if (allDone) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        fontFamily: "'Prompt', 'Sarabun', sans-serif"
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');`}</style>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl" style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)'
          }}>✓</div>
          <h1 className="text-2xl font-bold text-white mb-3">กรอกครบทุกคนแล้ว!</h1>
          <p className="text-gray-400 mb-4">ขอบคุณที่ร่วมกรอกข้อมูลครับ</p>
          <p className="text-gray-600 text-sm">สามารถปิดหน้านี้ได้เลย</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: "'Prompt', 'Sarabun', sans-serif"
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');`}</style>

      <div className="max-w-lg mx-auto pt-6 pb-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-2 rounded-full mb-4" style={{
            background: 'rgba(251, 191, 36, 0.2)',
            border: '1px solid rgba(251, 191, 36, 0.4)'
          }}>
            <span className="text-yellow-400 text-sm">⚠️ กรอกข้อมูลเพิ่มเติม</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">งานครบรอบ 40 ปี เภสัชรังสิต</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            ทีมงานต้องขออภัยที่เกิดข้อผิดพลาด<br/>
            ทำให้ท่านกดข้ามการกรอกข้อมูลที่สำคัญ<br/><br/>
            เพื่อให้การเก็บข้อมูลสมบูรณ์แบบ<br/>
            ทางผู้ออกแบบสำรวจและผู้จัดงานครบรอบ 40 ปี Rx RSU<br/>
            จึงรบกวนท่านกรอกรุ่นเพิ่มเติมให้หน่อยนะครับ 🙏
          </p>

          {/* คำแนะนำ */}
          <div className="mt-5 p-4 rounded-xl text-left" style={{
            background: 'rgba(79, 195, 247, 0.1)',
            border: '1px solid rgba(79, 195, 247, 0.3)'
          }}>
            <div className="text-cyan-400 font-semibold mb-3 text-sm">📝 วิธีการกรอก</div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(79, 195, 247, 0.2)', color: '#4FC3F7' }}>1</span>
                <span className="text-gray-300 text-sm">เลือกชื่อของท่านจากรายการด้านล่าง</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(79, 195, 247, 0.2)', color: '#4FC3F7' }}>2</span>
                <span className="text-gray-300 text-sm">กรอกรุ่น (ศิษย์เก่า) หรือ ชั้นปี (ศิษย์ปัจจุบัน)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(79, 195, 247, 0.2)', color: '#4FC3F7' }}>3</span>
                <span className="text-gray-300 text-sm">กดปุ่ม "ยืนยันข้อมูล"</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl p-5" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-10 h-10 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">กำลังโหลดข้อมูล...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">❌ {error}</p>
              <button onClick={fetchPeople} className="px-6 py-2 rounded-lg text-white" style={{ background: '#e94560' }}>
                ลองใหม่
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: ค้นหาและเลือกชื่อ */}
              <div className="mb-5">
                <label className="block text-white font-medium mb-3">1️⃣ เลือกชื่อของท่าน</label>

                {/* ช่องค้นหา */}
                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-white text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                    placeholder="พิมพ์ชื่อเพื่อค้นหา..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                <p className="text-gray-500 text-xs mb-2">พบ {filteredPeople.length} รายชื่อที่ยังไม่ได้กรอกรุ่น</p>

                {/* รายชื่อ */}
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {filteredPeople.length === 0 ? (
                    <p className="text-center text-gray-500 py-6">ไม่พบรายชื่อที่ค้นหา</p>
                  ) : (
                    filteredPeople.map((person) => (
                      <div
                        key={person.id}
                        onClick={() => handleSelectPerson(person)}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                          selectedPerson?.id === person.id
                            ? 'border-2 border-pink-500'
                            : 'border border-gray-700 hover:border-gray-500'
                        }`}
                        style={{
                          background: selectedPerson?.id === person.id
                            ? 'rgba(233, 69, 96, 0.15)'
                            : 'rgba(255, 255, 255, 0.03)'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{person.maskedName}</p>
                            <p className="text-gray-500 text-xs mt-1">{person.status}</p>
                          </div>
                          {selectedPerson?.id === person.id && (
                            <span className="text-pink-500 text-lg">✓</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Step 2: กรอกรุ่น */}
              {selectedPerson && (
                <div className="mb-5 animate-fadeIn">
                  <label className="block text-white font-medium mb-3">
                    2️⃣ กรอก{selectedPerson.status === 'ศิษย์เก่า' ? 'รุ่น' : 'ชั้นปี'} (ตัวเลข)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full px-4 py-4 rounded-xl text-white text-xl text-center outline-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                    placeholder={selectedPerson.status === 'ศิษย์เก่า' ? 'เช่น 16' : 'เช่น 3'}
                    value={rxInput}
                    onChange={(e) => setRxInput(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                  {rxInput && (
                    <p className="text-center text-gray-400 text-sm mt-2">
                      {selectedPerson.status === 'ศิษย์เก่า' ? `Rx${rxInput}` : `ปี ${rxInput}`}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!selectedPerson || !rxInput.trim() || isSubmitting}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                  !selectedPerson || !rxInput.trim() || isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:opacity-90'
                }`}
                style={{
                  background: submitSuccess
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'linear-gradient(135deg, #e94560, #ff6b6b)'
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    กำลังบันทึก...
                  </span>
                ) : submitSuccess ? (
                  '✓ บันทึกเรียบร้อย!'
                ) : (
                  'ยืนยันข้อมูล ✓'
                )}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6 leading-relaxed">
          งานครบรอบ 40 ปี เภสัชศาสตร์ มหาวิทยาลัยรังสิต<br/>
          20 มิถุนายน 2569
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default FillMissingRx;
