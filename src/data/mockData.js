export const STORAGE_KEYS = {
  KHACH_HANG: 'sportbook_khach_hang_v1',
  PHIEU_DAT_SAN: 'sportbook_phieu_dat_san_v1',
  CHI_TIET_DAT_SAN: 'sportbook_chi_tiet_dat_san_v1',
  CURRENT_USER: 'sportbook_current_user_v1'
};

export function getTodayStr() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
}

export const TODAY_STR = getTodayStr();

export const LOAI_SAN = [
  { MaLoai: 'LS01', TenLoai: 'Sân bóng đá 5 người', MoTa: 'Mặt cỏ nhân tạo tiêu chuẩn FIFA, có hệ thống đèn LED chống chói.' },
  { MaLoai: 'LS02', TenLoai: 'Sân bóng đá 7 người', MoTa: 'Sân cỏ nhân tạo kích thước lớn, phù hợp thi đấu giao hữu phong trào.' },
  { MaLoai: 'LS03', TenLoai: 'Sân bóng đá 11 người', MoTa: 'Sân tiêu chuẩn thi đấu giải chuyên nghiệp, khán đài và phòng thay đồ.' },
];

export const SAN = [
  { MaSan: 'S01', TenSan: 'Sân Bóng Đá 5 - A1', ChieuDai: 40, ChieuRong: 20, MaLoai: 'LS01', TrangThai: 'Hoạt động' },
  { MaSan: 'S02', TenSan: 'Sân Bóng Đá 5 - A2', ChieuDai: 40, ChieuRong: 20, MaLoai: 'LS01', TrangThai: 'Hoạt động' },
  { MaSan: 'S03', TenSan: 'Sân Bóng Đá 7 - B1', ChieuDai: 55, ChieuRong: 35, MaLoai: 'LS02', TrangThai: 'Hoạt động' },
  { MaSan: 'S04', TenSan: 'Sân Bóng Đá 11 - C1', ChieuDai: 105, ChieuRong: 68, MaLoai: 'LS03', TrangThai: 'Hoạt động' },
];

export const TIME_SLOTS = [
  { KhungGioBD: '06:00', KhungGioKT: '08:00', label: '06:00 - 08:00', hours: 2, period: 'Sáng sớm' },
  { KhungGioBD: '08:00', KhungGioKT: '10:00', label: '08:00 - 10:00', hours: 2, period: 'Buổi sáng' },
  { KhungGioBD: '14:00', KhungGioKT: '16:00', label: '14:00 - 16:00', hours: 2, period: 'Buổi chiều' },
  { KhungGioBD: '16:00', KhungGioKT: '18:00', label: '16:00 - 18:00', hours: 2, period: 'Giờ vàng' },
  { KhungGioBD: '18:00', KhungGioKT: '20:00', label: '18:00 - 20:00', hours: 2, period: 'Cao điểm tối' },
  { KhungGioBD: '20:00', KhungGioKT: '22:00', label: '20:00 - 22:00', hours: 2, period: 'Buổi tối' }
];

export const DEFAULT_KHACH_HANG = [
  { MaKH: 'KH001', TenKH: 'Nguyễn Văn An', Email: 'an.nguyen@gmail.com', SDT: '0901234567', DiaChi: 'Quận Ninh Kiều, TP. Cần Thơ', MatKhau: '123456' },
  { MaKH: 'KH002', TenKH: 'Trần Thị Bích', Email: 'bich.tran@gmail.com', SDT: '0912345678', DiaChi: 'Quận Cái Răng, TP. Cần Thơ', MatKhau: '123456' },
  { MaKH: 'KH003', TenKH: 'Lê Hoàng Nam', Email: 'namle.sport@gmail.com', SDT: '0987654321', DiaChi: 'Quận Bình Thủy, TP. Cần Thơ', MatKhau: '123456' }
];

export const DEFAULT_PHIEU_DAT_SAN = [
  {
    MaPhieu: 'PD2026001',
    MaKH: 'KH001',
    NgayDat: `${TODAY_STR} 07:15`,
    TongTien: 600000,
    TienCoc: 180000,
    DaThanhToan: 180000,
    PhuongThucTT: 'Chuyển khoản VietQR',
    NgayThanhToan: `${TODAY_STR} 07:18`,
    GhiChu: 'Đặt sân đá giao hữu công ty, chuẩn bị sẵn 2 chai nước suối lớn.',
    TrangThai: 'Đã đặt cọc (30%)'
  },
  {
    MaPhieu: 'PD2026002',
    MaKH: 'KH002',
    NgayDat: `${TODAY_STR} 08:05`,
    TongTien: 234000,
    TienCoc: 70200,
    DaThanhToan: 0,
    PhuongThucTT: '',
    NgayThanhToan: '',
    GhiChu: 'Thuê thêm 2 vợt cầu lông tại quầy.',
    TrangThai: 'Chờ thanh toán'
  }
];

export const DEFAULT_CHI_TIET_DAT_SAN = [
  {
    STT_PD: 1,
    MaPhieu: 'PD2026001',
    MaSan: 'S01',
    NgaySuDung: TODAY_STR,
    NgayGioNhanDK: `${TODAY_STR} 18:00`,
    NgayGioTraDK: `${TODAY_STR} 20:00`,
    KhungGioBD: '18:00',
    KhungGioKT: '20:00',
    GiaLucDat: 600000
  },
  {
    STT_PD: 2,
    MaPhieu: 'PD2026002',
    MaSan: 'S05',
    NgaySuDung: TODAY_STR,
    NgayGioNhanDK: `${TODAY_STR} 20:00`,
    NgayGioTraDK: `${TODAY_STR} 22:00`,
    KhungGioBD: '20:00',
    KhungGioKT: '22:00',
    GiaLucDat: 234000
  }
];
