<script setup>
import { getSan, formatCurrency, formatDateVN } from '../../utils/helpers';

defineProps({
  isOpen: Boolean,
  data: { type: Object, default: null }
});

const emit = defineEmits(['close', 'view-bookings', 'pay-now']);
</script>

<template>
  <div v-if="isOpen && data" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" @click="emit('close')"></div>
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        <div class="bg-emerald-600 p-6 text-center text-white">
          <div class="w-14 h-14 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <i class="fa-solid fa-check text-2xl"></i>
          </div>
          <h3 class="text-xl font-extrabold">Đăng ký thuê sân thành công!</h3>
          <p class="text-emerald-100 text-xs mt-1">Dữ liệu đã được lưu vào PHIEU_DAT_SAN &amp; CHI_TIET_DAT_SAN</p>
        </div>

        <div class="p-6 space-y-4 text-sm">
          <div class="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between">
            <span class="text-xs text-slate-500">Mã phiếu đặt (MaPhieu):</span>
            <span class="font-mono font-extrabold text-base text-emerald-700">{{ data.phieu.MaPhieu }}</span>
          </div>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500">Khách hàng:</span>
              <span class="font-bold text-slate-800">{{ data.customer.TenKH }} ({{ data.customer.MaKH }})</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500">Số điện thoại:</span>
              <span class="font-semibold text-slate-800">{{ data.customer.SDT }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500">Sân thuê:</span>
              <span class="font-bold text-slate-800">{{ getSan(data.chiTiet.MaSan)?.TenSan || data.chiTiet.MaSan }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500">Ngày &amp; Khung giờ:</span>
              <span class="font-bold text-emerald-700">
                {{ formatDateVN(data.chiTiet.NgaySuDung) }} | {{ data.chiTiet.KhungGioBD }} - {{ data.chiTiet.KhungGioKT }}
              </span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500">Tổng tiền thuê:</span>
              <span class="font-extrabold text-slate-900">{{ formatCurrency(data.phieu.TongTien) }}</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-slate-500">Tiền cọc giữ sân (30%):</span>
              <span class="font-bold text-amber-600">{{ formatCurrency(data.phieu.TienCoc) }}</span>
            </div>
          </div>
        </div>

        <div class="px-6 pb-6 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            @click="emit('view-bookings')"
            class="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition"
          >
            Xem phiếu đã đặt
          </button>
          <button
            type="button"
            @click="emit('pay-now', data.phieu.MaPhieu)"
            class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
          >
            <i class="fa-solid fa-credit-card"></i>
            <span>Thanh toán ngay</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
