<script setup>
import { reactive, computed } from 'vue';
import { TODAY_STR, LOAI_SAN, SAN, TIME_SLOTS } from '../../data/mockData';
import { getBangGia, getLoaiSan, formatCurrency, formatDateVN } from '../../utils/helpers';

const props = defineProps({
  phieuDatSanList: { type: Array, required: true },
  chiTietDatSanList: { type: Array, required: true }
});

const emit = defineEmits(['open-booking', 'notify']);

const filters = reactive({
  date: TODAY_STR,
  type: 'ALL',
  slot: 'ALL',
  onlyAvailable: false
});

const activeDate = computed(() => filters.date || TODAY_STR);

const dayInfo = computed(() => {
  const dateObj = new Date(activeDate.value + 'T00:00:00');
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayOfWeek = dateObj.getDay();
  return {
    dayName: dayNames[dayOfWeek],
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6
  };
});

const filteredTimeSlots = computed(() => {
  return TIME_SLOTS.filter(slot => {
    if (filters.slot === 'ALL') return true;
    if (filters.slot === '06:00') return slot.KhungGioBD === '06:00' || slot.KhungGioBD === '08:00';
    if (filters.slot === '12:00') return slot.KhungGioBD === '14:00';
    return slot.KhungGioBD === filters.slot;
  });
});

function isSlotBooked(maSan, ngayStr, khungGioBD) {
  return props.chiTietDatSanList.some(ct => {
    if (ct.MaSan !== maSan || ct.NgaySuDung !== ngayStr || ct.KhungGioBD !== khungGioBD) {
      return false;
    }
    const phieu = props.phieuDatSanList.find(p => p.MaPhieu === ct.MaPhieu);
    return phieu && phieu.TrangThai !== 'Đã hủy';
  });
}

const filteredCourts = computed(() => {
  return SAN.filter(san => {
    if (filters.type !== 'ALL' && san.MaLoai !== filters.type) return false;
    if (filters.onlyAvailable) {
      if (san.TrangThai !== 'Hoạt động') return false;
      const hasFreeSlot = filteredTimeSlots.value.some(slot => !isSlotBooked(san.MaSan, activeDate.value, slot.KhungGioBD));
      if (!hasFreeSlot) return false;
    }
    return true;
  });
});

function getFreeSlotsCount(maSan) {
  return filteredTimeSlots.value.filter(slot => !isSlotBooked(maSan, activeDate.value, slot.KhungGioBD)).length;
}

function resetFilters() {
  filters.date = TODAY_STR;
  filters.type = 'ALL';
  filters.slot = 'ALL';
  filters.onlyAvailable = false;
  emit('notify', 'Đã đặt lại bộ lọc tìm kiếm');
}

function setTypeFilter(maLoai) {
  filters.type = maLoai;
}

defineExpose({ setTypeFilter });
</script>

<template>
  <section class="space-y-6 animate-fade-in">
    <!-- Banner giới thiệu ngắn -->
    <div class="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-emerald-50 text-xs font-medium mb-2">
          <i class="fa-solid fa-database"></i>
          <span>API Danh mục sân &amp; Bảng giá</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-bold">Tra cứu sân trống &amp; Bảng giá theo khung giờ</h2>
        <p class="text-emerald-100 text-sm mt-1 max-w-2xl">
          Chọn ngày thi đấu và loại sân để xem đơn giá chi tiết theo từng khung giờ. Bấm trực tiếp vào khung giờ trống để chuyển sang đăng ký thuê sân.
        </p>
      </div>
      <div class="flex flex-wrap gap-3 text-xs bg-black/15 p-3 rounded-xl backdrop-blur-sm shrink-0">
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm bg-emerald-400 inline-block"></span>
          <span>Còn trống (Có thể đặt)</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm bg-rose-400 inline-block"></span>
          <span>Đã có người đặt</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm bg-slate-400 inline-block"></span>
          <span>Sân đang bảo trì</span>
        </div>
      </div>
    </div>

    <!-- Bộ lọc tìm kiếm -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label for="filter-date" class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            <i class="fa-regular fa-calendar text-emerald-600 mr-1"></i> Ngày sử dụng sân
          </label>
          <input
            type="date"
            id="filter-date"
            v-model="filters.date"
            :min="TODAY_STR"
            class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
          />
        </div>

        <div>
          <label for="filter-type" class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            <i class="fa-solid fa-layer-group text-emerald-600 mr-1"></i> Loại sân 
          </label>
          <select
            id="filter-type"
            v-model="filters.type"
            class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
          >
            <option value="ALL">Tất cả loại sân</option>
            <option v-for="ls in LOAI_SAN" :key="ls.MaLoai" :value="ls.MaLoai">
              {{ ls.TenLoai }}
            </option>
          </select>
        </div>

        <div>
          <label for="filter-slot" class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            <i class="fa-regular fa-clock text-emerald-600 mr-1"></i> Khung giờ mong muốn
          </label>
          <select
            id="filter-slot"
            v-model="filters.slot"
            class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
          >
            <option value="ALL">Tất cả khung giờ trong ngày</option>
            <option value="06:00">(06:00 - 12:00)</option>
            <option value="12:00">(14:00 - 16:00)</option>
            <option value="16:00">(16:00 - 18:00)</option>
            <option value="18:00">(18:00 - 22:00)</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="flex-1 flex items-center gap-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl transition">
            <input
              type="checkbox"
              v-model="filters.onlyAvailable"
              class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span class="text-sm font-medium text-slate-700 select-none">Chỉ sân còn trống</span>
          </label>
          <button
            type="button"
            @click="resetFilters"
            title="Đặt lại bộ lọc"
            class="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <i class="fa-solid fa-rotate-right"></i>
          </button>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-slate-800">Ngày đang xem: {{ dayInfo.dayName }}, {{ formatDateVN(activeDate) }}</span>
          <span
            :class="dayInfo.isWeekend ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'"
            class="px-2 py-0.5 rounded-md text-[11px] font-bold"
          >
            {{ dayInfo.isWeekend ? 'Giá cuối tuần (+15%)' : 'Bảng giá ngày thường' }}
          </span>
        </div>
        <div class="text-slate-500">
          Đơn giá hiển thị theo từng khung giờ (2 tiếng/ca)
        </div>
      </div>
    </div>

    <!-- Danh sách kết quả Sân & Bảng giá -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-if="filteredCourts.length === 0" class="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div class="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <i class="fa-solid fa-magnifying-glass text-xl"></i>
        </div>
        <h3 class="text-base font-bold text-slate-800">Không tìm thấy sân phù hợp</h3>
        <p class="text-sm text-slate-500 mt-1">Vui lòng thử chọn ngày khác hoặc bỏ bớt điều kiện lọc.</p>
        <button
          type="button"
          @click="resetFilters"
          class="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
        >
          Xem tất cả sân
        </button>
      </div>

      <article
        v-for="san in filteredCourts"
        :key="san.MaSan"
        class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
      >
        <div class="p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{{ san.MaSan }}</span>
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {{ getLoaiSan(san.MaLoai)?.TenLoai }}
                </span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mt-2">{{ san.TenSan }}</h3>
            </div>

            <span
              :class="san.TrangThai !== 'Hoạt động' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'"
              class="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            >
              <span :class="san.TrangThai !== 'Hoạt động' ? 'bg-amber-500' : 'bg-emerald-500'" class="w-2 h-2 rounded-full"></span>
              {{ san.TrangThai }}
            </span>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
            <span>
              <i class="fa-solid fa-ruler-combined text-slate-400 mr-1"></i>Kích thước:
              <strong class="text-slate-700">{{ san.ChieuDai }}m × {{ san.ChieuRong }}m</strong>
            </span>
            <span>
              <i class="fa-regular fa-clock text-slate-400 mr-1"></i>Tình trạng ngày {{ formatDateVN(activeDate) }}:
              <strong :class="san.TrangThai !== 'Hoạt động' ? 'text-amber-600' : (getFreeSlotsCount(san.MaSan) > 0 ? 'text-emerald-600' : 'text-rose-600')">
                {{ san.TrangThai !== 'Hoạt động' ? 'Tạm ngưng phục vụ' : `${getFreeSlotsCount(san.MaSan)}/${filteredTimeSlots.length} ca trống` }}
              </strong>
            </span>
          </div>

          <div class="mt-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
                Bảng giá &amp; Khung giờ (Bấm vào ca trống để đặt)
              </span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <template v-for="slot in filteredTimeSlots" :key="slot.KhungGioBD">
                <div
                  v-if="san.TrangThai !== 'Hoạt động'"
                  class="p-2.5 rounded-xl border border-slate-200 bg-slate-100/70 opacity-60 cursor-not-allowed"
                >
                  <div class="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>{{ slot.label }}</span>
                    <span>Bảo trì</span>
                  </div>
                  <div class="text-xs text-slate-400 mt-1">{{ formatCurrency(getBangGia(san.MaSan, activeDate, slot.KhungGioBD)) }}/giờ</div>
                </div>

                <div
                  v-else-if="isSlotBooked(san.MaSan, activeDate, slot.KhungGioBD)"
                  class="p-2.5 rounded-xl border border-rose-200 bg-rose-50/80 cursor-not-allowed"
                >
                  <div class="flex items-center justify-between text-xs font-bold text-rose-700">
                    <span>{{ slot.label }}</span>
                    <span class="px-1.5 py-0.5 rounded bg-rose-200/70 text-[10px]">Đã đặt</span>
                  </div>
                  <div class="text-xs text-rose-500 line-through mt-1">
                    {{ formatCurrency(getBangGia(san.MaSan, activeDate, slot.KhungGioBD) * slot.hours) }} ({{ slot.hours }}h)
                  </div>
                </div>

                <button
                  v-else
                  type="button"
                  @click="emit('open-booking', { maSan: san.MaSan, ngayStr: activeDate, khungGioBD: slot.KhungGioBD })"
                  class="text-left p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-600 hover:border-emerald-600 group transition-all shadow-2xs"
                >
                  <div class="flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-white">
                    <span>{{ slot.label }}</span>
                    <span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 group-hover:bg-white/20 group-hover:text-white text-[10px]">Trống</span>
                  </div>
                  <div class="flex items-baseline justify-between mt-1">
                    <span class="text-xs font-extrabold text-emerald-700 group-hover:text-white">
                      {{ formatCurrency(getBangGia(san.MaSan, activeDate, slot.KhungGioBD) * slot.hours) }}
                    </span>
                    <span class="text-[10px] text-slate-500 group-hover:text-emerald-100">
                      {{ formatCurrency(getBangGia(san.MaSan, activeDate, slot.KhungGioBD)) }}/h
                    </span>
                  </div>
                </button>
              </template>
            </div>
          </div>
        </div>

        <div class="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <p class="text-xs text-slate-500 truncate">{{ getLoaiSan(san.MaLoai)?.MoTa }}</p>
          <button
            type="button"
            :disabled="san.TrangThai !== 'Hoạt động' || getFreeSlotsCount(san.MaSan) === 0"
            @click="emit('open-booking', { maSan: san.MaSan, ngayStr: activeDate, khungGioBD: null })"
            :class="(san.TrangThai !== 'Hoạt động' || getFreeSlotsCount(san.MaSan) === 0)
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-emerald-600 text-white shadow-sm'"
            class="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition"
          >
            <i class="fa-solid fa-calendar-plus"></i>
            <span>{{ san.TrangThai !== 'Hoạt động' ? 'Đang bảo trì' : (getFreeSlotsCount(san.MaSan) === 0 ? 'Hết chỗ' : 'Đăng ký thuê sân') }}</span>
          </button>
        </div>
      </article>
    </div>
  </section>
</template>
