// ========================================
// Google Apps Script - Pharmacy 40th Survey
// Version: FINAL
// ========================================

// รับข้อมูลจากแบบสอบถาม
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // รับข้อมูล
    let data;
    if (e.parameter && e.parameter.data) {
      data = JSON.parse(e.parameter.data);
    } else if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      throw new Error('No data received');
    }
    
    // สร้าง Header ถ้ายังไม่มี
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp', 'ชื่อ-นามสกุล', 'สถานะ', 'รุ่น/ชั้นปี', 'ที่ทำงาน', 'จังหวัด', 
        'โทรศัพท์', 'Line/Email', 'สนใจร่วมงาน', 'เวลาที่สะดวก', 'ประเด็นที่สนใจ', 
        'หัวข้อสัมมนา', 'รูปแบบการนำเสนอ', 'สิทธิประโยชน์ที่อยากได้', 'สิทธิประโยชน์อื่นๆ',
        'ค่า Full Package', 'ค่าเฉพาะประชุม', 'ค่าเฉพาะเลี้ยง', 'กิจกรรมบูธ', 'แบรนด์ที่อยากให้มา'
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setBackground('#808000').setFontColor('#FFFFFF').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    // เพิ่มข้อมูล
    const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    const row = [
      timestamp,
      data.fullName || '',
      data.status === 'alumni' ? 'ศิษย์เก่า' : 'ศิษย์ปัจจุบัน',
      data.rxGeneration || data.currentYear || '',
      data.workplace || '',
      data.province || '',
      data.phone || '',
      data.contact || '',
      data.interestedToJoin === 'yes' ? 'สนใจ' : 'ไม่สนใจ',
      data.preferredTime === 'morning' ? 'ครึ่งเช้า' : data.preferredTime === 'afternoon' ? 'ครึ่งบ่าย' : data.preferredTime === 'both' ? 'ทั้งวัน' : '',
      (data.disciplines || []).join(', '),
      (data.seminarTopics || []).join(', '),
      (data.presentationFormats || []).join(', '),
      (data.alumniBenefits || []).join(', '),
      data.otherBenefits || '',
      data.feeFullPackage || '',
      data.feeConferenceOnly || '',
      data.feePartyOnly || '',
      (data.boothActivities || []).join(', '),
      data.preferredBrands || ''
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ดึงข้อมูลสถิติและ responses
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const allData = sheet.getDataRange().getValues();
    
    // ถ้าไม่มีข้อมูล
    if (allData.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        total: 0, 
        stats: [],
        responses: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // นับสถิติรุ่น
    const rxCounts = {};
    const responses = [];
    
    for (let i = 1; i < allData.length; i++) {
      const row = allData[i];
      
      // นับรุ่น
      const rx = row[3] ? row[3].toString().trim() : 'ไม่ระบุ';
      rxCounts[rx] = (rxCounts[rx] || 0) + 1;
      
      // เก็บ response
      responses.push({
        id: i,
        timestamp: row[0] || '',
        fullName: row[1] || '',
        status: row[2] === 'ศิษย์เก่า' ? 'alumni' : 'current',
        rxGeneration: row[2] === 'ศิษย์เก่า' ? row[3] : '',
        currentYear: row[2] === 'ศิษย์ปัจจุบัน' ? row[3] : '',
        workplace: row[4] || '',
        province: row[5] || '',
        phone: row[6] || '',
        contact: row[7] || '',
        interestedToJoin: row[8] === 'สนใจ' ? 'yes' : 'no',
        preferredTime: row[9] === 'ครึ่งเช้า' ? 'morning' : row[9] === 'ครึ่งบ่าย' ? 'afternoon' : row[9] === 'ทั้งวัน' ? 'both' : '',
        disciplines: row[10] ? row[10].split(', ') : [],
        seminarTopics: row[11] ? row[11].split(', ') : [],
        presentationFormats: row[12] ? row[12].split(', ') : [],
        alumniBenefits: row[13] ? row[13].split(', ') : [],
        otherBenefits: row[14] || '',
        feeFullPackage: row[15] || '',
        feeConferenceOnly: row[16] || '',
        feePartyOnly: row[17] || '',
        boothActivities: row[18] ? row[18].split(', ') : [],
        preferredBrands: row[19] || ''
      });
    }
    
    // แปลงสถิติเป็น array และเรียงลำดับ
    const stats = Object.entries(rxCounts)
      .map(([rx, count]) => ({ rx, count }))
      .sort((a, b) => b.count - a.count);
    
    const total = allData.length - 1;
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      total, 
      stats,
      responses
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
