<script setup>
import { reactive, computed, watch } from 'vue';
import { TIME_SLOTS } from '../../data/mockData';
import { getBangGia, getLoaiSan, getSan, formatCurrency, formatDateVN } from '../../utils/helpers';

const props = defineProps({
  isOpen: Boolean,
  maSan: { type: String, default: null },
  ngaySuDung: { type: String, default: null },
  preselectedSlot: { type: String, default: '' },
  currentUser: { type: Object, default: null },
  khachHangList: { type: Array, required: true },
  isSlotBookedFn: { type: Function, required: true }
});

const emit = defineEmits(['close', 'submit-booking', 'request-login', 'notify']);

const form = reactive({
  selectedSlot: '',
  custPhone: '',
  custName: '',
  custEmail: '',
  custAddress: '',
  note: '',
  error: ''
});

const customerStatus = reactive({
  type: 'unverified',
  maKH: ''
});

const selectedModalSan = computed(() => getSan(props.maSan));

const availableModalSlots = computed(() => {
  if (!props.maSan || !props.ngaySuDung) return [];
  return TIME_SLOTS.filter(slot => !props.isSlotBookedFn(props.maSan, props.ngaySuDung, slot.KhungGioBD));
});

const modalPricing = computed(() => {
  const slotObj = TIME_SLOTS.find(s => s.KhungGioBD === form.selectedSlot);
  if (!props.maSan || !props.ngaySuDung || !slotObj) {
    return { total: 0, deposit: 0 };
  }
  const hourlyPrice = getBangGia(props.maSan, props.ngaySuDung, form.selectedSlot);
  const total = hourlyPrice * slotObj.hours;
  return {
    total,
    deposit: Math.round(total * 0.3)
  };
});

watch(
  () => props.isOpen,
  (val) => {
    if (!val) return;
    const freeSlots = availableModalSlots.value;
    form.selectedSlot =
      props.preselectedSlot && freeSlots.some(s => s.KhungGioBD === props.preselectedSlot)
        ? props.preselectedSlot
        : freeSlots[0]?.KhungGioBD || '';
    form.note = '';
    form.error = '';

    if (props.currentUser) {
      form.custPhone = props.currentUser.SDT;
      form.custName = props.currentUser.TenKH;
      form.custEmail = props.currentUser.Email || '';
      form.custAddress = props.currentUser.DiaChi;
      customerStatus.type = 'logged_in';
      customerStatus.maKH = props.currentUser.MaKH;
    } else {
      form.custPhone = '';
      form.custName = '';
      form.custEmail = '';
      form.custAddress = '';
      customerStatus.type = 'unverified';
      customerStatus.maKH = '';
    }
  }
);

function fillDemoPhone(phone) {
  form.custPhone = phone;
  checkExistingCustomer(true);
}

function checkExistingCustomer(showNotification = false) {
  const cleanPhone = form.custPhone.trim();
  if (cleanPhone.length < 9) {
    customerStatus.type = 'unverified';
    customerStatus.maKH = '';
    return;
  }

  const existing = props.khachHangList.find(kh => kh.SDT === cleanPhone);
  if (existing) {
    form.custName = existing.TenKH;
    form.custEmail = existing.Email || '';
    form.custAddress = existing.DiaChi;
    customerStatus.type = 'found';
    customerStatus.maKH = existing.MaKH;
    if (showNotification) {
      emit('notify', `Đã tìm thấy thông tin khách hàng: ${existing.TenKH}`);
    }
  } else {
    customerStatus.type = 'new';
    customerStatus.maKH = '';
    if (showNotification) {
      emit('notify', 'Số điện thoại mới, vui lòng điền đầy đủ thông tin bên dưới.');
    }
  }
}

function handleSubmit() {
  form.error = '';
  const sdt = form.custPhone.trim();
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

  if (!phoneRegex.test(sdt)) {
    form.error = 'Số điện thoại không hợp lệ (cần đúng 10 chữ số bắt đầu bằng 03, 05, 07, 08, 09).';
    return;
  }

  if (props.isSlotBookedFn(props.maSan, props.ngaySuDung, form.selectedSlot)) {
    form.error = 'Rất tiếc! Khung giờ này vừa có người khác đặt. Vui lòng chọn khung giờ khác.';
    return;
  }

  emit('submit-booking', {
    maSan: props.maSan,
    ngaySuDung: props.ngaySuDung,
    selectedSlot: form.selectedSlot,
    sdt,
    tenKH: form.custName.trim(),
    email: form.custEmail.trim(),
    diaChi: form.custAddress.trim(),
    ghiChu: form.note.trim()
  });
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" @click="emit('close')"></div>

    <div class="flex min-h-full items-center justify-center p-4 sm:p-6">
      <div class="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        <div class="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <span class="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">API Quản lí đặt sân &amp; Khách hàng</span>
            <h3 class="text-lg font-bold flex items-center gap-2 mt-0.5">
              <i class="fa-solid fa-calendar-check text-emerald-400"></i>
              Đăng ký thuê sân
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

        <form @submit.prevent="handleSubmit" class="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          <!-- Phần 1: Chi tiết sân & Khung giờ đã chọn -->
          <div class="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-800">
                1. Thông tin sân &amp; Khung giờ thuê
              </span>
              <span class="text-xs font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-700 font-semibold">
                Mã sân: {{ maSan }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-slate-500 text-xs">Tên sân &amp; Loại sân</p>
                <p class="font-bold text-slate-900 mt-0.5">
                  {{ selectedModalSan?.TenSan }} ({{ getLoaiSan(selectedModalSan?.MaLoai)?.TenLoai }})
                </p>
              </div>
              <div>
                <p class="text-slate-500 text-xs">Ngày sử dụng (Ngay)</p>
                <p class="font-bold text-slate-900 mt-0.5">{{ formatDateVN(ngaySuDung) }}</p>
              </div>
              <div>
                <label for="modal-slot-select" class="block text-slate-500 text-xs mb-1">Khung giờ thuê (KhungGioBD - KT)</label>
                <select
                  id="modal-slot-select"
                  v-model="form.selectedSlot"
                  class="w-full rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option v-for="slot in availableModalSlots" :key="slot.KhungGioBD" :value="slot.KhungGioBD">
                    {{ slot.label }} ({{ slot.period }}) - {{ formatCurrency(getBangGia(maSan, ngaySuDung, slot.KhungGioBD) * slot.hours) }}
                  </option>
                </select>
              </div>
              <div class="bg-white rounded-lg p-2.5 border border-emerald-200 flex flex-col justify-center">
                <div class="flex justify-between items-center text-xs text-slate-500">
                  <span>Tổng tiền thuê:</span>
                  <span class="text-base font-extrabold text-emerald-700">{{ formatCurrency(modalPricing.total) }}</span>
                </div>
                <div class="flex justify-between items-center text-xs text-slate-500 mt-1 pt-1 border-t border-slate-100">
                  <span>Tiền cọc giữ sân (30%):</span>
                  <span class="font-bold text-amber-600">{{ formatCurrency(modalPricing.deposit) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Phần 2: Xác nhận thông tin khách hàng -->
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <i class="fa-solid fa-user-check text-emerald-600"></i>
                  2. Xác nhận thông tin khách hàng (Bắt buộc)
                </span>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ currentUser ? 'Thông tin khách hàng được tự động đồng bộ từ tài khoản đang đăng nhập.' : 'Đăng nhập hoặc nhập SĐT để tra cứu khách hàng cũ / điền mới thông tin bên dưới.' }}
                </p>
              </div>

              <span v-if="customerStatus.type === 'logged_in'" class="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold self-start sm:self-auto">
                <i class="fa-solid fa-shield-check mr-1"></i>Đã xác thực tài khoản ({{ customerStatus.maKH }})
              </span>
              <span v-else-if="customerStatus.type === 'found'" class="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold self-start sm:self-auto">
                <i class="fa-solid fa-circle-check mr-1"></i>Khách hàng thân thiết ({{ customerStatus.maKH }})
              </span>
              <span v-else-if="customerStatus.type === 'new'" class="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold self-start sm:self-auto">
                <i class="fa-solid fa-user-plus mr-1"></i>Khách hàng mới (Tự động tạo mã)
              </span>
              <span v-else class="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium self-start sm:self-auto">
                Chưa xác thực
              </span>
            </div>

            <div v-if="!currentUser" class="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="text-xs text-blue-900">
                <p class="font-bold flex items-center gap-1.5">
                  <i class="fa-solid fa-circle-info text-blue-600"></i>
                  Bạn đã có tài khoản thành viên?
                </p>
                <p class="text-blue-700 mt-0.5">Đăng nhập ngay để tự động điền thông tin và lưu vào lịch sử đặt sân của bạn.</p>
              </div>
              <button
                type="button"
                @click="emit('request-login', form.selectedSlot)"
                class="shrink-0 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
              >
                Đăng nhập ngay
              </button>
            </div>

            <div v-if="!currentUser" class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex flex-wrap items-center gap-2">
              <span class="font-semibold text-slate-700"><i class="fa-solid fa-lightbulb text-amber-500 mr-1"></i>Hoặc thử SĐT có sẵn:</span>
              <button type="button" @click="fillDemoPhone('0901234567')" class="px-2 py-1 rounded bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 font-mono transition">0901234567</button>
              <button type="button" @click="fillDemoPhone('0912345678')" class="px-2 py-1 rounded bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 font-mono transition">0912345678</button>
              <button type="button" @click="fillDemoPhone('0987654321')" class="px-2 py-1 rounded bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 font-mono transition">0987654321</button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="cust-phone" class="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại (SDT) <span class="text-rose-500">*</span>
                </label>
                <div class="flex gap-2">
                  <input
                    type="tel"
                    id="cust-phone"
                    v-model="form.custPhone"
                    :disabled="!!currentUser"
                    @input="checkExistingCustomer(false)"
                    required
                    placeholder="VD: 0901234567"
                    class="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-600"
                  />
                  <button
                    v-if="!currentUser"
                    type="button"
                    @click="checkExistingCustomer(true)"
                    class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition shrink-0"
                  >
                    Kiểm tra
                  </button>
                </div>
              </div>

              <div>
                <label for="cust-name" class="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên khách hàng (TenKH) <span class="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="cust-name"
                  v-model="form.custName"
                  :disabled="!!currentUser"
                  required
                  placeholder="Nhập họ tên đầy đủ"
                  class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-600"
                />
              </div>

              <div>
                <label for="cust-email" class="block text-xs font-semibold text-slate-700 mb-1">
                  Email nhận thông báo
                </label>
                <input
                  type="email"
                  id="cust-email"
                  v-model="form.custEmail"
                  :disabled="!!currentUser"
                  placeholder="example@gmail.com"
                  class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-600"
                />
              </div>

              <div>
                <label for="cust-address" class="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ (DiaChi) <span class="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="cust-address"
                  v-model="form.custAddress"
                  :disabled="!!currentUser"
                  required
                  placeholder="Quận/Huyện, Thành phố"
                  class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label for="booking-note" class="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú đặt sân (GhiChu)
              </label>
              <textarea
                id="booking-note"
                v-model="form.note"
                rows="2"
                placeholder="Ví dụ: Thuê thêm bóng, áo bib, nước uống..."
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              ></textarea>
            </div>
          </div>

          <div v-if="form.error" class="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
            <i class="fa-solid fa-circle-exclamation text-rose-600 text-sm"></i>
            <span>{{ form.error }}</span>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition"
            >
              <i class="fa-solid fa-check"></i>
              <span>Xác nhận đặt sân</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
