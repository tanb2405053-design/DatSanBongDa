<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  initialTab: { type: String, default: 'login' },
  khachHangList: { type: Array, required: true }
});

const emit = defineEmits(['close', 'login-success', 'register-success']);

const currentTab = reactive({ value: props.initialTab });

const loginForm = reactive({
  identifier: '',
  password: '',
  showPassword: false,
  error: ''
});

const registerForm = reactive({
  name: '',
  phone: '',
  email: '',
  address: '',
  password: '',
  passwordConfirm: '',
  error: ''
});

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      currentTab.value = props.initialTab || 'login';
      loginForm.identifier = '';
      loginForm.password = '';
      loginForm.showPassword = false;
      loginForm.error = '';

      registerForm.name = '';
      registerForm.phone = '';
      registerForm.email = '';
      registerForm.address = '';
      registerForm.password = '';
      registerForm.passwordConfirm = '';
      registerForm.error = '';
    }
  }
);

function switchTab(tab) {
  currentTab.value = tab;
  loginForm.error = '';
  registerForm.error = '';
}

function fillLoginDemo(phone) {
  loginForm.identifier = phone;
  loginForm.password = '123456';
}

function handleLoginSubmit() {
  loginForm.error = '';
  const identifier = loginForm.identifier.trim().toLowerCase();
  const password = loginForm.password;

  const matchedUser = props.khachHangList.find(
    kh =>
      (kh.SDT.toLowerCase() === identifier || (kh.Email && kh.Email.toLowerCase() === identifier)) &&
      kh.MatKhau === password
  );

  if (!matchedUser) {
    loginForm.error = 'Số điện thoại/Email hoặc mật khẩu không chính xác!';
    return;
  }

  emit('login-success', matchedUser);
}

function handleRegisterSubmit() {
  registerForm.error = '';
  const tenKH = registerForm.name.trim();
  const sdt = registerForm.phone.trim();
  const email = registerForm.email.trim();
  const diaChi = registerForm.address.trim();
  const matKhau = registerForm.password;
  const xacNhanMatKhau = registerForm.passwordConfirm;

  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  if (!phoneRegex.test(sdt)) {
    registerForm.error = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.';
    return;
  }

  if (props.khachHangList.some(kh => kh.SDT === sdt)) {
    registerForm.error = 'Số điện thoại này đã được đăng ký tài khoản. Vui lòng chuyển sang tab Đăng nhập!';
    return;
  }

  if (props.khachHangList.some(kh => kh.Email && kh.Email.toLowerCase() === email.toLowerCase())) {
    registerForm.error = 'Email này đã được sử dụng cho một tài khoản khác.';
    return;
  }

  if (matKhau !== xacNhanMatKhau) {
    registerForm.error = 'Mật khẩu xác nhận không khớp!';
    return;
  }

  emit('register-success', {
    TenKH: tenKH,
    Email: email,
    SDT: sdt,
    DiaChi: diaChi,
    MatKhau: matKhau
  });
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" @click="emit('close')"></div>

    <div class="flex min-h-full items-center justify-center p-4 sm:p-6">
      <div class="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        <div class="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold flex items-center gap-2 mt-0.5">
              <i class="fa-solid fa-user-shield text-emerald-400"></i>
              <span>{{ currentTab.value === 'login' ? 'Đăng nhập tài khoản' : 'Đăng ký thành viên mới' }}</span>
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

        <div class="px-6 pt-5">
          <div class="grid grid-cols-2 bg-slate-100 p-1 rounded-xl text-sm font-semibold">
            <button
              type="button"
              @click="switchTab('login')"
              :class="currentTab.value === 'login' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
              class="py-2 rounded-lg transition"
            >
              Đăng nhập
            </button>
            <button
              type="button"
              @click="switchTab('register')"
              :class="currentTab.value === 'register' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
              class="py-2 rounded-lg transition"
            >
              Đăng ký mới
            </button>
          </div>
        </div>

        <!-- Form Đăng nhập -->
        <form v-if="currentTab.value === 'login'" @submit.prevent="handleLoginSubmit" class="p-6 space-y-4">
          <div>
            <label for="login-identifier" class="block text-xs font-semibold text-slate-700 mb-1">
              Số điện thoại (SDT) hoặc Email <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <i class="fa-solid fa-user"></i>
              </span>
              <input
                type="text"
                id="login-identifier"
                v-model="loginForm.identifier"
                required
                placeholder="VD: 0901234567 hoặc email@gmail.com"
                class="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label for="login-password" class="block text-xs font-semibold text-slate-700 mb-1">
              Mật khẩu (MatKhau) <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <i class="fa-solid fa-lock"></i>
              </span>
              <input
                :type="loginForm.showPassword ? 'text' : 'password'"
                id="login-password"
                v-model="loginForm.password"
                required
                placeholder="Nhập mật khẩu"
                class="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                @click="loginForm.showPassword = !loginForm.showPassword"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <i :class="loginForm.showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
              </button>
            </div>
          </div>

          <div v-if="loginForm.error" class="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
            <i class="fa-solid fa-circle-exclamation text-rose-600"></i>
            <span>{{ loginForm.error }}</span>
          </div>

          <button
            type="submit"
            class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-right-to-bracket"></i>
            <span>Đăng nhập hệ thống</span>
          </button>
        </form>

        <!-- Form Đăng ký -->
        <form v-else @submit.prevent="handleRegisterSubmit" class="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
          <div>
            <label for="reg-name" class="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên (TenKH) <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="reg-name"
              v-model="registerForm.name"
              required
              placeholder="Nguyễn Văn A"
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="reg-phone" class="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại (SDT) <span class="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                id="reg-phone"
                v-model="registerForm.phone"
                required
                placeholder="09xxxxxxxx"
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label for="reg-email" class="block text-xs font-semibold text-slate-700 mb-1">
                Email <span class="text-rose-500">*</span>
              </label>
              <input
                type="email"
                id="reg-email"
                v-model="registerForm.email"
                required
                placeholder="email@gmail.com"
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label for="reg-address" class="block text-xs font-semibold text-slate-700 mb-1">
              Địa chỉ (DiaChi) <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="reg-address"
              v-model="registerForm.address"
              required
              placeholder="Quận/Huyện, Tỉnh/Thành phố"
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="reg-password" class="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu (MatKhau) <span class="text-rose-500">*</span>
              </label>
              <input
                type="password"
                id="reg-password"
                v-model="registerForm.password"
                required
                minlength="6"
                placeholder="Tối thiểu 6 ký tự"
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label for="reg-password-confirm" class="block text-xs font-semibold text-slate-700 mb-1">
                Xác nhận mật khẩu <span class="text-rose-500">*</span>
              </label>
              <input
                type="password"
                id="reg-password-confirm"
                v-model="registerForm.passwordConfirm"
                required
                minlength="6"
                placeholder="Nhập lại mật khẩu"
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div v-if="registerForm.error" class="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
            <i class="fa-solid fa-circle-exclamation text-rose-600"></i>
            <span>{{ registerForm.error }}</span>
          </div>

          <button
            type="submit"
            class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 mt-2"
          >
            <i class="fa-solid fa-user-plus"></i>
            <span>Tạo tài khoản &amp; Đăng nhập</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
