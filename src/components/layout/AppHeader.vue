<script setup>
import { getUserInitial } from '../../utils/helpers';

defineProps({
  activeTab: { type: String, required: true },
  activeBookingCount: { type: Number, required: true },
  currentUser: { type: Object, default: null }
});

const emit = defineEmits(['update:activeTab', 'open-auth', 'logout']);
</script>

<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 gap-3">
        <!-- Logo & Tên hệ thống -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <i class="fa-solid fa-futbol text-xl"></i>
            </div>
            <div>
              <h1 class="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                Sport<span class="text-emerald-600">Book</span>
              </h1>
              <p class="text-xs text-slate-500 mt-1">Hệ thống Tra cứu &amp; Đặt sân trực tuyến</p>
            </div>
          </div>
        </div>

        <!-- Điều hướng 2 chức năng chính -->
        <nav class="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto w-full sm:w-auto">
          <button
            type="button"
            @click="emit('update:activeTab', 'search')"
            :class="activeTab === 'search' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          >
            <i class="fa-solid fa-magnifying-glass"></i>
            <span>Tra cứu sân &amp; Bảng giá</span>
          </button>
          <button
            type="button"
            @click="emit('update:activeTab', 'bookings')"
            :class="activeTab === 'bookings' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          >
            <i class="fa-solid fa-receipt"></i>
            <span>{{ currentUser ? 'Phiếu đặt của tôi' : 'Phiếu đã đặt' }}</span>
            <span class="ml-0.5 px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700 font-bold">
              {{ activeBookingCount }}
            </span>
          </button>
        </nav>

        <!-- Khu vực Tài khoản -->
        <div class="flex items-center gap-2 self-end sm:self-auto">
          <template v-if="currentUser">
            <div class="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {{ getUserInitial(currentUser.TenKH) }}
              </div>
              <div class="text-left leading-tight">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-slate-900">{{ currentUser.TenKH }}</span>
                  <span class="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white">{{ currentUser.MaKH }}</span>
                </div>
                <p class="text-[11px] text-emerald-700 font-medium">{{ currentUser.SDT }}</p>
              </div>
              <button
                type="button"
                @click="emit('logout')"
                title="Đăng xuất"
                class="ml-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition flex items-center gap-1"
              >
                <i class="fa-solid fa-right-from-bracket"></i>
                <span class="hidden md:inline">Đăng xuất</span>
              </button>
            </div>
          </template>
          <template v-else>
            <button
              type="button"
              @click="emit('open-auth', 'login')"
              class="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition flex items-center gap-1.5"
            >
              <i class="fa-solid fa-right-to-bracket text-emerald-600"></i>
              <span>Đăng nhập</span>
            </button>
            <button
              type="button"
              @click="emit('open-auth', 'register')"
              class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <i class="fa-solid fa-user-plus"></i>
              <span>Đăng ký</span>
            </button>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
