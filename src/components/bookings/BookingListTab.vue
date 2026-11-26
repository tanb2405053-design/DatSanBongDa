<script setup>
import { reactive, computed, watch } from 'vue';
import { getSan, getLoaiSan, formatCurrency, getStatusBadgeClass } from '../../utils/helpers';

const props = defineProps({
  currentUser: { type: Object, default: null },
  khachHangList: { type: Array, required: true },
  phieuDatSanList: { type: Array, required: true },
  chiTietDatSanList: { type: Array, required: true }
});

const emit = defineEmits(['go-search', 'open-payment', 'prompt-cancel', 'open-auth']);

const lookupForm = reactive({
  maPhieu: '',
  sdt: '',
  searched: false,
  error: ''
});

// Tự động reset form tra cứu khi đăng nhập hoặc đăng xuất
watch(
  () => props.currentUser,
  () => {
    lookupForm.maPhieu = '';
    lookupForm.sdt = '';
    lookupForm.searched = false;
    lookupForm.error = '';
  }
);

const displayedBookings = computed(() => {
  // Trường hợp 1: Đã đăng nhập -> Chỉ hiện phiếu thuộc tài khoản hiện tại
  if (props.currentUser) {
    return props.phieuDatSanList.filter(p => p.MaKH === props.currentUser.MaKH);
  }

  // Trường hợp 2: Chưa đăng nhập -> Chỉ hiện phiếu khớp cả Mã phiếu + SĐT đã tra cứu
  if (lookupForm.searched && !lookupForm.error) {
    const code = lookupForm.maPhieu.trim().toUpperCase();
    const phone = lookupForm.sdt.trim();
    return props.phieuDatSanList.filter(p => {
      const kh = getCustomerByMaKH(p.MaKH);
      return p.MaPhieu.toUpperCase() === code && kh && kh.SDT === phone;
    });
  }

  return [];
});

function handleGuestLookup() {
  lookupForm.error = '';
  lookupForm.searched = true;

  const code = lookupForm.maPhieu.trim().toUpperCase();
  const phone = lookupForm.sdt.trim();

  if (!code || !phone) {
    lookupForm.error = 'Vui lòng nhập đầy đủ cả Mã phiếu đặt và Số điện thoại để tra cứu.';
    return;
  }

  const matched = props.phieuDatSanList.find(p => {
    const kh = getCustomerByMaKH(p.MaKH);
    return p.MaPhieu.toUpperCase() === code && kh && kh.SDT === phone;
  });

  if (!matched) {
    lookupForm.error = 'Không tìm thấy phiếu đặt sân nào khớp với Mã phiếu và Số điện thoại này.';
  }
}

function getCustomerByMaKH(maKH) {
  return props.khachHangList.find(kh => kh.MaKH === maKH);
}

function getBookingDetails(maPhieu) {
  return props.chiTietDatSanList.filter(ct => ct.MaPhieu === maPhieu);
}

// Hàm hỗ trợ điền nhanh mã phiếu vừa đặt xong cho khách vãng lai
function prefillAndLookup(maPhieu, sdt) {
  lookupForm.maPhieu = maPhieu;
  lookupForm.sdt = sdt;
  handleGuestLookup();
}

defineExpose({ prefillAndLookup });
</script>

<template>
  <section class="space-y-6 animate-fade-in">
    <!-- Header Banner của Tab -->
    <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <i class="fa-solid fa-file-invoice text-emerald-600"></i>
          <template v-if="currentUser">
            Phiếu đặt sân của {{ currentUser.TenKH }} ({{ currentUser.MaKH }})
          </template>
          <template v-else>
            Tra cứu Phiếu đặt sân của bạn
          </template>
        </h2>
        <p class="text-sm text-slate-500 mt-1">
          <template v-if="currentUser">
            Quản lý lịch sử đặt sân, thanh toán trực tuyến hoặc hủy phiếu thuộc tài khoản của bạn.
          </template>
          <template v-else>
            Để bảo mật thông tin khách hàng, vui lòng đăng nhập hoặc nhập đúng Mã phiếu + Số điện thoại đã đặt.
          </template>
        </p>
      </div>

      <button
        type="button"
        @click="emit('go-search')"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition self-start md:self-auto"
      >
        <i class="fa-solid fa-plus"></i>
        <span>Đặt sân mới</span>
      </button>
    </div>

    <!-- Khu vực dành cho Khách chưa đăng nhập -->
    <div v-if="!currentUser" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Cột trái: Form tra cứu bằng Mã phiếu + SĐT -->
      <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">Tra cứu nhanh (Không cần đăng nhập)</h3>
            <p class="text-xs text-slate-500">Dành cho khách đặt sân vãng lai bằng số điện thoại</p>
          </div>
        </div>

        <form @submit.prevent="handleGuestLookup" class="space-y-4 pt-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label for="lookup-code" class="block text-xs font-semibold text-slate-700 mb-1">
                Mã phiếu đặt <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="lookup-code"
                v-model="lookupForm.maPhieu"
                placeholder="VD: PD2026001"
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label for="lookup-phone" class="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại đặt sân <span class="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                id="lookup-phone"
                v-model="lookupForm.sdt"
                placeholder="VD: 0901234567"
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div v-if="lookupForm.error" class="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
            <i class="fa-solid fa-circle-exclamation text-rose-600"></i>
            <span>{{ lookupForm.error }}</span>
          </div>

          <button
            type="submit"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-sm font-bold transition flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-search"></i>
            <span>Tìm phiếu đặt sân</span>
          </button>
        </form>
      </div>

      <!-- Cột phải: Khuyến khích đăng nhập -->
      <div class="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex flex-col justify-between space-y-5 shadow-sm">
        <div class="space-y-2.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <i class="fa-solid fa-user-shield"></i> Tài khoản thành viên
          </span>
          <h3 class="text-lg font-bold">Xem toàn bộ lịch sử đặt sân của bạn</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Đăng nhập vào tài khoản thành viên để tự động đồng bộ mọi phiếu đặt sân, theo dõi trạng thái thanh toán và đặt sân nhanh chỉ với 1 cú nhấp chuột.
          </p>
        </div>

        <div class="flex flex-wrap gap-2.5">
          <button
            type="button"
            @click="emit('open-auth', 'login')"
            class="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-right-to-bracket"></i>
            <span>Đăng nhập ngay</span>
          </button>
          <button
            type="button"
            @click="emit('open-auth', 'register')"
            class="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition"
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>

    <!-- Danh sách phiếu đặt hiển thị -->
    <div v-if="currentUser || displayedBookings.length > 0" class="space-y-4">
      <div v-if="currentUser && displayedBookings.length === 0" class="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
        <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <i class="fa-regular fa-folder-open text-xl"></i>
        </div>
        <p class="text-slate-600 font-semibold text-sm">Bạn chưa có phiếu đặt sân nào trên hệ thống.</p>
        <button
          type="button"
          @click="emit('go-search')"
          class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
        >
          Tra cứu &amp; Đặt sân ngay
        </button>
      </div>

      <div
        v-for="phieu in displayedBookings"
        :key="phieu.MaPhieu"
        :class="phieu.TrangThai === 'Đã hủy' ? 'border-slate-200 opacity-75' : 'border-slate-200 shadow-sm'"
        class="bg-white rounded-2xl border p-5 space-y-4"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-3">
            <span class="font-mono font-extrabold text-sm px-3 py-1 rounded-lg bg-slate-900 text-white">
              {{ phieu.MaPhieu }}
            </span>
            <div>
              <p class="text-xs text-slate-500">Ngày lập phiếu: <strong class="text-slate-700">{{ phieu.NgayDat }}</strong></p>
              <p class="text-xs text-slate-500">
                Khách hàng: <strong class="text-slate-800">{{ getCustomerByMaKH(phieu.MaKH)?.TenKH }}</strong> - {{ getCustomerByMaKH(phieu.MaKH)?.SDT }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <span :class="getStatusBadgeClass(phieu.TrangThai)" class="px-3 py-1 rounded-full text-xs font-bold">
              {{ phieu.TrangThai }}
            </span>
            <button
              v-if="phieu.TrangThai !== 'Đã hủy' && (phieu.DaThanhToan || 0) < phieu.TongTien"
              type="button"
              @click="emit('open-payment', phieu)"
              class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <i class="fa-solid fa-credit-card"></i>
              <span>{{ (phieu.DaThanhToan || 0) > 0 ? 'Thanh toán nốt' : 'Thanh toán' }}</span>
            </button>
            <button
              v-if="phieu.TrangThai !== 'Đã hủy'"
              type="button"
              @click="emit('prompt-cancel', phieu.MaPhieu)"
              class="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
            >
              <i class="fa-solid fa-ban mr-1"></i>Hủy phiếu
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <div
            v-for="ct in getBookingDetails(phieu.MaPhieu)"
            :key="ct.STT_PD"
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">#{{ ct.STT_PD }}</span>
                <span class="text-xs font-bold text-slate-900">{{ getSan(ct.MaSan)?.TenSan || ct.MaSan }}</span>
                <span class="text-xs text-slate-500">({{ getLoaiSan(getSan(ct.MaSan)?.MaLoai)?.TenLoai }})</span>
              </div>
              <div class="text-xs text-emerald-700 font-semibold mt-1">
                <i class="fa-regular fa-calendar mr-1"></i>Nhận sân: {{ ct.NgayGioNhanDK || `${ct.NgaySuDung} ${ct.KhungGioBD}` }} → Trả sân: {{ ct.NgayGioTraDK || `${ct.NgaySuDung} ${ct.KhungGioKT}` }}
              </div>
            </div>
            <div class="text-sm font-extrabold text-slate-800">
              {{ formatCurrency(ct.GiaLucDat) }}
            </div>
          </div>
        </div>

        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pt-2 text-xs text-slate-600">
          <div class="space-y-1">
            <p><span class="font-semibold">Ghi chú:</span> {{ phieu.GhiChu }}</p>
            <p v-if="phieu.PhuongThucTT" class="text-slate-500">
              <i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i>
              Hình thức: <strong class="text-slate-700">{{ phieu.PhuongThucTT }}</strong>
              <span v-if="phieu.NgayThanhToan"> ({{ phieu.NgayThanhToan }})</span>
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3 sm:gap-4 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
            <span>Tiền cọc (30%): <strong class="text-amber-600">{{ formatCurrency(phieu.TienCoc) }}</strong></span>
            <span>Đã thanh toán: <strong class="text-blue-700">{{ formatCurrency(phieu.DaThanhToan || 0) }}</strong></span>
            <span class="text-sm">Tổng cộng: <strong class="text-emerald-700 font-extrabold">{{ formatCurrency(phieu.TongTien) }}</strong></span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>