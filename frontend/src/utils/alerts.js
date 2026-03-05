import Swal from 'sweetalert2';

export const showToast = (title, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  Toast.fire({
    icon: icon,
    title: title,
    background: '#ffffff',
    color: '#1e293b', // slate-800
  });
};

export const showAlert = (title, text, icon = 'info') => {
  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonText: 'ENTENDIDO',
    confirmButtonColor: '#007f5f', // Tu verde esmeralda
    buttonsStyling: true,
    customClass: {
      popup: 'rounded-[30px] shadow-2xl border-none font-sans',
      title: 'text-2xl font-serif text-slate-800',
      confirmButton: 'rounded-2xl px-8 py-3 font-black uppercase text-xs tracking-widest'
    }
  });
};