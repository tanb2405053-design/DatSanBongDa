<script setup>
import { ref, computed } from 'vue';
import { getSan, getLoaiSan, formatCurrency, getStatusBadgeClass } from '../../utils/helpers';

const props = defineProps({
  currentUser: { type: Object, default: null },
  khachHangList: { type: Array, required: true },
  phieuDatSanList: { type: Array, required: true },
  chiTietDatSanList: { type: Array, required: true }
});

const emit = defineEmits(['go-search', 'open-payment', 'prompt-cancel']);

const bookingViewScope = ref('mine');

const displayedBookings = computed(() => {
  if (props.currentUser && bookingViewScope.value === 'mine') {
    return props.phieuDatSanList.filter(p => p.MaKH === props.currentUser.MaKH);
  }
  return props.phieuDatSanList;
});

function getCustomerByMaKH(maKH) {
  return props.khachHangList.find(kh => kh.MaKH === maKH);
}

function getBookingDetails(maPhieu) {
  return props.chiTietDatSanList.filter(ct => ct.MaPhieu === maPhieu);
}

function setScope(scope) {
  bookingViewScope.value = scope;
}

defineExpose({ setScope });
</script>

<template>
  <section class="space-y-6 animate-fade-in">
    <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <i class="fa-solid fa-file-invoice text-emerald-600"></i>
          <template v-if="currentUser && bookingViewScope === 'mine'">
            Phiếu đặt sân của {{ currentUser.TenKH }} ({{ currentUser.MaKH }})
          </template>
          <template v-else-if="currentUser && bookingViewScope === 'all'">
            Toàn bộ Phiếu đặt sân trên hệ thống
          </template>
          <template v-else>
            Danh sách Phiếu đặt sân (PHIEU_DAT_SAN)
          </template>
        </h2>
        <p class="text-sm text-slate-500 mt-1">
          <template v-if="currentUser && bookingViewScope === 'mine'">
            Hiển thị các phiếu thuê sân thuộc tài khoản của bạn. Bấm "Tất cả hệ thống" để xem toàn bộ.
          </template>
          <template v-else-if="currentUser && bookingViewScope === 'all'">
            Đang xem tất cả phiếu đặt sân của mọi khách hàng.
          </template>
          <template v-else>
            Đăng nhập để lọc nhanh các phiếu đặt của riêng bạn. Khi hủy phiếu, khung giờ sẽ mở trống trở lại.
          </template>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <div v-if="currentUser" class="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            @click="bookingViewScope = 'mine'"
            :class="bookingViewScope === 'mine' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            class="px-3 py-1.5 rounded-lg transition"
          >
            Của tôi
          </button>
          <button
            type="button"
            @click="bookingViewScope = 'all'"
            :class="bookingViewScope === 'all' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            class="px-3 py-1.5 rounded-lg transition"
          >
            Tất cả hệ thống
          </button>
        </div>

        <button
          type="button"
          @click="emit('go-search')"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition"
        >
          <i class="fa-solid fa-plus"></i>
          <span>Đặt thêm sân mới</span>
        </button>
      </div>
    </div>

    <!-- Danh sách phiếu đặt -->
    <div class="space-y-4">
      <div v-if="displayedBookings.length === 0" class="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
        <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <i class="fa-regular fa-folder-open text-xl"></i>
        </div>
        <p class="text-slate-600 font-semibold text-sm">Chưa có phiếu đặt sân nào trong danh sách này.</p>
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
                <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">STT_PD: #{{ ct.STT_PD }}</span>
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
