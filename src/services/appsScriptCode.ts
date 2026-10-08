/**
 * Google Apps Script source code template for TemanKelompok
 * Dapat disalin langsung ke Google Apps Script (Extensions > Apps Script)
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * TEMANKELOMPOK - BACKEND GOOGLE APPS SCRIPT
 * Web App Endpoint & Database Google Sheets
 * =========================================================================
 * 
 * CARA PEMASANGAN:
 * 1. Buat Google Spreadsheet baru di Google Drive (https://sheets.new)
 * 2. Di menu atas Spreadsheet, klik 'Extensions' (Ekstensi) > 'Apps Script'
 * 3. Hapus kode bawaan (myFunction), lalu Tempelkan (Paste) seluruh kode ini
 * 4. Klik tombol 'Save' (ikon disket)
 * 5. Jalankan fungsi 'setupSpreadsheet' sekali untuk membuat tab & kolom otomatis
 * 6. Klik tombol 'Deploy' (Terapkan) di pojok kanan atas > 'New deployment' (Penerapan baru)
 * 7. Pilih tipe: 'Web app' (ikon roda gigi)
 * 8. Atur:
 *    - Description: TemanKelompok API v1
 *    - Execute as: 'Me' (Saya)
 *    - Who has access: 'Anyone' (Siapa saja)  <-- PENTING! Agar webapp bisa akses
 * 9. Klik 'Deploy', izinkan otorisasi akses Google jika diminta
 * 10. Salin 'Web app URL' (akhiran /exec) dan tempelkan ke Pengaturan Webapp Anda!
 */

// Inisialisasi Spreadsheet aktif
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Menu otomatis di Google Spreadsheet untuk kemudahan Admin
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 TemanKelompok')
    .addItem('🛠️ Format Tab & Header Otomatis', 'setupSpreadsheet')
    .addItem('📊 Hitung Ulang Kuota & Status', 'recalculateStats')
    .addToUi();
}

/**
 * Buat sheet & kolom otomatis dengan styling profesional
 */
function setupSpreadsheet() {
  var ss = getSpreadsheet();
  
  // 1. Sheet Mata Kuliah
  var sheetMatkul = ss.getSheetByName('Mata_Kuliah') || ss.insertSheet('Mata_Kuliah');
  var headerMatkul = ['ID', 'Kode', 'Nama Mata Kuliah', 'Dosen Pengampu', 'SKS', 'Semester', 'Dibuat Pada'];
  sheetMatkul.getRange(1, 1, 1, headerMatkul.length).setValues([headerMatkul])
    .setBackground('#1e293b').setFontColor('#ffffff').setFontWeight('bold');
  sheetMatkul.setFrozenRows(1);

  // 2. Sheet Kelompok
  var sheetKelompok = ss.getSheetByName('Kelompok') || ss.insertSheet('Kelompok');
  var headerKelompok = [
    'ID', 'ID Matkul', 'Nama Kelompok', 'Topik Tugas', 'Deskripsi', 
    'Kuota Maksimal', 'Anggota Terisi', 'Ketua Kelompok', 'WhatsApp Ketua', 
    'Status', 'Batas Deadline', 'Link WA Group', 'Waktu Dibuat'
  ];
  sheetKelompok.getRange(1, 1, 1, headerKelompok.length).setValues([headerKelompok])
    .setBackground('#1e40af').setFontColor('#ffffff').setFontWeight('bold');
  sheetKelompok.setFrozenRows(1);

  // 3. Sheet Anggota
  var sheetAnggota = ss.getSheetByName('Anggota') || ss.insertSheet('Anggota');
  var headerAnggota = [
    'ID', 'ID Kelompok', 'ID Matkul', 'Nama Lengkap', 'NIM/NPM', 
    'Nomor WhatsApp', 'Email', 'Peran / Role', 'Keahlian', 
    'Komitmen', 'Status', 'Catatan Admin', 'Waktu Mendaftar'
  ];
  sheetAnggota.getRange(1, 1, 1, headerAnggota.length).setValues([headerAnggota])
    .setBackground('#065f46').setFontColor('#ffffff').setFontWeight('bold');
  sheetAnggota.setFrozenRows(1);

  return { success: true, message: 'Header dan tab berhasil dibuat otomatis!' };
}

/**
 * Handle HTTP GET - Mengambil data kelompok & anggota untuk Webapp
 */
function doGet(e) {
  try {
    var ss = getSpreadsheet();
    
    // Pastikan sheets ada
    var sheetMatkul = ss.getSheetByName('Mata_Kuliah');
    var sheetKelompok = ss.getSheetByName('Kelompok');
    var sheetAnggota = ss.getSheetByName('Anggota');
    
    if (!sheetKelompok || !sheetAnggota) {
      setupSpreadsheet();
      sheetMatkul = ss.getSheetByName('Mata_Kuliah');
      sheetKelompok = ss.getSheetByName('Kelompok');
      sheetAnggota = ss.getSheetByName('Anggota');
    }

    var courses = getRowsAsObjects(sheetMatkul, ['id', 'code', 'name', 'lecturer', 'sks', 'semester', 'createdAt']);
    var groups = getRowsAsObjects(sheetKelompok, [
      'id', 'courseId', 'name', 'topic', 'description', 'maxMembers', 
      'filledMembers', 'leaderName', 'leaderWa', 'status', 'deadline', 
      'waGroupLink', 'createdAt'
    ]);
    var members = getRowsAsObjects(sheetAnggota, [
      'id', 'groupId', 'courseId', 'name', 'nim', 'whatsapp', 'email', 
      'role', 'skills', 'commitment', 'status', 'notes', 'registeredAt'
    ]);

    var result = {
      status: 'success',
      courses: courses,
      groups: groups,
      members: members,
      spreadsheetName: ss.getName(),
      timestamp: new Date().toISOString()
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle HTTP POST - Menerima pendaftaran baru atau sinkronisasi penuh
 */
function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      throw new Error('Data payload kosong');
    }

    var action = data.action || 'syncAll';
    var ss = getSpreadsheet();

    // 1. Tes Koneksi
    if (action === 'testConnection') {
      return responseJson({
        status: 'success',
        message: 'Koneksi ke Google Sheets berhasil! Spreadsheet: ' + ss.getName(),
        timestamp: new Date().toISOString()
      });
    }

    // 2. Pendaftaran Anggota Baru dari Mahasiswa
    if (action === 'registerMember') {
      var member = data.member;
      var sheetAnggota = ss.getSheetByName('Anggota') || ss.insertSheet('Anggota');
      
      var newRow = [
        member.id || 'MEM-' + Date.now(),
        member.groupId,
        member.courseId,
        member.name,
        member.nim,
        member.whatsapp,
        member.email || '',
        member.role,
        member.skills || '',
        member.commitment || '',
        member.status || 'PENDING',
        member.notes || '',
        member.registeredAt || new Date().toISOString()
      ];
      
      sheetAnggota.appendRow(newRow);
      recalculateStats();

      return responseJson({
        status: 'success',
        message: 'Pendaftaran berhasil dicatat di Google Sheets',
        memberId: member.id
      });
    }

    // 3. Update Status Anggota (Diterima / Ditolak oleh Admin)
    if (action === 'updateMemberStatus') {
      var sheetAnggota = ss.getSheetByName('Anggota');
      if (sheetAnggota) {
        var values = sheetAnggota.getDataRange().getValues();
        for (var i = 1; i < values.length; i++) {
          if (values[i][0] == data.memberId) {
            sheetAnggota.getRange(i + 1, 11).setValue(data.newStatus); // Kolom 11: Status
            if (data.notes) {
              sheetAnggota.getRange(i + 1, 12).setValue(data.notes);
            }
            break;
          }
        }
      }
      recalculateStats();
      return responseJson({ status: 'success', message: 'Status anggota diperbarui' });
    }

    // 4. Sinkronisasi Penuh (Sync All dari Web App ke Google Sheets)
    if (action === 'syncAll') {
      setupSpreadsheet();
      
      // Update Mata Kuliah
      if (data.courses && Array.isArray(data.courses)) {
        var sheetMatkul = ss.getSheetByName('Mata_Kuliah');
        clearDataRows(sheetMatkul);
        var matkulRows = data.courses.map(function(c) {
          return [c.id, c.code, c.name, c.lecturer, c.sks, c.semester, c.createdAt];
        });
        if (matkulRows.length > 0) {
          sheetMatkul.getRange(2, 1, matkulRows.length, matkulRows[0].length).setValues(matkulRows);
        }
      }

      // Update Kelompok
      if (data.groups && Array.isArray(data.groups)) {
        var sheetKelompok = ss.getSheetByName('Kelompok');
        clearDataRows(sheetKelompok);
        var groupRows = data.groups.map(function(g) {
          return [
            g.id, g.courseId, g.name, g.topic, g.description, 
            g.maxMembers, g.filledMembers || 0, g.leaderName, 
            g.leaderWa, g.status, g.deadline, g.waGroupLink || '', g.createdAt
          ];
        });
        if (groupRows.length > 0) {
          sheetKelompok.getRange(2, 1, groupRows.length, groupRows[0].length).setValues(groupRows);
        }
      }

      // Update Anggota
      if (data.members && Array.isArray(data.members)) {
        var sheetAnggota = ss.getSheetByName('Anggota');
        clearDataRows(sheetAnggota);
        var memberRows = data.members.map(function(m) {
          return [
            m.id, m.groupId, m.courseId, m.name, m.nim, 
            m.whatsapp, m.email, m.role, m.skills, 
            m.commitment, m.status, m.notes || '', m.registeredAt
          ];
        });
        if (memberRows.length > 0) {
          sheetAnggota.getRange(2, 1, memberRows.length, memberRows[0].length).setValues(memberRows);
        }
      }

      recalculateStats();

      return responseJson({
        status: 'success',
        message: 'Seluruh data berhasil disinkronisasi ke Google Sheets',
        syncedAt: new Date().toISOString()
      });
    }

    return responseJson({ status: 'error', message: 'Aksi tidak dikenali: ' + action });

  } catch (err) {
    return responseJson({ status: 'error', message: err.toString() });
  }
}

/**
 * Helper: Hapus data tanpa menghapus baris header
 */
function clearDataRows(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow > 1 && lastCol > 0) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }
}

/**
 * Helper: Ambil baris sebagai objek JSON
 */
function getRowsAsObjects(sheet, keys) {
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, Math.min(lastCol, keys.length)).getValues();
  return data.map(function(row) {
    var obj = {};
    keys.forEach(function(key, idx) {
      obj[key] = row[idx] !== undefined ? row[idx] : '';
    });
    return obj;
  });
}

/**
 * Hitung ulang status kuota kelompok otomatis berdasarkan anggota yang di-APPROVED
 */
function recalculateStats() {
  var ss = getSpreadsheet();
  var sheetKelompok = ss.getSheetByName('Kelompok');
  var sheetAnggota = ss.getSheetByName('Anggota');
  if (!sheetKelompok || !sheetAnggota) return;

  var groupsData = sheetKelompok.getDataRange().getValues();
  var membersData = sheetAnggota.getDataRange().getValues();
  if (groupsData.length <= 1) return;

  // Hitung jumlah approved per groupId
  var counts = {};
  for (var m = 1; m < membersData.length; m++) {
    var gId = membersData[m][1];
    var status = membersData[m][10];
    if (status === 'APPROVED') {
      counts[gId] = (counts[gId] || 0) + 1;
    }
  }

  // Update kuota terisi di sheet kelompok (kolom 7: Anggota Terisi, kolom 10: Status)
  for (var g = 1; g < groupsData.length; g++) {
    var id = groupsData[g][0];
    var max = parseInt(groupsData[g][5], 10) || 1;
    var filled = counts[id] || 0;
    
    sheetKelompok.getRange(g + 1, 7).setValue(filled);

    var currentStatus = groupsData[g][9];
    if (currentStatus !== 'CLOSED') {
      if (filled >= max) {
        sheetKelompok.getRange(g + 1, 10).setValue('FULL');
      } else {
        sheetKelompok.getRange(g + 1, 10).setValue('OPEN');
      }
    }
  }
}

/**
 * Helper standar respons JSON
 */
function responseJson(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
