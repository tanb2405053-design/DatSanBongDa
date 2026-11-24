<script setup>
import { reactive, computed, watch } from 'vue';
import { formatCurrency } from '../../utils/helpers';

const props = defineProps({
  isOpen: Boolean,
  phieu: { type: Object, default: null },
  customer: { type: Object, default: null }
});

const emit = defineEmits(['close', 'confirm-payment']);

const state = reactive({
  paymentType: 'deposit',
  method: 'vietqr',
  isProcessing: false
});

watch(
  () => props.isOpen,
  (val) => {
    if (val && props.phieu) {
      const alreadyPaid = props.phieu.DaThanhToan || 0;
      state.paymentType = alreadyPaid > 0 ? 'full' : 'deposit';
      state.method = 'vietqr';
      state.isProcessing = false;
    }
  }
);

const paymentAmountToPay = computed(() => {
  const p = props.phieu;
  if (!p) return 0;
  const alreadyPaid = p.DaThanhToan || 0;
  const remaining = Math.max(0, p.TongTien - alreadyPaid);
  if (alreadyPaid > 0) return remaining;
  return state.paymentType === 'deposit' ? p.TienCoc : p.TongTien;
});

const vietQrImageUrl = computed(() => {
  if (!props.phieu) return '';
  const amount = paymentAmountToPay.value;
  const addInfo = encodeURIComponent(`SPORTBOOK ${props.phieu.MaPhieu}`);
  return `https://img.vietqr.io/image/MB-0901234567-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=SPORTBOOK%20CAN%20THO`;
});

function handleConfirm() {
  if (!props.phieu) return;
  state.isProcessing = true;
  setTimeout(() => {
    emit('confirm-payment', {
      maPhieu: props.phieu.MaPhieu,
      amountPaid: paymentAmountToPay.value,
      method: state.method
    });
    state.isProcessing = false;
  }, 500);
}
</script>

<template>
  <div v-if="isOpen && phieu" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" @click="emit('close')"></div>

    <div class="flex min-h-full items-center justify-center p-4 sm:p-6">
      <div class="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        <!-- Header -->
        <div class="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <span class="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">Cổng thanh toán trực tuyến</span>
            <h3 class="text-lg font-bold flex items-center gap-2 mt-0.5">
              <i class="fa-solid fa-credit-card text-emerald-400"></i>
              <span>Thanh toán phiếu {{ phieu.MaPhieu }}</span>
            </h3>
          </div>
          <button
            type="button"
            @click="emit('close')"
            class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          <!-- Thông tin tóm tắt phiếu -->
          <div class="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
            <div class="flex justify-between">
              <span class="text-slate-500">Khách hàng:</span>
              <span class="font-bold text-slate-800">{{ customer?.TenKH }} ({{ customer?.SDT }})</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Tổng giá trị phiếu đặt:</span>
              <span class="font-extrabold text-slate-900">{{ formatCurrency(phieu.TongTien) }}</span>
            </div>
            <div v-if="(phieu.DaThanhToan || 0) > 0" class="flex justify-between">
              <span class="text-slate-500">Đã thanh toán trước đó:</span>
              <span class="font-bold text-blue-700">{{ formatCurrency(phieu.DaThanhToan) }}</span>
            </div>
          </div>

          <!-- 1. Chọn mức thanh toán (nếu chưa cọc lần nào) -->
          <div v-if="(phieu.DaThanhToan || 0) === 0" class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500">1. Chọn mức thanh toán</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="state.paymentType = 'deposit'"
                :class="state.paymentType === 'deposit' ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:bg-slate-50'"
                class="p-3 rounded-xl border text-left transition"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-800">Đặt cọc giữ sân (30%)</span>
                  <i v-if="state.paymentType === 'deposit'" class="fa-solid fa-circle-check text-emerald-600"></i>
                </div>
                <p class="text-base font-extrabold text-amber-600 mt-1">{{ formatCurrency(phieu.TienCoc) }}</p>
                <p class="text-[11px] text-slate-500 mt-0.5">Phần còn lại trả tại sân</p>
              </button>

              <button
                type="button"
                @click="state.paymentType = 'full'"
                :class="state.paymentType === 'full' ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:bg-slate-50'"
                class="p-3 rounded-xl border text-left transition"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-800">Thanh toán 100%</span>
                  <i v-if="state.paymentType === 'full'" class="fa-solid fa-circle-check text-emerald-600"></i>
                </div>
                <p class="text-base font-extrabold text-emerald-700 mt-1">{{ formatCurrency(phieu.TongTien) }}</p>
                <p class="text-[11px] text-slate-500 mt-0.5">Hoàn tất toàn bộ chi phí</p>
              </button>
            </div>
          </div>

          <div v-else class="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-center justify-between">
            <div>
              <p class="font-bold">Thanh toán phần chi phí còn lại</p>
              <p class="text-amber-700 mt-0.5">Hoàn tất 100% giá trị phiếu đặt sân</p>
            </div>
            <span class="text-base font-extrabold text-emerald-700">{{ formatCurrency(paymentAmountToPay) }}</span>
          </div>

          <!-- 2. Chọn phương thức thanh toán -->
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500">2. Phương thức thanh toán</label>
            <div class="grid grid-cols-3 gap-2.5 text-xs font-semibold">
              <button
                type="button"
                @click="state.method = 'vietqr'"
                :class="state.method === 'vietqr' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
                class="py-2.5 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition"
              >
                <i class="fa-solid fa-qrcode text-base"></i>
                <span>VietQR / Ngân hàng</span>
              </button>

              <button
                type="button"
                @click="state.method = 'momo'"
                :class="state.method === 'momo' ? 'border-pink-600 bg-pink-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
                class="py-2.5 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition"
              >
                <i class="fa-solid fa-wallet text-base"></i>
                <span>Ví MoMo</span>
              </button>

              <button
                type="button"
                @click="state.method = 'cash'"
                :class="state.method === 'cash' ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
                class="py-2.5 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition"
              >
                <i class="fa-solid fa-money-bill-wave text-base"></i>
                <span>Tiền mặt tại sân</span>
              </button>
            </div>
          </div>

          <!-- 3. Khu vực hiển thị chi tiết theo phương thức -->
          <div v-if="state.method === 'vietqr'" class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
            <p class="text-xs text-slate-600">Quét mã QR bằng ứng dụng Ngân hàng bất kỳ để thanh toán tự động</p>
            <img :src="vietQrImageUrl" alt="Mã QR thanh toán" class="w-48 h-48 mx-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs object-contain" />
            <div class="text-xs text-slate-600 pt-1">
              Số tiền: <strong class="text-emerald-700 text-sm">{{ formatCurrency(paymentAmountToPay) }}</strong> •
              Nội dung: <code class="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-800">SPORTBOOK {{ phieu.MaPhieu }}</code>
            </div>
          </div>

          <div v-else-if="state.method === 'momo'" class="bg-pink-50/70 border border-pink-200 rounded-2xl p-4 text-center space-y-2">
            <div class="w-12 h-12 rounded-2xl bg-pink-600 text-white flex items-center justify-center mx-auto font-extrabold text-sm shadow-sm">
              MoMo
            </div>
            <p class="text-xs font-bold text-slate-800">Chuyển tiền đến ví MoMo SportBook: <span class="font-mono text-pink-700">0901 234 567</span></p>
            <p class="text-xs text-slate-600">Số tiền: <strong class="text-pink-700">{{ formatCurrency(paymentAmountToPay) }}</strong> — Lời nhắn: <strong>{{ phieu.MaPhieu }}</strong></p>
          </div>

          <div v-else class="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
            <p class="font-bold flex items-center gap-1.5">
              <i class="fa-solid fa-store text-amber-600"></i> Thanh toán trực tiếp tại quầy lễ tân cụm sân
            </p>
            <p class="text-amber-800 leading-relaxed">
              Vui lòng có mặt trước giờ bóng lăn ít nhất <strong>15 phút</strong> và đọc mã phiếu <strong class="font-mono">{{ phieu.MaPhieu }}</strong> cho nhân viên để hoàn tất thanh toán <strong>{{ formatCurrency(paymentAmountToPay) }}</strong>.
            </p>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition"
            >
              Đóng
            </button>
            <button
              type="button"
              @click="handleConfirm"
              :disabled="state.isProcessing"
              class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition"
            >
              <i :class="state.isProcessing ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-circle-check'"></i>
              <span>{{ state.isProcessing ? 'Đang xác nhận...' : 'Xác nhận đã thanh toán' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
