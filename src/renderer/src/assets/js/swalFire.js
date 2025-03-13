
import Swal from "sweetalert2";

const showAlert = ({
  header = "Notification",
  message = "",
  type = "info",
  confirmText = "OK",
  showCancel = false,
  cancelText = "Cancel",
  confirmCallback = null,
  cancelCallback = null,
  autoClose = false, 
  closeTimer = 3000, 
}) => {
  Swal.fire({
    title: header,
    text: message,
    icon: type, // "success", "error", "warning", "info", "question"
    showCancelButton: showCancel,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    timer: autoClose ? closeTimer : null,
    timerProgressBar: autoClose,
    customClass: {
        popup: "custom-swal-popup", 
        confirmButton: "custom-swal-button-confirm",
        cancelButton: "custom-swal-button-cancel",
        icon: "custom-swal-icon",
      },
  }).then((result) => {
    if (result.isConfirmed && confirmCallback) {
      confirmCallback(); 
    } else if (result.dismiss === Swal.DismissReason.cancel && cancelCallback) {
      cancelCallback(); 
    }
  });
};

export default showAlert;
