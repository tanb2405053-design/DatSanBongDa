<script setup>
defineProps({
  isOpen: Boolean,
  maPhieu: { type: String, default: null }
});

const emit = defineEmits(['close', 'confirm-cancel']);
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" @click="emit('close')"></div>
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-fade-in text-center">
        <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <i class="fa-solid fa-triangle-exclamation text-xl"></i>
        </div>
        <h3 class="text-lg font-bold text-slate-900">Xác nhận hủy phiếu đặt sân?</h3>
        <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Bạn có chắc chắn muốn hủy phiếu {{ maPhieu }}? Khung giờ tương ứng sẽ mở trống trở lại cho khách khác đặt.
        </p>
        <div class="mt-5 flex gap-3">
          <button
            type="button"
            @click="emit('close')"
            class="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold"
          >
            Giữ lại
          </button>
          <button
            type="button"
            @click="emit('confirm-cancel')"
            class="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm"
          >
            Đồng ý hủy
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
