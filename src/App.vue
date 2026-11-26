<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import {
  STORAGE_KEYS,
  TODAY_STR,
  TIME_SLOTS,
  DEFAULT_KHACH_HANG,
  DEFAULT_PHIEU_DAT_SAN,
  DEFAULT_CHI_TIET_DAT_SAN
} from './data/mockData';
import { getBangGia, getSan, formatCurrency } from './utils/helpers';

import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
import CourtSearchTab from './components/search/CourtSearchTab.vue';
import BookingListTab from './components/bookings/BookingListTab.vue';
import AuthModal from './components/modals/AuthModal.vue';
import BookingModal from './components/modals/BookingModal.vue';
import ReceiptModal from './components/modals/ReceiptModal.vue';
import PaymentModal from './components/modals/PaymentModal.vue';
import CancelModal from './components/modals/CancelModal.vue';

// -------------------------------------------------------------------
// 1. STATE DỮ LIỆU CHÍNH & ĐIỀU HƯỚNG
// -------------------------------------------------------------------
const khachHangList = ref([]);
const phieuDatSanList = ref([]);
const chiTietDatSanList = ref([]);
const currentUserMaKH = ref(null);

const activeTab = ref('search');
const pendingBookingAfterLogin = ref(null);
const toasts = ref([]);

const searchTabRef = ref(null);
const bookingTabRef = ref(null);

// State các Modal
const authModal = reactive({ isOpen: false, tab: 'login' });
const bookingModal = reactive({ isOpen: false, maSan: null, ngaySuDung: null, selectedSlot: '' });
const receiptModal = reactive({ isOpen: false, data: null });
const paymentModal = reactive({ isOpen: false, phieu: null });
const cancelModal = reactive({ isOpen: false, maPhieu: null });

// -------------------------------------------------------------------
// 2. LOCALSTORAGE HELPERS
// -------------------------------------------------------------------
function loadStateFromStorage() {
  try {
    const savedKH = localStorage.getItem(STORAGE_KEYS.KHACH_HANG);
    const savedPD = localStorage.getItem(STORAGE_KEYS.PHIEU_DAT_SAN);
    const savedCT = localStorage.getItem(STORAGE_KEYS.CHI_TIET_DAT_SAN);
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

    khachHangList.value = savedKH ? JSON.parse(savedKH) : JSON.parse(JSON.stringify(DEFAULT_KHACH_HANG));
    phieuDatSanList.value = savedPD ? JSON.parse(savedPD) : JSON.parse(JSON.stringify(DEFAULT_PHIEU_DAT_SAN));
    chiTietDatSanList.value = savedCT ? JSON.parse(savedCT) : JSON.parse(JSON.stringify(DEFAULT_CHI_TIET_DAT_SAN));
    currentUserMaKH.value = savedUser || null;
  } catch (e) {
    khachHangList.value = JSON.parse(JSON.stringify(DEFAULT_KHACH_HANG));
    phieuDatSanList.value = JSON.parse(JSON.stringify(DEFAULT_PHIEU_DAT_SAN));
    chiTietDatSanList.value = JSON.parse(JSON.stringify(DEFAULT_CHI_TIET_DAT_SAN));
    currentUserMaKH.value = null;
  }
}

function saveStateToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.KHACH_HANG, JSON.stringify(khachHangList.value));
    localStorage.setItem(STORAGE_KEYS.PHIEU_DAT_SAN, JSON.stringify(phieuDatSanList.value));
    localStorage.setItem(STORAGE_KEYS.CHI_TIET_DAT_SAN, JSON.stringify(chiTietDatSanList.value));
    if (currentUserMaKH.value) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, currentUserMaKH.value);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (e) {
    // Bỏ qua lỗi storage
  }
}

function resetDemoDatabase() {
  localStorage.removeItem(STORAGE_KEYS.KHACH_HANG);
  localStorage.removeItem(STORAGE_KEYS.PHIEU_DAT_SAN);
  localStorage.removeItem(STORAGE_KEYS.CHI_TIET_DAT_SAN);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  loadStateFromStorage();
  showToast('Đã khôi phục dữ liệu mẫu ban đầu!');
}

// -------------------------------------------------------------------
// 3. COMPUTED & TIỆN ÍCH CHUNG
// -------------------------------------------------------------------
const currentUser = computed(() => {
  if (!currentUserMaKH.value) return null;
  return khachHangList.value.find(kh => kh.MaKH === currentUserMaKH.value) || null;
});

const activeBookingCount = computed(() => {
  if (!currentUser.value) return 0;
  return phieuDatSanList.value.filter(
    p => p.MaKH === currentUser.value.MaKH && p.TrangThai !== 'Đã hủy'
  ).length;
});

function isSlotBooked(maSan, ngayStr, khungGioBD) {
  return chiTietDatSanList.value.some(ct => {
    if (ct.MaSan !== maSan || ct.NgaySuDung !== ngayStr || ct.KhungGioBD !== khungGioBD) {
      return false;
    }
    const phieu = phieuDatSanList.value.find(p => p.MaPhieu === ct.MaPhieu);
    return phieu && phieu.TrangThai !== 'Đã hủy';
  });
}

function showToast(message, type = 'success') {
  const id = Date.now() + Math.random();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 3200);
}

function handleFooterSelectType(maLoai) {
  activeTab.value = 'search';
  searchTabRef.value?.setTypeFilter(maLoai);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// -------------------------------------------------------------------
// 4. XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ / ĐĂNG XUẤT
// -------------------------------------------------------------------
function openAuthModal(tab = 'login') {
  authModal.tab = tab;
  authModal.isOpen = true;
}

function handleLoginSuccess(matchedUser) {
  currentUserMaKH.value = matchedUser.MaKH;
  saveStateToStorage();
  authModal.isOpen = false;
  showToast(`Chào mừng ${matchedUser.TenKH} quay trở lại!`);

  if (pendingBookingAfterLogin.value) {
    const payload = pendingBookingAfterLogin.value;
    pendingBookingAfterLogin.value = null;
    handleOpenBooking(payload);
  }
}

function handleRegisterSuccess(newUserData) {
  const newMaKH = 'KH' + String(khachHangList.value.length + 1).padStart(3, '0');
  const newCustomer = { MaKH: newMaKH, ...newUserData };

  khachHangList.value.push(newCustomer);
  currentUserMaKH.value = newCustomer.MaKH;
  saveStateToStorage();

  authModal.isOpen = false;
  showToast(`Đăng ký thành công! Mã thành viên của bạn là ${newMaKH}.`);

  if (pendingBookingAfterLogin.value) {
    const payload = pendingBookingAfterLogin.value;
    pendingBookingAfterLogin.value = null;
    handleOpenBooking(payload);
  }
}

function handleLogout() {
  const name = currentUser.value ? currentUser.value.TenKH : '';
  currentUserMaKH.value = null;
  saveStateToStorage();
  showToast(`Đã đăng xuất khỏi tài khoản ${name}.`);
}

// -------------------------------------------------------------------
// 5. XỬ LÝ ĐẶT SÂN, THANH TOÁN & HỦY PHIẾU
// -------------------------------------------------------------------
function handleOpenBooking({ maSan, ngayStr, khungGioBD }) {
  const san = getSan(maSan);
  if (!san || san.TrangThai !== 'Hoạt động') return;

  const freeSlots = TIME_SLOTS.filter(slot => !isSlotBooked(maSan, ngayStr, slot.KhungGioBD));
  if (freeSlots.length === 0) {
    showToast('Sân này đã kín lịch trong ngày đã chọn!', 'error');
    return;
  }

  bookingModal.maSan = maSan;
  bookingModal.ngaySuDung = ngayStr;
  bookingModal.selectedSlot = khungGioBD || freeSlots[0].KhungGioBD;
  bookingModal.isOpen = true;
}

function handleRequestLoginFromBooking(currentSelectedSlot) {
  pendingBookingAfterLogin.value = {
    maSan: bookingModal.maSan,
    ngayStr: bookingModal.ngaySuDung,
    khungGioBD: currentSelectedSlot
  };
  bookingModal.isOpen = false;
  openAuthModal('login');
}

function handleBookingSubmit(payload) {
  const { maSan, ngaySuDung, selectedSlot, sdt, tenKH, email, diaChi, ghiChu } = payload;
  const slotObj = TIME_SLOTS.find(s => s.KhungGioBD === selectedSlot);

  let customer = currentUser.value || khachHangList.value.find(kh => kh.SDT === sdt);
  if (customer) {
    customer.TenKH = tenKH;
    customer.Email = email;
    customer.DiaChi = diaChi;
  } else {
    const newMaKH = 'KH' + String(khachHangList.value.length + 1).padStart(3, '0');
    customer = { MaKH: newMaKH, TenKH: tenKH, Email: email, SDT: sdt, DiaChi: diaChi, MatKhau: '123456' };
    khachHangList.value.push(customer);
  }

  const hourlyPrice = getBangGia(maSan, ngaySuDung, selectedSlot);
  const tongTien = hourlyPrice * slotObj.hours;
  const tienCoc = Math.round(tongTien * 0.3);

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const maPhieu = 'PD' + now.getFullYear() + String(phieuDatSanList.value.length + 1).padStart(3, '0');

  const newPhieu = {
    MaPhieu: maPhieu,
    MaKH: customer.MaKH,
    NgayDat: `${TODAY_STR} ${timeStr}`,
    TongTien: tongTien,
    TienCoc: tienCoc,
    DaThanhToan: 0,
    PhuongThucTT: '',
    NgayThanhToan: '',
    GhiChu: ghiChu || 'Không có ghi chú',
    TrangThai: 'Chờ thanh toán'
  };
  phieuDatSanList.value.unshift(newPhieu);

  const newChiTiet = {
    STT_PD: chiTietDatSanList.value.length + 1,
    MaPhieu: maPhieu,
    MaSan: maSan,
    NgaySuDung: ngaySuDung,
    NgayGioNhanDK: `${ngaySuDung} ${slotObj.KhungGioBD}`,
    NgayGioTraDK: `${ngaySuDung} ${slotObj.KhungGioKT}`,
    KhungGioBD: slotObj.KhungGioBD,
    KhungGioKT: slotObj.KhungGioKT,
    GiaLucDat: tongTien
  };
  chiTietDatSanList.value.unshift(newChiTiet);

  saveStateToStorage();
  bookingModal.isOpen = false;

  receiptModal.data = { phieu: newPhieu, chiTiet: newChiTiet, customer: { ...customer } };
  receiptModal.isOpen = true;
}

function openPaymentModal(phieu) {
  if (!phieu || phieu.TrangThai === 'Đã hủy') return;
  paymentModal.phieu = phieu;
  paymentModal.isOpen = true;
}

function handleViewBookingsFromReceipt() {
  const data = receiptModal.data;
  receiptModal.isOpen = false;
  activeTab.value = 'bookings';
  if (!currentUser.value && data) {
    bookingTabRef.value?.prefillAndLookup(data.phieu.MaPhieu, data.customer.SDT);
  }
}

function handlePayNowFromReceipt(maPhieu) {
  receiptModal.isOpen = false;
  const targetPhieu = phieuDatSanList.value.find(p => p.MaPhieu === maPhieu);
  if (targetPhieu) openPaymentModal(targetPhieu);
}

function handleConfirmPayment({ maPhieu, amountPaid, method }) {
  const targetPhieu = phieuDatSanList.value.find(p => p.MaPhieu === maPhieu);
  if (targetPhieu) {
    const totalPaid = (targetPhieu.DaThanhToan || 0) + amountPaid;
    targetPhieu.DaThanhToan = totalPaid;
    targetPhieu.PhuongThucTT =
      method === 'vietqr' ? 'Chuyển khoản VietQR' :
      method === 'momo' ? 'Ví MoMo' : 'Tiền mặt tại quầy';

    const now = new Date();
    targetPhieu.NgayThanhToan = `${TODAY_STR} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (method === 'cash') {
      targetPhieu.TrangThai = 'Chờ thu tiền tại quầy';
    } else if (totalPaid >= targetPhieu.TongTien) {
      targetPhieu.TrangThai = 'Đã thanh toán 100%';
    } else {
      targetPhieu.TrangThai = 'Đã đặt cọc (30%)';
    }

    saveStateToStorage();
    showToast(`Thanh toán thành công ${formatCurrency(amountPaid)} cho phiếu ${targetPhieu.MaPhieu}!`);
  }
  paymentModal.isOpen = false;
  paymentModal.phieu = null;
}

function promptCancelBooking(maPhieu) {
  cancelModal.maPhieu = maPhieu;
  cancelModal.isOpen = true;
}

function executeCancelBooking() {
  const phieu = phieuDatSanList.value.find(p => p.MaPhieu === cancelModal.maPhieu);
  if (phieu) {
    phieu.TrangThai = 'Đã hủy';
    saveStateToStorage();
    showToast(`Đã hủy phiếu ${phieu.MaPhieu} và giải phóng khung giờ trống.`);
  }
  cancelModal.isOpen = false;
  cancelModal.maPhieu = null;
}

onMounted(() => {
  loadStateFromStorage();
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader
      v-model:active-tab="activeTab"
      :active-booking-count="activeBookingCount"
      :current-user="currentUser"
      @open-auth="openAuthModal"
      @logout="handleLogout"
    />

    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <CourtSearchTab
        ref="searchTabRef"
        v-show="activeTab === 'search'"
        :phieu-dat-san-list="phieuDatSanList"
        :chi-tiet-dat-san-list="chiTietDatSanList"
        @open-booking="handleOpenBooking"
        @notify="showToast"
      />

      <BookingListTab
        ref="bookingTabRef"
        v-show="activeTab === 'bookings'"
        :current-user="currentUser"
        :khach-hang-list="khachHangList"
        :phieu-dat-san-list="phieuDatSanList"
        :chi-tiet-dat-san-list="chiTietDatSanList"
        @go-search="activeTab = 'search'"
        @open-payment="openPaymentModal"
        @prompt-cancel="promptCancelBooking"
        @open-auth="openAuthModal"
      />
    </main>

    <!-- Modals -->
    <AuthModal
      :is-open="authModal.isOpen"
      :initial-tab="authModal.tab"
      :khach-hang-list="khachHangList"
      @close="authModal.isOpen = false"
      @login-success="handleLoginSuccess"
      @register-success="handleRegisterSuccess"
    />

    <BookingModal
      :is-open="bookingModal.isOpen"
      :ma-san="bookingModal.maSan"
      :ngay-su-dung="bookingModal.ngaySuDung"
      :preselected-slot="bookingModal.selectedSlot"
      :current-user="currentUser"
      :khach-hang-list="khachHangList"
      :is-slot-booked-fn="isSlotBooked"
      @close="bookingModal.isOpen = false"
      @submit-booking="handleBookingSubmit"
      @request-login="handleRequestLoginFromBooking"
      @notify="showToast"
    />

    <ReceiptModal
      :is-open="receiptModal.isOpen"
      :data="receiptModal.data"
      @close="receiptModal.isOpen = false"
      @view-bookings="handleViewBookingsFromReceipt"
      @pay-now="handlePayNowFromReceipt"
    />

    <PaymentModal
      :is-open="paymentModal.isOpen"
      :phieu="paymentModal.phieu"
      :customer="paymentModal.phieu ? khachHangList.find(k => k.MaKH === paymentModal.phieu.MaKH) : null"
      @close="paymentModal.isOpen = false"
      @confirm-payment="handleConfirmPayment"
    />

    <CancelModal
      :is-open="cancelModal.isOpen"
      :ma-phieu="cancelModal.maPhieu"
      @close="cancelModal.isOpen = false"
      @confirm-cancel="executeCancelBooking"
    />

    <!-- Toast thông báo nổi -->
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="toast.type === 'success' ? 'bg-slate-900 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-800'"
        class="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border-l-4 text-sm font-medium animate-fade-in"
      >
        <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check text-emerald-400' : 'fa-solid fa-circle-exclamation'"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>

    <AppFooter
      @reset-db="resetDemoDatabase"
      @select-type="handleFooterSelectType"
    />
  </div>
</template>

<style>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
