<script setup>
const emit = defineEmits(['reset-db', 'select-type']);
</script>

<template>
  <footer class="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        <!-- Cột 1: Thương hiệu & Mạng xã hội -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20"
            >
              <i class="fa-solid fa-futbol text-xl"></i>
            </div>
            <div>
              <span class="text-xl font-extrabold text-white tracking-tight leading-none block">
                Sport<span class="text-emerald-500">Book</span>
              </span>
              <span class="text-xs text-slate-400">Đặt sân thể thao trực tuyến</span>
            </div>
          </div>
          <p class="text-sm text-slate-400 leading-relaxed">
            Hệ thống tra cứu lịch trống, bảng giá minh bạch và đặt sân thể thao nhanh chóng 24/7. Kết nối đam mê thể
            thao mọi lúc, mọi nơi.
          </p>

          <!-- Các nút Mạng xã hội -->
          <div class="pt-1">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Kết nối với chúng tôi</p>
            <div class="flex items-center gap-2.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-[#1877F2] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <i class="fa-brands fa-facebook-f text-sm"></i>
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zalo"
                class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-[#0068FF] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs font-extrabold text-xs"
              >
                Zalo
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-black text-slate-300 hover:text-white border border-transparent hover:border-slate-700 flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <i class="fa-brands fa-tiktok text-sm"></i>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-[#FF0000] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <i class="fa-brands fa-youtube text-sm"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Cột 2: Dịch vụ sân thể thao -->
        <div>
          <h3 class="text-sm font-bold uppercase tracking-wider text-white mb-4">Danh mục sân</h3>
          <ul class="space-y-2.5 text-sm text-slate-400">
            <li>
              <a
                href="#san-5"
                @click.prevent="emit('select-type', 'LS01')"
                class="hover:text-emerald-400 transition flex items-center gap-2"
              >
                <i class="fa-solid fa-angle-right text-xs text-emerald-500"></i>
                <span>Sân Bóng Đá 5 Người</span>
              </a>
            </li>
            <li>
              <a
                href="#san-7"
                @click.prevent="emit('select-type', 'LS02')"
                class="hover:text-emerald-400 transition flex items-center gap-2"
              >
                <i class="fa-solid fa-angle-right text-xs text-emerald-500"></i>
                <span>Sân Bóng Đá 7 Người</span>
              </a>
            </li>
            <li>
              <a
                href="#san-11"
                @click.prevent="emit('select-type', 'LS03')"
                class="hover:text-emerald-400 transition flex items-center gap-2"
              >
                <i class="fa-solid fa-angle-right text-xs text-emerald-500"></i>
                <span>Sân Bóng Đá 11 Người</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Cột 3: Hỗ trợ & Chính sách -->
        <div>
          <h3 class="text-sm font-bold uppercase tracking-wider text-white mb-4">Hỗ trợ khách hàng</h3>
          <ul class="space-y-2.5 text-sm text-slate-400">
            <li>
              <a href="#huong-dan" class="hover:text-emerald-400 transition flex items-center gap-2">
                <i class="fa-solid fa-angle-right text-xs text-emerald-500"></i>
                <span>Hướng dẫn đặt sân &amp; giữ chỗ</span>
              </a>
            </li>
            <li>
              <a href="#bang-gia" class="hover:text-emerald-400 transition flex items-center gap-2">
                <i class="fa-solid fa-angle-right text-xs text-emerald-500"></i>
                <span>Quy định giá giờ vàng &amp; cuối tuần</span>
              </a>
            </li>
            <li>
              <a href="#chinh-sach-huy" class="hover:text-emerald-400 transition flex items-center gap-2">
                <i class="fa-solid fa-angle-right text-xs text-emerald-500"></i>
                <span>Chính sách đổi lịch &amp; hoàn cọc</span>
              </a>
            </li>
            <li>
              <a href="#noi-quy" class="hover:text-emerald-400 transition flex items-center gap-2">
                <i class="fa-solid fa-angle-right text-xs text-emerald-500"></i>
                <span>Nội quy sử dụng cụm sân</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Cột 4: Thông tin liên hệ & Giờ mở cửa -->
        <div>
          <h3 class="text-sm font-bold uppercase tracking-wider text-white mb-4">Thông tin liên hệ</h3>
          <ul class="space-y-3 text-sm text-slate-400">
            <li class="flex items-start gap-3">
              <i class="fa-solid fa-location-dot text-emerald-500 mt-1 shrink-0"></i>
              <span>Số 128 Đường 3/2, Quận Ninh Kiều, TP. Cần Thơ</span>
            </li>
            <li class="flex items-center gap-3">
              <i class="fa-solid fa-phone text-emerald-500 shrink-0"></i>
              <a href="tel:0901234567" class="hover:text-white font-semibold text-slate-200 transition">
                0901 234 567 (Hotline 24/7)
              </a>
            </li>
            <li class="flex items-center gap-3">
              <i class="fa-solid fa-envelope text-emerald-500 shrink-0"></i>
              <a href="mailto:lienhe@sportbook.vn" class="hover:text-white transition">lienhe@sportbook.vn</a>
            </li>
            <li class="flex items-start gap-3">
              <i class="fa-regular fa-clock text-emerald-500 mt-1 shrink-0"></i>
              <div>
                <span class="block text-slate-200 font-medium">Giờ mở cửa cụm sân:</span>
                <span>06:00 – 22:00 (Thứ 2 – Chủ Nhật)</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Thanh bản quyền dưới cùng -->
      <div
        class="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500"
      >
        <p>&copy; 2026 <strong class="text-slate-300">SportBook</strong>. Bảo lưu mọi quyền.</p>

        <div class="flex flex-wrap items-center gap-4 sm:gap-5">
          <a href="#dieu-khoan" class="hover:text-slate-300 transition">Điều khoản sử dụng</a>
          <a href="#bao-mat" class="hover:text-slate-300 transition">Chính sách bảo mật</a>

          <button
            type="button"
            @click="emit('reset-db')"
            class="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-semibold transition flex items-center gap-1.5 shadow-xs"
          >
            <i class="fa-solid fa-database text-emerald-500"></i>
            <span>Đặt lại dữ liệu gốc</span>
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>
