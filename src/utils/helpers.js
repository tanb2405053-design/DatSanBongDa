import { SAN, LOAI_SAN } from '../data/mockData';

export function getBangGia(maSan, ngayStr, khungGioBD) {
  const san = SAN.find(s => s.MaSan === maSan);
  if (!san) return 0;

  const dateObj = new Date(ngayStr + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let baseHourlyRate = 150000;
  if (san.MaLoai === 'LS01') baseHourlyRate = 200000;
  else if (san.MaLoai === 'LS02') baseHourlyRate = 350000;
  else if (san.MaLoai === 'LS03') baseHourlyRate = 600000;
  else if (san.MaLoai === 'LS04') baseHourlyRate = 90000;

  let timeMultiplier = 1.0;
  if (khungGioBD === '16:00') timeMultiplier = 1.25;
  else if (khungGioBD === '18:00') timeMultiplier = 1.5;
  else if (khungGioBD === '20:00') timeMultiplier = 1.3;

  const dayMultiplier = isWeekend ? 1.15 : 1.0;
  return Math.round((baseHourlyRate * timeMultiplier * dayMultiplier) / 1000) * 1000;
}

export function getLoaiSan(maLoai) {
  return LOAI_SAN.find(ls => ls.MaLoai === maLoai);
}

export function getSan(maSan) {
  return SAN.find(s => s.MaSan === maSan);
}

export function formatCurrency(amount) {
  return (amount || 0).toLocaleString('vi-VN') + ' đ';
}

export function formatDateVN(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function getUserInitial(fullName) {
  if (!fullName) return 'U';
  return fullName.trim().split(' ').pop().charAt(0).toUpperCase();
}

export function getStatusBadgeClass(trangThai) {
  if (trangThai === 'Đã hủy') return 'bg-rose-100 text-rose-700';
  if (trangThai === 'Đã thanh toán 100%') return 'bg-emerald-100 text-emerald-800';
  if (trangThai === 'Đã đặt cọc (30%)') return 'bg-blue-100 text-blue-800';
  if (trangThai === 'Chờ thu tiền tại quầy') return 'bg-purple-100 text-purple-800';
  return 'bg-amber-100 text-amber-800';
}
